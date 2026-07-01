import {
  getAgencyForDocumentLabel,
  GOVERNMENT_AGENCIES,
  type GovernmentAgency,
} from '@/constants/government-offices';
import { getGoogleMapsApiKey } from '@/constants/maps';
import type { ChatMessage } from '@/services/chat';
import type { UserLocation } from '@/services/location';
import type { AideyReply, MapDestination, Suggestion } from '@/types/aidey-response';
import type { UserCoordinates } from '@/utils/maps';

type OfficeFinderContext = {
  userMessage: string;
  userLocation?: UserLocation | UserCoordinates;
  documentLabel?: string;
  history: ChatMessage[];
};

type PlacesTextSearchResult = {
  name: string;
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: number;
      lng: number;
    };
  };
};

type PlacesTextSearchResponse = {
  status: string;
  results?: PlacesTextSearchResult[];
  error_message?: string;
};

const OFFICE_INTENT_PATTERNS = [
  /pinakamalapit\s+na\s+opisina/i,
  /malapit\s+na\s+opisina/i,
  /nearest\s+office/i,
  /hanapin\s+ang\s+opisina/i,
  /saan\s+ang\s+opisina/i,
  /nasaan\s+ang\s+opisina/i,
  /where\s+is\s+the\s+(nearest\s+)?office/i,
  /find\s+the\s+nearest\s+office/i,
  /office\s+location/i,
  /location\s+of\s+(the\s+)?[a-z0-9\s]*office/i,
  /lokasyon\s+ng\s+opisina/i,
];

const DIRECTIONS_INTENT_PATTERNS = [
  /directions?\s+(to|sa|papunta)/i,
  /how\s+to\s+get\s+to/i,
  /paano\s+(pupunta|pumunta|makarating|mapunta)/i,
  /ruta\s+(sa|papunta|patre)/i,
  /tingnan\s+ang\s+ruta/i,
  /ipakita\s+ang\s+(ruta|mapa)/i,
  /show\s+(me\s+)?(the\s+)?(route|directions|map)/i,
  /papunta\s+sa/i,
  /pupunta\s+sa/i,
  /daan\s+(papunta|patungo)/i,
  /mapa\s+(ng|sa|papunta)/i,
  /navigate\s+to/i,
];

const LOCATION_SHARE_PATTERN =
  /^Nasa .+ ako \(\-?\d+\.\d+, \-?\d+\.\d+\)\. Hanapin ang pinakamalapit na opisina\.$/;

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}

function collectConversationText(context: OfficeFinderContext) {
  return [
    ...context.history.map((message) => message.text),
    context.userMessage,
    context.documentLabel ?? '',
  ].join('\n');
}

export function isOfficeFinderIntent(text: string) {
  return OFFICE_INTENT_PATTERNS.some((pattern) => pattern.test(text));
}

export function isDirectionsIntent(text: string) {
  return DIRECTIONS_INTENT_PATTERNS.some((pattern) => pattern.test(text));
}

export function isOfficeDirectionsIntent(text: string) {
  return isOfficeFinderIntent(text) || isDirectionsIntent(text);
}

export function isLocationShareMessage(text: string) {
  return LOCATION_SHARE_PATTERN.test(text.trim());
}

function inferAgencyFromText(text: string): GovernmentAgency | null {
  const normalized = normalizeText(text);

  for (const agency of Object.values(GOVERNMENT_AGENCIES)) {
    if (agency.aliases.some((alias) => normalized.includes(alias))) {
      return agency;
    }
  }

  return null;
}

export function inferLikelyAgency(context: OfficeFinderContext): GovernmentAgency | null {
  if (context.documentLabel) {
    const fromDocument = getAgencyForDocumentLabel(context.documentLabel);
    if (fromDocument) return fromDocument;
  }

  const conversationText = collectConversationText(context);
  const fromConversation = inferAgencyFromText(conversationText);
  if (fromConversation) return fromConversation;

  return null;
}

function hasOfficeDirectionsIntent(context: OfficeFinderContext) {
  const conversationText = collectConversationText(context);
  return (
    isOfficeDirectionsIntent(context.userMessage) ||
    isOfficeDirectionsIntent(conversationText)
  );
}

function asksWhereAgencyIs(context: OfficeFinderContext) {
  const conversationText = collectConversationText(context);
  return (
    /saan\s+ang|nasaan\s+ang|where\s+is|where\s+can\s+i|location\s+of/i.test(
      conversationText,
    ) && inferLikelyAgency(context) != null
  );
}

export function shouldAutoFetchLocation(context: OfficeFinderContext, reply: AideyReply) {
  if (context.userLocation) return false;
  if (reply.mapDestination) return true;
  if (reply.needsLocation) return true;
  if (hasOfficeDirectionsIntent(context)) return true;
  if (asksWhereAgencyIs(context)) return true;

  return false;
}

function shouldResolveOffice(context: OfficeFinderContext, reply: AideyReply) {
  if (reply.mapDestination) return true;
  if (context.userLocation && isLocationShareMessage(context.userMessage)) return true;
  if (context.userLocation && hasOfficeDirectionsIntent(context)) return true;
  if (context.userLocation && asksWhereAgencyIs(context)) return true;
  if (context.userLocation && reply.needsLocation === false && inferLikelyAgency(context)) {
    return true;
  }

  return false;
}

function haversineDistance(
  origin: UserCoordinates,
  destination: UserCoordinates,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLng = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function searchPlacesNearUser(
  query: string,
  userLocation: UserCoordinates,
): Promise<MapDestination | null> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    query,
    location: `${userLocation.latitude},${userLocation.longitude}`,
    radius: '50000',
    region: 'ph',
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`,
  );

  if (!response.ok) return null;

  const data = (await response.json()) as PlacesTextSearchResponse;
  if (data.status !== 'OK' || !data.results?.length) return null;

  const ranked = [...data.results]
    .map((place) => {
      const lat = place.geometry?.location?.lat;
      const lng = place.geometry?.location?.lng;
      if (lat == null || lng == null) return null;

      return {
        name: place.name,
        address: place.formatted_address,
        latitude: lat,
        longitude: lng,
        distanceKm: haversineDistance(userLocation, { latitude: lat, longitude: lng }),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item != null)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const nearest = ranked[0];
  if (!nearest) return null;

  return {
    name: nearest.name,
    address: nearest.address,
    latitude: nearest.latitude,
    longitude: nearest.longitude,
    query,
  };
}

async function resolveOfficeDestination(
  agency: GovernmentAgency,
  userLocation: UserCoordinates,
  hint?: MapDestination,
): Promise<MapDestination | null> {
  const queries = [
    hint?.query,
    hint?.name ? `${hint.name} Philippines` : null,
    `${agency.placeQuery} near me`,
    agency.placeQuery,
  ].filter((value): value is string => Boolean(value?.trim()));

  for (const query of queries) {
    const destination = await searchPlacesNearUser(query, userLocation);
    if (destination) {
      return {
        ...destination,
        name: destination.name || agency.name,
      };
    }
  }

  return null;
}

function ensureOpenMapsSuggestion(suggestions: Suggestion[]): Suggestion[] {
  const hasOpenMaps = suggestions.some((item) => item.action === 'open_maps');
  if (hasOpenMaps) return suggestions;

  return [
    {
      label: 'Tingnan ang ruta',
      value: 'Tingnan ang ruta',
      action: 'open_maps' as const,
    },
    ...suggestions,
  ].slice(0, 5);
}

function buildOfficeFoundMessage(agency: GovernmentAgency, destination: MapDestination) {
  const officeName = destination.name || agency.name;
  const addressSuffix = destination.address ? ` sa ${destination.address}` : '';
  return `Narito ang pinakamalapit na opisina ng ${agency.name}: ${officeName}${addressSuffix}. Tingnan ang ruta sa mapa sa ibaba.`;
}

export async function enrichReplyWithNearestOffice(
  reply: AideyReply,
  context: OfficeFinderContext,
): Promise<AideyReply> {
  if (!shouldResolveOffice(context, reply)) return reply;

  const userCoordinates = context.userLocation
    ? {
        latitude: context.userLocation.latitude,
        longitude: context.userLocation.longitude,
      }
    : undefined;

  if (!userCoordinates) return reply;

  const agency =
    inferLikelyAgency(context) ??
    (reply.mapDestination?.name
      ? inferAgencyFromText(reply.mapDestination.name) ??
        inferAgencyFromText(reply.mapDestination.query ?? '')
      : null);

  if (!agency) return reply;

  const resolved = await resolveOfficeDestination(
    agency,
    userCoordinates,
    reply.mapDestination,
  );

  if (!resolved) return reply;

  const message =
    reply.mapDestination?.latitude == null
      ? buildOfficeFoundMessage(agency, resolved)
      : reply.message;

  return {
    ...reply,
    message,
    needsLocation: false,
    mapDestination: resolved,
    suggestions: ensureOpenMapsSuggestion(reply.suggestions),
  };
}
