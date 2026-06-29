import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/text";
import { colors } from "@/constants/colors";

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Pressable style={styles.headerButton} accessibilityLabel="Menu">
                        <SymbolView
                            name={{ ios: "line.3.horizontal", android: "menu", web: "menu" }}
                            size={24}
                            tintColor={colors.secondary}
                        />
                    </Pressable>
                    <Text style={styles.title}>Aidey</Text>
                    <Pressable
                        style={styles.headerButton}
                        accessibilityLabel="Settings"
                        onPress={() => router.push("/settings")}>
                        <SymbolView
                            name={{ ios: "gearshape", android: "settings", web: "settings" }}
                            size={24}
                            tintColor={colors.secondary}
                        />
                    </Pressable>
                </View>

                <View style={styles.buttons}>
                    <Pressable
                        style={styles.button}
                        onPress={() => router.push("/documents")}>
                        <View style={styles.buttonRow}>
                            <View style={styles.buttonMedia}>
                                <Image
                                    source={require("@/assets/images/mgadokumentoatid.png")}
                                    style={styles.buttonIcon}
                                    contentFit="contain"
                                />
                            </View>
                            <View style={styles.buttonTextWrapper}>
                                <Text style={styles.buttonText}>Mga Dokumento at ID</Text>
                            </View>
                        </View>
                    </Pressable>
                    <Pressable
                        style={styles.button}
                        onPress={() => router.push("/ai-assistant")}>
                        <View style={styles.buttonRow}>
                            <View style={styles.buttonMedia}>
                                <Image
                                    source={require("@/assets/images/magpatulongsaai.png")}
                                    style={styles.buttonIcon}
                                    contentFit="contain"
                                />
                            </View>
                            <View style={styles.buttonTextWrapper}>
                                <Text style={styles.buttonText}>Magpatulong sa AI</Text>
                            </View>
                        </View>
                    </Pressable>
                </View>

                <View style={styles.middle}>
                    <View style={styles.profileWireframe}>
                        <View style={styles.photoPlaceholder} />

                        <View style={styles.personalInfo}>
                            <View style={styles.infoField}>
                                <Text style={styles.infoLabel}>Full Name</Text>
                                <View style={styles.infoWire} />
                            </View>
                            <View style={styles.infoField}>
                                <Text style={styles.infoLabel}>Birthday</Text>
                                <View style={styles.infoWire} />
                            </View>
                            <View style={styles.infoField}>
                                <Text style={styles.infoLabel}>Address</Text>
                                <View style={styles.infoWire} />
                            </View>
                            <View style={styles.infoField}>
                                <Text style={styles.infoLabel}>Contact</Text>
                                <View style={styles.infoWire} />
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <Image
                source={require("@/assets/images/mainmenu.png")}
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
    },
    title: {
        flex: 1,
        fontSize: 20,
        textAlign: "center",
        color: colors.secondary,
    },
    middle: {
        flex: 1,
        justifyContent: "center",
    },
    profileWireframe: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    photoPlaceholder: {
        width: 96,
        aspectRatio: 1,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.secondaryBorder,
    },
    personalInfo: {
        flex: 1,
        gap: 10,
    },
    infoField: {
        gap: 4,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.secondary,
    },
    infoWire: {
        height: 14,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.secondaryBorder,
    },
    buttons: {
        marginTop: 32,
        gap: 12,
        alignSelf: "stretch",
    },
    button: {
        width: "100%",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: colors.secondaryMuted,
        borderWidth: 1,
        borderColor: colors.secondaryBorder,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    buttonMedia: {
        width: 75,
        height: 75,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonIcon: {
        width: 75,
        height: 75,
    },
    buttonTextWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: colors.secondary,
        fontSize: 16,
        textAlign: "center",
    },
    bottomImage: {
        width: "100%",
        height: 220,
    },
});
