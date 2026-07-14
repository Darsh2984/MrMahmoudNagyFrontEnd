import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

export function Input({ label, value, onChangeText, secureTextEntry, placeholder, error, ...rest }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          { borderColor: error ? colors.danger : focused ? colors.secondary : colors.border },
        ]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});

export default Input;
