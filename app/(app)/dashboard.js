import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/lib/api";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

const DESKTOP_BREAKPOINT = 900;

function StatCard({
  label,
  value,
  icon,
  accent,
  actionLabel,
  description,
  onPress,
  disabled = false,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.statCardWrapper,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Card style={styles.statCard}>
        <View
          style={[
            styles.statIcon,
            { backgroundColor: `${accent}16` },
          ]}
        >
          <Ionicons name={icon} size={23} color={accent} />
        </View>

        <View style={styles.statContent}>
          <Text style={styles.statLabel}>{label}</Text>

          <Text style={styles.statValue}>{value ?? 0}</Text>

          {description ? (
            <Text style={styles.statDescription}>
              {description}
            </Text>
          ) : null}

          <View style={styles.statActionRow}>
            <Text style={[styles.statActionText, { color: accent }]}>
              {actionLabel}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={15}
              color={accent}
            />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function AttentionItem({
  count,
  title,
  description,
  actionLabel,
  icon,
  accent,
  onPress,
}) {
  if (!count) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${count} ${title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.attentionPressable,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.attentionItem}>
        <View
          style={[
            styles.attentionIcon,
            { backgroundColor: `${accent}16` },
          ]}
        >
          <Ionicons name={icon} size={22} color={accent} />
        </View>

        <View style={styles.attentionContent}>
          <View style={styles.attentionTitleRow}>
            <Text style={styles.attentionTitle}>{title}</Text>

            <View
              style={[
                styles.countBadge,
                { backgroundColor: `${accent}18` },
              ]}
            >
              <Text style={[styles.countBadgeText, { color: accent }]}>
                {count}
              </Text>
            </View>
          </View>

          <Text style={styles.attentionDescription}>
            {description}
          </Text>

          <View style={styles.attentionActionRow}>
            <Text
              style={[styles.attentionActionText, { color: accent }]}
            >
              {actionLabel}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color={accent}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function YearRow({ year, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${year.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.yearPressable,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.yearRow}>
        <View style={styles.yearIcon}>
          <Ionicons
            name="school-outline"
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.yearContent}>
          <Text style={styles.yearName}>{year.name}</Text>

          <Text style={styles.yearMeta}>
            {year.groupCount}{" "}
            {year.groupCount === 1 ? "group" : "groups"}
          </Text>
        </View>

        <View style={styles.yearAction}>
          <Text style={styles.yearActionText}>View</Text>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.primary}
          />
        </View>
      </View>
    </Pressable>
  );
}

function SectionHeader({ title, description }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {description ? (
        <Text style={styles.sectionDescription}>{description}</Text>
      ) : null}
    </View>
  );
}

function LoadingState() {
  return (
    <Screen scroll={false} style={styles.centeredScreen}>
      <ActivityIndicator
        color={colors.primary}
        size="large"
      />

      <Text style={styles.loadingText}>
        Loading your dashboard...
      </Text>
    </Screen>
  );
}

function NonAdminDashboard({ user }) {
  const displayName =
    user?.name ||
    user?.firstName ||
    user?.email ||
    "there";

  return (
    <Screen>
      <View style={styles.simpleHeader}>
        <Text style={styles.eyebrow}>DASHBOARD</Text>

        <Text style={[typography.h1, styles.pageTitle]}>
          Welcome back, {displayName}
        </Text>

        <Text style={styles.pageDescription}>
          Your personalised dashboard will be available soon.
        </Text>
      </View>

      <Card style={styles.placeholderCard}>
        <View style={styles.placeholderIcon}>
          <Ionicons
            name="construct-outline"
            size={30}
            color={colors.primary}
          />
        </View>

        <Text style={styles.placeholderTitle}>
          Dashboard coming soon
        </Text>

        <Text style={styles.placeholderDescription}>
          Your role-specific statistics and shortcuts will be
          added in the next dashboard build.
        </Text>
      </Card>
    </Screen>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const isAdminLevel =
    user?.role === "TEACHER" || user?.isHeadAssistant;

  const displayName =
    user?.name ||
    user?.firstName ||
    user?.email ||
    "there";

  const loadDashboard = useCallback(
    async ({ isRetry = false } = {}) => {
      setError("");

      if (isRetry) {
        setRefreshing(true);
      }

      try {
        const response = await api.get(
          "/dashboard/teacher-summary"
        );

        setSummary(response.data);
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            err.response?.data?.message ||
            "Couldn't load dashboard data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isAdminLevel) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [isAdminLevel, loadDashboard]);

  if (!isAdminLevel) {
    return <NonAdminDashboard user={user} />;
  }

  if (loading) {
    return <LoadingState />;
  }

  const years = summary?.years ?? [];

  const unresolvedTickets =
    summary?.unresolvedTickets ?? 0;

  const ungradedWritten =
    summary?.ungradedWritten ?? 0;

  const undelegatedSubmissions =
    summary?.undelegatedSubmissions ?? 0;

  const hasAttentionItems =
    unresolvedTickets > 0 ||
    ungradedWritten > 0 ||
    undelegatedSubmissions > 0;

  const yearsPanel = (
    <View style={styles.sectionColumn}>
      <SectionHeader
        title="Your academic years"
        description="Browse your years and their groups."
      />

      <Card style={styles.panelCard}>
        {years.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-outline"
                size={28}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No academic years yet
            </Text>

            <Text style={styles.emptyDescription}>
              Create an academic year before adding groups,
              students, sessions, or quizzes.
            </Text>

            <Button
              title="Manage years"
              variant="outline"
              onPress={() => router.push("/(app)/groups")}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          years.map((year, index) => (
            <View key={year.id}>
              <YearRow
                year={year}
                onPress={() =>
                  router.push("/(app)/groups")
                }
              />

              {index < years.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))
        )}
      </Card>
    </View>
  );

  const attentionPanel = (
    <View style={styles.sectionColumn}>
      <SectionHeader
        title="Needs your attention"
        description="Items that currently require action."
      />

      <Card style={styles.panelCard}>
        {hasAttentionItems ? (
          <>
            <AttentionItem
              count={unresolvedTickets}
              title="Unresolved tickets"
              description="Students are waiting for support or a resolution."
              actionLabel="Review tickets"
              icon="chatbubble-ellipses-outline"
              accent={colors.danger}
              onPress={() => router.push("/(app)/tickets")}
            />

            {unresolvedTickets > 0 &&
            (ungradedWritten > 0 ||
              undelegatedSubmissions > 0) ? (
              <View style={styles.divider} />
            ) : null}

            <AttentionItem
              count={ungradedWritten}
              title="Written answers"
              description="Quiz answers are waiting to be reviewed and graded."
              actionLabel="Start grading"
              icon="document-text-outline"
              accent={colors.warning}
              onPress={() => router.push("/(app)/quizzes")}
            />

            {ungradedWritten > 0 &&
            undelegatedSubmissions > 0 ? (
              <View style={styles.divider} />
            ) : null}

            <AttentionItem
              count={undelegatedSubmissions}
              title="Homework submissions"
              description="Submitted work has not yet been assigned for grading."
              actionLabel="Manage submissions"
              icon="git-branch-outline"
              accent={colors.secondary}
              onPress={() => router.push("/(app)/tasks")}
            />
          </>
        ) : (
          <View style={styles.allClearState}>
            <View style={styles.allClearIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={34}
                color={colors.secondary}
              />
            </View>

            <Text style={styles.allClearTitle}>
              You&apos;re all caught up
            </Text>

            <Text style={styles.allClearDescription}>
              There are no unresolved tickets, pending written
              answers, or homework submissions waiting for
              delegation.
            </Text>
          </View>
        )}
      </Card>
    </View>
  );

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View
        style={[
          styles.header,
          isDesktop && styles.headerDesktop,
        ]}
      >
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>DASHBOARD</Text>

          <Text style={[typography.h1, styles.pageTitle]}>
            Welcome back, {displayName}
          </Text>

          <Text style={styles.pageDescription}>
            Here is an overview of your academic structure and
            the work that needs your attention.
          </Text>
        </View>

        <Button
          title="Create quiz"
          variant="warning"
          onPress={() => router.push("/(app)/quizzes")}
          style={[
            styles.createButton,
            !isDesktop && styles.createButtonMobile,
          ]}
        />
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <View style={styles.errorHeader}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="cloud-offline-outline"
                size={23}
                color={colors.danger}
              />
            </View>

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                Dashboard unavailable
              </Text>

              <Text style={styles.errorDescription}>
                {error}
              </Text>
            </View>
          </View>

          <Button
            title="Retry"
            variant="outline"
            loading={refreshing}
            onPress={() =>
              loadDashboard({ isRetry: true })
            }
            style={styles.retryButton}
          />
        </View>
      ) : null}

      {summary ? (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              label="Academic years"
              value={summary.totalYears}
              icon="calendar-outline"
              accent={colors.primary}
              actionLabel="View years"
              onPress={() => router.push("/(app)/groups")}
            />

            <StatCard
              label="Groups"
              value={summary.totalGroups}
              icon="people-outline"
              accent={colors.secondary}
              actionLabel="View groups"
              onPress={() => router.push("/(app)/groups")}
            />

            <StatCard
              label="Open tickets"
              value={unresolvedTickets}
              icon="chatbubble-ellipses-outline"
              accent={colors.danger}
              actionLabel="Review tickets"
              onPress={() => router.push("/(app)/tickets")}
            />

            <StatCard
              label="Pending grading"
              value={ungradedWritten}
              icon="document-text-outline"
              accent={colors.warning}
              actionLabel="Review answers"
              onPress={() => router.push("/(app)/quizzes")}
            />

            <StatCard
              label="Awaiting delegation"
              value={undelegatedSubmissions}
              icon="git-branch-outline"
              accent={colors.secondary}
              description="Submitted, ungraded homework that has not been assigned to an assistant."
              actionLabel="Manage submissions"
              onPress={() => router.push("/(app)/tasks")}
            />
          </View>

          {isDesktop ? (
            <View style={styles.bodyDesktop}>
              <View style={styles.yearsColumn}>
                {yearsPanel}
              </View>

              <View style={styles.attentionColumn}>
                {attentionPanel}
              </View>
            </View>
          ) : (
            <View style={styles.bodyMobile}>
              {attentionPanel}
              {yearsPanel}
            </View>
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },

  centeredScreen: {
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },

  header: {
    marginBottom: spacing.lg,
  },

  headerDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  simpleHeader: {
    marginBottom: spacing.lg,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },

  pageTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  pageDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 23,
    maxWidth: 700,
  },

  createButton: {
    minWidth: 145,
  },

  createButtonMobile: {
    width: "100%",
    marginTop: spacing.md,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  statCardWrapper: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 210,
  },

  statCard: {
    minHeight: 145,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
  },

  statIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  statContent: {
    flex: 1,
  },

  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },

  statValue: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  statDescription: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },

  statActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
  },

  statActionText: {
    ...typography.caption,
    fontWeight: "700",
  },

  bodyDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },

  bodyMobile: {
    gap: spacing.xl,
  },

  yearsColumn: {
    flex: 1.35,
    minWidth: 0,
  },

  attentionColumn: {
    flex: 1,
    minWidth: 0,
  },

  sectionColumn: {
    width: "100%",
  },

  sectionHeader: {
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  sectionDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },

  panelCard: {
    padding: 0,
    overflow: "hidden",
  },

  yearPressable: {
    width: "100%",
  },

  yearRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  yearIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginRight: spacing.md,
  },

  yearContent: {
    flex: 1,
  },

  yearName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  yearMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },

  yearAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginLeft: spacing.sm,
  },

  yearActionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },

  attentionPressable: {
    width: "100%",
  },

  attentionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
  },

  attentionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  attentionContent: {
    flex: 1,
    minWidth: 0,
  },

  attentionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },

  attentionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },

  countBadge: {
    minWidth: 30,
    height: 26,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },

  countBadgeText: {
    ...typography.caption,
    fontWeight: "800",
  },

  attentionDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
  },

  attentionActionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },

  attentionActionText: {
    ...typography.caption,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  allClearState: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  allClearIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}16`,
    marginBottom: spacing.md,
  },

  allClearTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  allClearDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  emptyDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 390,
  },

  emptyButton: {
    marginTop: spacing.md,
  },

  errorCard: {
    borderWidth: 1,
    borderColor: `${colors.danger}45`,
    borderRadius: radius.lg,
    backgroundColor: `${colors.danger}0C`,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  errorHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  errorIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.danger}15`,
    marginRight: spacing.md,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    ...typography.bodyBold,
    color: colors.danger,
    marginBottom: 3,
  },

  errorDescription: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 21,
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
  },

  placeholderCard: {
    maxWidth: 620,
    alignItems: "center",
    padding: spacing.xl,
  },

  placeholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginBottom: spacing.md,
  },

  placeholderTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  placeholderDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },

  pressed: {
    opacity: 0.72,
  },
});
