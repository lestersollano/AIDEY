import NetInfo from '@react-native-community/netinfo';

export type PendingError =
  | { type: 'connection' }
  | { type: 'ai-unavailable' };

let pendingError: PendingError | null = null;

export function markPendingInternetError() {
  pendingError = { type: 'connection' };
}

export function markPendingAiUnavailableError() {
  pendingError = { type: 'ai-unavailable' };
}

export function consumePendingError(): PendingError | null {
  const error = pendingError;
  pendingError = null;
  return error;
}

/** @deprecated Use consumePendingError */
export function consumePendingInternetError() {
  const error = consumePendingError();
  return error?.type === 'connection';
}

export async function hasValidInternetConnection(): Promise<boolean> {
  let state = await NetInfo.fetch();

  if (state.isConnected === false) {
    return false;
  }

  if (state.isInternetReachable === false) {
    return false;
  }

  if (state.isInternetReachable === true) {
    return true;
  }

  state = await NetInfo.refresh();

  if (state.isConnected === false || state.isInternetReachable === false) {
    return false;
  }

  if (state.isInternetReachable === true) {
    return true;
  }

  try {
    const response = await fetch('https://clients3.google.com/generate_204', {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}
