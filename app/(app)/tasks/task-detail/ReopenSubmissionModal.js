import React from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Button } from "../../../../src/components/ui/Button";
import { colors } from "../../../../src/theme";

import {
  formatGradeValue,
} from "./taskDetail.helpers";

import { styles } from "./modal.styles";

export function ReopenSubmissionModal({
  submission,
  gradeOutOf,
  reason,
  loading,
  onChangeReason,
  onConfirm,
  onClose,
}) {
  const currentGrade = formatGradeValue(
    submission?.grade,
    gradeOutOf
  );

  return (
    <Modal
      visible={Boolean(submission)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          disabled={loading}
          onPress={onClose}
        />

        <View style={styles.reopenModalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.reopenModalIcon}>
              <Ionicons
                name="refresh-outline"
                size={24}
                color={colors.warning}
              />
            </View>

            <View style={styles.modalHeadingCopy}>
              <Text style={styles.modalTitle}>
                Reopen grading
              </Text>

              <Text style={styles.mutedText}>
                Clear the visible grade and return this
                submission to pending grading.
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Close"
              disabled={loading}
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalClose,
                pressed &&
                  !loading &&
                  styles.pressed,
                loading &&
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

          <View style={styles.reopenSummary}>
            <View style={styles.reopenSummaryIcon}>
              <Ionicons
                name="document-text-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <View style={styles.reopenSummaryCopy}>
              <Text
                numberOfLines={1}
                style={styles.reopenStudentName}
              >
                {submission?.student?.name || "Student"}
              </Text>

              <Text style={styles.reopenCurrentGrade}>
                Current grade: {currentGrade}
              </Text>
            </View>
          </View>

          <View style={styles.reopenWarning}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={colors.warning}
            />

            <Text style={styles.reopenWarningText}>
              Reopening will remove the visible grade,
              feedback, grader and grading date from the
              current submission. The previous grading details
              will remain available in grading history.
            </Text>
          </View>

          <View style={styles.reasonField}>
            <Text style={styles.formLabel}>
              Reopen reason
            </Text>

            <TextInput
              value={reason}
              onChangeText={onChangeReason}
              editable={!loading}
              multiline
              textAlignVertical="top"
              placeholder="Explain why this submission is being reopened..."
              placeholderTextColor={colors.textMuted}
              style={styles.reopenReasonInput}
            />

            <Text style={styles.mutedText}>
              A reason is required before reopening the
              submission.
            </Text>
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              disabled={loading}
              onPress={onClose}
            />

            <Button
              title={
                loading
                  ? "Reopening..."
                  : "Reopen submission"
              }
              variant="warning"
              disabled={loading}
              onPress={onConfirm}
            />

            {loading ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default ReopenSubmissionModal;