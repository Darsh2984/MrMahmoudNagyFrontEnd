import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { Button } from "../../../src/components/ui/Button";

import { useAuth } from "../../../src/contexts/AuthContext";

import {
  colors,
} from "../../../src/theme";

import {
  formatFileSize,
} from "./task-detail/taskDetail.helpers";

import {
  useTaskDetail,
} from "./task-detail/useTaskDetail";

import SubmissionCard from "./task-detail/SubmissionCard";
import { TaskAIGradingProvider, TaskAIReferences } from "../../../src/components/tasks/TaskAIGrading";
import DelegationModal from "./task-detail/DelegationModal";
import DelegationHistoryModal from "./task-detail/DelegationHistoryModal";
import GradingHistoryModal from "./task-detail/GradingHistoryModal";
import ReopenSubmissionModal from "./task-detail/ReopenSubmissionModal";

import {
  styles,
} from "./[taskId].styles";

function formatDateTime(value) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Not specified";
  }

  return date.toLocaleString();
}

function getTaskStatus(task) {
  if (!task) {
    return {
      label: "Unknown",
      tone: "neutral",
    };
  }

  const deadline = task.deadline
    ? new Date(task.deadline)
    : null;

  if (
    deadline &&
    !Number.isNaN(
      deadline.getTime(),
    ) &&
    deadline < new Date()
  ) {
    return {
      label: "Deadline passed",
      tone: "warning",
    };
  }

  return {
    label: "Active",
    tone: "success",
  };
}

function getRouteParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

function HardcopyStudentCard({ student, busy, onMarkHardcopy }) {
  const groupNames = Array.isArray(student?.groups)
    ? student.groups.map((group) => group?.name).filter(Boolean)
    : [];

  return (
    <Card style={styles.hardcopyStudentCard}>
      <View style={styles.hardcopyStudentInfo}>
        <View style={styles.hardcopyStudentIcon}>
          <Ionicons name="person-outline" size={21} color={colors.primary} />
        </View>
        <View style={styles.hardcopyStudentCopy}>
          <Text style={styles.hardcopyStudentName}>
            {student?.name || "Unknown student"}
          </Text>
          {student?.email ? (
            <Text style={styles.hardcopyStudentMeta}>{student.email}</Text>
          ) : null}
          {groupNames.length ? (
            <Text style={styles.hardcopyStudentMeta}>
              {groupNames.join(", ")}
            </Text>
          ) : null}
        </View>
      </View>

      <Button
        title="Mark as hardcopy submitted"
        variant="outline"
        loading={busy}
        disabled={busy}
        onPress={onMarkHardcopy}
      />
    </Card>
  );
}

export default function TaskDetail() {
  const router = useRouter();

  const params =
    useLocalSearchParams();

  const { width } =
    useWindowDimensions();

  const { user } =
    useAuth();

  const taskId = Array.isArray(
    params.taskId,
  )
    ? params.taskId[0]
    : params.taskId;

  const returnYearId = getRouteParam(params.yearId);
  const returnGroupId = getRouteParam(params.groupId);

  function goBackToTasks() {
    if (returnYearId) {
      router.replace({
        pathname: "/(app)/tasks",
        params: {
          yearId: returnYearId,
          ...(returnGroupId
            ? { groupId: returnGroupId }
            : {}),
        },
      });
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(app)/tasks");
  }

  const isDesktop =
    width >= 1050;

  const isCompact =
    width < 680;

  const detail =
    useTaskDetail({
      taskId,
      user,
      currentGroupId: returnGroupId,
    });

  const {
    task,
    submissions,
    unsubmittedStudents,
    taskGroups,

    loading,
    refreshing,
    error,
    success,

    isAdminLevel,

    summary,
    progressPercentage,
    flaggedSubmissions,

    filteredAssistants,

    selectableSubmissions,
    selectedSubmissionIds,
    selectedSubmissions,

    gradingSubmissionId,
    editingSubmissionId,

    openingFileKey,

    delegateModalMode,
    selectedSubmission,
    selectedDelegation,
    assistantSearch,
    delegationReason,
    delegateError,
    delegationBusyId,

    delegationHistorySubmission,
    delegationHistory,
    delegationHistoryLoading,
    delegationHistoryError,

    gradingHistorySubmission,
    gradingHistory,
    gradingHistoryLoading,
    gradingHistoryError,

    reopeningSubmission,
    reopenReason,
    reopeningSubmissionId,
    markingHardcopyStudentId,

    loadTask,
    dismissError,
    dismissSuccess,

    getGradeForm,
    updateGradeForm,
    startEditingGrade,
    cancelEditingGrade,

    openExternalFile,
    selectCorrectedFiles,
    removeSelectedCorrectedFile,
    gradeSubmission,
    deleteCorrectedFile,

    toggleSubmissionSelection,
    selectAllSubmissions,
    clearSubmissionSelection,

    openDelegateModal,
    openBulkDelegateModal,
    openReassignModal,
    closeDelegateModal,

    assignSubmission,
    bulkAssignSubmissions,
    reassignSubmission,
    removeDelegation,

    setAssistantSearch,
    setDelegationReason,

    assistantGroupNames,

    openDelegationHistory,
    closeDelegationHistory,

    openGradingHistory,
    closeGradingHistory,

    openReopenModal,
    closeReopenModal,
    setReopenReason,
    confirmReopenSubmission,
    markHardcopySubmitted,
  } = detail;

  const [submissionTab, setSubmissionTab] =
    useState("ALL");

  const canViewFlaggedStudents =
    user?.role === "TEACHER" ||
    user?.role === "ASSISTANT";

  const showingFlaggedStudents =
    canViewFlaggedStudents &&
    submissionTab === "FLAGGED";

  const showingMissingStudents =
    canViewFlaggedStudents &&
    submissionTab === "MISSING";

  const showingAllSubmissions =
    !showingFlaggedStudents && !showingMissingStudents;

  const visibleSubmissions =
    showingFlaggedStudents
      ? flaggedSubmissions
      : submissions;

  const visibleCount = showingMissingStudents
    ? unsubmittedStudents.length
    : visibleSubmissions.length;

  const selectedIdSet =
    new Set(
      selectedSubmissionIds.map(
        String,
      ),
    );

  const allSelectableSelected =
    selectableSubmissions.length > 0 &&
    selectableSubmissions.every(
      (submission) =>
        selectedIdSet.has(
          String(
            submission.id,
          ),
        ),
    );

  const taskStatus =
    getTaskStatus(task);

  function handleAssistantSelection(
    assistantId,
  ) {
    if (
      delegateModalMode ===
      "BULK_ASSIGN"
    ) {
      return bulkAssignSubmissions(
        assistantId,
      );
    }

    if (
      delegateModalMode ===
      "REASSIGN"
    ) {
      return reassignSubmission(
        assistantId,
      );
    }

    return assignSubmission(
      assistantId,
    );
  }

  function confirmRemoveDelegation(
    submission,
  ) {
    if (!submission?.delegation) {
      return;
    }

    const assistantName =
      submission.delegation
        ?.assistant?.name ||
      "the assistant";

    const message =
      `Remove the delegation from ${assistantName}?`;

    if (
      typeof window !==
      "undefined"
    ) {
      const confirmed =
        window.confirm(
          message,
        );

      if (!confirmed) {
        return;
      }
    }

    removeDelegation(
      submission,
      "Delegation removed from the task page.",
    );
  }

  function confirmHardcopySubmission(student) {
    const message =
      `Mark ${student?.name || "this student"} as having submitted this ${task?.taskType === "IN_CLASS_QUIZ" ? "in-class quiz" : "homework"} externally as a hardcopy?`;
    const proceed = async () => {
      const marked = await markHardcopySubmitted(student);
      if (marked) {
        setSubmissionTab("ALL");
      }
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && !window.confirm(message)) {
        return;
      }
      proceed();
      return;
    }

    Alert.alert("Record hardcopy submission", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Mark submitted", onPress: proceed },
    ]);
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={
          styles.fullPageLoading
        }
      >
        <View
          style={
            styles.loadingIcon
          }
        >
          <Ionicons
            name="clipboard-outline"
            size={30}
            color={colors.primary}
          />
        </View>

        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={
            styles.loadingTitle
          }
        >
          Loading task details
        </Text>

        <Text
          style={
            styles.loadingText
          }
        >
          Preparing submissions, grading
          information, and delegation data.
        </Text>
      </Screen>
    );
  }

  if (!task) {
    return (
      <Screen>
        <View style={styles.page}>
          <Pressable
            onPress={goBackToTasks}
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={colors.primary}
            />

            <Text
              style={
                styles.backButtonText
              }
            >
              Back
            </Text>
          </Pressable>

          <Card
            style={
              styles.notFoundCard
            }
          >
            <View
              style={
                styles.notFoundIcon
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={34}
                color={colors.danger}
              />
            </View>

            <Text
              style={
                styles.notFoundTitle
              }
            >
              Task not found
            </Text>

            <Text
              style={
                styles.notFoundText
              }
            >
              {error ||
                "The task could not be loaded or you do not have access to it."}
            </Text>

            <Button
              title="Go back"
              variant="outline"
              onPress={goBackToTasks}
            />
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <TaskAIGradingProvider taskId={taskId} taskTitle={task.title} user={user}>
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() =>
            loadTask({
              silent: true,
            })
          }
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.page}>
        <Pressable
          onPress={goBackToTasks}
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={colors.primary}
          />

          <Text
            style={
              styles.backButtonText
            }
          >
            Back to tasks
          </Text>
        </Pressable>

        {error ? (
          <View
            style={[
              styles.alert,
              styles.errorAlert,
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>

            <Pressable
              accessibilityLabel="Dismiss error"
              onPress={dismissError}
              style={
                styles.alertClose
              }
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.danger}
              />
            </Pressable>
          </View>
        ) : null}

        {success ? (
          <View
            style={[
              styles.alert,
              styles.successAlert,
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.secondary}
            />

            <Text
              style={
                styles.successText
              }
            >
              {success}
            </Text>

            <Pressable
              accessibilityLabel="Dismiss success"
              onPress={dismissSuccess}
              style={
                styles.alertClose
              }
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.secondary}
              />
            </Pressable>
          </View>
        ) : null}

        <Card style={styles.heroCard}>
          <View
            style={[
              styles.heroContent,
              isCompact &&
                styles.heroContentSmall,
            ]}
          >
            <View style={styles.heroIcon}>
              <Ionicons
                name="clipboard-outline"
                size={28}
                color={colors.primary}
              />
            </View>

            <View style={styles.heroCopy}>
              <View style={styles.heroTopRow}>
                <View
                  style={
                    styles.heroTitleCopy
                  }
                >
                  <Text style={styles.eyebrow}>
                    TASK DETAILS
                  </Text>

                  <Text style={styles.pageTitle}>
                    {task.title ||
                      "Untitled task"}
                  </Text>
                </View>

                <Badge
                  label={taskStatus.label}
                  tone={taskStatus.tone}
                />
              </View>

              {task.description ? (
                <Text
                  style={
                    styles.pageDescription
                  }
                >
                  {task.description}
                </Text>
              ) : null}

              <View style={styles.heroBadges}>
                <Badge
                  label={
                    task.taskType === "IN_CLASS_QUIZ"
                      ? "In Class Quiz"
                      : "Homework"
                  }
                  tone="info"
                />

                <Badge
                  label={`Grade out of ${
                    task.gradeOutOf ?? "-"
                  }`}
                  tone="info"
                />

                <Badge
                  label={
                    task.allowLateSubmission
                      ? "Late submission allowed"
                      : "No late submission"
                  }
                  tone={
                    task.allowLateSubmission
                      ? "success"
                      : "neutral"
                  }
                />

                <Badge
                  label={`${summary.total} submissions`}
                  tone="neutral"
                />
              </View>

              {taskGroups.length ? (
                <View
                  style={
                    styles.taskGroupsSection
                  }
                >
                  <Text
                    style={
                      styles.taskGroupsLabel
                    }
                  >
                    Assigned groups
                  </Text>

                  <View
                    style={
                      styles.taskGroupsList
                    }
                  >
                    {taskGroups.map(
                      (group) => (
                        <View
                          key={group.id}
                          style={
                            styles.taskGroupBadge
                          }
                        >
                          <Ionicons
                            name="people-outline"
                            size={13}
                            color={colors.primary}
                          />

                          <Text
                            style={
                              styles.taskGroupBadgeText
                            }
                          >
                            {group.name ||
                              "Unnamed group"}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </Card>

        <TaskAIReferences gradeOutOf={task.gradeOutOf} />

        <View style={styles.statsGrid}>
          <StatCard
            icon="documents-outline"
            label="Submissions"
            value={summary.total}
          />

          <StatCard
            icon="checkmark-done-outline"
            label="Graded"
            value={summary.graded}
            tone="success"
          />

          <StatCard
            icon="person-outline"
            label="Delegated"
            value={summary.delegated}
            tone="warning"
          />

          <StatCard
            icon="time-outline"
            label="Pending"
            value={summary.pending}
          />

          {canViewFlaggedStudents ? (
            <StatCard
              icon="flag-outline"
              label="Flagged below 60%"
              value={flaggedSubmissions.length}
              tone="danger"
            />
          ) : null}
        </View>

        <View
          style={[
            styles.contentLayout,
            isDesktop &&
              styles.contentLayoutDesktop,
          ]}
        >
          <View
            style={
              styles.mainColumn
            }
          >
            {canViewFlaggedStudents ? (
              <View style={styles.submissionTabs}>
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected:
                      showingAllSubmissions,
                  }}
                  onPress={() =>
                    setSubmissionTab("ALL")
                  }
                  style={({ pressed }) => [
                    styles.submissionTab,
                    showingAllSubmissions &&
                      styles.submissionTabActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="documents-outline"
                    size={18}
                    color={
                      showingAllSubmissions
                        ? colors.white
                        : colors.textMuted
                    }
                  />

                  <Text
                    style={[
                      styles.submissionTabText,
                      showingAllSubmissions &&
                        styles.submissionTabTextActive,
                    ]}
                  >
                    All submissions
                  </Text>

                  <View
                    style={[
                      styles.submissionTabCount,
                      showingAllSubmissions &&
                        styles.submissionTabCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.submissionTabCountText,
                        showingAllSubmissions &&
                          styles.submissionTabCountTextActive,
                      ]}
                    >
                      {submissions.length}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: showingMissingStudents }}
                  onPress={() => setSubmissionTab("MISSING")}
                  style={({ pressed }) => [
                    styles.submissionTab,
                    styles.missingSubmissionTab,
                    showingMissingStudents && styles.missingSubmissionTabActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="file-tray-outline"
                    size={18}
                    color={showingMissingStudents ? colors.white : colors.warning}
                  />
                  <Text
                    style={[
                      styles.submissionTabText,
                      styles.missingSubmissionTabText,
                      showingMissingStudents && styles.submissionTabTextActive,
                    ]}
                  >
                    Awaiting submission
                  </Text>
                  <View
                    style={[
                      styles.submissionTabCount,
                      styles.missingSubmissionTabCount,
                      showingMissingStudents && styles.submissionTabCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.submissionTabCountText,
                        styles.missingSubmissionTabCountText,
                        showingMissingStudents && styles.submissionTabCountTextActive,
                      ]}
                    >
                      {unsubmittedStudents.length}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected:
                      showingFlaggedStudents,
                  }}
                  onPress={() =>
                    setSubmissionTab("FLAGGED")
                  }
                  style={({ pressed }) => [
                    styles.submissionTab,
                    styles.flaggedSubmissionTab,
                    showingFlaggedStudents &&
                      styles.flaggedSubmissionTabActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="flag-outline"
                    size={18}
                    color={
                      showingFlaggedStudents
                        ? colors.white
                        : colors.danger
                    }
                  />

                  <Text
                    style={[
                      styles.submissionTabText,
                      styles.flaggedSubmissionTabText,
                      showingFlaggedStudents &&
                        styles.submissionTabTextActive,
                    ]}
                  >
                    Flagged students
                  </Text>

                  <View
                    style={[
                      styles.submissionTabCount,
                      styles.flaggedSubmissionTabCount,
                      showingFlaggedStudents &&
                        styles.submissionTabCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.submissionTabCountText,
                        styles.flaggedSubmissionTabCountText,
                        showingFlaggedStudents &&
                          styles.submissionTabCountTextActive,
                      ]}
                    >
                      {flaggedSubmissions.length}
                    </Text>
                  </View>
                </Pressable>
              </View>
            ) : null}

            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  {showingFlaggedStudents
                    ? "Flagged students"
                    : showingMissingStudents
                      ? "Awaiting submission"
                      : "Student submissions"}
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  {showingFlaggedStudents
                    ? "Students whose recorded grade is below 60% for this task."
                    : showingMissingStudents
                      ? "Students with no online or hardcopy submission yet. Record a hardcopy here when paper work is received."
                      : "Review files, delegate papers, grade work, and manage grading history."}
                </Text>
              </View>

              <Text
                style={
                  styles.sectionCount
                }
              >
                {visibleCount}
              </Text>
            </View>

            {showingAllSubmissions &&
            isAdminLevel &&
            selectableSubmissions.length ? (
              <View
                style={
                  styles.bulkToolbar
                }
              >
                <Pressable
                  onPress={
                    allSelectableSelected
                      ? clearSubmissionSelection
                      : selectAllSubmissions
                  }
                  style={({ pressed }) => [
                    styles.selectionControl,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      allSelectableSelected &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {allSelectableSelected ? (
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color={colors.white}
                      />
                    ) : null}
                  </View>

                  <Text
                    style={
                      styles.selectionLabel
                    }
                  >
                    {allSelectableSelected
                      ? "Clear selection"
                      : "Select all undelegated"}
                  </Text>
                </Pressable>

                <View
                  style={
                    styles.bulkToolbarActions
                  }
                >
                  <Text
                    style={
                      styles.selectedCount
                    }
                  >
                    {
                      selectedSubmissionIds.length
                    }{" "}
                    selected
                  </Text>

                  <Button
                    title="Bulk delegate"
                    variant="warning"
                    disabled={
                      !selectedSubmissionIds.length
                    }
                    onPress={
                      openBulkDelegateModal
                    }
                  />
                </View>
              </View>
            ) : null}

            {!visibleCount ? (
              <Card
                style={
                  styles.emptyCard
                }
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <Ionicons
                    name="documents-outline"
                    size={34}
                    color={colors.primary}
                  />
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  {showingMissingStudents
                    ? "Everyone has submitted"
                    : showingFlaggedStudents
                    ? "No flagged students"
                    : "No submissions yet"}
                </Text>

                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  {showingMissingStudents
                    ? "There are no students waiting for an online or hardcopy submission in the selected group."
                    : showingFlaggedStudents
                    ? "Students will appear here automatically when their recorded grade is below 60%."
                    : "Student homework submissions will appear here when they are uploaded."}
                </Text>
              </Card>
            ) : (
              <View
                style={
                  styles.submissionList
                }
              >
                {showingMissingStudents
                  ? unsubmittedStudents.map((student) => (
                      <HardcopyStudentCard
                        key={student.id}
                        student={student}
                        busy={
                          String(markingHardcopyStudentId) === String(student.id)
                        }
                        onMarkHardcopy={() => confirmHardcopySubmission(student)}
                      />
                    ))
                  : visibleSubmissions.map(
                  (submission) => {
                    const canSelect =
                      isAdminLevel &&
                      submission.grade ===
                        null &&
                      !submission.delegation;

                    return (
                      <SubmissionCard
                        key={
                          submission.id
                        }
                        submission={
                          submission
                        }
                        task={task}
                        user={user}
                        isAdminLevel={
                          isAdminLevel
                        }
                        isSelected={selectedIdSet.has(
                          String(
                            submission.id,
                          ),
                        )}
                        canSelect={
                          canSelect
                        }
                        gradeForm={getGradeForm(
                          submission.id,
                        )}
                        isGrading={
                          gradingSubmissionId ===
                          submission.id
                        }
                        editingSubmissionId={
                          editingSubmissionId
                        }
                        openingFileKey={
                          openingFileKey
                        }
                        delegationBusyId={
                          delegationBusyId
                        }
                        onToggleSelection={() =>
                          toggleSubmissionSelection(
                            submission.id,
                          )
                        }
                        onOpenFile={
                          openExternalFile
                        }
                        onDeleteCorrectedFile={(
                          correctedFileId,
                        ) =>
                          deleteCorrectedFile(
                            {
                              submission,
                              correctedFileId,
                            },
                          )
                        }
                        onUpdateGrade={(
                          value,
                        ) =>
                          updateGradeForm(
                            submission.id,
                            {
                              grade:
                                value,
                            },
                          )
                        }
                        onUpdateComments={(
                          value,
                        ) =>
                          updateGradeForm(
                            submission.id,
                            {
                              comments:
                                value,
                            },
                          )
                        }
                        onSelectCorrectedFiles={() =>
                          selectCorrectedFiles(
                            submission.id,
                          )
                        }
                        onRemoveSelectedCorrectedFile={(
                          localId,
                        ) =>
                          removeSelectedCorrectedFile(
                            submission.id,
                            localId,
                          )
                        }
                        onGrade={() =>
                          gradeSubmission(
                            submission,
                          )
                        }
                        onStartEditingGrade={() =>
                          startEditingGrade(
                            submission,
                          )
                        }
                        onCancelEditingGrade={() =>
                          cancelEditingGrade(
                            submission.id,
                          )
                        }
                        onOpenDelegate={() =>
                          openDelegateModal(
                            submission,
                          )
                        }
                        onOpenReassign={() =>
                          openReassignModal(
                            submission,
                          )
                        }
                        onRemoveDelegation={() =>
                          confirmRemoveDelegation(
                            submission,
                          )
                        }
                        onOpenDelegationHistory={() =>
                          openDelegationHistory(
                            submission,
                          )
                        }
                        onOpenGradingHistory={() =>
                          openGradingHistory(
                            submission,
                          )
                        }
                        onOpenReopen={() =>
                          openReopenModal(
                            submission,
                          )
                        }
                      />
                    );
                  },
                )}
              </View>
            )}
          </View>

          <View
            style={[
              styles.sideColumn,
              isDesktop &&
                styles.sideColumnDesktop,
            ]}
          >
            <Card
              style={
                styles.progressCard
              }
            >
              <View
                style={
                  styles.sideCardIcon
                }
              >
                <Ionicons
                  name="pie-chart-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text
                style={
                  styles.sideCardTitle
                }
              >
                Grading progress
              </Text>

              <Text
                style={
                  styles.progressValue
                }
              >
                {progressPercentage}%
              </Text>

              <View
                style={
                  styles.progressTrack
                }
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        `${progressPercentage}%`,
                    },
                  ]}
                />
              </View>

              <Text
                style={
                  styles.progressText
                }
              >
                {summary.graded} of{" "}
                {summary.total} submissions
                graded
              </Text>
            </Card>

            <Card
              style={styles.infoCard}
            >
              <View
                style={
                  styles.sideCardIcon
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text
                style={
                  styles.sideCardTitle
                }
              >
                Task schedule
              </Text>

              <InfoRow
                label="Deadline"
                value={formatDateTime(
                  task.deadline,
                )}
              />

              <InfoRow
                label="Created"
                value={formatDateTime(
                  task.createdAt,
                )}
              />

              {task.updatedAt ? (
                <InfoRow
                  label="Last updated"
                  value={formatDateTime(
                    task.updatedAt,
                  )}
                />
              ) : null}
            </Card>

            <Card
              style={styles.infoCard}
            >
              <View
                style={
                  styles.sideCardIcon
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text
                style={
                  styles.sideCardTitle
                }
              >
                Grading notes
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                Corrected files are appended to
                existing returned files. Reopening
                preserves previous grade values in
                grading history and returns the
                current delegation to pending.
              </Text>
            </Card>
          </View>
        </View>
      </View>

      <DelegationModal
        visible={delegateModalMode}
        mode={delegateModalMode}
        selectedSubmission={
          selectedSubmission
        }
        selectedSubmissions={
          selectedSubmissions
        }
        selectedDelegation={
          selectedDelegation
        }
        assistants={
          filteredAssistants
        }
        assistantSearch={
          assistantSearch
        }
        reason={
          delegationReason
        }
        error={delegateError}
        busyId={
          delegationBusyId
        }
        getAssistantGroupNames={
          assistantGroupNames
        }
        onChangeSearch={
          setAssistantSearch
        }
        onChangeReason={
          setDelegationReason
        }
        onSelectAssistant={
          handleAssistantSelection
        }
        onClose={
          closeDelegateModal
        }
      />

      <DelegationHistoryModal
        submission={
          delegationHistorySubmission
        }
        history={
          delegationHistory
        }
        loading={
          delegationHistoryLoading
        }
        error={
          delegationHistoryError
        }
        onClose={
          closeDelegationHistory
        }
      />

      <GradingHistoryModal
        submission={
          gradingHistorySubmission
        }
        history={gradingHistory}
        loading={
          gradingHistoryLoading
        }
        error={
          gradingHistoryError
        }
        gradeOutOf={
          task.gradeOutOf
        }
        onClose={
          closeGradingHistory
        }
      />

      <ReopenSubmissionModal
        submission={
          reopeningSubmission
        }
        gradeOutOf={
          task.gradeOutOf
        }
        reason={reopenReason}
        loading={Boolean(
          reopeningSubmissionId,
        )}
        onChangeReason={
          setReopenReason
        }
        onConfirm={
          confirmReopenSubmission
        }
        onClose={
          closeReopenModal
        }
      />
    </Screen>
    </TaskAIGradingProvider>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "primary",
}) {
  const color =
    tone === "success"
      ? colors.secondary
      : tone === "warning"
        ? colors.warning
        : tone === "danger"
          ? colors.danger
          : colors.primary;

  return (
    <Card style={styles.statCard}>
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              `${color}15`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={color}
        />
      </View>

      <Text
        style={styles.statValue}
      >
        {value}
      </Text>

      <Text
        style={styles.statLabel}
      >
        {label}
      </Text>
    </Card>
  );
}

function InfoRow({
  label,
  value,
}) {
  return (
    <View style={styles.infoRow}>
      <Text
        style={styles.infoLabel}
      >
        {label}
      </Text>

      <Text
        style={styles.infoValue}
      >
        {value}
      </Text>
    </View>
  );
}
