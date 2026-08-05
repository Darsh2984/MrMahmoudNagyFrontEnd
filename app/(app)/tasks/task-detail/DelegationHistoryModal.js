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

export function DelegationModal({
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
  const isBulk =
    mode === "BULK_ASSIGN";

  const isReassign =
    mode === "REASSIGN";

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

  function selectAssistant(assistantId) {
    if (busyId) {
      return;
    }

    onSelectAssistant(assistantId);
  }

  return (
    <Modal
      visible={Boolean(visible)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
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
              accessibilityLabel="Close"
              disabled={Boolean(busyId)}
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalClose,
                pressed &&
                  !busyId &&
                  styles.pressed,
                busyId &&
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
                  {selectedDelegation.assistant.name}
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
              value={assistantSearch}
              onChangeText={onChangeSearch}
              editable={!busyId}
              placeholder="Search assistants"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />

            {assistantSearch ? (
              <Pressable
                disabled={Boolean(busyId)}
                onPress={() => onChangeSearch("")}
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
              value={reason}
              onChangeText={onChangeReason}
              editable={!busyId}
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

          {!assistants?.length ? (
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
              {assistants.map((assistant) => {
                const groupNames =
                  getAssistantGroupNames?.(
                    assistant.id,
                  ) || [];

                const currentAssistantId =
                  selectedDelegation?.assistantId ||
                  selectedDelegation?.assistant?.id;

                const isCurrentAssistant =
                  isReassign &&
                  String(currentAssistantId) ===
                    String(assistant.id);

                const isBusy =
                  Boolean(busyId);

                return (
                  <Pressable
                    key={assistant.id}
                    disabled={
                      isBusy ||
                      isCurrentAssistant
                    }
                    onPress={() =>
                      selectAssistant(
                        assistant.id,
                      )
                    }
                    style={({ pressed }) => [
                      styles.assistantRow,
                      isCurrentAssistant &&
                        styles.assistantRowCurrent,
                      pressed &&
                        !isBusy &&
                        !isCurrentAssistant &&
                        styles.pressed,
                      (isBusy ||
                        isCurrentAssistant) &&
                        styles.disabled,
                    ]}
                  >
                    <View style={styles.assistantAvatar}>
                      <Text style={styles.assistantAvatarText}>
                        {getInitials(
                          assistant.name,
                        )}
                      </Text>
                    </View>

                    <View style={styles.assistantInfo}>
                      <View style={styles.assistantNameRow}>
                        <Text
                          numberOfLines={1}
                          style={styles.assistantName}
                        >
                          {assistant.name ||
                            "Unnamed assistant"}
                        </Text>

                        {assistant.isHeadAssistant ? (
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
                        {assistant.email || ""}
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
              disabled={Boolean(busyId)}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default DelegationModal;