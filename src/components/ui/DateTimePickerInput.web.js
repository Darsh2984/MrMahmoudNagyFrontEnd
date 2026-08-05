import React from "react";
import {
  Text,
  View,
} from "react-native";

import {
  colors,
  radius,
  spacing,
} from "../../theme";

function toLocalInputValue(date) {
  if (!(date instanceof Date)) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() -
      offset * 60 * 1000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
}

export function DateTimePickerInput({
  label,
  value,
  onChange,
  minimumDate,
  disabled = false,
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: colors.textPrimary,
          }}
        >
          {label}
        </Text>
      ) : null}

      <input
        type="datetime-local"
        disabled={disabled}
        value={toLocalInputValue(value)}
        min={toLocalInputValue(
          minimumDate
        )}
        onChange={(event) => {
          const raw =
            event.target.value;

          onChange(
            raw
              ? new Date(raw)
              : null
          );
        }}
        style={{
          width: "100%",
          minHeight: 48,
          boxSizing: "border-box",
          padding: `0 ${spacing.md}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.md,
          backgroundColor: disabled
            ? colors.background
            : colors.white,
          color: colors.textPrimary,
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
        }}
      />
    </View>
  );
}