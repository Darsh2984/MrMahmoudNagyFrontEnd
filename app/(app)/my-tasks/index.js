import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
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

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../src/theme";

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
        const deadline = task.deadline
          ? new Date(task.deadline).getTime()
          : null;

        const submission = getMySubmission(
          task,
          user?.id
        );

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
    return [...tasks].sort((first, second) => {
      const firstSubmission = getMySubmission(
        first,
        user?.id
      );
      const secondSubmission = getMySubmission(
        second,
        user?.id
      );

      const firstPriority = getTaskPriority(
        first,
        firstSubmission
      );

      const secondPriority = getTaskPriority(
        second,
        secondSubmission
      );

      if (firstPriority !== secondPriority) {
        return firstPriority - secondPriority;
      }

      const firstDeadline = first.deadline
        ? new Date(first.deadline).getTime()
        : Number.MAX_SAFE_INTEGER;

      const secondDeadline = second.deadline
        ? new Date(second.deadline).getTime()
        : Number.MAX_SAFE_INTEGER;

      return firstDeadline - secondDeadline;
    });
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
        const profileResponse = await api.get(
          `/students/${user.id}`
        );

        const memberships = Array.isArray(
          profileResponse.data?.groupMemberships
        )
          ? profileResponse.data.groupMemberships
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

        const tasksResponse = await api.get(
          `/tasks/group/${firstGroup.id}`
        );

        setTasks(
          Array.isArray(tasksResponse.data)
            ? tasksResponse.data
            : []
        );
      } catch (requestError) {
        setError(
          requestError.response?.data?.msg ||
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
    router.push(`/my-tasks/${taskId}`);
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
          Loading your homework...
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderText}>
            <Text style={styles.eyebrow}>
              STUDENT HOMEWORK
            </Text>

            <Text style={styles.pageTitle}>
              My Tasks
            </Text>

            <Text style={styles.pageSubtitle}>
              Review assigned homework, track
              deadlines, submit your work, and check
              grading progress.
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
              loadTasks({ silent: true })
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
              <Text style={styles.groupLabel}>
                Your group
              </Text>

              <Text style={styles.groupName}>
                {group.name}
              </Text>

              {group.year?.name ? (
                <Text style={styles.groupYear}>
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
            onDismiss={() => setError("")}
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
              value={taskSummary.submitted}
              tone="info"
            />

            <SummaryCard
              icon="checkmark-done-outline"
              label="Graded"
              value={taskSummary.graded}
              tone="success"
            />
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Assigned tasks
            </Text>

            <Text style={styles.sectionSubtitle}>
              Tasks are ordered by urgency and
              submission status.
            </Text>
          </View>

          {tasks.length > 0 ? (
            <Text style={styles.taskCount}>
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
              const submission = getMySubmission(
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

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        pressed && styles.pressedOpacity,
      ]}
    >
      <Card style={styles.taskCard}>
        <View style={styles.taskCardHeader}>
          <View
            style={[
              styles.taskIcon,
              status.tone === "danger" &&
                styles.taskIconDanger,
              status.tone === "warning" &&
                styles.taskIconWarning,
              status.tone === "success" &&
                styles.taskIconSuccess,
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

          <View style={styles.taskMainInfo}>
            <Text
              numberOfLines={2}
              style={styles.taskTitle}
            >
              {task.title}
            </Text>

            <Text
              numberOfLines={2}
              style={styles.taskDescription}
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

        <View style={styles.taskDivider} />

        <View style={styles.taskMetaGrid}>
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

        {submission?.grade != null ? (
          <View style={styles.gradePreview}>
            <View>
              <Text
                style={styles.gradePreviewLabel}
              >
                Your grade
              </Text>

              <Text
                style={styles.gradePreviewText}
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
          <Text style={styles.taskFooterText}>
            {status.helperText}
          </Text>

          <View style={styles.openTaskAction}>
            <Text
              style={styles.openTaskActionText}
            >
              View task
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
        <Text style={styles.taskMetaLabel}>
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
  const color = getStatusColor(tone);

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

      <Text style={styles.summaryValue}>
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </Card>
  );
}

function EmptyTasksState({ hasGroup }) {
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

      <Text style={styles.emptyDescription}>
        {hasGroup
          ? "Your teacher has not assigned any homework to this group yet."
          : "You must be assigned to an academic group before homework becomes available."}
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
      <View style={styles.errorIndicator} />

      <View style={styles.errorContent}>
        <Text style={styles.errorTitle}>
          Couldn't load tasks
        </Text>

        <Text style={styles.errorMessage}>
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

function getMySubmission(task, userId) {
  const submissions = Array.isArray(
    task?.submissions
  )
    ? task.submissions
    : [];

  return (
    submissions.find(
      (submission) =>
        submission.studentId === userId ||
        submission.student?.id === userId
    ) || null
  );
}

function getTaskStatus(task, submission) {
  const deadline = task.deadline
    ? new Date(task.deadline).getTime()
    : null;

  const isPastDeadline =
    deadline && deadline < Date.now();

  if (submission?.grade != null) {
    return {
      label: "Graded",
      badgeTone: "success",
      tone: "success",
      icon: "checkmark-done-outline",
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
      label: "Closed",
      badgeTone: "danger",
      tone: "danger",
      icon: "lock-closed-outline",
      helperText:
        "The deadline passed and late submissions are not allowed.",
    };
  }

  if (isPastDeadline) {
    return {
      label: "Overdue",
      badgeTone: "warning",
      tone: "warning",
      icon: "alert-circle-outline",
      helperText:
        "The deadline passed, but late submission is still allowed.",
    };
  }

  return {
    label: "Pending",
    badgeTone: "neutral",
    tone: "warning",
    icon: "time-outline",
    helperText:
      "Open the task to review and submit your homework.",
  };
}

function getTaskPriority(task, submission) {
  const status = getTaskStatus(
    task,
    submission
  );

  if (status.label === "Overdue") {
    return 0;
  }

  if (status.label === "Pending") {
    return 1;
  }

  if (status.label === "Submitted") {
    return 2;
  }

  if (status.label === "Graded") {
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

  if (tone === "info") {
    return colors.primary;
  }

  return colors.primary;
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 1280,
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },

  centeredScreen: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },

  pageHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  pageHeaderText: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 320,
    maxWidth: 760,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },

  pageTitle: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  pageSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },

  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },

  groupIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: `${colors.secondary}25`,
  },

  groupInfo: {
    flex: 1,
    minWidth: 0,
  },

  groupLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  groupName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
  },

  groupYear: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  summaryCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 190,
    minWidth: 170,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },

  summaryValue: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 3,
  },

  taskCount: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  taskList: {
    gap: spacing.md,
  },

  taskCard: {
    padding: spacing.lg,
  },

  taskCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  taskIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: `${colors.primary}12`,
  },

  taskIconDanger: {
    backgroundColor: `${colors.danger}12`,
  },

  taskIconWarning: {
    backgroundColor: `${colors.warning}12`,
  },

  taskIconSuccess: {
    backgroundColor: `${colors.secondary}18`,
  },

  taskMainInfo: {
    flex: 1,
    minWidth: 0,
  },

  taskTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  taskDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
  },

  taskDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  taskMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  taskMetaItem: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 190,
    minWidth: 170,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  taskMetaIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.white,
  },

  taskMetaText: {
    flex: 1,
    minWidth: 0,
  },

  taskMetaLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  taskMetaValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 2,
  },

  taskMetaValueDanger: {
    color: colors.danger,
  },

  gradePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: `${colors.secondary}16`,
  },

  gradePreviewLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  gradePreviewText: {
    ...typography.h3,
    color: colors.secondary,
    marginTop: 2,
  },

  taskFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  taskFooterText: {
    ...typography.caption,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 240,
    color: colors.textMuted,
    lineHeight: 18,
  },

  openTaskAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  openTaskActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  emptyCard: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 34,
    backgroundColor: `${colors.secondary}22`,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
  },

  emptyDescription: {
    ...typography.body,
    maxWidth: 460,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginTop: spacing.xs,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.danger}55`,
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}0D`,
  },

  errorIndicator: {
    alignSelf: "stretch",
    width: 4,
    backgroundColor: colors.danger,
  },

  errorContent: {
    flex: 1,
    padding: spacing.sm,
  },

  errorTitle: {
    ...typography.bodyBold,
    color: colors.danger,
    marginBottom: 2,
  },

  errorMessage: {
    ...typography.caption,
    color: colors.danger,
    lineHeight: 18,
  },

  errorAction: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },

  errorActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.danger,
  },

  errorDismiss: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  pressedOpacity: {
    opacity: 0.72,
  },
});