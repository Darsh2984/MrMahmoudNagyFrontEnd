import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";
import { useAuth } from "../../../src/contexts/AuthContext";

import api from "../../../src/lib/api";
import { formatDate } from "../../../src/utils/formatDate";
import { colors } from "../../../src/theme";

import { styles } from "./index.styles";

export default function MyTasks() {
  const { user } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [group, setGroup] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const taskSummary = useMemo(() => {
    const now = Date.now();

    return tasks.reduce(
      (summary, task) => {
        const submission = getMySubmission(
          task,
          user?.id
        );

        const deadline = task.deadline
          ? new Date(task.deadline).getTime()
          : null;

        if (submission?.grade != null) {
          summary.graded += 1;
        } else if (submission) {
          summary.submitted += 1;
        } else if (
          deadline &&
          deadline < now
        ) {
          summary.overdue += 1;
        } else {
          summary.pending += 1;
        }

        return summary;
      },
      {
        total: tasks.length,
        pending: 0,
        submitted: 0,
        graded: 0,
        overdue: 0,
      }
    );
  }, [tasks, user?.id]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort(
      (first, second) => {
        const firstSubmission =
          getMySubmission(
            first,
            user?.id
          );

        const secondSubmission =
          getMySubmission(
            second,
            user?.id
          );

        const firstPriority =
          getTaskPriority(
            first,
            firstSubmission
          );

        const secondPriority =
          getTaskPriority(
            second,
            secondSubmission
          );

        if (
          firstPriority !== secondPriority
        ) {
          return (
            firstPriority -
            secondPriority
          );
        }

        const firstDeadline =
          first.deadline
            ? new Date(
                first.deadline
              ).getTime()
            : Number.MAX_SAFE_INTEGER;

        const secondDeadline =
          second.deadline
            ? new Date(
                second.deadline
              ).getTime()
            : Number.MAX_SAFE_INTEGER;

        return (
          firstDeadline -
          secondDeadline
        );
      }
    );
  }, [tasks, user?.id]);

  const loadTasks = useCallback(
    async ({ silent = false } = {}) => {
      if (!user?.id) {
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const profileResponse =
          await api.get(
            `/students/${user.id}`
          );

        const memberships =
          Array.isArray(
            profileResponse.data
              ?.groupMemberships
          )
            ? profileResponse.data
                .groupMemberships
            : [];

        const firstGroup =
          memberships[0]?.group || null;

        if (!firstGroup?.id) {
          setGroup(null);
          setTasks([]);

          setError(
            "You are not assigned to a group yet."
          );

          return;
        }

        setGroup(firstGroup);

        const tasksResponse =
          await api.get(
            `/tasks/group/${firstGroup.id}`
          );

        setTasks(
          Array.isArray(
            tasksResponse.data
          )
            ? tasksResponse.data
            : []
        );
      } catch (requestError) {
        setError(
          requestError.response?.data
            ?.msg ||
            requestError.response?.data
              ?.message ||
            "Couldn't load your tasks."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function openTask(taskId) {
    router.push(
      `/my-tasks/${taskId}`
    );
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading your tasks...
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.pageHeader}>
          <View
            style={styles.pageHeaderText}
          >
            <Text style={styles.eyebrow}>
              STUDENT HOMEWORK
            </Text>

            <Text style={styles.pageTitle}>
              My Tasks
            </Text>

            <Text
              style={styles.pageSubtitle}
            >
              Review assigned tasks,
              track deadlines, submit your
              work, and check grading
              progress.
            </Text>
          </View>

          <Button
            title={
              refreshing
                ? "Refreshing..."
                : "Refresh"
            }
            variant="outline"
            loading={refreshing}
            disabled={refreshing}
            onPress={() =>
              loadTasks({
                silent: true,
              })
            }
          />
        </View>

        {group ? (
          <Card style={styles.groupCard}>
            <View style={styles.groupIcon}>
              <Ionicons
                name="people-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.groupInfo}>
              <Text
                style={styles.groupLabel}
              >
                Your group
              </Text>

              <Text
                style={styles.groupName}
              >
                {group.name}
              </Text>

              {group.year?.name ? (
                <Text
                  style={styles.groupYear}
                >
                  {group.year.name}
                </Text>
              ) : null}
            </View>
          </Card>
        ) : null}

        {error ? (
          <ErrorBanner
            message={error}
            onRetry={() => loadTasks()}
            onDismiss={() =>
              setError("")
            }
          />
        ) : null}

        {tasks.length > 0 ? (
          <View style={styles.statsGrid}>
            <SummaryCard
              icon="documents-outline"
              label="Total tasks"
              value={taskSummary.total}
              tone="default"
            />

            <SummaryCard
              icon="time-outline"
              label="Pending"
              value={taskSummary.pending}
              tone="warning"
            />

            <SummaryCard
              icon="cloud-done-outline"
              label="Submitted"
              value={
                taskSummary.submitted
              }
              tone="info"
            />

            <SummaryCard
              icon="checkmark-done-outline"
              label="Graded"
              value={taskSummary.graded}
              tone="success"
            />

            <SummaryCard
              icon="alert-circle-outline"
              label="Overdue"
              value={taskSummary.overdue}
              tone="danger"
            />
          </View>
        ) : null}

        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Assigned tasks
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Unsubmitted tasks appear first,
              followed by submitted and graded
              work.
            </Text>
          </View>

          {tasks.length > 0 ? (
            <Text
              style={styles.taskCount}
            >
              {tasks.length}{" "}
              {tasks.length === 1
                ? "task"
                : "tasks"}
            </Text>
          ) : null}
        </View>

        {tasks.length === 0 ? (
          <EmptyTasksState
            hasGroup={Boolean(group)}
          />
        ) : (
          <View style={styles.taskList}>
            {sortedTasks.map((task) => {
              const submission =
                getMySubmission(
                  task,
                  user?.id
                );

              const status =
                getTaskStatus(
                  task,
                  submission
                );

              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  submission={submission}
                  status={status}
                  onPress={() =>
                    openTask(task.id)
                  }
                />
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}

function TaskCard({
  task,
  submission,
  status,
  onPress,
}) {
  const isPastDeadline =
    task.deadline &&
    new Date(task.deadline).getTime() <
      Date.now();

  const hasSubmitted =
    Boolean(submission);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        pressed &&
          styles.pressedOpacity,
      ]}
    >
      <Card style={styles.taskCard}>
        <View
          style={styles.taskCardHeader}
        >
          <View
            style={[
              styles.taskIcon,

              status.tone === "danger" &&
                styles.taskIconDanger,

              status.tone === "warning" &&
                styles.taskIconWarning,

              status.tone === "success" &&
                styles.taskIconSuccess,

              status.tone === "info" &&
                styles.taskIconInfo,
            ]}
          >
            <Ionicons
              name={status.icon}
              size={22}
              color={getStatusColor(
                status.tone
              )}
            />
          </View>

          <View
            style={styles.taskMainInfo}
          >
            <Text style={styles.taskTypeLabel}>
              {task.taskType === "IN_CLASS_QUIZ"
                ? "IN CLASS QUIZ"
                : "HOMEWORK"}
            </Text>

            <Text
              numberOfLines={2}
              style={styles.taskTitle}
            >
              {task.title}
            </Text>

            <Text
              numberOfLines={2}
              style={
                styles.taskDescription
              }
            >
              {task.description?.trim() ||
                "No additional instructions were provided."}
            </Text>
          </View>

          <Badge
            label={status.label}
            tone={status.badgeTone}
          />
        </View>

        <View
          style={[
            styles.submissionStatusBox,

            hasSubmitted
              ? styles.submissionStatusBoxSubmitted
              : styles.submissionStatusBoxPending,
          ]}
        >
          <View
            style={[
              styles.submissionStatusIcon,

              hasSubmitted
                ? styles.submissionStatusIconSubmitted
                : styles.submissionStatusIconPending,
            ]}
          >
            <Ionicons
              name={
                hasSubmitted
                  ? "checkmark-circle"
                  : "cloud-upload-outline"
              }
              size={22}
              color={
                hasSubmitted
                  ? colors.secondary
                  : colors.warning
              }
            />
          </View>

          <View
            style={
              styles.submissionStatusCopy
            }
          >
            <Text
              style={[
                styles.submissionStatusTitle,

                hasSubmitted
                  ? styles.submissionStatusTitleSubmitted
                  : styles.submissionStatusTitlePending,
              ]}
            >
              {hasSubmitted
                ? "Assignment submitted"
                : "Assignment not submitted"}
            </Text>

            <Text
              style={
                styles.submissionStatusText
              }
            >
              {getSubmissionStatusText(
                task,
                submission
              )}
            </Text>
          </View>

          {hasSubmitted ? (
            <Ionicons
              name="checkmark-done-outline"
              size={21}
              color={colors.secondary}
            />
          ) : null}
        </View>

        <View
          style={styles.taskDivider}
        />

        <View
          style={styles.taskMetaGrid}
        >
          <TaskMeta
            icon="calendar-outline"
            label="Deadline"
            value={
              formatDate(task.deadline) ||
              "No deadline"
            }
            danger={
              isPastDeadline &&
              !submission
            }
          />

          <TaskMeta
            icon="trophy-outline"
            label="Grade out of"
            value={`${
              task.gradeOutOf ?? "—"
            } marks`}
          />

          <TaskMeta
            icon="time-outline"
            label="Late submission"
            value={
              task.allowLateSubmission
                ? "Allowed"
                : "Not allowed"
            }
          />
        </View>

        {submission ? (
          <View
            style={
              styles.submissionDetails
            }
          >
            <View
              style={
                styles.submissionDetailItem
              }
            >
              <Ionicons
                name="calendar-outline"
                size={17}
                color={colors.primary}
              />

              <View>
                <Text
                  style={
                    styles.submissionDetailLabel
                  }
                >
                  Submitted on
                </Text>

                <Text
                  style={
                    styles.submissionDetailValue
                  }
                >
                  {formatDate(
                    submission.submittedAt
                  ) ||
                    "Date unavailable"}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.submissionDetailItem
              }
            >
              <Ionicons
                name={
                  submission.grade != null
                    ? "checkmark-done-outline"
                    : "hourglass-outline"
                }
                size={17}
                color={
                  submission.grade != null
                    ? colors.secondary
                    : colors.warning
                }
              />

              <View>
                <Text
                  style={
                    styles.submissionDetailLabel
                  }
                >
                  Grading status
                </Text>

                <Text
                  style={
                    styles.submissionDetailValue
                  }
                >
                  {submission.grade != null
                    ? "Graded"
                    : "Waiting for grading"}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {submission?.grade != null ? (
          <View
            style={styles.gradePreview}
          >
            <View>
              <Text
                style={
                  styles.gradePreviewLabel
                }
              >
                Your grade
              </Text>

              <Text
                style={
                  styles.gradePreviewText
                }
              >
                {submission.grade}/
                {task.gradeOutOf}
              </Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={28}
              color={colors.secondary}
            />
          </View>
        ) : null}

        <View style={styles.taskFooter}>
          <Text
            style={styles.taskFooterText}
          >
            {status.helperText}
          </Text>

          <View
            style={styles.openTaskAction}
          >
            <Text
              style={
                styles.openTaskActionText
              }
            >
              {submission
                ? "View submission"
                : "Open and submit"}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.primary}
            />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function TaskMeta({
  icon,
  label,
  value,
  danger = false,
}) {
  return (
    <View style={styles.taskMetaItem}>
      <View style={styles.taskMetaIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={
            danger
              ? colors.danger
              : colors.primary
          }
        />
      </View>

      <View style={styles.taskMetaText}>
        <Text
          style={styles.taskMetaLabel}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.taskMetaValue,

            danger &&
              styles.taskMetaValueDanger,
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}) {
  const color =
    getStatusColor(tone);

  return (
    <Card style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor: `${color}16`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={color}
        />
      </View>

      <Text
        style={styles.summaryValue}
      >
        {value}
      </Text>

      <Text
        style={styles.summaryLabel}
      >
        {label}
      </Text>
    </Card>
  );
}

function EmptyTasksState({
  hasGroup,
}) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={
            hasGroup
              ? "clipboard-outline"
              : "people-outline"
          }
          size={34}
          color={colors.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {hasGroup
          ? "No tasks assigned yet"
          : "Group assignment required"}
      </Text>

      <Text
        style={styles.emptyDescription}
      >
        {hasGroup
          ? "Your teacher has not assigned any tasks to this group yet."
          : "You must be assigned to an academic group before tasks become available."}
      </Text>
    </Card>
  );
}

function ErrorBanner({
  message,
  onRetry,
  onDismiss,
}) {
  return (
    <View
      accessibilityRole="alert"
      style={styles.errorBanner}
    >
      <View
        style={styles.errorIndicator}
      />

      <View
        style={styles.errorContent}
      >
        <Text style={styles.errorTitle}>
          Couldn't load tasks
        </Text>

        <Text
          style={styles.errorMessage}
        >
          {message}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [
          styles.errorAction,

          pressed &&
            styles.pressedOpacity,
        ]}
      >
        <Text
          style={styles.errorActionText}
        >
          Retry
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss error"
        onPress={onDismiss}
        style={({ pressed }) => [
          styles.errorDismiss,

          pressed &&
            styles.pressedOpacity,
        ]}
      >
        <Ionicons
          name="close"
          size={18}
          color={colors.danger}
        />
      </Pressable>
    </View>
  );
}

function getMySubmission(
  task,
  userId
) {
  const submissions =
    Array.isArray(task?.submissions)
      ? task.submissions
      : [];

  return (
    submissions.find(
      (submission) =>
        String(
          submission.studentId
        ) === String(userId) ||
        String(
          submission.student?.id
        ) === String(userId)
    ) || null
  );
}

function getSubmissionStatusText(
  task,
  submission
) {
  if (submission?.grade != null) {
    return `Submitted and graded: ${submission.grade}/${task.gradeOutOf}.`;
  }

  if (submission) {
    const submittedDate =
      formatDate(
        submission.submittedAt
      );

    return submittedDate
      ? `Submitted on ${submittedDate}. Waiting for grading.`
      : "Your homework was submitted and is waiting for grading.";
  }

  const deadline = task.deadline
    ? new Date(task.deadline).getTime()
    : null;

  const isPastDeadline =
    deadline &&
    deadline < Date.now();

  if (
    isPastDeadline &&
    !task.allowLateSubmission
  ) {
    return "You did not submit this assignment before submissions closed.";
  }

  if (isPastDeadline) {
    return "You have not submitted yet. Late submission is still allowed.";
  }

  return "You have not submitted this assignment yet.";
}

function getTaskStatus(
  task,
  submission
) {
  const deadline = task.deadline
    ? new Date(task.deadline).getTime()
    : null;

  const isPastDeadline =
    deadline &&
    deadline < Date.now();

  if (submission?.grade != null) {
    return {
      label: "Graded",
      badgeTone: "success",
      tone: "success",
      icon:
        "checkmark-done-outline",
      helperText:
        "Your submission has been graded.",
    };
  }

  if (submission) {
    return {
      label: "Submitted",
      badgeTone: "info",
      tone: "info",
      icon: "cloud-done-outline",
      helperText:
        "Your homework is awaiting grading.",
    };
  }

  if (
    isPastDeadline &&
    !task.allowLateSubmission
  ) {
    return {
      label: "Not submitted",
      badgeTone: "danger",
      tone: "danger",
      icon: "close-circle-outline",
      helperText:
        "The deadline passed without a submission.",
    };
  }

  if (isPastDeadline) {
    return {
      label: "Overdue",
      badgeTone: "warning",
      tone: "warning",
      icon: "alert-circle-outline",
      helperText:
        "Late submission is still allowed.",
    };
  }

  return {
    label: "Not submitted",
    badgeTone: "neutral",
    tone: "warning",
    icon: "cloud-upload-outline",
    helperText:
      "Open the task and submit your homework.",
  };
}

function getTaskPriority(
  task,
  submission
) {
  const status =
    getTaskStatus(
      task,
      submission
    );

  if (
    status.label === "Overdue"
  ) {
    return 0;
  }

  if (
    status.label === "Not submitted"
  ) {
    return 1;
  }

  if (
    status.label === "Submitted"
  ) {
    return 2;
  }

  if (
    status.label === "Graded"
  ) {
    return 3;
  }

  return 4;
}

function getStatusColor(tone) {
  if (tone === "success") {
    return colors.secondary;
  }

  if (tone === "warning") {
    return colors.warning;
  }

  if (tone === "danger") {
    return colors.danger;
  }

  return colors.primary;
}
