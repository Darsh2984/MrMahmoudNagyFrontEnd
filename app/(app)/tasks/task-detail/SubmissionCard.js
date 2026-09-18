import React from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Card } from "../../../../src/components/ui/Card";
import { Badge } from "../../../../src/components/ui/Badge";
import { Button } from "../../../../src/components/ui/Button";

import {
  colors,
} from "../../../../src/theme";

import {
  formatFileSize,
  getInitial,
  getSubmissionStatus,
  isSubmissionDelegatedToUser,
} from "./taskDetail.helpers";

import { GradingForm } from "./GradingForm";
import { SubmissionAIGrading } from "../../../../src/components/tasks/TaskAIGrading";
import { styles } from "./taskSubmission.styles";
function formatDateTime(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unknown";
  }

  return date.toLocaleString();
}

export function SubmissionCard({
  submission,
  task,
  user,
  isAdminLevel,
  isSelected,
  canSelect,
  gradeForm,
  isGrading,
  editingSubmissionId,
  openingFileKey,
  delegationBusyId,
  onToggleSelection,
  onOpenFile,
  onDeleteCorrectedFile,
  onUpdateGrade,
  onUpdateComments,
  onSelectCorrectedFiles,
  onRemoveSelectedCorrectedFile,
  onGrade,
  onStartEditingGrade,
  onCancelEditingGrade,
  onOpenDelegate,
  onOpenReassign,
  onRemoveDelegation,
  onOpenDelegationHistory,
  onOpenGradingHistory,
  onOpenReopen,
}) {
  const graded =
    submission.grade !== null &&
    submission.grade !== undefined;

  const delegatedToCurrentUser =
    isSubmissionDelegatedToUser(
      submission,
      user,
    );

  const isEditingGrade =
    editingSubmissionId ===
    submission.id;

  const canGrade =
    !graded &&
    (isAdminLevel ||
      delegatedToCurrentUser);

  const canEditGrade =
    graded &&
    (isAdminLevel ||
      delegatedToCurrentUser);

  const canManageDelegation =
    isAdminLevel &&
    !graded;

  const status =
    getSubmissionStatus(
      submission,
      user?.id,
    );

  const studentFiles =
    Array.isArray(
      submission.files,
    )
      ? submission.files
      : [];

  const correctedFiles =
    Array.isArray(
      submission.correctedFiles,
    )
      ? submission.correctedFiles
      : [];

  const delegation =
    submission.delegation;

  const isDelegationBusy =
    Boolean(
      delegationBusyId &&
      (
        String(
          delegationBusyId,
        ) ===
          String(
            delegation?.id,
          ) ||
        String(
          delegationBusyId,
        ) ===
          String(
            submission.id,
          )
      ),
    );

  return (
    <Card style={styles.submissionCard}>
      {canSelect ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: isSelected,
          }}
          onPress={onToggleSelection}
          style={({ pressed }) => [
            styles.cardSelectionRow,
            pressed &&
              styles.pressed,
          ]}
        >
          <View
            style={[
              styles.checkbox,
              isSelected &&
                styles.checkboxSelected,
            ]}
          >
            {isSelected ? (
              <Ionicons
                name="checkmark"
                size={15}
                color={colors.white}
              />
            ) : null}
          </View>

          <Text style={styles.cardSelectionText}>
            Select for bulk delegation
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.submissionHeader}>
        <View style={styles.studentIdentity}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentAvatarText}>
              {getInitial(
                submission.student?.name,
              )}
            </Text>
          </View>

          <View style={styles.studentInfo}>
            <Text
              numberOfLines={1}
              style={styles.studentName}
            >
              {submission.student?.name ||
                "Unknown student"}
            </Text>

            <Text style={styles.studentMeta}>
              Submitted{" "}
              {formatDateTime(
                submission.submittedAt ||
                  submission.firstSubmittedAt,
              )}
            </Text>

            {submission.lastModifiedAt ? (
              <Text style={styles.studentMeta}>
                Last modified{" "}
                {formatDateTime(
                  submission.lastModifiedAt,
                )}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.statusBadges}>
          <Badge
            label={status.label}
            tone={status.tone}
          />

          {submission.lastModifiedAfterDeadline ||
          submission.wasModifiedAfterDeadline ? (
            <Badge
              label="Modified late"
              tone="warning"
            />
          ) : null}
        </View>
      </View>

      {submission.lastModifiedAfterDeadline ||
      submission.wasModifiedAfterDeadline ? (
        <View style={styles.lateWarning}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={colors.warning}
          />

          <View style={styles.lateWarningText}>
            <Text style={styles.lateWarningTitle}>
              Modified after deadline
            </Text>

            <Text style={styles.lateWarningDescription}>
              The student changed this submission after the
              task deadline.
            </Text>
          </View>
        </View>
      ) : null}

      <SubmissionFiles
        files={studentFiles}
        openingFileKey={openingFileKey}
        onOpenFile={onOpenFile}
      />

      {delegation ? (
        <View style={styles.delegationPanel}>
          <View style={styles.delegationIcon}>
            <Ionicons
              name="person-circle-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.delegationText}>
            <Text style={styles.delegationTitle}>
              Delegated to{" "}
              {delegation.assistant?.name ||
                "Assistant"}
            </Text>

            <Text style={styles.delegationSubtitle}>
              Assigned by{" "}
              {delegation.delegatedBy?.name ||
                "Teacher"}
              {delegation.delegatedAt
                ? ` on ${formatDateTime(
                    delegation.delegatedAt,
                  )}`
                : ""}
            </Text>

            {delegation.completedAt ? (
              <Text style={styles.delegationSubtitle}>
                Completed{" "}
                {formatDateTime(
                  delegation.completedAt,
                )}
              </Text>
            ) : null}
          </View>

          {isDelegationBusy ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          ) : null}
        </View>
      ) : null}

      {canManageDelegation ? (
        <View style={styles.delegationActions}>
          {!delegation ? (
            <Button
              title="Delegate"
              variant="outline"
              disabled={isDelegationBusy}
              onPress={onOpenDelegate}
            />
          ) : (
            <>
              <Button
                title="Reassign"
                variant="outline"
                disabled={isDelegationBusy}
                onPress={onOpenReassign}
              />

              <Button
                title="Remove delegation"
                variant="danger"
                disabled={isDelegationBusy}
                onPress={onRemoveDelegation}
              />
            </>
          )}
        </View>
      ) : null}

      {delegation || isAdminLevel ? (
        <View style={styles.historyActionRow}>
          <Button
            title="Delegation history"
            variant="outline"
            onPress={onOpenDelegationHistory}
          />
        </View>
      ) : null}

      {graded ? (
        <GradedResult
          submission={submission}
          task={task}
          correctedFiles={correctedFiles}
          canEditGrade={canEditGrade}
          isEditingGrade={isEditingGrade}
          isAdminLevel={isAdminLevel}
          openingFileKey={openingFileKey}
          onOpenFile={onOpenFile}
          onDeleteCorrectedFile={
            onDeleteCorrectedFile
          }
          onStartEditingGrade={
            onStartEditingGrade
          }
          onOpenGradingHistory={
            onOpenGradingHistory
          }
          onOpenReopen={
            onOpenReopen
          }
        />
      ) : null}

      {isAdminLevel || delegatedToCurrentUser ? (
        <SubmissionAIGrading submission={submission} />
      ) : null}

      {canGrade || isEditingGrade ? (
        <GradingForm
          submission={submission}
          gradeOutOf={task?.gradeOutOf}
          form={gradeForm}
          isSaving={isGrading}
          isEditing={isEditingGrade}
          onChangeGrade={onUpdateGrade}
          onChangeComments={onUpdateComments}
          onSelectFiles={
            onSelectCorrectedFiles
          }
          onRemoveSelectedFile={
            onRemoveSelectedCorrectedFile
          }
          onSave={onGrade}
          onCancelEditing={
            onCancelEditingGrade
          }
        />
      ) : null}
    </Card>
  );
}

function SubmissionFiles({
  files,
  openingFileKey,
  onOpenFile,
}) {
  return (
    <View style={styles.filesSection}>
      <View style={styles.filesSectionHeader}>
        <Text style={styles.filesSectionTitle}>
          Student files
        </Text>

        <Text style={styles.filesCount}>
          {files.length}{" "}
          {files.length === 1
            ? "file"
            : "files"}
        </Text>
      </View>

      {!files.length ? (
        <View style={styles.noFileBox}>
          <Ionicons
            name="document-outline"
            size={20}
            color={colors.textMuted}
          />

          <Text style={styles.noFileText}>
            No submission files were found.
          </Text>
        </View>
      ) : (
        files.map((file, index) => {
          const fileKey =
            `submission:${file.id || index}`;

          const opening =
            openingFileKey === fileKey;

          return (
            <Pressable
              key={file.id || fileKey}
              disabled={
                opening ||
                !file.fileUrl
              }
              onPress={() =>
                onOpenFile(
                  file.fileUrl,
                  fileKey,
                )
              }
              style={({ pressed }) => [
                styles.fileRow,
                pressed &&
                  styles.pressed,
                !file.fileUrl &&
                  styles.disabled,
              ]}
            >
              <View style={styles.fileOrder}>
                <Text style={styles.fileOrderText}>
                  {index + 1}
                </Text>
              </View>

              <View style={styles.fileDetails}>
                <Text
                  numberOfLines={1}
                  style={styles.fileName}
                >
                  {file.originalName ||
                    `Submission file ${index + 1}`}
                </Text>

                <Text style={styles.fileMeta}>
                  {formatFileSize(file.size)}
                  {file.uploadedAt
                    ? ` • ${formatDateTime(
                        file.uploadedAt,
                      )}`
                    : ""}
                </Text>
              </View>

              {opening ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                />
              ) : (
                <Ionicons
                  name="open-outline"
                  size={19}
                  color={colors.primary}
                />
              )}
            </Pressable>
          );
        })
      )}
    </View>
  );
}

function GradedResult({
  submission,
  task,
  correctedFiles,
  canEditGrade,
  isEditingGrade,
  isAdminLevel,
  openingFileKey,
  onOpenFile,
  onDeleteCorrectedFile,
  onStartEditingGrade,
  onOpenGradingHistory,
  onOpenReopen,
}) {
  return (
    <View style={styles.gradedPanel}>
      <View style={styles.gradedHeader}>
        <View style={styles.gradedIcon}>
          <Ionicons
            name="checkmark-circle-outline"
            size={23}
            color={colors.secondary}
          />
        </View>

        <View style={styles.gradedText}>
          <Text style={styles.gradedTitle}>
            Submission graded
          </Text>

          <Text style={styles.gradedSubtitle}>
            {submission.grade}/
            {task?.gradeOutOf ?? "-"}
          </Text>

          {submission.gradedBy?.name ? (
            <Text style={styles.gradedByText}>
              Graded by{" "}
              {submission.gradedBy.name}
              {submission.gradedAt
                ? ` on ${formatDateTime(
                    submission.gradedAt,
                  )}`
                : ""}
            </Text>
          ) : null}
        </View>
      </View>

      {submission.comments ? (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackLabel}>
            Feedback
          </Text>

          <Text style={styles.feedbackText}>
            {submission.comments}
          </Text>
        </View>
      ) : null}

      {correctedFiles.length ? (
        <View style={styles.returnedFilesSection}>
          <Text style={styles.filesSectionTitle}>
            Returned corrected files
          </Text>

          {correctedFiles.map(
            (file, index) => {
              const openKey =
                `corrected:${file.id}`;

              const opening =
                openingFileKey === openKey;

              return (
                <View
                  key={file.id || openKey}
                  style={styles.correctedFileRow}
                >
                  <Pressable
                    disabled={
                      opening ||
                      !file.fileUrl
                    }
                    onPress={() =>
                      onOpenFile(
                        file.fileUrl,
                        openKey,
                      )
                    }
                    style={({ pressed }) => [
                      styles.correctedFileOpenArea,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <View
                      style={styles.correctedFileIcon}
                    >
                      <Ionicons
                        name="document-attach-outline"
                        size={18}
                        color={colors.secondary}
                      />
                    </View>

                    <View style={styles.fileDetails}>
                      <Text
                        numberOfLines={1}
                        style={styles.fileName}
                      >
                        {file.originalName ||
                          `Corrected file ${index + 1}`}
                      </Text>

                      <Text style={styles.fileMeta}>
                        {formatFileSize(file.size)}
                        {file.uploadedBy?.name
                          ? ` • ${file.uploadedBy.name}`
                          : ""}
                      </Text>
                    </View>

                    {opening ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.primary}
                      />
                    ) : (
                      <Ionicons
                        name="open-outline"
                        size={19}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>

                  {canEditGrade ? (
                    <Pressable
                      accessibilityLabel="Delete corrected file"
                      disabled={opening}
                      onPress={() =>
                        onDeleteCorrectedFile(
                          file.id,
                        )
                      }
                      style={({ pressed }) => [
                        styles.correctedFileDeleteButton,
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.danger}
                      />
                    </Pressable>
                  ) : null}
                </View>
              );
            },
          )}
        </View>
      ) : null}

      <View style={styles.gradedActions}>
        {canEditGrade &&
        !isEditingGrade ? (
          <Button
            title="Edit grade"
            variant="outline"
            onPress={onStartEditingGrade}
          />
        ) : null}

        <Button
          title="Grading history"
          variant="outline"
          onPress={onOpenGradingHistory}
        />

        {isAdminLevel ? (
          <Button
            title="Reopen grading"
            variant="warning"
            onPress={onOpenReopen}
          />
        ) : null}
      </View>
    </View>
  );
}

export default SubmissionCard;
