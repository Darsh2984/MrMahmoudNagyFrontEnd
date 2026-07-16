import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/lib/api";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

const STAT_ITEMS = [
  {
    key: "opened",
    label: "Assigned tickets",
    description: "Total tickets routed to you",
    icon: "file-tray-full-outline",
    tone: "primary",
  },
  {
    key: "replied",
    label: "Replied",
    description: "Tickets you have responded to",
    icon: "chatbubble-ellipses-outline",
    tone: "success",
  },
  {
    key: "resolvedConfirmed",
    label: "Confirmed resolved",
    description: "Resolved and confirmed by students",
    icon: "checkmark-circle-outline",
    tone: "success",
  },
  {
    key: "pendingConfirmation",
    label: "Awaiting confirmation",
    description: "Waiting for the student to confirm",
    icon: "time-outline",
    tone: "warning",
  },
  {
    key: "reopened",
    label: "Reopened",
    description: "Tickets reopened by students",
    icon: "refresh-circle-outline",
    tone: "danger",
  },
  {
    key: "stillOpen",
    label: "Not yet handled",
    description: "Tickets with no reply yet",
    icon: "alert-circle-outline",
    tone: "danger",
  },
];

export default function MyStats() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async ({ refresh = false } = {}) => {
      if (!user?.id) {
        setError("Your assistant account could not be identified.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      refresh ? setRefreshing(true) : setLoading(true);
      setError("");

      try {
        const [statsResponse, assignmentsResponse] = await Promise.all([
          api.get("/assistant-stats/me"),
          api.get(
            `/assistant-assignments/assistant/${user.id}`
          ),
        ]);

        setStats(statsResponse.data || {});
        setAssignments(
          Array.isArray(assignmentsResponse.data)
            ? assignmentsResponse.data
            : []
        );
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            err.response?.data?.message ||
            "Couldn't load your assistant dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const responseRate = useMemo(() => {
    const opened = Number(stats?.opened || 0);
    const replied = Number(stats?.replied || 0);

    if (!opened) return null;

    return Math.round((replied / opened) * 100);
  }, [stats]);

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Ionicons
              name="analytics-outline"
              size={30}
              color={colors.primary}
            />
          </View>

          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loadingSpinner}
          />

          <Text style={styles.loadingTitle}>
            Loading your dashboard
          </Text>

          <Text style={styles.loadingText}>
            Preparing your assigned groups and ticket activity.
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
          onRefresh={() =>
            loadDashboard({ refresh: true })
          }
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.eyebrow}>
              ASSISTANT DASHBOARD
            </Text>

            <Text style={styles.title}>
              Welcome back
              {user?.name ? `, ${getFirstName(user.name)}` : ""}
            </Text>

            <Text style={styles.subtitle}>
              Review your ticket activity and assigned student
              groups.
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
            <View style={styles.errorRow}>
              <View style={styles.errorIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={colors.danger}
                />
              </View>

              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  Dashboard unavailable
                </Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>
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

              <Text style={styles.retryText}>
                Try again
              </Text>
            </Pressable>
          </Card>
        ) : null}

        {stats ? (
          <>
            <Card style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="headset-outline"
                    size={27}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.heroContent}>
                  <Text style={styles.heroLabel}>
                    SUPPORT OVERVIEW
                  </Text>

                  <Text style={styles.heroTitle}>
                    Your ticket workload
                  </Text>

                  <Text style={styles.heroDescription}>
                    Track how many student requests have been
                    assigned, answered, and resolved.
                  </Text>
                </View>
              </View>

              <View style={styles.heroMetrics}>
                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricValue}>
                    {stats.opened || 0}
                  </Text>
                  <Text style={styles.heroMetricLabel}>
                    Assigned
                  </Text>
                </View>

                <View style={styles.heroDivider} />

                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricValue}>
                    {stats.replied || 0}
                  </Text>
                  <Text style={styles.heroMetricLabel}>
                    Replied
                  </Text>
                </View>

                <View style={styles.heroDivider} />

                <View style={styles.heroMetric}>
                  <Text style={styles.heroMetricValue}>
                    {responseRate !== null
                      ? `${responseRate}%`
                      : "—"}
                  </Text>
                  <Text style={styles.heroMetricLabel}>
                    Response rate
                  </Text>
                </View>
              </View>
            </Card>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Ticket statistics
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Your current support activity
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  loadDashboard({ refresh: true })
                }
                disabled={refreshing}
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.pressed,
                ]}
              >
                {refreshing ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />
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
              {STAT_ITEMS.map((item) => (
                <StatCard
                  key={item.key}
                  label={item.label}
                  description={item.description}
                  value={stats[item.key] || 0}
                  icon={item.icon}
                  tone={item.tone}
                />
              ))}
            </View>

            <View style={styles.groupsSection}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Assigned groups
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Student groups currently assigned to you
                  </Text>
                </View>

                <View style={styles.groupCountBadge}>
                  <Text style={styles.groupCountText}>
                    {assignments.length}
                  </Text>
                </View>
              </View>

              {assignments.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="people-outline"
                      size={31}
                      color={colors.primary}
                    />
                  </View>

                  <Text style={styles.emptyTitle}>
                    No groups assigned
                  </Text>

                  <Text style={styles.emptyText}>
                    You have not been assigned to any student
                    groups yet.
                  </Text>
                </Card>
              ) : (
                <View style={styles.groupList}>
                  {assignments.map((assignment, index) => (
                    <Card
                      key={assignment.id}
                      style={styles.groupCard}
                    >
                      <View style={styles.groupIcon}>
                        <Ionicons
                          name="people-outline"
                          size={22}
                          color={colors.primary}
                        />
                      </View>

                      <View style={styles.groupContent}>
                        <Text style={styles.groupLabel}>
                          ASSIGNED GROUP
                        </Text>

                        <Text style={styles.groupName}>
                          {assignment.group?.name ||
                            "Unnamed group"}
                        </Text>
                      </View>

                      <View style={styles.groupNumber}>
                        <Text style={styles.groupNumberText}>
                          {index + 1}
                        </Text>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function StatCard({
  label,
  description,
  value,
  icon,
  tone,
}) {
  const toneStyle = TONES[tone] || TONES.primary;

  return (
    <View style={styles.statCardWrapper}>
      <Card style={styles.statCard}>
        <View
          style={[
            styles.statIcon,
            {
              backgroundColor: toneStyle.soft,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={23}
            color={toneStyle.main}
          />
        </View>

        <Text style={styles.statValue}>
          {value}
        </Text>

        <Text style={styles.statLabel}>
          {label}
        </Text>

        <Text style={styles.statDescription}>
          {description}
        </Text>
      </Card>
    </View>
  );
}

function getFirstName(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)[0];
}

function getInitials(name) {
  const parts = String(name || "Assistant")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "AS";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
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
    maxWidth: 380,
    marginTop: spacing.xs,
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

  headerContent: {
    flex: 1,
  },

  eyebrow: {
    marginBottom: 5,
    fontSize: 11,
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
    fontSize: 14,
    lineHeight: 21,
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

  errorRow: {
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

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  errorText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
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

  retryText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  heroCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },

  heroHeader: {
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
    backgroundColor: colors.background,
  },

  heroContent: {
    flex: 1,
  },

  heroLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "rgba(255,255,255,0.66)",
  },

  heroTitle: {
    marginTop: 4,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  heroDescription: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.76)",
  },

  heroMetrics: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
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
    color: "rgba(255,255,255,0.68)",
    textAlign: "center",
  },

  heroDivider: {
    width: 1,
    marginHorizontal: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
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
    minHeight: 180,
    padding: spacing.md,
  },

  statIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    marginTop: spacing.md,
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },

  statLabel: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  statDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },

  groupsSection: {
    marginTop: spacing.xl,
  },

  groupCountBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: "rgba(11, 60, 73, 0.10)",
  },

  groupCountText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },

  groupList: {
    gap: spacing.sm,
  },

  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },

  groupIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 60, 73, 0.09)",
  },

  groupContent: {
    flex: 1,
  },

  groupLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: colors.textMuted,
  },

  groupName: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },

  groupNumber: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "rgba(139, 170, 145, 0.18)",
  },

  groupNumberText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.secondary,
  },

  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 60, 73, 0.09)",
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  emptyText: {
    maxWidth: 360,
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.72,
  },
});