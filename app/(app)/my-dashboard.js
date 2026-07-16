import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/lib/api";
import { colors, radius, spacing, typography } from "../../src/theme";

const DASHBOARD_ITEMS = [
  {
    key: "attendance",
    title: "Attendance",
    icon: "calendar-outline",
    tone: "success",
  },
  {
    key: "tasks",
    title: "Homework",
    icon: "document-text-outline",
    tone: "primary",
  },
  {
    key: "quizzes",
    title: "Pending quizzes",
    icon: "help-circle-outline",
    tone: "warning",
    route: "/quizzes",
  },
  {
    key: "tickets",
    title: "Open tickets",
    icon: "chatbubble-ellipses-outline",
    tone: "danger",
    route: "/tickets",
  },
];

export default function MyDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [ticketCount, setTicketCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard({ refresh = false } = {}) {
    if (!user?.id) {
      setError("Your account information could not be loaded.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    refresh ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const profile = await api.get(`/students/${user.id}`);
      const group = profile.data.groupMemberships?.[0]?.group;

      if (!group) {
        setSummary(null);
        setError("You have not been added to a group yet.");
        return;
      }

      const [perfRes, ticketsRes, quizzesRes] = await Promise.all([
        api.get(`/performance/${group.id}/${user.id}`),
        api.get("/tickets/mine"),
        api.get("/quiz-student/mine"),
      ]);

      const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      const quizzes = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];

      setSummary(perfRes.data);
      setTicketCount(
        tickets.filter((ticket) => ticket.status !== "CONFIRMED_RESOLVED")
          .length
      );
      setQuizCount(
        quizzes.filter((quiz) => !quiz.alreadySubmitted).length
      );
    } catch (err) {
      setSummary(null);
      setError(err.response?.data?.msg || "Couldn't load your dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [user?.id]);

  const dashboardData = useMemo(() => {
    const attendance = Array.isArray(summary?.attendance)
      ? summary.attendance
      : [];
    const tasks = Array.isArray(summary?.tasks) ? summary.tasks : [];

    const attendedCount = attendance.filter((item) => item.present).length;
    const tasksSubmitted = tasks.filter((item) => item.submitted).length;

    const attendancePercentage = attendance.length
      ? Math.round((attendedCount / attendance.length) * 100)
      : null;

    const taskPercentage = tasks.length
      ? Math.round((tasksSubmitted / tasks.length) * 100)
      : null;

    return {
      attendance: {
        value:
          attendancePercentage !== null
            ? `${attendancePercentage}%`
            : "—",
        description: attendance.length
          ? `${attendedCount} of ${attendance.length} sessions attended`
          : "No sessions recorded yet",
        progress: attendancePercentage,
      },
      tasks: {
        value: `${tasksSubmitted}/${tasks.length}`,
        description: tasks.length
          ? `${taskPercentage}% of homework submitted`
          : "No homework assigned yet",
        progress: taskPercentage,
      },
      quizzes: {
        value: String(quizCount),
        description:
          quizCount === 1
            ? "Quiz waiting to be completed"
            : "Quizzes waiting to be completed",
        progress: null,
      },
      tickets: {
        value: String(ticketCount),
        description:
          ticketCount === 1
            ? "Ticket still needs attention"
            : "Tickets still need attention",
        progress: null,
      },
    };
  }, [summary, quizCount, ticketCount]);

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Ionicons
              name="school-outline"
              size={30}
              color={colors.primary}
            />
          </View>

          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loadingSpinner}
          />

          <Text style={styles.loadingTitle}>Loading your dashboard</Text>
          <Text style={styles.loadingText}>
            Preparing your latest attendance, homework and quiz information.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadDashboard({ refresh: true })}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>STUDENT DASHBOARD</Text>
            <Text style={styles.title}>
              Welcome back{user?.name ? `, ${getFirstName(user.name)}` : ""}
            </Text>
            <Text style={styles.subtitle}>
              Here is a summary of your current learning progress.
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.name)}
            </Text>
          </View>
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <View style={styles.messageRow}>
              <View style={styles.errorIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={colors.danger}
                />
              </View>

              <View style={styles.messageContent}>
                <Text style={styles.errorTitle}>
                  Dashboard unavailable
                </Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </View>

            <Pressable
              onPress={() => loadDashboard()}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </Card>
        ) : null}

        {summary ? (
          <>
            <Card style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="analytics-outline"
                    size={26}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.heroContent}>
                  <Text style={styles.heroLabel}>Overall progress</Text>
                  <Text style={styles.heroTitle}>
                    Keep building your momentum
                  </Text>
                  <Text style={styles.heroDescription}>
                    Complete pending quizzes and homework to stay up to date.
                  </Text>
                </View>
              </View>

              <View style={styles.heroMetrics}>
                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricValue}>
                    {dashboardData.attendance.value}
                  </Text>
                  <Text style={styles.heroMetricLabel}>Attendance</Text>
                </View>

                <View style={styles.heroDivider} />

                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricValue}>
                    {dashboardData.tasks.value}
                  </Text>
                  <Text style={styles.heroMetricLabel}>Homework</Text>
                </View>

                <View style={styles.heroDivider} />

                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricValue}>{quizCount}</Text>
                  <Text style={styles.heroMetricLabel}>Pending quizzes</Text>
                </View>
              </View>
            </Card>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Your summary</Text>
                <Text style={styles.sectionSubtitle}>
                  Latest activity across your account
                </Text>
              </View>

              <Pressable
                onPress={() => loadDashboard({ refresh: true })}
                disabled={refreshing}
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.pressed,
                ]}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </Pressable>
            </View>

            <View style={styles.statsGrid}>
              {DASHBOARD_ITEMS.map((item) => {
                const data = dashboardData[item.key];

                return (
                  <DashboardStatCard
                    key={item.key}
                    title={item.title}
                    value={data.value}
                    description={data.description}
                    progress={data.progress}
                    icon={item.icon}
                    tone={item.tone}
                    onPress={
                      item.route
                        ? () => router.push(item.route)
                        : undefined
                    }
                  />
                );
              })}
            </View>

            {(quizCount > 0 || ticketCount > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Needs your attention
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Items you may want to review next
                </Text>

                <Card style={styles.actionCard}>
                  {quizCount > 0 ? (
                    <ActionRow
                      icon="help-circle-outline"
                      tone="warning"
                      title={
                        quizCount === 1
                          ? "Complete your pending quiz"
                          : `Complete ${quizCount} pending quizzes`
                      }
                      description="Open your quizzes and continue where you left off."
                      onPress={() => router.push("/quizzes")}
                    />
                  ) : null}

                  {quizCount > 0 && ticketCount > 0 ? (
                    <View style={styles.actionDivider} />
                  ) : null}

                  {ticketCount > 0 ? (
                    <ActionRow
                      icon="chatbubble-ellipses-outline"
                      tone="danger"
                      title={
                        ticketCount === 1
                          ? "Check your open ticket"
                          : `Check your ${ticketCount} open tickets`
                      }
                      description="Review replies or confirm whether your issue was solved."
                      onPress={() => router.push("/tickets")}
                    />
                  ) : null}
                </Card>
              </View>
            )}
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function DashboardStatCard({
  title,
  value,
  description,
  progress,
  icon,
  tone,
  onPress,
}) {
  const toneStyle = TONES[tone] || TONES.primary;

  const content = (
    <Card style={styles.statCard}>
      <View style={styles.statCardTop}>
        <View
          style={[
            styles.statIcon,
            { backgroundColor: toneStyle.soft },
          ]}
        >
          <Ionicons name={icon} size={23} color={toneStyle.main} />
        </View>

        {onPress ? (
          <View style={styles.cardArrow}>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color={colors.textMuted}
            />
          </View>
        ) : null}
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statDescription}>{description}</Text>

      {typeof progress === "number" ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(0, Math.min(progress, 100))}%`,
                backgroundColor: toneStyle.main,
              },
            ]}
          />
        </View>
      ) : null}
    </Card>
  );

  if (!onPress) {
    return <View style={styles.statCardWrapper}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.statCardWrapper,
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

function ActionRow({
  icon,
  title,
  description,
  tone,
  onPress,
}) {
  const toneStyle = TONES[tone] || TONES.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.actionIcon,
          { backgroundColor: toneStyle.soft },
        ]}
      >
        <Ionicons name={icon} size={22} color={toneStyle.main} />
      </View>

      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color={colors.textMuted}
      />
    </Pressable>
  );
}

function getFirstName(name) {
  return String(name || "").trim().split(/\s+/)[0];
}

function getInitials(name) {
  const parts = String(name || "Student")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const TONES = {
  primary: {
    main: colors.primary,
    soft: "rgba(11, 60, 73, 0.10)",
  },
  success: {
    main: colors.secondary,
    soft: "rgba(139, 170, 145, 0.18)",
  },
  warning: {
    main: colors.warning,
    soft: "rgba(215, 126, 66, 0.14)",
  },
  danger: {
    main: colors.danger,
    soft: "rgba(200, 93, 71, 0.12)",
  },
};

const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 60, 73, 0.10)",
  },

  loadingSpinner: {
    marginTop: spacing.lg,
  },

  loadingTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  loadingText: {
    marginTop: spacing.xs,
    maxWidth: 360,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.secondary,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: spacing.xs,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  errorCard: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(200, 93, 71, 0.22)",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(200, 93, 71, 0.10)",
  },

  messageContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  errorText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },

  retryButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: "rgba(11, 60, 73, 0.08)",
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  heroCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primary,
    overflow: "hidden",
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },

  heroContent: {
    flex: 1,
  },

  heroLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "rgba(255, 255, 255, 0.70)",
  },

  heroTitle: {
    marginTop: 5,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  heroDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255, 255, 255, 0.76)",
  },

  heroMetrics: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.14)",
  },

  heroMetric: {
    flex: 1,
    alignItems: "center",
  },

  heroMetricValue: {
    fontSize: 21,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  heroMetricLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.68)",
    textAlign: "center",
  },

  heroDivider: {
    width: 1,
    marginHorizontal: spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  section: {
    marginTop: spacing.xl,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textMuted,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 60, 73, 0.08)",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  statCardWrapper: {
    width: "50%",
    padding: 6,
  },

  statCard: {
    flex: 1,
    minHeight: 190,
    padding: spacing.md,
  },

  statCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  cardArrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  statValue: {
    marginTop: spacing.lg,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "800",
    color: colors.text,
  },

  statTitle: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  statDescription: {
    marginTop: 6,
    minHeight: 38,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },

  progressTrack: {
    height: 6,
    marginTop: spacing.md,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: "rgba(51, 49, 46, 0.08)",
  },

  progressFill: {
    height: "100%",
    borderRadius: 99,
  },

  actionCard: {
    marginTop: spacing.md,
    paddingVertical: 4,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  actionDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },

  actionDivider: {
    height: 1,
    backgroundColor: "rgba(51, 49, 46, 0.08)",
  },

  pressed: {
    opacity: 0.72,
  },
});