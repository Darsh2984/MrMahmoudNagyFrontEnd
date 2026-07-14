import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const VARIANTS = {
  primary: { bg: colors.primary, text: colors.white },
  secondary: { bg: colors.secondary, text: colors.white },
  danger: { bg: colors.danger, text: colors.white },
  warning: { bg: colors.warning, text: colors.white },
  outline: { bg: "transparent", text: colors.primary, borderColor: colors.primary },
};

export function Button({ title, onPress, variant = "primary", disabled, loading, style }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.borderColor || "transparent",
          borderWidth: v.borderColor ? 1 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text style={[typography.button, { color: v.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Button;
