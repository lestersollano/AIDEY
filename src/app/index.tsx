import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { IdCard } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AideyWordmark } from "@/components/aidey-wordmark";
import { Dropdown } from "@/components/dropdown";
import { HomeMenuSidebar } from "@/components/home-menu-sidebar";
import { Text } from "@/components/text";
import { brand, colors } from "@/constants/colors";
import { DOCUMENTS } from "@/constants/documents";
import { fonts } from "@/constants/fonts";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/contexts/locale-context";
import {
    useDocumentUploads,
    useDocumentUploadsSyncStatus,
} from "@/hooks/use-document-uploads";

function getDefaultOwnedId(ownedIdIds: string[]) {
    if (ownedIdIds.includes("national-id")) {
        return "national-id";
    }

    return ownedIdIds[0] ?? null;
}

function pressableStyle(baseStyle: object, pressedStyle: object) {
    return ({ pressed }: { pressed: boolean }) => [
        baseStyle,
        pressed && pressedStyle,
    ];
}

export default function HomeScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const uploads = useDocumentUploads();
    const { isLoading: uploadsLoading } = useDocumentUploadsSyncStatus();
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const insets = useSafeAreaInsets();
    const greetingName = user?.displayName?.trim().split(/\s+/)[0] ?? t("auth.noName");

    const ownedIdOptions = useMemo(
        () =>
            DOCUMENTS.filter(
                (document) =>
                    document.category === "id" &&
                    (uploads[document.id]?.length ?? 0) > 0,
            ).map((document) => ({
                value: document.id,
                label: document.label,
            })),
        [uploads],
    );

    const ownedIdIds = useMemo(
        () => ownedIdOptions.map((option) => option.value),
        [ownedIdOptions],
    );

    useEffect(() => {
        if (ownedIdIds.length === 0) {
            setSelectedId(null);
            return;
        }

        setSelectedId((current) => {
            if (current && ownedIdIds.includes(current)) {
                return current;
            }

            return getDefaultOwnedId(ownedIdIds);
        });
    }, [ownedIdIds]);

    const selectedIdImageUri = selectedId
        ? uploads[selectedId]?.[0]?.localUri
        : undefined;

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <HomeMenuSidebar
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable
                        style={pressableStyle(
                            styles.headerButton,
                            styles.headerButtonPressed,
                        )}
                        accessibilityLabel={t("common.menu")}
                        onPress={() => setMenuVisible(true)}
                    >
                        <SymbolView
                            name={{
                                ios: "line.3.horizontal",
                                android: "menu",
                                web: "menu",
                            }}
                            size={24}
                            tintColor={colors.secondary}
                        />
                    </Pressable>
                    <AideyWordmark style={styles.title} />
                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.greeting}>
                    <LinearGradient
                        colors={[brand.navy, brand.blue, brand.teal]}
                        locations={[0, 0.55, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.greetingGradient}
                    >
                        <View style={styles.greetingHeader}>
                            <View style={styles.greetingTextRow}>
                                <View style={styles.greetingIcon}>
                                    <IdCard
                                        size={26}
                                        color={colors.primary}
                                        strokeWidth={2}
                                    />
                                </View>
                                <View style={styles.greetingCopy}>
                                    <Text style={styles.greetingText}>
                                        {t("home.greeting", {
                                            name: greetingName,
                                        })}
                                    </Text>
                                    <Text style={styles.greetingEmail}>
                                        {user?.email || t("auth.noEmail")}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    <ScrollView
                        style={styles.section}
                        contentContainerStyle={styles.sectionContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.buttons}>
                            <Pressable
                                style={pressableStyle(
                                    styles.button,
                                    styles.buttonPressed,
                                )}
                                android_ripple={{
                                    color: "rgba(0, 22, 106, 0.12)",
                                }}
                                onPress={() => router.push("/documents")}
                            >
                                <View style={styles.buttonRow}>
                                    <View
                                        style={[
                                            styles.buttonMedia,
                                            styles.buttonMediaDocuments,
                                        ]}
                                    >
                                        <Image
                                            source={require("@/assets/images/mascot/cropped/mgadokumentoatid.png")}
                                            style={styles.buttonIcon}
                                            contentFit="contain"
                                        />
                                    </View>
                                    <View style={styles.buttonTextWrapper}>
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                styles.buttonTextDocuments,
                                            ]}>
                                            {t("home.documentsTitle")}
                                        </Text>
                                        <Text style={styles.buttonSubtext}>
                                            {t("home.documentsSubtitle")}
                                        </Text>
                                    </View>
                                    <SymbolView
                                        name={{
                                            ios: "chevron.right",
                                            android: "chevron_right",
                                            web: "chevron_right",
                                        }}
                                        size={18}
                                        tintColor={brand.blue}
                                    />
                                </View>
                            </Pressable>

                            <Pressable
                                style={pressableStyle(
                                    styles.button,
                                    styles.buttonPressed,
                                )}
                                android_ripple={{
                                    color: "rgba(0, 22, 106, 0.12)",
                                }}
                                onPress={() => router.push("/ids")}
                            >
                                <View style={styles.buttonRow}>
                                    <View
                                        style={[
                                            styles.buttonMedia,
                                            styles.buttonMediaIds,
                                        ]}
                                    >
                                        <Image
                                            source={require("@/assets/images/mascot/mood/confused.png")}
                                            style={styles.buttonIcon}
                                            contentFit="contain"
                                        />
                                    </View>
                                    <View style={styles.buttonTextWrapper}>
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                styles.buttonTextIds,
                                            ]}>
                                            {t("home.idsTitle")}
                                        </Text>
                                        <Text style={styles.buttonSubtext}>
                                            {t("home.idsSubtitle")}
                                        </Text>
                                    </View>
                                    <SymbolView
                                        name={{
                                            ios: "chevron.right",
                                            android: "chevron_right",
                                            web: "chevron_right",
                                        }}
                                        size={18}
                                        tintColor={brand.teal}
                                    />
                                </View>
                            </Pressable>
                        </View>

                        <View style={styles.divider} />

                        {!uploadsLoading && ownedIdOptions.length > 0 ? (
                            <>
                                <Dropdown
                                    style={styles.dropdown}
                                    options={ownedIdOptions}
                                    value={selectedId}
                                    onChange={setSelectedId}
                                    placeholder={t("home.dropdownPlaceholder")}
                                    accessibilityLabel={t("home.dropdownLabel")}
                                />

                                <View style={styles.card}>
                                    {selectedIdImageUri ? (
                                        <Image
                                            source={{ uri: selectedIdImageUri }}
                                            style={styles.cardImage}
                                            contentFit="cover"
                                        />
                                    ) : null}
                                </View>
                            </>
                        ) : !uploadsLoading ? (
                            <Text style={styles.tagline}>
                                {t("home.emptyTaglinePrefix")}
                                <Text style={styles.taglineDocuments}>
                                    {t("home.emptyTaglineDocumentsWord")}
                                </Text>
                                {t("home.emptyTaglineMiddle")}
                                <Text style={styles.taglineId}>
                                    {t("home.emptyTaglineIdWord")}
                                </Text>
                            </Text>
                        ) : null}
                    </ScrollView>
                </View>
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.aiFab,
                    { bottom: insets.bottom + 24 },
                    pressed && styles.aiFabPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("home.aiTitle")}
                onPress={() => router.push("/ai-assistant")}
            >
                <Image
                    source={require("@/assets/images/mascot/cropped/magpatulongsaai.png")}
                    style={styles.aiFabImage}
                    contentFit="cover"
                />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(0, 22, 106, 0.03)",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
        marginBottom: 4,
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.secondaryBorder,
        backgroundColor: colors.primary,
    },
    headerButtonPressed: {
        opacity: 0.7,
        backgroundColor: colors.secondaryMuted,
    },
    headerSpacer: {
        width: 40,
        height: 40,
    },
    title: {
        flex: 1,
        fontSize: 20,
        textAlign: "center",
    },
    greeting: {
        marginTop: 8,
        marginHorizontal: -24,
        alignSelf: "stretch",
        flex: 1,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: colors.primary,
        overflow: "hidden",
        shadowColor: brand.navy,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    greetingGradient: {
        width: "100%",
        paddingTop: 28,
        paddingBottom: 36,
    },
    greetingHeader: {
        paddingHorizontal: 24,
    },
    greetingTextRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginBottom: 16,
    },
    greetingIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.18)",
    },
    greetingCopy: {
        flex: 1,
        gap: 2,
    },
    greetingText: {
        fontSize: 28,
        lineHeight: 34,
        fontFamily: fonts.fredoka,
        color: colors.primary,
    },
    greetingEmail: {
        marginTop: 6,
        fontSize: 12,
        fontFamily: fonts.regular,
        color: "rgba(255, 255, 255, 0.78)",
        letterSpacing: 0.2,
    },
    section: {
        flex: 1,
        alignSelf: "stretch",
        marginTop: -24,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: colors.primary,
        overflow: "hidden",
    },
    sectionContent: {
        paddingTop: 32,
        paddingHorizontal: 24,
        paddingBottom: 112,
    },
    buttons: {
        gap: 12,
        marginTop: 8,
    },
    divider: {
        marginTop: 28,
        marginBottom: 4,
        height: 1,
        width: "100%",
        backgroundColor: colors.secondaryBorder,
    },
    dropdown: {
        marginTop: 20,
        zIndex: 2,
    },
    card: {
        marginTop: 20,
        width: "100%",
        aspectRatio: 1.6,
        borderRadius: 20,
        backgroundColor: colors.secondaryMuted,
        borderWidth: 1,
        borderColor: colors.secondaryBorder,
        overflow: "hidden",
        zIndex: 1,
    },
    cardImage: {
        width: "100%",
        height: "100%",
    },
    tagline: {
        marginTop: 28,
        alignSelf: "center",
        maxWidth: 280,
        fontSize: 13,
        lineHeight: 18,
        fontFamily: fonts.fredokaRegular,
        color: colors.secondaryPlaceholder,
        textAlign: "center",
    },
    taglineDocuments: {
        color: brand.blue,
        fontFamily: fonts.fredokaRegular,
    },
    taglineId: {
        color: brand.teal,
        fontFamily: fonts.fredokaRegular,
    },
    button: {
        width: "100%",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 18,
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderColor: colors.secondaryBorder,
        shadowColor: brand.navy,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    buttonPressed: {
        opacity: 0.88,
        transform: [{ scale: 0.99 }],
    },
    buttonRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        width: "100%",
    },
    buttonMedia: {
        width: 60,
        height: 60,
        borderRadius: 16,
        overflow: "hidden",
    },
    buttonMediaDocuments: {
        backgroundColor: "rgba(0, 90, 222, 0.1)",
    },
    buttonMediaIds: {
        backgroundColor: "rgba(1, 154, 143, 0.1)",
    },
    buttonIcon: {
        width: 60,
        height: 60,
    },
    buttonTextWrapper: {
        flex: 1,
        gap: 3,
    },
    buttonText: {
        color: brand.navy,
        fontSize: 16,
        fontFamily: fonts.semiBold,
    },
    buttonTextDocuments: {
        color: brand.blue,
    },
    buttonTextIds: {
        color: brand.teal,
    },
    buttonSubtext: {
        fontSize: 13,
        lineHeight: 18,
        color: "rgba(0, 22, 106, 0.55)",
        fontFamily: fonts.regular,
    },
    aiFab: {
        position: "absolute",
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "rgba(1, 154, 143, 0.25)",
        shadowColor: brand.teal,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 8,
    },
    aiFabPressed: {
        opacity: 0.92,
        transform: [{ scale: 0.96 }],
    },
    aiFabImage: {
        width: 64,
        height: 64,
    },
});
