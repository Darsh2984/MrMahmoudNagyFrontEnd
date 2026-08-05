import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import {
  colors,
  radius,
  spacing,
} from "../../theme";

export function DateTimePickerInput({
  label,
  value,
  onChange,
  placeholder = "Select date and time",
  minimumDate,
  disabled = false,
}) {
  const [visible, setVisible] =
    useState(false);

  const [mode, setMode] =
    useState("date");

  const [temporaryValue, setTemporaryValue] =
    useState(value || new Date());

  function openPicker() {
    if (disabled) {
      return;
    }

    setTemporaryValue(
      value || minimumDate || new Date()
    );

    setMode("date");
    setVisible(true);
  }

  function handleChange(
    event,
    selectedDate
  ) {
    if (
      Platform.OS === "android" &&
      event.type === "dismissed"
    ) {
      setVisible(false);
      return;
    }

    if (!selectedDate) {
      return;
    }

    setTemporaryValue(selectedDate);

    if (
      Platform.OS === "android" &&
      mode === "date"
    ) {
      setMode("time");
      return;
    }

    if (
      Platform.OS === "android" &&
      mode === "time"
    ) {
      onChange(selectedDate);
      setVisible(false);
    }
  }

  function confirmIOS() {
    onChange(temporaryValue);
    setVisible(false);
  }

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

      <Pressable
        disabled={disabled}
        onPress={openPicker}
        style={({ pressed }) => ({
          minHeight: 48,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: disabled
            ? colors.background
            : colors.white,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Ionicons
          name="calendar-outline"
          size={19}
          color={colors.primary}
        />

        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: value
              ? colors.textPrimary
              : colors.textMuted,
          }}
        >
          {value
            ? value.toLocaleString()
            : placeholder}
        </Text>

        {value && !disabled ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onChange(null);
            }}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </Pressable>

      {visible &&
      Platform.OS === "android" ? (
        <DateTimePicker
          value={temporaryValue}
          mode={mode}
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setVisible(false)
          }
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: spacing.lg,
              backgroundColor:
                "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: 420,
                padding: spacing.lg,
                borderRadius: radius.lg,
                backgroundColor:
                  colors.white,
              }}
            >
              <DateTimePicker
                value={temporaryValue}
                mode="datetime"
                minimumDate={minimumDate}
                display="spinner"
                onChange={(
                  event,
                  selectedDate
                ) => {
                  if (selectedDate) {
                    setTemporaryValue(
                      selectedDate
                    );
                  }
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent:
                    "flex-end",
                  gap: spacing.sm,
                  marginTop: spacing.md,
                }}
              >
                <Pressable
                  onPress={() =>
                    setVisible(false)
                  }
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color:
                        colors.textMuted,
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={confirmIOS}
                >
                  <Text
                    style={{
                      fontWeight: "800",
                      color:
                        colors.primary,
                    }}
                  >
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}