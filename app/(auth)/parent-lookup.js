import React, {
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import {
  Link,
  useRouter,
} from "expo-router";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import api from "../../src/lib/api";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

const PARENT_ACCESS_CODE_KEY =
  "parent_access_code";

function getApiError(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "?";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`
    .toUpperCase();
}

function getLastMessagePreview(message) {
  if (!message) {
    return "No messages yet";
  }

  const senderName =
    message.senderType === "PARENT"
      ? message.parentDisplayName ||
        "Parent"
      : message.senderUser?.name ||
        "School";

  if (message.content) {
    return `${senderName}: ${message.content}`;
  }

  return `${senderName}: sent a message`;
}

function formatAttendanceMode(mode) {
  if (mode === "ONLINE") {
    return "Online attendance";
  }

  if (mode === "ONGROUND") {
    return "On-ground attendance";
  }

  return "Attendance mode not set";
}

export default function ParentLookup() {
  const router = useRouter();

  const [accessCode, setAccessCode] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const normalizedCode =
    accessCode.trim().toUpperCase();

  const student = result?.student || null;

  const performance =
    result?.performance || null;

  const chats = Array.isArray(result?.chats)
    ? result.chats
    : [];

  const performanceSummary = useMemo(() => {
    const attendance = Array.isArray(
      performance?.attendance
    )
      ? performance.attendance
      : [];

    const tasks = Array.isArray(
      performance?.tasks
    )
      ? performance.tasks
      : [];

    const attendedCount =
      attendance.filter(
        (record) => record.present
      ).length;

    const submittedTasksCount =
      tasks.filter(
        (task) => task.submitted
      ).length;

    return {
      attendanceCount: attendedCount,
      attendanceTotal: attendance.length,
      attendancePercentage:
        attendance.length > 0
          ? Math.round(
              (attendedCount /
                attendance.length) *
                100
            )
          : null,
      submittedTasksCount,
      tasksTotal: tasks.length,
    };
  }, [performance]);

  async function handleLookup() {
    if (!normalizedCode || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post(
        "/parent-access/lookup",
        {
          accessCode: normalizedCode,
        }
      );

      await AsyncStorage.setItem(
        PARENT_ACCESS_CODE_KEY,
        normalizedCode
      );

      setResult(response.data);
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Couldn't find a student using this access code."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(value) {
    setAccessCode(value);

    if (error) {
      setError("");
    }

    if (result) {
      setResult(null);
    }
  }

  function openSupportChat(chat) {
    router.push({
      pathname:
        "/(auth)/parent-support-chat/[chatId]",
      params: {
        chatId: chat.id,
      },
    });
  }

  const firstMembership =
    student?.groupMemberships?.[0];

  const group =
    firstMembership?.group ||
    student?.group ||
    null;

  const year = group?.year || null;

  const quizzes = Array.isArray(
    performance?.quizzes
  )
    ? performance.quizzes
    : [];

  const inClassQuizzes = Array.isArray(
    performance?.inClassQuizzes
  )
    ? performance.inClassQuizzes
    : [];

  return (
    <Screen
      scroll
      contentContainerStyle={
        styles.screenContent
      }
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        style={styles.keyboardView}
      >
        <View style={styles.page}>
          <View style={styles.brandHeader}>
            <View style={styles.brandIcon}>
              <Ionicons
                name="school-outline"
                size={28}
                color={colors.white}
              />
            </View>

            <View style={styles.brandContent}>
              <Text style={styles.brandName}>
                Mahmoud Nagy Platform
              </Text>

              <Text
                style={styles.brandDescription}
              >
                Secure parent progress and
                support access
              </Text>
            </View>
          </View>

          <Card style={styles.lookupCard}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="people-outline"
                  size={27}
                  color={colors.primary}
                />
              </View>

              <View style={styles.headerContent}>
                <Text style={styles.eyebrow}>
                  PARENT ACCESS
                </Text>

                <Text
                  style={[
                    typography.h1,
                    styles.title,
                  ]}
                >
                  View your child's progress
                </Text>

                <Text style={styles.subtitle}>
                  Enter the student access code
                  provided by the platform to view
                  progress and open the private
                  support chat.
                </Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorAlert}>
                <View style={styles.errorIcon}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={21}
                    color={colors.danger}
                  />
                </View>

                <Text style={styles.errorText}>
                  {error}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss error"
                  onPress={() => setError("")}
                  style={({ pressed }) => [
                    styles.dismissButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={19}
                    color={colors.danger}
                  />
                </Pressable>
              </View>
            ) : null}

            <Input
              label="Student access code"
              value={accessCode}
              onChangeText={handleCodeChange}
              placeholder="Enter the access code"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="search"
              onSubmitEditing={handleLookup}
            />

            <Button
              title="View parent access"
              onPress={handleLookup}
              loading={loading}
              disabled={!normalizedCode || loading}
              style={styles.lookupButton}
            />

            <View style={styles.securityNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={colors.secondary}
              />

              <Text
                style={styles.securityNoteText}
              >
                This code gives access only to this
                student's parent view and private
                support chat.
              </Text>
            </View>
          </Card>

          {loading ? (
            <Card style={styles.loadingCard}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

              <Text style={styles.loadingTitle}>
                Finding student information
              </Text>

              <Text style={styles.loadingText}>
                Please wait while we securely
                retrieve the academic record.
              </Text>
            </Card>
          ) : null}

          {student && !loading ? (
            <View style={styles.results}>
              <StudentHeader
                student={student}
                groupName={group?.name}
                yearName={year?.name}
              />

              <View style={styles.summaryGrid}>
                <SummaryCard
                  icon="calendar-outline"
                  label="Attendance"
                  value={
                    performanceSummary
                      .attendancePercentage !== null
                      ? `${performanceSummary.attendancePercentage}%`
                      : "—"
                  }
                  description={
                    performanceSummary.attendanceTotal
                      ? `${performanceSummary.attendanceCount} of ${performanceSummary.attendanceTotal} sessions attended`
                      : "No attendance records yet"
                  }
                  tone="success"
                />

                <SummaryCard
                  icon="document-text-outline"
                  label="Tasks submitted"
                  value={`${performanceSummary.submittedTasksCount}/${performanceSummary.tasksTotal}`}
                  description={
                    performanceSummary.tasksTotal
                      ? "Submitted homework tasks"
                      : "No tasks assigned yet"
                  }
                  tone="primary"
                />

                <SummaryCard
                  icon="chatbubbles-outline"
                  label="Support chats"
                  value={`${chats.length}`}
                  description={
                    chats.length
                      ? "Private chat with the teacher team"
                      : "No support chat yet"
                  }
                  tone="primary"
                />
              </View>

              <ParentSupportChats
                chats={chats}
                onOpenChat={openSupportChat}
              />

              <PerformanceSection
                title="Quizzes"
                subtitle="Question-bank quiz attempts and scores"
                icon="help-circle-outline"
                emptyText="No quiz records are available yet."
              >
                {quizzes.map((quiz) => (
                  <QuizRow
                    key={quiz.quizId}
                    title={quiz.title}
                    attempted={quiz.attempted}
                    score={quiz.score}
                    total={quiz.total}
                  />
                ))}
              </PerformanceSection>

              <PerformanceSection
                title="In-Class Quizzes"
                subtitle="Grades recorded during class sessions"
                icon="clipboard-outline"
                emptyText="No in-class quiz grades are available yet."
              >
                {inClassQuizzes.map((quiz) => (
                  <GradeRow
                    key={quiz.quizId}
                    title={quiz.quizName}
                    grade={quiz.grade}
                    gradeOutOf={
                      quiz.gradeOutOf
                    }
                  />
                ))}
              </PerformanceSection>
            </View>
          ) : null}

          <Link
            href="/(auth)/login"
            asChild
          >
            <Pressable
              accessibilityRole="link"
              style={({ pressed }) => [
                styles.backLink,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-back-outline"
                size={18}
                color={colors.primary}
              />

              <Text style={styles.backLinkText}>
                Back to sign in
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function StudentHeader({
  student,
  groupName,
  yearName,
}) {
  return (
    <Card style={styles.studentCard}>
      <View style={styles.studentAvatar}>
        <Text style={styles.studentAvatarText}>
          {getInitials(student.name)}
        </Text>
      </View>

      <View style={styles.studentContent}>
        <Text style={styles.studentLabel}>
          STUDENT RECORD
        </Text>

        <Text style={styles.studentName}>
          {student.name}
        </Text>

        <View style={styles.studentDetails}>
          <DetailPill
            icon="people-outline"
            text={
              groupName && yearName
                ? `${yearName} · ${groupName}`
                : groupName ||
                  yearName ||
                  "No group assigned"
            }
          />

          <DetailPill
            icon={
              student.attendanceMode ===
              "ONLINE"
                ? "laptop-outline"
                : "location-outline"
            }
            text={formatAttendanceMode(
              student.attendanceMode
            )}
          />
        </View>
      </View>
    </Card>
  );
}

function ParentSupportChats({
  chats,
  onOpenChat,
}) {
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            name="chatbubbles-outline"
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionTitle}>
            Support Chat
          </Text>

          <Text style={styles.sectionSubtitle}>
            Private communication with the
            teacher and assigned assistants.
          </Text>
        </View>

        <View style={styles.recordCount}>
          <Text style={styles.recordCountText}>
            {chats.length}
          </Text>
        </View>
      </View>

      {chats.length ? (
        <View style={styles.chatList}>
          {chats.map((chat) => (
            <Pressable
              key={chat.id}
              accessibilityRole="button"
              onPress={() => onOpenChat(chat)}
              style={({ pressed }) => [
                styles.chatRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.chatIcon}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <View style={styles.chatContent}>
                <View style={styles.chatTitleRow}>
                  <Text
                    numberOfLines={1}
                    style={styles.chatTitle}
                  >
                    {chat.name ||
                      "Student Support"}
                  </Text>

                  {Number(chat.unreadCount) >
                  0 ? (
                    <View
                      style={
                        styles.unreadBadge
                      }
                    >
                      <Text
                        style={
                          styles.unreadText
                        }
                      >
                        {chat.unreadCount}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text
                  numberOfLines={1}
                  style={styles.chatMeta}
                >
                  {[
                    chat.group?.year?.name,
                    chat.group?.name,
                  ]
                    .filter(Boolean)
                    .join(" · ") ||
                    "Student support"}
                </Text>

                <Text
                  numberOfLines={2}
                  style={styles.chatPreview}
                >
                  {getLastMessagePreview(
                    chat.lastMessage
                  )}
                </Text>

                {chat.lastMessage?.createdAt ? (
                  <Text style={styles.chatTime}>
                    {formatDateTime(
                      chat.lastMessage
                        .createdAt
                    )}
                  </Text>
                ) : null}
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="chatbubble-outline"
            size={27}
            color={colors.textMuted}
          />

          <Text style={styles.emptyText}>
            No support chat exists yet. It will
            appear after the student is assigned
            to a group.
          </Text>
        </View>
      )}
    </Card>
  );
}

function DetailPill({ icon, text }) {
  return (
    <View style={styles.detailPill}>
      <Ionicons
        name={icon}
        size={15}
        color={colors.primary}
      />

      <Text style={styles.detailPillText}>
        {text}
      </Text>
    </View>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
  tone,
}) {
  const toneStyle =
    tone === "success"
      ? {
          color: colors.secondary,
          backgroundColor:
            `${colors.secondary}20`,
        }
      : {
          color: colors.primary,
          backgroundColor:
            `${colors.primary}12`,
        };

  return (
    <Card style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor:
              toneStyle.backgroundColor,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={23}
          color={toneStyle.color}
        />
      </View>

      <Text style={styles.summaryValue}>
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryDescription}>
        {description}
      </Text>
    </Card>
  );
}

function PerformanceSection({
  title,
  subtitle,
  icon,
  emptyText,
  children,
}) {
  const childItems =
    React.Children.toArray(children);

  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            name={icon}
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionTitle}>
            {title}
          </Text>

          <Text style={styles.sectionSubtitle}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.recordCount}>
          <Text style={styles.recordCountText}>
            {childItems.length}
          </Text>
        </View>
      </View>

      {childItems.length ? (
        <View style={styles.records}>
          {childItems.map(
            (child, index) => (
              <React.Fragment
                key={child.key || index}
              >
                {index > 0 ? (
                  <View
                    style={
                      styles.recordDivider
                    }
                  />
                ) : null}

                {child}
              </React.Fragment>
            )
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="document-outline"
            size={27}
            color={colors.textMuted}
          />

          <Text style={styles.emptyText}>
            {emptyText}
          </Text>
        </View>
      )}
    </Card>
  );
}

function QuizRow({
  title,
  attempted,
  score,
  total,
}) {
  const hasScore =
    attempted &&
    score !== null &&
    score !== undefined &&
    total !== null &&
    total !== undefined;

  return (
    <View style={styles.recordRow}>
      <View style={styles.recordMain}>
        <Text style={styles.recordTitle}>
          {title || "Untitled quiz"}
        </Text>

        <Text style={styles.recordStatus}>
          {attempted
            ? "Quiz attempted"
            : "Not attempted yet"}
        </Text>
      </View>

      <View
        style={[
          styles.scoreBadge,
          !attempted &&
            styles.pendingBadge,
        ]}
      >
        <Text
          style={[
            styles.scoreText,
            !attempted &&
              styles.pendingText,
          ]}
        >
          {hasScore
            ? `${score}/${total}`
            : "Pending"}
        </Text>
      </View>
    </View>
  );
}

function GradeRow({
  title,
  grade,
  gradeOutOf,
}) {
  const hasGrade =
    grade !== null &&
    grade !== undefined &&
    gradeOutOf !== null &&
    gradeOutOf !== undefined;

  return (
    <View style={styles.recordRow}>
      <View style={styles.recordMain}>
        <Text style={styles.recordTitle}>
          {title || "Untitled in-class quiz"}
        </Text>

        <Text style={styles.recordStatus}>
          In-class assessment
        </Text>
      </View>

      <View style={styles.scoreBadge}>
        <Text style={styles.scoreText}>
          {hasGrade
            ? `${grade}/${gradeOutOf}`
            : "Not graded"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  page: {
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
    padding: spacing.lg,
    gap: spacing.lg,
  },

  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  brandIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  brandContent: {
    flex: 1,
  },

  brandName: {
    ...typography.h3,
    color: colors.textPrimary,
  },

  brandDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 3,
  },

  lookupCard: {
    gap: spacing.md,
  },

  header: {
    flexDirection: "row",
    gap: spacing.md,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.primary + "12",
  },

  headerContent: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.primary,
    marginBottom: 5,
  },

  title: {
    color: colors.textPrimary,
  },

  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: spacing.xs,
  },

  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor:
      colors.danger + "10",
  },

  errorIcon: {
    width: 28,
    alignItems: "center",
  },

  errorText: {
    flex: 1,
    color: colors.danger,
    fontWeight: "700",
  },

  dismissButton: {
    padding: spacing.xs,
  },

  lookupButton: {
    marginTop: spacing.xs,
  },

  securityNote: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor:
      colors.secondary + "12",
  },

  securityNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },

  loadingCard: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },

  loadingTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },

  results: {
    gap: spacing.lg,
  },

  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  studentAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  studentAvatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "900",
  },

  studentContent: {
    flex: 1,
  },

  studentLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
  },

  studentName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 3,
  },

  studentDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  detailPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor:
      colors.primary + "10",
  },

  detailPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  summaryCard: {
    flex: 1,
    minWidth: 220,
    gap: spacing.xs,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  summaryLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  summaryDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },

  sectionCard: {
    gap: spacing.md,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.primary + "12",
  },

  sectionHeaderContent: {
    flex: 1,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },

  recordCount: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.secondary + "16",
  },

  recordCountText: {
    fontWeight: "900",
    color: colors.secondary,
  },

  records: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },

  recordDivider: {
    height: 1,
    backgroundColor: colors.border,
  },

  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
  },

  recordMain: {
    flex: 1,
  },

  recordTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  recordStatus: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },

  scoreBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor:
      colors.secondary + "16",
  },

  scoreText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.secondary,
  },

  pendingBadge: {
    backgroundColor:
      colors.textMuted + "18",
  },

  pendingText: {
    color: colors.textMuted,
  },

  chatList: {
    gap: spacing.sm,
  },

  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },

  chatIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.primary + "10",
  },

  chatContent: {
    flex: 1,
    minWidth: 0,
  },

  chatTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  chatTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  chatMeta: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "800",
    marginTop: 3,
  },

  chatPreview: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 4,
  },

  chatTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },

  unreadBadge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger,
  },

  unreadText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },

  backLink: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
  },

  backLinkText: {
    fontWeight: "800",
    color: colors.primary,
  },

  pressed: {
    opacity: 0.72,
  },
});