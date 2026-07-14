import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/lib/api";
import { colors, spacing, typography } from "../../src/theme";

function StatCard({ label, value, accent }) {
  return (
    <Card style={[styles.statCard, { borderLeftColor: accent, borderLeftWidth: 4 }]}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[typography.h2, { color: colors.textPrimary, marginTop: 2 }]}>{value}</Text>
    </Card>
  );
}

function AttentionRow({ count, label, accent }) {
  if (!count) return null;
  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <Text style={typography.body}>
        <Text style={{ color: accent, fontWeight: "700" }}>{count}</Text> {label}
      </Text>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdminLevel = user?.role === "TEACHER" || user?.isHeadAssistant;

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await api.get("/dashboard/teacher-summary");
      setSummary(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Couldn't load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminLevel) load();
    else setLoading(false);
  }, [isAdminLevel, load]);

  if (!isAdminLevel) {
    return (
      <Screen>
        <Text style={[typography.h1, { color: colors.primary, marginBottom: spacing.md }]}>
          Welcome, {user?.name}
        </Text>
        <Card>
          <Text style={typography.body}>Your dashboard is coming in the next build pass.</Text>
        </Card>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen scroll={false} style={{ alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Text style={[typography.h1, { color: colors.primary }]}>Welcome, {user?.name}</Text>
        <Button title="+ Create quiz" variant="warning" onPress={() => router.push("/(app)/quizzes")} />
      </View>

      {error ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ color: colors.danger }}>{error}</Text>
          <Button title="Retry" variant="outline" onPress={load} style={{ marginTop: spacing.sm }} />
        </Card>
      ) : null}

      {summary ? (
        <>
          <View style={styles.statRow}>
            <StatCard label="Years" value={summary.totalYears} accent={colors.primary} />
            <StatCard label="Students" value={summary.totalStudents} accent={colors.secondary} />
            <StatCard label="Open tickets" value={summary.unresolvedTickets} accent={colors.danger} />
            <StatCard label="Ungraded" value={summary.ungradedWritten} accent={colors.warning} />
          </View>

          <View style={styles.bodyRow}>
            <View style={{ flex: 1.4, marginRight: spacing.md }}>
              <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Your years</Text>
              {summary.years.length === 0 ? (
                <Card><Text style={typography.body}>No years created yet.</Text></Card>
              ) : (
                summary.years.map((y) => (
                  <Card key={y.id} style={styles.yearRow}>
                    <View>
                      <Text style={typography.bodyBold}>{y.name}</Text>
                      <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                        {y.groupCount} groups · {y.studentCount} students
                      </Text>
                    </View>
                    <Text style={{ color: colors.primary, fontWeight: "600" }}>View →</Text>
                  </Card>
                ))
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Needs your attention</Text>
              <AttentionRow count={summary.unresolvedTickets} label="tickets unresolved" accent={colors.danger} />
              <AttentionRow count={summary.ungradedWritten} label="written quiz answers awaiting grading" accent={colors.warning} />
              <AttentionRow count={summary.undelegatedSubmissions} label="homework submissions not yet delegated" accent={colors.secondary} />
              {!summary.unresolvedTickets && !summary.ungradedWritten && !summary.undelegatedSubmissions ? (
                <Card><Text style={typography.body}>Nothing needs attention right now.</Text></Card>
              ) : null}
            </View>
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: { flexGrow: 1, flexBasis: 140, paddingVertical: spacing.sm },
  bodyRow: { flexDirection: "row", flexWrap: "wrap" },
  yearRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
});
