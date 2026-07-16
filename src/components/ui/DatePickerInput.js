import React, {
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../theme";
import { formatDate } from "../../utils/formatDate";

function toLocalDate(value) {
  if (!value) {
    return new Date();
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? new Date()
    : parsed;
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toWebBoundary(value) {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return toIsoDate(value);
  }

  return value;
}

function WebDatePicker({
  label,
  value,
  onChange,
  placeholder,
  minimumDate,
  maximumDate,
  disabled,
  error,
}) {
  const inputRef = useRef(null);

  function openWebPicker() {
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

  const input = React.createElement("input", {
    ref: inputRef,
    type: "date",
    value: value || "",
    disabled,
    min: toWebBoundary(minimumDate),
    max: toWebBoundary(maximumDate),
    "aria-label": label || placeholder,
    onChange: (event) => {
      onChange(event.target.value);
    },
    style: {
      flex: 1,
      width: "100%",
      minWidth: 0,
      height: 46,
      border: "none",
      outline: "none",
      backgroundColor: "transparent",
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: "inherit",
      cursor: disabled ? "not-allowed" : "pointer",

      // Hide inconsistent browser icon because we add our own.
      WebkitAppearance: "none",
      MozAppearance: "textfield",
      appearance: "none",
    },
  });

  return (
    <>
      <View
        style={[
          styles.field,
          error ? styles.errorBorder : null,
          disabled ? styles.disabled : null,
        ]}
      >
        {input}

        <Pressable
          onPress={openWebPicker}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Open calendar"
          style={({ pressed }) => [
            styles.webCalendarButton,
            pressed ? styles.webCalendarButtonPressed : null,
          ]}
        >
          <Text style={styles.webCalendarIcon}>📅</Text>
        </Pressable>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </>
  );
}

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
  const selectedDate = useMemo(
    () => toLocalDate(value),
    [value]
  );

  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(
    selectedDate
  );

  function openPicker() {
    if (disabled) {
      return;
    }

    setDraftDate(selectedDate);
    setOpen(true);
  }

  function handleNativeChange(event, date) {
    if (Platform.OS === "android") {
      setOpen(false);

      if (event.type === "set" && date) {
        onChange(toIsoDate(date));
      }

      return;
    }

    if (date) {
      setDraftDate(date);
    }
  }

  if (Platform.OS === "web") {
    return (
      <View style={[styles.wrapper, style]}>
        {label ? (
          <Text style={styles.label}>{label}</Text>
        ) : null}

        <WebDatePicker
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          disabled={disabled}
          error={error}
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <Pressable
        onPress={openPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        style={({ pressed }) => [
          styles.field,
          error ? styles.errorBorder : null,
          pressed && !disabled ? styles.pressed : null,
          disabled ? styles.disabled : null,
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

        <Ionicons
          name="calendar-outline"
          size={20}
          color={colors.primary}
        />
      </Pressable>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {open && Platform.OS === "android" ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleNativeChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => setOpen(false)}
          >
            <Pressable
              style={styles.modalCard}
              onPress={() => {}}
            >
              <Text style={styles.modalTitle}>
                {label || "Select date"}
              </Text>

              <DateTimePicker
                value={draftDate}
                mode="date"
                display="inline"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={handleNativeChange}
              />

              <View style={styles.actions}>
                <Pressable
                  onPress={() => setOpen(false)}
                  style={styles.actionButton}
                >
                  <Text style={styles.cancelText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    onChange(toIsoDate(draftDate));
                    setOpen(false);
                  }}
                  style={[
                    styles.actionButton,
                    styles.confirmButton,
                  ]}
                >
                  <Text style={styles.confirmText}>
                    Select
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
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
    overflow: "hidden",
  },

  value: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },

  placeholder: {
    color: colors.textMuted,
  },

  calendarIcon: {
    fontSize: 18,
    marginLeft: spacing.sm,
  },

  webCalendarButton: {
    width: 42,
    height: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    marginLeft: spacing.xs,
  },

  webCalendarButtonPressed: {
    opacity: 0.7,
  },

  webCalendarIcon: {
    fontSize: 19,
  },

  pressed: {
    opacity: 0.8,
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

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 60, 73, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  modalTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },

  confirmButton: {
    backgroundColor: colors.primary,
  },

  cancelText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },

  confirmText: {
    color: colors.white,
    fontWeight: "700",
  },
});

export default DatePickerInput;