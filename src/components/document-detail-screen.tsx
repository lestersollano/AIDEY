import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { Text } from "@/components/text";
import { useTranslation } from "@/contexts/locale-context";
import { brand, colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";

function pressableStyle(baseStyle: object, pressedStyle: object) {
    return ({ pressed }: { pressed: boolean }) => [
        baseStyle,
        pressed && pressedStyle,
    ];
}

type DocumentDetailScreenProps = {
    documentId: string;
    title: string;
    children?: ReactNode;
};

export function DocumentDetailScreen({
    documentId,
    title,
    children,
}: DocumentDetailScreenProps) {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader
                title={<Text style={styles.headerTitle}>{title}</Text>}
            />
            <View style={styles.content}>
                <View style={styles.actions}>
                    <Pressable
                        style={pressableStyle(
                            styles.actionButton,
                            styles.actionButtonPressed,
                        )}
                        accessibilityRole="button"
                        onPress={() =>
                            router.push(`/documents/${documentId}/wala`)
                        }
                    >
                        <View style={styles.actionButtonContent}>
                            <View style={styles.actionButtonIconWrapper}>
                                <Image
                                    source={require("@/assets/images/mascot/cropped/id_wala.png")}
                                    style={styles.actionButtonIcon}
                                    contentFit="contain"
                                />
                            </View>
                            <Text style={styles.actionButtonText}>
                                {t("documents.dontHave", { title })}
                            </Text>
                        </View>
                    </Pressable>
                    <Pressable
                        style={pressableStyle(
                            styles.actionButton,
                            styles.actionButtonPressed,
                        )}
                        accessibilityRole="button"
                        onPress={() =>
                            router.push(`/documents/${documentId}/mayroon`)
                        }
                    >
                        <View style={styles.actionButtonContent}>
                            <View style={styles.actionButtonIconWrapper}>
                                <Image
                                    source={require("@/assets/images/mascot/cropped/id_mayroon.png")}
                                    style={styles.actionButtonIcon}
                                    contentFit="contain"
                                />
                            </View>
                            <Text style={styles.actionButtonText}>
                                {t("documents.alreadyHave", { title })}
                            </Text>
                        </View>
                    </Pressable>
                    <Text style={styles.hint}>{t("documents.detailHint")}</Text>
                </View>
                {children}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: fonts.semiBold,
        color: brand.navy,
        textAlign: "center",
    },
    content: {
        flex: 1,
        marginTop: 16,
    },
    actions: {
        gap: 14,
        alignItems: "center",
    },
    actionButton: {
        width: "100%",
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.secondaryBorder,
        backgroundColor: colors.primary,
        alignItems: "center",
        shadowColor: brand.navy,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    actionButtonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    actionButtonContent: {
        alignItems: "center",
        gap: 8,
        width: "100%",
    },
    actionButtonIconWrapper: {
        width: "100%",
        height: 180,
        alignItems: "center",
        justifyContent: "center",
    },
    actionButtonIcon: {
        width: 150,
        height: 150,
    },
    actionButtonText: {
        fontSize: 16,
        fontFamily: fonts.semiBold,
        color: brand.navy,
        textAlign: "center",
    },
    hint: {
        marginTop: 8,
        maxWidth: 320,
        fontSize: 15,
        fontFamily: fonts.regular,
        color: colors.secondary,
        textAlign: "center",
        lineHeight: 22,
    },
});
