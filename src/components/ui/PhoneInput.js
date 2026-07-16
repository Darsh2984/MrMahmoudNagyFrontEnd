import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

// Common codes for this platform's region, "Other" lets any code be typed manually.
const COUNTRY_CODES = [
  { code: "+20", label: "🇪🇬 +20" },
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+965", label: "🇰🇼 +965" },
  { code: "+974", label: "🇶🇦 +974" },
  { code: "+973", label: "🇧🇭 +973" },
  { code: "+968", label: "🇴🇲 +968" },
  { code: "+962", label: "🇯🇴 +962" },
  { code: "+961", label: "🇱🇧 +961" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+1", label: "🇺🇸 +1" },
];

/** value/onChangeText carry the FULL phone string, e.g. "+20 1012345678" — this
 * component just splits that into a code picker + a plain number field. */
export function PhoneInput({ label, value, onChangeText, placeholder }) {
  const [open, setOpen] = useState(false);

  const parts = (value || "").split(" ");
  const currentCode = parts[0] || "+20";
  const number = parts.slice(1).join(" ");

  function setCode(code) {
    onChangeText(`${code} ${number}`.trim());
    setOpen(false);
  }

  function setNumber(text) {
    onChangeText(`${currentCode} ${text}`.trim());
  }

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={{ flexDirection: "row" }}>
        <Pressable onPress={() => setOpen((o) => !o)} style={styles.codeButton}>
          <Text style={{ color: colors.textPrimary }}>{currentCode} ▾</Text>
        </Pressable>
        <TextInput
          value={number}
          onChangeText={setNumber}
          placeholder={placeholder || "1012345678"}
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          style={styles.numberInput}
        />
      </View>
      {open ? (
        <View style={styles.dropdown}>
          {COUNTRY_CODES.map((c) => (
            <Pressable key={c.code} onPress={() => setCode(c.code)} style={styles.dropdownItem}>
              <Text>{c.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.xs },
  codeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
    justifyContent: "center",
  },
  numberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    marginTop: spacing.xs,
    maxHeight: 200,
  },
  dropdownItem: { padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.background },
});

export default PhoneInput;
