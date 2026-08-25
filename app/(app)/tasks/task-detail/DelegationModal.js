import React from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Button } from "../../../../src/components/ui/Button";
import { colors } from "../../../../src/theme";

import {
  getInitials,
} from "./taskDetail.helpers";

import { styles } from "./modal.styles";

function DelegationModal({
  visible,
  mode,
  selectedSubmission,
  selectedSubmissions,
  selectedDelegation,
  assistants,
  assistantSearch,
  reason,
  error,
  busyId,
  getAssistantGroupNames,
  onChangeSearch,
  onChangeReason,
  onSelectAssistant,
  onClose,
}) {
  const isVisible = Boolean(visible);

  const isBusy = Boolean(busyId);

  const isBulk =
    mode === "BULK_ASSIGN";

  const isReassign =
    mode === "REASSIGN";

  const safeAssistants =
    Array.isArray(assistants)
      ? assistants
      : [];

  const modalTitle = isBulk
    ? "Delegate selected submissions"
    : isReassign
      ? "Reassign submission"
      : "Delegate submission";

  const modalDescription = isBulk
    ? `Assign ${selectedSubmissions?.length || 0} selected submissions to one eligible assistant.`
    : isReassign
      ? `Move ${
          selectedSubmission?.student?.name ||
          "this student's"
        } submission to another eligible assistant.`
      : `Assign ${
          selectedSubmission?.student?.name ||
          "this student"
        } to an eligible assistant for grading.`;

  const currentAssistantId =
    selectedDelegation?.assistantId ||
    selectedDelegation?.assistant?.id;

  function handleClose() {
    if (isBusy) {
      return;
    }

    onClose?.();
  }

  function selectAssistant(assistantId) {
    if (isBusy || !assistantId) {
      return;
    }

    onSelectAssistant?.(assistantId);
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          disabled={isBusy}
          onPress={handleClose}
        />

        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIcon}>
              <Ionicons
                name={
                  isReassign
                    ? "swap-horizontal-outline"
                    : "person-add-outline"
                }
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.modalHeadingCopy}>
              <Text style={styles.modalTitle}>
                {modalTitle}
              </Text>

              <Text style={styles.mutedText}>
                {modalDescription}
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Close delegation modal"
              disabled={isBusy}
              onPress={handleClose}
              style={({ pressed }) => [
                styles.modalClose,
                pressed &&
                  !isBusy &&
                  styles.pressed,
                isBusy &&
                  styles.disabled,
              ]}
            >
              <Ionicons
                name="close"
                size={22}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>

          {isReassign &&
          selectedDelegation?.assistant ? (
            <View style={styles.currentAssignmentBox}>
              <View style={styles.currentAssignmentIcon}>
                <Ionicons
                  name="person-circle-outline"
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View style={styles.currentAssignmentCopy}>
                <Text style={styles.currentAssignmentLabel}>
                  Currently assigned to
                </Text>

                <Text style={styles.currentAssignmentValue}>
                  {selectedDelegation.assistant.name ||
                    "Assistant"}
                </Text>
              </View>
            </View>
          ) : null}

          {error ? (
            <View style={styles.modalErrorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color={colors.danger}
              />

              <Text style={styles.modalErrorText}>
                {error}
              </Text>
            </View>
          ) : null}

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textMuted}
            />

            <TextInput
              value={assistantSearch || ""}
              onChangeText={onChangeSearch}
              editable={!isBusy}
              placeholder="Search assistants"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.searchInput}
            />

            {assistantSearch ? (
              <Pressable
                accessibilityLabel="Clear assistant search"
                disabled={isBusy}
                onPress={() => onChangeSearch?.("")}
                style={({ pressed }) => [
                  pressed &&
                    !isBusy &&
                    styles.pressed,
                  isBusy &&
                    styles.disabled,
                ]}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.reasonField}>
            <Text style={styles.formLabel}>
              Reason or note
            </Text>

            <TextInput
              value={reason || ""}
              onChangeText={onChangeReason}
              editable={!isBusy}
              multiline
              textAlignVertical="top"
              placeholder={
                isReassign
                  ? "Optional reason for reassignment..."
                  : "Optional instructions for the assistant..."
              }
              placeholderTextColor={colors.textMuted}
              style={styles.reasonInput}
            />
          </View>

          <Text style={styles.listTitle}>
            Eligible assistants
          </Text>

          {!safeAssistants.length ? (
            <View style={styles.modalState}>
              <Ionicons
                name="people-outline"
                size={34}
                color={colors.textMuted}
              />

              <Text style={styles.modalEmptyTitle}>
                No eligible assistants
              </Text>

              <Text style={styles.modalEmptyText}>
                No assistant with homework-grading permission
                is assigned to this task's groups.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.assistantList}
              contentContainerStyle={
                styles.assistantListContent
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {safeAssistants.map((assistant) => {
                const assistantId =
                  assistant?.id;

                const groupNames =
                  getAssistantGroupNames?.(
                    assistantId,
                  ) || [];

                const isCurrentAssistant =
                  isReassign &&
                  currentAssistantId != null &&
                  String(currentAssistantId) ===
                    String(assistantId);

                const disabled =
                  isBusy ||
                  isCurrentAssistant ||
                  !assistantId;

                return (
                  <Pressable
                    key={
                      assistantId ||
                      assistant?.email ||
                      assistant?.name
                    }
                    disabled={disabled}
                    onPress={() =>
                      selectAssistant(
                        assistantId,
                      )
                    }
                    style={({ pressed }) => [
                      styles.assistantRow,
                      isCurrentAssistant &&
                        styles.assistantRowCurrent,
                      pressed &&
                        !disabled &&
                        styles.pressed,
                      disabled &&
                        styles.disabled,
                    ]}
                  >
                    <View style={styles.assistantAvatar}>
                      <Text style={styles.assistantAvatarText}>
                        {getInitials(
                          assistant?.name,
                        )}
                      </Text>
                    </View>

                    <View style={styles.assistantInfo}>
                      <View style={styles.assistantNameRow}>
                        <Text
                          numberOfLines={1}
                          style={styles.assistantName}
                        >
                          {assistant?.name ||
                            "Unnamed assistant"}
                        </Text>

                        {assistant?.isHeadAssistant ? (
                          <View style={styles.headBadge}>
                            <Text style={styles.headBadgeText}>
                              HEAD
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={styles.assistantEmail}
                      >
                        {assistant?.email || ""}
                      </Text>

                      <Text
                        numberOfLines={2}
                        style={styles.assistantGroups}
                      >
                        {groupNames.length
                          ? groupNames.join(", ")
                          : "No matching group names"}
                      </Text>
                    </View>

                    {isCurrentAssistant ? (
                      <Text style={styles.currentText}>
                        Current
                      </Text>
                    ) : isBusy ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.primary}
                      />
                    ) : (
                      <View style={styles.assistantSelectButton}>
                        <Text style={styles.assistantSelectText}>
                          {isReassign
                            ? "Reassign"
                            : "Assign"}
                        </Text>

                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              disabled={isBusy}
              onPress={handleClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export {
  DelegationModal,
};

export default DelegationModal;