import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import api from "../../src/lib/api";
import { formatEgyptDateTime } from "../../src/utils/egyptTime";
import { colors, radius, spacing, typography } from "../../src/theme";

const FILTERS = [
  { value: "all", label: "All activity" },
  { value: "errors", label: "Errors only" },
  { value: "success", label: "Successful only" },
];

function getErrorMessage(error) {
  return (
    error?.response?.data?.msg ||
    error?.message ||
    "Couldn't load student activity."
  );
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return "Unknown size";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudentActivity() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [outcome, setOutcome] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/student-activity", {
        params: {
          page,
          limit: 50,
          outcome,
          ...(search ? { search } : {}),
        },
      });

      setLogs(Array.isArray(response.data?.logs) ? response.data.logs : []);
      setPagination(
        response.data?.pagination || { page, total: 0, totalPages: 1 },
      );
    } catch (requestError) {
      setLogs([]);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [outcome, search]);

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>SYSTEM MONITORING</Text>
            <Text style={styles.title}>Student activity logs</Text>
            <Text style={styles.subtitle}>
              Review student requests, uploads, successful actions, and errors reported by the backend.
            </Text>
          </View>

          <Button
            title="Refresh"
            variant="outline"
            onPress={() => loadLogs(pagination.page)}
            loading={loading}
          />
        </View>

        <Card style={styles.filtersCard}>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={20} color={colors.textMuted} />
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={() => setSearch(searchInput.trim())}
              placeholder="Search student, email, action, path, or error"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              returnKeyType="search"
            />
            <Button
              title="Search"
              onPress={() => setSearch(searchInput.trim())}
            />
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map((filter) => {
              const selected = outcome === filter.value;

              return (
                <Pressable
                  key={filter.value}
                  onPress={() => setOutcome(filter.value)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Recent activity</Text>
          <Text style={styles.resultsCount}>{pagination.total || 0} records</Text>
        </View>

        {loading ? (
          <Card style={styles.stateCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateText}>Loading activity…</Text>
          </Card>
        ) : logs.length === 0 ? (
          <Card style={styles.stateCard}>
            <Ionicons name="document-text-outline" size={34} color={colors.textMuted} />
            <Text style={styles.stateTitle}>No matching activity</Text>
            <Text style={styles.stateText}>New student requests will appear here after the backend update is deployed.</Text>
          </Card>
        ) : (
          <View style={styles.logList}>
            {logs.map((log) => {
              const files = Array.isArray(log.metadata?.files) ? log.metadata.files : [];

              return (
                <Card key={log.id} style={styles.logCard}>
                  <View style={styles.logTopRow}>
                    <View style={[styles.statusIcon, log.successful ? styles.successIcon : styles.failureIcon]}>
                      <Ionicons
                        name={log.successful ? "checkmark" : "alert"}
                        size={18}
                        color={log.successful ? colors.primary : colors.danger}
                      />
                    </View>

                    <View style={styles.logMain}>
                      <Text style={styles.action}>{log.action}</Text>
                      <Text style={styles.student}>{log.userName} · {log.userEmail}</Text>
                    </View>

                    <View style={[styles.statusBadge, log.successful ? styles.successBadge : styles.failureBadge]}>
                      <Text style={[styles.statusText, !log.successful && styles.failureText]}>
                        {log.statusCode}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detail}>{log.method} {log.path}</Text>
                    <Text style={styles.detail}>{log.durationMs} ms</Text>
                    <Text style={styles.detail}>{formatEgyptDateTime(log.createdAt)} · Egypt time</Text>
                  </View>

                  {log.errorMessage ? (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorBoxText}>{log.errorMessage}</Text>
                    </View>
                  ) : null}

                  {files.length ? (
                    <View style={styles.filesBox}>
                      <Text style={styles.filesTitle}>Uploaded files</Text>
                      {files.map((file, index) => (
                        <Text key={`${file.name}-${index}`} style={styles.fileText}>
                          {file.name} · {formatBytes(file.size)} · {file.contentType || "Unknown type"}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </View>
        )}

        <View style={styles.pagination}>
          <Button
            title="Previous"
            variant="outline"
            disabled={loading || pagination.page <= 1}
            onPress={() => loadLogs(pagination.page - 1)}
          />
          <Text style={styles.pageText}>Page {pagination.page} of {pagination.totalPages}</Text>
          <Button
            title="Next"
            variant="outline"
            disabled={loading || pagination.page >= pagination.totalPages}
            onPress={() => loadLogs(pagination.page + 1)}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", maxWidth: 1180, alignSelf: "center", paddingBottom: spacing.xl },
  header: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md, marginBottom: spacing.lg },
  headerCopy: { flex: 1, minWidth: 260 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.3, color: colors.warning, marginBottom: 6 },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, maxWidth: 720, lineHeight: 22 },
  filtersCard: { gap: spacing.md, marginBottom: spacing.md },
  searchRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingLeft: spacing.sm, padding: 5 },
  searchInput: { flex: 1, minWidth: 210, minHeight: 42, color: colors.textPrimary, fontSize: 14 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  filterChip: { paddingVertical: 9, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  filterChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  filterTextSelected: { color: colors.white },
  pressed: { opacity: 0.75 },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: `${colors.danger}12`, marginBottom: spacing.md },
  errorText: { flex: 1, color: colors.danger },
  resultsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  resultsTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  resultsCount: { fontSize: 13, color: colors.textMuted },
  stateCard: { minHeight: 220, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  stateTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  stateText: { color: colors.textMuted, textAlign: "center" },
  logList: { gap: spacing.sm },
  logCard: { gap: spacing.sm },
  logTopRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  statusIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  successIcon: { backgroundColor: `${colors.secondary}25` },
  failureIcon: { backgroundColor: `${colors.danger}15` },
  logMain: { flex: 1, minWidth: 0 },
  action: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  student: { marginTop: 3, fontSize: 13, color: colors.textMuted },
  statusBadge: { minWidth: 48, paddingVertical: 6, paddingHorizontal: 9, borderRadius: radius.pill, alignItems: "center" },
  successBadge: { backgroundColor: `${colors.secondary}25` },
  failureBadge: { backgroundColor: `${colors.danger}15` },
  statusText: { fontWeight: "900", color: colors.primary },
  failureText: { color: colors.danger },
  detailsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, paddingLeft: 50 },
  detail: { fontSize: 12, color: colors.textMuted },
  errorBox: { marginLeft: 50, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: `${colors.danger}10` },
  errorBoxText: { fontSize: 13, color: colors.danger },
  filesBox: { marginLeft: 50, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.background },
  filesTitle: { fontSize: 12, fontWeight: "800", color: colors.textPrimary, marginBottom: 4 },
  fileText: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  pagination: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: spacing.md, marginTop: spacing.lg },
  pageText: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
});

