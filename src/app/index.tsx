import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AideyWordmark } from "@/components/aidey-wordmark";
import { Text } from "@/components/text";
import { brand, colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";

function pressableStyle(baseStyle: object, pressedStyle: object) {
    return ({ pressed }: { pressed: boolean }) => [
        baseStyle,
        pressed && pressedStyle,
    ];
}

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable
                        style={pressableStyle(
                            styles.headerButton,
                            styles.headerButtonPressed,
                        )}
                        accessibilityLabel="Menu"
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
                    <Pressable
                        style={pressableStyle(
                            styles.headerButton,
                            styles.headerButtonPressed,
                        )}
                        accessibilityLabel="Settings"
                        onPress={() => router.push("/settings")}
                    >
                        <SymbolView
                            name={{
                                ios: "gearshape",
                                android: "settings",
                                web: "settings",
                            }}
                            size={24}
                            tintColor={colors.secondary}
                        />
                    </Pressable>
                </View>

                <View style={styles.buttons}>
                    <Pressable
                        style={pressableStyle(
                            styles.button,
                            styles.buttonPressed,
                        )}
                        android_ripple={{ color: "rgba(0, 22, 106, 0.12)" }}
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
                                <Text style={styles.buttonTextDocuments}>
                                    Mga Dokumento at ID
                                </Text>
                                <Text style={styles.buttonSubtext}>
                                    Tingnan at i-upload ang mga ID
                                </Text>
                            </View>
                            <SymbolView
                                name={{
                                    ios: "chevron.right",
                                    android: "chevron_right",
                                    web: "chevron_right",
                                }}
                                size={18}
                                tintColor={brand.navy}
                            />
                        </View>
                    </Pressable>
                    <Pressable
                        style={pressableStyle(
                            styles.button,
                            styles.buttonPressed,
                        )}
                        android_ripple={{ color: "rgba(1, 154, 143, 0.12)" }}
                        onPress={() => router.push("/ai-assistant")}
                    >
                        <View style={styles.buttonRow}>
                            <View
                                style={[
                                    styles.buttonMedia,
                                    styles.buttonMediaAi,
                                ]}
                            >
                                <Image
                                    source={require("@/assets/images/mascot/cropped/magpatulongsaai.png")}
                                    style={styles.buttonIcon}
                                    contentFit="contain"
                                />
                            </View>
                            <View style={styles.buttonTextWrapper}>
                                <Text style={styles.buttonTextAi}>
                                    Magpatulong sa AI
                                </Text>
                                <Text style={styles.buttonSubtextAi}>
                                    Magtanong at humingi ng tulong
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

                <View style={styles.hero}>
                    <AideyWordmark style={styles.greeting} />
                    <Text style={styles.tagline}>
                        Ako si Aidey, ang iyong Gabay sa Dokumento at ID! Piliin
                        ang kailangan mo sa mga opsyon sa itaas.
                    </Text>
                </View>
            </View>

            <Image
                source={require("@/assets/images/mascot/cropped/mainmenu.png")}
                style={styles.bottomImage}
                contentFit="contain"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
    },
    headerButtonPressed: {
        opacity: 0.5,
        backgroundColor: colors.secondaryMuted,
    },
    title: {
        flex: 1,
        fontSize: 20,
        textAlign: "center",
    },
    hero: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        gap: 8,
    },
    greeting: {
        fontSize: 28,
        textAlign: "center",
    },
    tagline: {
        fontSize: 15,
        color: colors.secondary,
        textAlign: "center",
        lineHeight: 22,
    },
    buttons: {
        marginTop: 32,
        gap: 14,
        alignSelf: "stretch",
    },
    button: {
        width: "100%",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderColor: colors.secondaryBorder,
        shadowColor: brand.navy,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    buttonRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        width: "100%",
    },
    buttonMedia: {
        width: 64,
        height: 64,
        borderRadius: 14,
        overflow: "hidden",
    },
    buttonMediaDocuments: {
        backgroundColor: "rgba(0, 22, 106, 0.06)",
    },
    buttonMediaAi: {
        backgroundColor: "rgba(1, 154, 143, 0.08)",
    },
    buttonIcon: {
        width: 64,
        height: 64,
    },
    buttonTextWrapper: {
        flex: 1,
        gap: 2,
    },
    buttonTextDocuments: {
        color: brand.navy,
        fontSize: 16,
        fontFamily: fonts.semiBold,
    },
    buttonTextAi: {
        color: brand.teal,
        fontSize: 16,
        fontFamily: fonts.semiBold,
    },
    buttonSubtext: {
        fontSize: 13,
        color: "rgba(0, 22, 106, 0.55)",
        fontFamily: fonts.regular,
    },
    buttonSubtextAi: {
        fontSize: 13,
        color: "rgba(1, 154, 143, 0.65)",
        fontFamily: fonts.regular,
    },
    bottomImage: {
        width: "100%",
        height: 220,
    },
});
