import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";

import api from "../../src/lib/api";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

const DESKTOP_BREAKPOINT = 900;

export default function Schools() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [schools, setSchools] = useState([]);
  const [name, setName] = useState("");
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [selectedSchool, setSelectedSchool] = useState(null);

  const [nameError, setNameError] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(
    async ({ isRefresh = false } = {}) => {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      }

      try {
        const response = await api.get("/schools");
        setSchools(response.data ?? []);
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            err.response?.data?.message ||
            "Couldn't load schools."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const filteredSchools = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return schools;
    }

    return schools.filter((school) =>
      school.name?.toLowerCase().includes(search)
    );
  }, [schools, searchText]);

  function validateSchoolName() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("School name is required.");
      return false;
    }

    if (trimmedName.length < 2) {
      setNameError(
        "School name must contain at least 2 characters."
      );
      return false;
    }

    const duplicateExists = schools.some(
      (school) =>
        school.name?.trim().toLowerCase() ===
        trimmedName.toLowerCase()
    );

    if (duplicateExists) {
      setNameError(
        "A school with this name already exists."
      );
      return false;
    }

    setNameError("");
    return true;
  }

  async function handleCreate() {
    if (creating || !validateSchoolName()) {
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response = await api.post("/schools", {
        name: name.trim(),
      });

      const createdSchool =
        response.data?.school || response.data;

      setName("");

      if (createdSchool?.id) {
        setSchools((current) => [
          createdSchool,
          ...current,
        ]);
      } else {
        await load();
      }
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Couldn't create the school."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!selectedSchool || deletingId) {
      return;
    }

    const schoolId = selectedSchool.id;

    setDeletingId(schoolId);
    setError("");

    try {
      await api.delete(`/schools/${schoolId}`);

      setSchools((current) =>
        current.filter(
          (school) => school.id !== schoolId
        )
      );

      setSelectedSchool(null);
    } catch (err) {
      setSelectedSchool(null);

      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Couldn't delete this school. Schools linked to students cannot be removed."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleNameChange(value) {
    setName(value);

    if (nameError) {
      setNameError("");
    }

    if (error) {
      setError("");
    }
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <ActivityIndicator
          color={colors.primary}
          size="large"
        />

        <Text style={styles.loadingText}>
          Loading schools...
        </Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View
        style={[
          styles.header,
          isDesktop && styles.headerDesktop,
        ]}
      >
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            PLATFORM SETTINGS
          </Text>

          <Text style={[typography.h1, styles.pageTitle]}>
            Schools
          </Text>

          <Text style={styles.pageDescription}>
            Manage the schools associated with students on
            the platform.
          </Text>
        </View>

        <View style={styles.totalCard}>
          <View style={styles.totalIcon}>
            <Ionicons
              name="school-outline"
              size={23}
              color={colors.primary}
            />
          </View>

          <View>
            <Text style={styles.totalLabel}>
              Total schools
            </Text>

            <Text style={styles.totalValue}>
              {schools.length}
            </Text>
          </View>
        </View>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <View style={styles.errorContent}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={colors.danger}
              />
            </View>

            <View style={styles.errorTextContainer}>
              <Text style={styles.errorTitle}>
                Something went wrong
              </Text>

              <Text style={styles.errorDescription}>
                {error}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss error"
              onPress={() => setError("")}
              style={styles.dismissButton}
            >
              <Ionicons
                name="close"
                size={20}
                color={colors.danger}
              />
            </Pressable>
          </View>

          <Button
            title="Retry"
            variant="outline"
            loading={refreshing}
            onPress={() =>
              load({ isRefresh: true })
            }
            style={styles.retryButton}
          />
        </View>
      ) : null}

      <View
        style={[
          styles.workspace,
          isDesktop && styles.workspaceDesktop,
        ]}
      >
        <View
          style={[
            styles.createColumn,
            isDesktop && styles.createColumnDesktop,
          ]}
        >
          <Card style={styles.createCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons
                  name="add-circle-outline"
                  size={25}
                  color={colors.primary}
                />
              </View>

              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>
                  Add a school
                </Text>

                <Text style={styles.cardDescription}>
                  Enter the official school name used for
                  student records.
                </Text>
              </View>
            </View>

            <Input
              label="School name"
              value={name}
              onChangeText={handleNameChange}
              placeholder="Enter school name"
              editable={!creating}
              error={nameError}
              maxLength={120}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <View style={styles.inputMeta}>
              <Text style={styles.inputHelp}>
                Use the full official name where possible.
              </Text>

              <Text style={styles.characterCount}>
                {name.length}/120
              </Text>
            </View>

            <Button
              title="Add school"
              variant="warning"
              loading={creating}
              disabled={!name.trim()}
              onPress={handleCreate}
              style={styles.fullWidthButton}
            />
          </Card>
        </View>

        <View style={styles.listColumn}>
          <View style={styles.listToolbar}>
            <View>
              <Text style={styles.sectionTitle}>
                School directory
              </Text>

              <Text style={styles.sectionDescription}>
                {filteredSchools.length}{" "}
                {filteredSchools.length === 1
                  ? "school"
                  : "schools"}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh schools"
              disabled={refreshing}
              onPress={() =>
                load({ isRefresh: true })
              }
              style={({ pressed }) => [
                styles.refreshButton,
                pressed && styles.pressed,
                refreshing && styles.disabled,
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

              <Text style={styles.refreshText}>
                Refresh
              </Text>
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.textMuted}
            />

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search schools..."
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
              style={styles.searchInput}
            />

            {searchText ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => setSearchText("")}
                style={styles.clearSearchButton}
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={colors.textMuted}
                />
              </Pressable>
            ) : null}
          </View>

          {filteredSchools.length === 0 ? (
            <EmptyState
              hasSchools={schools.length > 0}
              onClearSearch={() => setSearchText("")}
            />
          ) : (
            <Card style={styles.listCard}>
              {filteredSchools.map((school, index) => (
                <View key={school.id}>
                  <SchoolRow
                    school={school}
                    deleting={
                      deletingId === school.id
                    }
                    onDelete={() =>
                      setSelectedSchool(school)
                    }
                  />

                  {index <
                  filteredSchools.length - 1 ? (
                    <View style={styles.divider} />
                  ) : null}
                </View>
              ))}
            </Card>
          )}
        </View>
      </View>

      <DeleteSchoolModal
        school={selectedSchool}
        deleting={Boolean(deletingId)}
        onCancel={() => {
          if (!deletingId) {
            setSelectedSchool(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </Screen>
  );
}

function SchoolRow({ school, deleting, onDelete }) {
  return (
    <View style={styles.schoolRow}>
      <View style={styles.schoolIcon}>
        <Ionicons
          name="business-outline"
          size={22}
          color={colors.primary}
        />
      </View>

      <View style={styles.schoolContent}>
        <Text
          style={styles.schoolName}
          numberOfLines={2}
        >
          {school.name}
        </Text>

        <Text style={styles.schoolMeta}>
          School record
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${school.name}`}
        disabled={deleting}
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.pressed,
          deleting && styles.disabled,
        ]}
      >
        {deleting ? (
          <ActivityIndicator
            size="small"
            color={colors.danger}
          />
        ) : (
          <>
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.danger}
            />

            <Text style={styles.deleteButtonText}>
              Delete
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

function EmptyState({ hasSchools, onClearSearch }) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={
            hasSchools
              ? "search-outline"
              : "school-outline"
          }
          size={31}
          color={colors.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {hasSchools
          ? "No matching schools"
          : "No schools added yet"}
      </Text>

      <Text style={styles.emptyDescription}>
        {hasSchools
          ? "Try changing or clearing your search."
          : "Add the first school using the form on this page."}
      </Text>

      {hasSchools ? (
        <Button
          title="Clear search"
          variant="outline"
          onPress={onClearSearch}
          style={styles.emptyButton}
        />
      ) : null}
    </Card>
  );
}

function DeleteSchoolModal({
  school,
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      visible={Boolean(school)}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackdrop}>
        <Card style={styles.modalCard}>
          <View style={styles.modalIcon}>
            <Ionicons
              name="trash-outline"
              size={28}
              color={colors.danger}
            />
          </View>

          <Text style={styles.modalTitle}>
            Delete this school?
          </Text>

          <Text style={styles.modalDescription}>
            You are about to delete{" "}
            <Text style={styles.modalSchoolName}>
              {school?.name}
            </Text>
            .
          </Text>

          <View style={styles.warningBox}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={colors.warning}
            />

            <Text style={styles.warningText}>
              This action cannot be undone. A school linked
              to student records may not be deleted.
            </Text>
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              disabled={deleting}
              onPress={onCancel}
              style={styles.modalButton}
            />

            <Button
              title="Delete school"
              variant="danger"
              loading={deleting}
              onPress={onConfirm}
              style={styles.modalButton}
            />
          </View>
        </Card>
      </View>
    </Modal>
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
    maxWidth: 680,
  },

  totalCard: {
    minWidth: 180,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.md,
    marginTop: spacing.md,
  },

  totalIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}14`,
    marginRight: spacing.md,
  },

  totalLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },

  totalValue: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  errorCard: {
    borderWidth: 1,
    borderColor: `${colors.danger}45`,
    borderRadius: radius.lg,
    backgroundColor: `${colors.danger}0D`,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  errorContent: {
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

  errorTextContainer: {
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

  dismissButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
  },

  workspace: {
    gap: spacing.xl,
  },

  workspaceDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  createColumn: {
    width: "100%",
  },

  createColumnDesktop: {
    width: 360,
  },

  listColumn: {
    flex: 1,
    minWidth: 0,
  },

  createCard: {
    padding: spacing.lg,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },

  cardHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginRight: spacing.md,
  },

  cardHeaderText: {
    flex: 1,
  },

  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  cardDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
  },

  inputMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },

  inputHelp: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },

  characterCount: {
    ...typography.caption,
    color: colors.textMuted,
  },

  fullWidthButton: {
    width: "100%",
  },

  listToolbar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  sectionDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },

  refreshButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },

  refreshText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },

  searchBox: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    marginLeft: spacing.sm,
    paddingVertical: spacing.sm,
  },

  clearSearchButton: {
    padding: spacing.xs,
  },

  listCard: {
    padding: 0,
    overflow: "hidden",
  },

  schoolRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  schoolIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginRight: spacing.md,
  },

  schoolContent: {
    flex: 1,
    minWidth: 0,
  },

  schoolName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    lineHeight: 21,
    marginBottom: 3,
  },

  schoolMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },

  deleteButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: `${colors.danger}40`,
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}0A`,
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.sm,
  },

  deleteButtonText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  emptyCard: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
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
  },

  emptyButton: {
    marginTop: spacing.md,
  },

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: spacing.lg,
  },

  modalCard: {
    width: "100%",
    maxWidth: 470,
    padding: spacing.xl,
  },

  modalIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.danger}14`,
    marginBottom: spacing.md,
  },

  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  modalDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },

  modalSchoolName: {
    color: colors.textPrimary,
    fontWeight: "700",
  },

  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.warning}40`,
    borderRadius: radius.md,
    backgroundColor: `${colors.warning}0D`,
    padding: spacing.md,
    marginTop: spacing.md,
  },

  warningText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 19,
    flex: 1,
  },

  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  modalButton: {
    flex: 1,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.55,
  },
});