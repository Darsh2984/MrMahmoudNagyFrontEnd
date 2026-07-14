import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const TONES = {
  neutral: { bg: colors.border, text: colors.textPrimary },
  success: { bg: "#E4EDE6", text: "#3F6B47" },
  danger: { bg: "#F6E2DD", text: colors.danger },
  warning: { bg: "#F6E6D6", text: colors.warning },
  info: { bg: "#DCE6E9", text: colors.primary },
};

export function Badge({ label, tone = "neutral" }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[typography.caption, { color: t.text, fontWeight: "600" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
});

export default Badge;
