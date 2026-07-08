import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { Text } from "@/components/text";
import { brand, colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";

export type DropdownOption = {
    value: string;
    label: string;
};

type DropdownProps = {
    options: DropdownOption[];
    value: string | null;
    onChange: (value: string) => void;
    placeholder: string;
    accessibilityLabel?: string;
    style?: ViewStyle;
};

export function Dropdown({
    options,
    value,
    onChange,
    placeholder,
    accessibilityLabel,
    style,
}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find((option) => option.value === value);
    const label = selectedOption?.label ?? placeholder;

    return (
        <View style={[styles.container, open && styles.containerOpen, style]}>
            <Pressable
                style={({ pressed }) => [
                    styles.trigger,
                    open && styles.triggerOpen,
                    pressed && styles.triggerPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel ?? placeholder}
                accessibilityState={{ expanded: open }}
                onPress={() => setOpen((current) => !current)}
            >
                <Text
                    style={[
                        styles.triggerText,
                        !selectedOption && styles.placeholderText,
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
                <SymbolView
                    name={{
                        ios: open ? "chevron.up" : "chevron.down",
                        android: open ? "expand_less" : "expand_more",
                        web: open ? "expand_less" : "expand_more",
                    }}
                    size={18}
                    tintColor={brand.navy}
                />
            </Pressable>

            {open ? (
                <View style={styles.menu}>
                    {options.map((option, index) => {
                        const selected = option.value === value;

                        return (
                            <View key={option.value}>
                                {index > 0 ? (
                                    <View style={styles.divider} />
                                ) : null}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.option,
                                        selected && styles.optionSelected,
                                        pressed && styles.optionPressed,
                                    ]}
                                    accessibilityRole="menuitem"
                                    accessibilityState={{ selected }}
                                    onPress={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selected && styles.optionTextSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {selected ? (
                                        <SymbolView
                                            name={{
                                                ios: "checkmark",
                                                android: "check",
                                                web: "check",
                                            }}
                                            size={16}
                                            tintColor={brand.teal}
                                        />
                                    ) : null}
                                </Pressable>
                            </View>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        position: "relative",
        zIndex: 1,
    },
    containerOpen: {
        zIndex: 20,
    },
    trigger: {
        width: "100%",
        minHeight: 52,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderColor: colors.secondaryBorder,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        shadowColor: brand.navy,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    triggerOpen: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomColor: "transparent",
        shadowOpacity: 0,
        elevation: 0,
    },
    triggerPressed: {
        opacity: 0.85,
    },
    triggerText: {
        flex: 1,
        fontSize: 16,
        fontFamily: fonts.semiBold,
        color: brand.navy,
    },
    placeholderText: {
        color: colors.secondaryPlaceholder,
        fontFamily: fonts.regular,
    },
    menu: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        width: "100%",
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: colors.secondaryBorder,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        backgroundColor: colors.primary,
        overflow: "hidden",
        shadowColor: brand.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 20,
    },
    option: {
        minHeight: 48,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    optionSelected: {
        backgroundColor: colors.secondaryMuted,
    },
    optionPressed: {
        backgroundColor: colors.secondaryMuted,
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        fontFamily: fonts.regular,
        color: brand.navy,
    },
    optionTextSelected: {
        fontFamily: fonts.semiBold,
    },
    divider: {
        height: 1,
        backgroundColor: colors.secondaryBorder,
        marginHorizontal: 16,
    },
});
