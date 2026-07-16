import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

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

export default function ParentLookup() {
  const [accessCode, setAccessCode] = useState("");
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedCode = accessCode.trim();

  const performanceSummary = useMemo(() => {
    const attendance = Array.isArray(student?.performance?.attendance)
      ? student.performance.attendance
      : [];

    const tasks = Array.isArray(student?.performance?.tasks)
      ? student.performance.tasks
      : [];

    const attendedCount = attendance.filter(
      (record) => record.present
    ).length;

    const submittedTasksCount = tasks.filter(
      (task) => task.submitted
    ).length;

    return {
      attendanceCount: attendedCount,
      attendanceTotal: attendance.length,
      attendancePercentage: attendance.length
        ? Math.round((attendedCount / attendance.length) * 100)
        : null,
      submittedTasksCount,
      tasksTotal: tasks.length,
    };
  }, [student]);

  async function handleLookup() {
    if (!normalizedCode || loading) return;

    setLoading(true);
    setError("");
    setStudent(null);

    try {
      const response = await api.get(
        `/auth/lookup/${encodeURIComponent(normalizedCode)}`
      );

      setStudent(response.data);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Couldn't find a student using this access code."
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

    if (student) {
      setStudent(null);
    }
  }

  const membership = student?.groupMemberships?.[0];
  const group = membership?.group;
  const year = group?.year;

  const quizzes = Array.isArray(student?.performance?.quizzes)
    ? student.performance.quizzes
    : [];

  const inClassQuizzes = Array.isArray(
    student?.performance?.inClassQuizzes
  )
    ? student.performance.inClassQuizzes
    : [];

  return (
    <Screen
      scroll
      contentContainerStyle={styles.screenContent}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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

              <Text style={styles.brandDescription}>
                Secure parent progress access
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

                <Text style={[typography.h1, styles.title]}>
                  View your child's progress
                </Text>

                <Text style={styles.subtitle}>
                  Enter the access code provided for your child's
                  account to view their academic information.
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

                <Text style={styles.errorText}>{error}</Text>

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
              title="View progress"
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

              <Text style={styles.securityNoteText}>
                This page provides read-only access. No information
                can be edited.
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
                Please wait while we securely retrieve the academic
                record.
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
                    performanceSummary.attendancePercentage !== null
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
              </View>

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
                    gradeOutOf={quiz.gradeOutOf}
                  />
                ))}
              </PerformanceSection>
            </View>
          ) : null}

          <Link href="/(auth)/login" asChild>
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
                : groupName || yearName || "No group assigned"
            }
          />

          <DetailPill
            icon={
              student.attendanceMode === "ONLINE"
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
          backgroundColor: `${colors.secondary}20`,
        }
      : {
          color: colors.primary,
          backgroundColor: `${colors.primary}12`,
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
  const childItems = React.Children.toArray(children);

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
          {childItems.map((child, index) => (
            <React.Fragment key={child.key || index}>
              {index > 0 ? (
                <View style={styles.recordDivider} />
              ) : null}

              {child}
            </React.Fragment>
          ))}
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
          !attempted && styles.pendingBadge,
        ]}
      >
        <Text
          style={[
            styles.scoreText,
            !attempted && styles.pendingText,
          ]}
        >
          {hasScore ? `${score}/${total}` : "Pending"}
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

function formatAttendanceMode(mode) {
  if (mode === "ONLINE") {
    return "Online attendance";
  }

  if (mode === "ONGROUND") {
    return "On-ground attendance";
  }

  return "Attendance mode not set";
}

function getInitials(name) {
  const parts = String(name || "Student")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "ST";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    width: "100%",
  },

  keyboardView: {
    flex: 1,
  },

  page: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },

  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },

  brandIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },

  brandContent: {
    flexShrink: 1,
  },

  brandName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: colors.primary,
  },

  brandDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  lookupCard: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    padding: spacing.xl,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginRight: spacing.md,
  },

  headerContent: {
    flex: 1,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
  },

  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },

  errorAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: `${colors.danger}45`,
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}0D`,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },

  errorIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },

  errorText: {
    ...typography.caption,
    color: colors.danger,
    lineHeight: 19,
    flex: 1,
    paddingTop: 6,
  },

  dismissButton: {
    padding: spacing.xs,
  },

  lookupButton: {
    width: "100%",
    marginTop: spacing.sm,
  },

  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },

  securityNoteText: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 1,
  },

  loadingCard: {
    alignItems: "center",
    maxWidth: 620,
    width: "100%",
    alignSelf: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.xl,
  },

  loadingTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },

  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  results: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },

  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },

  studentAvatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    marginRight: spacing.md,
  },

  studentAvatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },

  studentContent: {
    flex: 1,
  },

  studentLabel: {
    ...typography.caption,
    color: colors.background,
    fontWeight: "800",
    letterSpacing: 1,
    opacity: 0.75,
  },

  studentName: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.white,
    marginTop: 3,
  },

  studentDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  detailPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  detailPillText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  summaryCard: {
    width: "50%",
    minHeight: 185,
    margin: 6,
    flexGrow: 1,
    flexBasis: 280,
  },

  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryValue: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: spacing.md,
  },

  summaryLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
  },

  summaryDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: spacing.xs,
  },

  sectionCard: {
    padding: spacing.lg,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginRight: spacing.sm,
  },

  sectionHeaderContent: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  recordCount: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: `${colors.primary}12`,
  },

  recordCountText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "800",
  },

  records: {
    marginTop: spacing.md,
  },

  recordDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  recordMain: {
    flex: 1,
  },

  recordTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  recordStatus: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  scoreBadge: {
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: `${colors.secondary}25`,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },

  scoreText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "800",
  },

  pendingBadge: {
    backgroundColor: `${colors.warning}20`,
  },

  pendingText: {
    color: colors.warning,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginTop: spacing.md,
  },

  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },

  backLinkText: {
    ...typography.bodyBold,
    color: colors.primary,
  },

  pressed: {
    opacity: 0.72,
  },
});