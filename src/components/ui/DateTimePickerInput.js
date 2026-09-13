import React, { useMemo, useRef, useState } from "react";
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

import { colors, radius, spacing, typography } from "../../theme";
import {
  cairoInputValueToIso,
  formatEgyptDateTime,
  isoToCairoInputValue,
} from "../../utils/egyptTime";

function inputValueToPickerDate(value) {
  const cairoValue = isoToCairoInputValue(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(cairoValue);

  if (!match) {
    const nowInCairo = isoToCairoInputValue(new Date().toISOString());
    const nowMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(nowInCairo);
    return new Date(
      Number(nowMatch[1]),
      Number(nowMatch[2]) - 1,
      Number(nowMatch[3]),
      Number(nowMatch[4]),
      Number(nowMatch[5]),
    );
  }

  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );
}

function pickerDateToIso(date) {
  const wallValue = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-") + `T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return cairoInputValueToIso(wallValue);
}

export function DateTimePickerInput({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled = false,
  style,
}) {
  const inputRef = useRef(null);
  const selectedDate = useMemo(() => inputValueToPickerDate(value), [value]);
  const [open, setOpen] = useState(false);
  const [androidMode, setAndroidMode] = useState("date");
  const [draftDate, setDraftDate] = useState(selectedDate);

  function openPicker() {
    if (disabled) return;
    setDraftDate(selectedDate);
    setAndroidMode("date");
    setOpen(true);
  }

  function handleAndroidChange(event, date) {
    if (event.type !== "set" || !date) {
      setOpen(false);
      return;
    }

    if (androidMode === "date") {
      const combined = new Date(date);
      combined.setHours(draftDate.getHours(), draftDate.getMinutes(), 0, 0);
      setDraftDate(combined);
      setAndroidMode("time");
      return;
    }

    const combined = new Date(draftDate);
    combined.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChange(pickerDateToIso(combined));
    setOpen(false);
  }

  if (Platform.OS === "web") {
    const input = React.createElement("input", {
      ref: inputRef,
      type: "datetime-local",
      value: isoToCairoInputValue(value),
      disabled,
      "aria-label": "Deadline in Egypt time",
      onChange: (event) => onChange(cairoInputValueToIso(event.target.value)),
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
      },
    });

    return (
      <View style={style}>
        <View style={[styles.field, disabled && styles.disabled]}>
          {input}
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        </View>
        <Text style={styles.hint}>Egypt time (Cairo)</Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Pressable
        onPress={openPicker}
        disabled={disabled}
        style={({ pressed }) => [
          styles.field,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? formatEgyptDateTime(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
      </Pressable>
      <Text style={styles.hint}>Egypt time (Cairo)</Text>

      {open && Platform.OS === "android" ? (
        <DateTimePicker
          value={draftDate}
          mode={androidMode}
          display="default"
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Deadline · Egypt time</Text>
              <DateTimePicker
                value={draftDate}
                mode="datetime"
                display="spinner"
                minuteInterval={1}
                onChange={(_event, date) => date && setDraftDate(date)}
              />
              <View style={styles.actions}>
                <Pressable onPress={() => setOpen(false)} style={styles.actionButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onChange(pickerDateToIso(draftDate));
                    setOpen(false);
                  }}
                  style={[styles.actionButton, styles.confirmButton]}
                >
                  <Text style={styles.confirmText}>Select</Text>
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
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    overflow: "hidden",
  },
  value: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  placeholder: { color: colors.textMuted },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: 5 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.55 },
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
  modalTitle: { ...typography.h3, color: colors.primary, marginBottom: spacing.sm },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm, marginTop: spacing.sm },
  actionButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md },
  confirmButton: { backgroundColor: colors.primary },
  cancelText: { color: colors.textPrimary, fontWeight: "600" },
  confirmText: { color: colors.white, fontWeight: "700" },
});

export default DateTimePickerInput;
