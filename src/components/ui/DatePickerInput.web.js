import React, { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../theme";

import { formatDate } from "../../utils/formatDate";

export function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = "Select date",
  error,
  minimumDate,
  maximumDate,
  style,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const min =
    minimumDate instanceof Date
      ? toIsoDate(minimumDate)
      : minimumDate;

  const max =
    maximumDate instanceof Date
      ? toIsoDate(maximumDate)
      : maximumDate;

  function openCalendar() {
    if (disabled) {
      return;
    }

    const input = inputRef.current;

    if (!input) {
      return;
    }

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    } catch {
      input.focus();
      input.click();
    }
  }

  const nativeDateInput = React.createElement("input", {
    ref: inputRef,
    type: "date",
    value: value || "",
    disabled,
    min,
    max,
    "aria-label": label || placeholder,

    onChange: (event) => {
      onChange(event.target.value);
    },

    style: {
      position: "absolute",
      width: 1,
      height: 1,
      opacity: 0,
      pointerEvents: "none",
    },
  });

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      {nativeDateInput}

      <Pressable
        onPress={openCalendar}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        style={({ pressed }) => [
          styles.field,
          error ? styles.errorBorder : null,
          disabled ? styles.disabled : null,
          pressed && !disabled ? styles.pressed : null,
        ]}
      >
        <Text
          style={[
            styles.value,
            !value ? styles.placeholder : null,
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>

        <View style={styles.calendarButton}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={colors.primary}
          />
        </View>
      </Pressable>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </View>
  );
}

function toIsoDate(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm,
  },

  label: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  field: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingLeft: spacing.sm + 2,
    paddingRight: spacing.xs,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
  },

  value: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },

  placeholder: {
    color: colors.textMuted,
  },

  calendarButton: {
    width: 40,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },

  

  pressed: {
    opacity: 0.78,
  },

  disabled: {
    opacity: 0.55,
  },

  errorBorder: {
    borderColor: colors.danger,
  },

  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});

export default DatePickerInput;