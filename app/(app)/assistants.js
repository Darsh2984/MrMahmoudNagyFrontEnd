import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { Badge } from "../../src/components/ui/Badge";

import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/lib/api";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

const PERMISSIONS = [
  {
    key: "canGradeHomework",
    label: "Grade homework",
    icon: "document-text-outline",
  },
  {
    key: "canGradeLiveQuestions",
    label: "Grade live questions",
    icon: "chatbubble-ellipses-outline",
  },
  {
    key: "canManageTickets",
    label: "Manage tickets",
    icon: "ticket-outline",
  },
  {
    key: "canUploadResources",
    label: "Upload resources",
    icon: "cloud-upload-outline",
  },
  {
    key: "canManageQuizzes",
    label: "Manage quizzes",
    icon: "help-circle-outline",
  },
  {
    key: "canManageSessions",
    label: "Manage sessions",
    icon: "calendar-outline",
  },
  {
    key: "canViewPerformance",
    label: "View performance",
    icon: "analytics-outline",
  },
  {
    key: "canManageTasks",
    label: "Manage tasks",
    icon: "clipboard-outline",
  },
];

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    fallback
  );
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "A";
}

function countPermissions(assistant) {
  return PERMISSIONS.reduce((total, permission) => {
    return total + (assistant.permissions?.[permission.key] ? 1 : 0);
  }, 0);
}

export default function Assistants() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const isTeacher = user?.role === "TEACHER";
  const isDesktop = width >= 980;
  const isSmallScreen = width < 640;

  const [assistants, setAssistants] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [managedByHeadId, setManagedByHeadId] =
    useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [creatingAssistant, setCreatingAssistant] =
    useState(false);

  const [updatingAssistantId, setUpdatingAssistantId] =
    useState(null);

  const [updatingPermissionKey, setUpdatingPermissionKey] =
    useState(null);

  const [deletingAssistantId, setDeletingAssistantId] =
    useState(null);

  const [createModalVisible, setCreateModalVisible] =
    useState(false);

  const [permissionsModalAssistant, setPermissionsModalAssistant] =
    useState(null);

  const [roleChangeTarget, setRoleChangeTarget] =
    useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const heads = useMemo(() => {
    return assistants.filter(
      (assistant) => assistant.isHeadAssistant,
    );
  }, [assistants]);

  const standardAssistants = useMemo(() => {
    return assistants.filter(
      (assistant) => !assistant.isHeadAssistant,
    );
  }, [assistants]);

  const filteredAssistants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assistants.filter((assistant) => {
      const matchesSearch =
        !query ||
        assistant.name?.toLowerCase().includes(query) ||
        assistant.email?.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "ALL" ||
        (roleFilter === "HEAD" &&
          assistant.isHeadAssistant) ||
        (roleFilter === "ASSISTANT" &&
          !assistant.isHeadAssistant);

      return matchesSearch && matchesRole;
    });
  }, [assistants, search, roleFilter]);

  const totalEnabledPermissions = useMemo(() => {
    return standardAssistants.reduce(
      (total, assistant) =>
        total + countPermissions(assistant),
      0,
    );
  }, [standardAssistants]);

  const loadAssistants = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/auth/assistants");

      setAssistants(
        Array.isArray(response.data) ? response.data : [],
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't load assistants.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssistants();
  }, [loadAssistants]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setForm({
      name: "",
      email: "",
      password: "",
    });

    setManagedByHeadId(null);
    setShowPassword(false);
  }

  function openCreateModal() {
    if (!isTeacher) return;

    clearMessages();
    resetForm();
    setCreateModalVisible(true);
  }

  function closeCreateModal() {
    if (creatingAssistant) return;

    setCreateModalVisible(false);
    resetForm();
  }

  function validateForm() {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name) {
      return "Assistant name is required.";
    }

    if (!email) {
      return "Assistant email is required.";
    }

    if (!email.includes("@")) {
      return "Enter a valid email address.";
    }

    if (!password) {
      return "A temporary password is required.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    return "";
  }

  async function handleCreate() {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setCreatingAssistant(true);
    setError("");

    try {
      await api.post("/auth/create-assistant", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        managedByHeadId: managedByHeadId || null,
      });

      setCreateModalVisible(false);
      resetForm();

      setSuccess("Assistant account created successfully.");

      await loadAssistants();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't create the assistant.",
        ),
      );
    } finally {
      setCreatingAssistant(false);
    }
  }

  async function handlePromote(assistant) {
    setUpdatingAssistantId(assistant.id);
    setError("");

    try {
      await api.post(
        `/auth/promote-head/${assistant.id}`,
      );

      setRoleChangeTarget(null);
      setSuccess(
        `${assistant.name} was promoted to Head Assistant.`,
      );

      await loadAssistants();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't promote the assistant.",
        ),
      );
    } finally {
      setUpdatingAssistantId(null);
    }
  }

  async function handleDemote(assistant) {
    setUpdatingAssistantId(assistant.id);
    setError("");

    try {
      await api.post(
        `/auth/demote-head/${assistant.id}`,
        {},
      );

      setRoleChangeTarget(null);
      setSuccess(
        `${assistant.name} was changed to a standard assistant.`,
      );

      await loadAssistants();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't demote the assistant.",
        ),
      );
    } finally {
      setUpdatingAssistantId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeletingAssistantId(deleteTarget.id);
    setError("");

    try {
      await api.delete(
        `/auth/assistants/${deleteTarget.id}`,
      );

      const deletedName = deleteTarget.name;

      setDeleteTarget(null);
      setSuccess(`${deletedName} was deleted.`);

      await loadAssistants();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't delete the assistant.",
        ),
      );
    } finally {
      setDeletingAssistantId(null);
    }
  }

  async function togglePermission(assistant, permissionKey) {
    if (!isTeacher || assistant.isHeadAssistant) return;

    const updateKey = `${assistant.id}:${permissionKey}`;

    const updatedPermissions = {
      ...(assistant.permissions || {}),
      [permissionKey]:
        !assistant.permissions?.[permissionKey],
    };

    setUpdatingPermissionKey(updateKey);
    setError("");

    try {
      await api.patch(
        `/auth/assistants/${assistant.id}/permissions`,
        {
          permissions: updatedPermissions,
        },
      );

      setAssistants((currentAssistants) =>
        currentAssistants.map((currentAssistant) =>
          currentAssistant.id === assistant.id
            ? {
                ...currentAssistant,
                permissions: updatedPermissions,
              }
            : currentAssistant,
        ),
      );

      setPermissionsModalAssistant(
        (currentAssistant) =>
          currentAssistant?.id === assistant.id
            ? {
                ...currentAssistant,
                permissions: updatedPermissions,
              }
            : currentAssistant,
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't update the permission.",
        ),
      );
    } finally {
      setUpdatingPermissionKey(null);
    }
  }

  function openRoleChange(assistant) {
    clearMessages();

    setRoleChangeTarget({
      assistant,
      action: assistant.isHeadAssistant
        ? "DEMOTE"
        : "PROMOTE",
    });
  }

  function renderAssistantCard(assistant) {
    const permissionCount = countPermissions(assistant);
    const assignedGroups = Array.isArray(assistant.groupAssignments)
      ? assistant.groupAssignments
          .map((assignment) => assignment?.group)
          .filter(Boolean)
          .sort((first, second) => {
            const yearComparison = String(first.year?.name || "")
              .localeCompare(String(second.year?.name || ""));

            return yearComparison || String(first.name || "")
              .localeCompare(String(second.name || ""));
          })
      : [];
    const managedByHead =
      assistant.managedByHead ||
      heads.find(
        (head) => head.id === assistant.managedByHeadId,
      );

    return (
      <Card
        key={assistant.id}
        style={styles.assistantCard}
      >
        <View
          style={[
            styles.assistantHeader,
            isSmallScreen && styles.assistantHeaderSmall,
          ]}
        >
          <View style={styles.assistantIdentity}>
            <View
              style={[
                styles.avatar,
                assistant.isHeadAssistant &&
                  styles.headAvatar,
              ]}
            >
              <Text style={styles.avatarText}>
                {getInitial(assistant.name)}
              </Text>
            </View>

            <View style={styles.assistantCopy}>
              <View style={styles.nameRow}>
                <Text
                  numberOfLines={1}
                  style={styles.assistantName}
                >
                  {assistant.name}
                </Text>

                {assistant.isHeadAssistant ? (
                  <Badge label="HEAD" tone="info" />
                ) : (
                  <Badge
                    label="ASSISTANT"
                    tone="neutral"
                  />
                )}
              </View>

              <View style={styles.emailRow}>
                <Ionicons
                  name="mail-outline"
                  size={14}
                  color={colors.textMuted}
                />

                <Text
                  numberOfLines={1}
                  style={styles.assistantEmail}
                >
                  {assistant.email}
                </Text>
              </View>
            </View>
          </View>

          {isTeacher ? (
            <View style={styles.cardActions}>
              <Pressable
                accessibilityLabel="Change assistant role"
                onPress={() => openRoleChange(assistant)}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={
                    assistant.isHeadAssistant
                      ? "arrow-down-circle-outline"
                      : "arrow-up-circle-outline"
                  }
                  size={19}
                  color={colors.primary}
                />
              </Pressable>

              <Pressable
                accessibilityLabel="Delete assistant"
                onPress={() => setDeleteTarget(assistant)}
                style={({ pressed }) => [
                  styles.deleteIconButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.danger}
                />
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={colors.primary}
              />
            </View>

            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>
                Permission access
              </Text>

              <Text style={styles.detailValue}>
                {assistant.isHeadAssistant
                  ? "All permissions"
                  : `${permissionCount} of ${PERMISSIONS.length}`}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="git-network-outline"
                size={18}
                color={colors.primary}
              />
            </View>

            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>
                Reports to
              </Text>

              <Text style={styles.detailValue}>
                {assistant.isHeadAssistant
                  ? "Teacher"
                  : managedByHead?.name ||
                    "Teacher directly"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.assignedGroupsSection}>
          <View style={styles.assignedGroupsHeader}>
            <View style={styles.assignedGroupsTitleRow}>
              <Ionicons
                name="people-outline"
                size={17}
                color={colors.primary}
              />
              <Text style={styles.assignedGroupsTitle}>
                Assigned groups
              </Text>
            </View>

            <Text style={styles.assignedGroupsCount}>
              {assignedGroups.length}
            </Text>
          </View>

          {assignedGroups.length ? (
            <View style={styles.assignedGroupList}>
              {assignedGroups.map((group) => (
                <View key={group.id} style={styles.assignedGroupBadge}>
                  <Text numberOfLines={1} style={styles.assignedGroupName}>
                    {group.name || "Unnamed group"}
                  </Text>
                  <Text numberOfLines={1} style={styles.assignedGroupYear}>
                    {group.year?.name || "Academic year unavailable"}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noAssignedGroupsText}>
              This assistant is not currently assigned to any groups.
            </Text>
          )}
        </View>

        {assistant.isHeadAssistant ? (
          <View style={styles.headNotice}>
            <Ionicons
              name="star-outline"
              size={20}
              color={colors.primary}
            />

            <View style={styles.headNoticeCopy}>
              <Text style={styles.headNoticeTitle}>
                Head Assistant access
              </Text>

              <Text style={styles.headNoticeText}>
                Head Assistants automatically receive every
                available permission.
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.permissionPreviewHeader}>
              <View>
                <Text style={styles.permissionPreviewTitle}>
                  Permissions
                </Text>

                <Text style={styles.permissionPreviewSubtitle}>
                  {permissionCount} enabled
                </Text>
              </View>

              {isTeacher ? (
                <Pressable
                  onPress={() =>
                    setPermissionsModalAssistant(assistant)
                  }
                  style={({ pressed }) => [
                    styles.managePermissionsButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.managePermissionsText}>
                    Manage
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color={colors.primary}
                  />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.permissionPreview}>
              {PERMISSIONS.map((permission) => {
                const enabled = Boolean(
                  assistant.permissions?.[permission.key],
                );

                return (
                  <View
                    key={permission.key}
                    style={[
                      styles.permissionBadge,
                      enabled &&
                        styles.permissionBadgeEnabled,
                    ]}
                  >
                    <Ionicons
                      name={
                        enabled
                          ? "checkmark-circle"
                          : "close-circle-outline"
                      }
                      size={15}
                      color={
                        enabled
                          ? colors.white
                          : colors.textMuted
                      }
                    />

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.permissionBadgeText,
                        enabled &&
                          styles.permissionBadgeTextEnabled,
                      ]}
                    >
                      {permission.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </Card>
    );
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={styles.fullPageLoading}
      >
        <ActivityIndicator
          color={colors.primary}
          size="large"
        />

        <Text style={styles.loadingText}>
          Loading assistants…
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowIcon}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.eyebrow}>
                TEAM MANAGEMENT
              </Text>
            </View>

            <Text style={styles.pageTitle}>
              Assistants
            </Text>

            <Text style={styles.pageSubtitle}>
              Manage assistant accounts, assign access
              permissions, and configure Head Assistant
              responsibilities.
            </Text>
          </View>

          {isTeacher ? (
            <Button
              title="New assistant"
              variant="warning"
              onPress={openCreateModal}
            />
          ) : null}
        </View>

        {error ? (
          <View style={[styles.alert, styles.errorAlert]}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              accessibilityLabel="Dismiss error"
              onPress={() => setError("")}
              style={styles.alertClose}
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.danger}
              />
            </Pressable>
          </View>
        ) : null}

        {success ? (
          <View
            style={[styles.alert, styles.successAlert]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.primary}
            />

            <Text style={styles.successText}>
              {success}
            </Text>

            <Pressable
              accessibilityLabel="Dismiss success message"
              onPress={() => setSuccess("")}
              style={styles.alertClose}
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.primary}
              />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="people-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {assistants.length}
            </Text>

            <Text style={styles.statLabel}>
              Total assistants
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="star-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {heads.length}
            </Text>

            <Text style={styles.statLabel}>
              Head Assistants
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="person-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {standardAssistants.length}
            </Text>

            <Text style={styles.statLabel}>
              Standard assistants
            </Text>
          </Card>

        </View>

        <Card style={styles.filterCard}>
          <View
            style={[
              styles.filterLayout,
              isSmallScreen && styles.filterLayoutSmall,
            ]}
          >
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textMuted}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search by name or email"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />

              {search ? (
                <Pressable
                  accessibilityLabel="Clear search"
                  onPress={() => setSearch("")}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            >
              {[
                ["ALL", "All"],
                ["HEAD", "Head Assistants"],
                ["ASSISTANT", "Assistants"],
              ].map(([value, label]) => {
                const active = roleFilter === value;

                return (
                  <Pressable
                    key={value}
                    onPress={() => setRoleFilter(value)}
                    style={({ pressed }) => [
                      styles.filterChip,
                      active &&
                        styles.filterChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        active &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Team members
            </Text>

            <Text style={styles.sectionSubtitle}>
              {filteredAssistants.length}{" "}
              {filteredAssistants.length === 1
                ? "assistant"
                : "assistants"}
            </Text>
          </View>
        </View>

        {!filteredAssistants.length ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="people-outline"
                size={36}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {assistants.length
                ? "No assistants found"
                : "No assistants yet"}
            </Text>

            <Text style={styles.emptyDescription}>
              {assistants.length
                ? "Adjust the search or role filter."
                : "Create the first assistant account to begin building your teaching team."}
            </Text>

            {isTeacher && !assistants.length ? (
              <Button
                title="Create assistant"
                variant="warning"
                onPress={openCreateModal}
              />
            ) : null}
          </Card>
        ) : (
          <View
            style={[
              styles.assistantGrid,
              isDesktop && styles.assistantGridDesktop,
            ]}
          >
            {filteredAssistants.map(
              renderAssistantCard,
            )}
          </View>
        )}
      </View>

      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCreateModal}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeCreateModal}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons
                  name="person-add-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View style={styles.modalHeadingCopy}>
                <Text style={styles.modalTitle}>
                  Create assistant
                </Text>

                <Text style={styles.mutedText}>
                  Create an assistant account and optionally
                  assign it to a Head Assistant.
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Close"
                disabled={creatingAssistant}
                onPress={closeCreateModal}
                style={({ pressed }) => [
                  styles.modalClose,
                  creatingAssistant &&
                    styles.disabled,
                  pressed &&
                    !creatingAssistant &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.textPrimary}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              <Text style={styles.inputLabel}>
                Full name
              </Text>

              <TextInput
                autoFocus
                value={form.name}
                onChangeText={(value) =>
                  setForm((current) => ({
                    ...current,
                    name: value,
                  }))
                }
                placeholder="Enter assistant name"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Email address
              </Text>

              <TextInput
                value={form.email}
                onChangeText={(value) =>
                  setForm((current) => ({
                    ...current,
                    email: value,
                  }))
                }
                placeholder="assistant@example.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Temporary password
              </Text>

              <View style={styles.passwordInput}>
                <TextInput
                  value={form.password}
                  onChangeText={(value) =>
                    setForm((current) => ({
                      ...current,
                      password: value,
                    }))
                  }
                  placeholder="Enter temporary password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={styles.passwordTextInput}
                />

                <Pressable
                  accessibilityLabel={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onPress={() =>
                    setShowPassword((current) => !current)
                  }
                  style={styles.passwordButton}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>

              <View style={styles.formSectionHeader}>
                <View>
                  <Text style={styles.inputLabel}>
                    Reports to
                  </Text>

                  <Text style={styles.fieldHint}>
                    Optional Head Assistant assignment
                  </Text>
                </View>

                {managedByHeadId ? (
                  <Pressable
                    onPress={() =>
                      setManagedByHeadId(null)
                    }
                  >
                    <Text style={styles.inlineAction}>
                      Clear
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {!heads.length ? (
                <View style={styles.noHeadsBox}>
                  <Ionicons
                    name="information-circle-outline"
                    size={21}
                    color={colors.primary}
                  />

                  <Text style={styles.noHeadsText}>
                    No Head Assistants exist. This assistant
                    will report directly to the teacher.
                  </Text>
                </View>
              ) : (
                <View style={styles.headList}>
                  <Pressable
                    onPress={() =>
                      setManagedByHeadId(null)
                    }
                    style={({ pressed }) => [
                      styles.headOption,
                      !managedByHeadId &&
                        styles.headOptionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.headAvatar}>
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color={
                          !managedByHeadId
                            ? colors.white
                            : colors.primary
                        }
                      />
                    </View>

                    <View style={styles.headOptionCopy}>
                      <Text
                        style={[
                          styles.headOptionName,
                          !managedByHeadId &&
                            styles.headOptionNameSelected,
                        ]}
                      >
                        Teacher directly
                      </Text>

                      <Text
                        style={[
                          styles.headOptionMeta,
                          !managedByHeadId &&
                            styles.headOptionMetaSelected,
                        ]}
                      >
                        No Head Assistant
                      </Text>
                    </View>

                    {!managedByHeadId ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.white}
                      />
                    ) : null}
                  </Pressable>

                  {heads.map((head) => {
                    const selected =
                      managedByHeadId === head.id;

                    return (
                      <Pressable
                        key={head.id}
                        onPress={() =>
                          setManagedByHeadId(head.id)
                        }
                        style={({ pressed }) => [
                          styles.headOption,
                          selected &&
                            styles.headOptionSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View
                          style={[
                            styles.headAvatar,
                            selected &&
                              styles.headAvatarSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.headAvatarText,
                              selected &&
                                styles.headAvatarTextSelected,
                            ]}
                          >
                            {getInitial(head.name)}
                          </Text>
                        </View>

                        <View style={styles.headOptionCopy}>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.headOptionName,
                              selected &&
                                styles.headOptionNameSelected,
                            ]}
                          >
                            {head.name}
                          </Text>

                          <Text
                            style={[
                              styles.headOptionMeta,
                              selected &&
                                styles.headOptionMetaSelected,
                            ]}
                          >
                            Head Assistant
                          </Text>
                        </View>

                        {selected ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.white}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={closeCreateModal}
                disabled={creatingAssistant}
              />

              <Button
                title="Create assistant"
                variant="warning"
                onPress={handleCreate}
                loading={creatingAssistant}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(permissionsModalAssistant)}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setPermissionsModalAssistant(null)
        }
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() =>
              setPermissionsModalAssistant(null)
            }
          />

          <View
            style={[
              styles.modalCard,
              styles.permissionsModal,
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View style={styles.modalHeadingCopy}>
                <Text style={styles.modalTitle}>
                  Manage permissions
                </Text>

                <Text style={styles.mutedText}>
                  Configure access for{" "}
                  {permissionsModalAssistant?.name}.
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Close"
                onPress={() =>
                  setPermissionsModalAssistant(null)
                }
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.textPrimary}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.permissionList}
              contentContainerStyle={
                styles.permissionListContent
              }
              nestedScrollEnabled
            >
              {PERMISSIONS.map((permission) => {
                const enabled = Boolean(
                  permissionsModalAssistant?.permissions?.[
                    permission.key
                  ],
                );

                const loadingKey = `${
                  permissionsModalAssistant?.id
                }:${permission.key}`;

                const permissionLoading =
                  updatingPermissionKey === loadingKey;

                return (
                  <Pressable
                    key={permission.key}
                    disabled={permissionLoading}
                    onPress={() =>
                      togglePermission(
                        permissionsModalAssistant,
                        permission.key,
                      )
                    }
                    style={({ pressed }) => [
                      styles.permissionRow,
                      enabled &&
                        styles.permissionRowEnabled,
                      pressed &&
                        !permissionLoading &&
                        styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.permissionIcon,
                        enabled &&
                          styles.permissionIconEnabled,
                      ]}
                    >
                      <Ionicons
                        name={permission.icon}
                        size={21}
                        color={
                          enabled
                            ? colors.white
                            : colors.primary
                        }
                      />
                    </View>

                    <View style={styles.permissionRowCopy}>
                      <Text
                        style={styles.permissionRowTitle}
                      >
                        {permission.label}
                      </Text>

                      <Text
                        style={styles.permissionRowSubtitle}
                      >
                        {enabled
                          ? "Permission enabled"
                          : "Permission disabled"}
                      </Text>
                    </View>

                    {permissionLoading ? (
                      <ActivityIndicator
                        color={colors.primary}
                        size="small"
                      />
                    ) : (
                      <View
                        style={[
                          styles.switchTrack,
                          enabled &&
                            styles.switchTrackEnabled,
                        ]}
                      >
                        <View
                          style={[
                            styles.switchThumb,
                            enabled &&
                              styles.switchThumbEnabled,
                          ]}
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Done"
                variant="secondary"
                onPress={() =>
                  setPermissionsModalAssistant(null)
                }
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(roleChangeTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!updatingAssistantId) {
            setRoleChangeTarget(null);
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (!updatingAssistantId) {
                setRoleChangeTarget(null);
              }
            }}
          />

          <View style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <Ionicons
                name={
                  roleChangeTarget?.action === "PROMOTE"
                    ? "arrow-up-circle-outline"
                    : "arrow-down-circle-outline"
                }
                size={30}
                color={colors.primary}
              />
            </View>

            <Text style={styles.confirmTitle}>
              {roleChangeTarget?.action === "PROMOTE"
                ? "Promote to Head Assistant?"
                : "Demote Head Assistant?"}
            </Text>

            <Text style={styles.confirmText}>
              {roleChangeTarget?.action === "PROMOTE"
                ? `${roleChangeTarget?.assistant?.name} will receive all assistant permissions automatically.`
                : `${roleChangeTarget?.assistant?.name} will return to standard assistant access.`}
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() =>
                  setRoleChangeTarget(null)
                }
                disabled={Boolean(
                  updatingAssistantId,
                )}
              />

              <Button
                title={
                  roleChangeTarget?.action === "PROMOTE"
                    ? "Promote"
                    : "Demote"
                }
                variant="warning"
                onPress={() => {
                  if (
                    roleChangeTarget?.action === "PROMOTE"
                  ) {
                    handlePromote(
                      roleChangeTarget.assistant,
                    );
                  } else {
                    handleDemote(
                      roleChangeTarget.assistant,
                    );
                  }
                }}
                loading={Boolean(
                  updatingAssistantId,
                )}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(deleteTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deletingAssistantId) {
            setDeleteTarget(null);
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (!deletingAssistantId) {
                setDeleteTarget(null);
              }
            }}
          />

          <View style={styles.confirmCard}>
            <View style={styles.deleteConfirmIcon}>
              <Ionicons
                name="person-remove-outline"
                size={30}
                color={colors.danger}
              />
            </View>

            <Text style={styles.confirmTitle}>
              Delete assistant?
            </Text>

            <Text style={styles.confirmText}>
              {deleteTarget?.name}'s account and access will
              be removed. This action may not be reversible.
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setDeleteTarget(null)}
                disabled={Boolean(
                  deletingAssistantId,
                )}
              />

              <Button
                title="Delete assistant"
                variant="danger"
                onPress={handleDelete}
                loading={Boolean(
                  deletingAssistantId,
                )}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 1320,
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },

  fullPageLoading: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },

  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },

  headerCopy: {
    flex: 1,
    minWidth: 260,
    maxWidth: 760,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },

  eyebrowIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}35`,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.primary,
  },

  pageTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  pageSubtitle: {
    ...typography.body,
    maxWidth: 700,
    color: colors.textMuted,
    lineHeight: 23,
  },

  alert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
  },

  errorAlert: {
    borderColor: `${colors.danger}55`,
    backgroundColor: `${colors.danger}12`,
  },

  successAlert: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}20`,
  },

  errorText: {
    flex: 1,
    ...typography.body,
    color: colors.danger,
  },

  successText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },

  alertClose: {
    padding: 4,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  statCard: {
    flex: 1,
    minWidth: 180,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: `${colors.secondary}25`,
  },

  statValue: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  filterCard: {
    marginBottom: spacing.lg,
  },

  filterLayout: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  filterLayoutSmall: {
    alignItems: "stretch",
    flexDirection: "column",
  },

  searchBox: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  searchInput: {
    flex: 1,
    minHeight: 46,
    color: colors.textPrimary,
    fontSize: 14,
  },

  filterList: {
    flexDirection: "row",
    gap: spacing.xs,
  },

  filterChip: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.white,
  },

  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  filterChipTextActive: {
    color: colors.white,
  },

  sectionHeader: {
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  assistantGrid: {
    gap: spacing.md,
  },

  assistantGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  assistantCard: {
    flexGrow: 1,
    flexBasis: 460,
    minWidth: 0,
    gap: spacing.md,
  },

  assistantHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  assistantHeaderSmall: {
    flexDirection: "column",
  },

  assistantIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  headAvatar: {
    backgroundColor: colors.secondary,
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.white,
  },

  assistantCopy: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 5,
  },

  assistantName: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  assistantEmail: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
  },

  cardActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  deleteIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.danger}12`,
  },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  detailItem: {
    flex: 1,
    minWidth: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  detailCopy: {
    flex: 1,
  },

  detailLabel: {
    marginBottom: 3,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.textMuted,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  assignedGroupsSection: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  assignedGroupsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  assignedGroupsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  assignedGroupsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  assignedGroupsCount: {
    minWidth: 26,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    overflow: "hidden",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    backgroundColor: `${colors.secondary}25`,
  },

  assignedGroupList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },

  assignedGroupBadge: {
    minWidth: 135,
    maxWidth: 220,
    flexGrow: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.secondary}45`,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  assignedGroupName: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  assignedGroupYear: {
    marginTop: 2,
    fontSize: 10,
    color: colors.textMuted,
  },

  noAssignedGroupsText: {
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
  },

  headNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: `${colors.secondary}18`,
  },

  headNoticeCopy: {
    flex: 1,
  },

  headNoticeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  headNoticeText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
  },

  permissionPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  permissionPreviewTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  permissionPreviewSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },

  managePermissionsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: spacing.xs,
  },

  managePermissionsText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  permissionPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },

  permissionBadge: {
    maxWidth: 190,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
  },

  permissionBadgeEnabled: {
    backgroundColor: colors.secondary,
  },

  permissionBadgeText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },

  permissionBadgeTextEnabled: {
    color: colors.white,
  },

  emptyCard: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: `${colors.secondary}22`,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  emptyDescription: {
    ...typography.body,
    maxWidth: 440,
    color: colors.textMuted,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(20,28,30,0.54)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "92%",
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,

    ...Platform.select({
      web: {
        boxShadow:
          "0 18px 50px rgba(0,0,0,0.18)",
      },

      default: {
        elevation: 8,
      },
    }),
  },

  permissionsModal: {
    maxWidth: 680,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  modalHeadingCopy: {
    flex: 1,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },

  mutedText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  formContent: {
    paddingBottom: spacing.sm,
  },

  inputLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  input: {
    width: "100%",
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 14,
  },

  passwordInput: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  passwordTextInput: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
  },

  passwordButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  formSectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  fieldHint: {
    fontSize: 11,
    color: colors.textMuted,
  },

  inlineAction: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  noHeadsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: `${colors.secondary}16`,
  },

  noHeadsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },

  headList: {
    gap: spacing.sm,
  },

  headOption: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },

  headOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  headAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  headAvatarSelected: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  headAvatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },

  headAvatarTextSelected: {
    color: colors.white,
  },

  headOptionCopy: {
    flex: 1,
    minWidth: 0,
  },

  headOptionName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  headOptionNameSelected: {
    color: colors.white,
  },

  headOptionMeta: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  headOptionMetaSelected: {
    color: "#C9D6D3",
  },

  permissionList: {
    maxHeight: 520,
  },

  permissionListContent: {
    gap: spacing.sm,
  },

  permissionRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },

  permissionRowEnabled: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}12`,
  },

  permissionIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  permissionIconEnabled: {
    backgroundColor: colors.primary,
  },

  permissionRowCopy: {
    flex: 1,
  },

  permissionRowTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  permissionRowSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 3,
    backgroundColor: colors.border,
  },

  switchTrackEnabled: {
    backgroundColor: colors.secondary,
  },

  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
  },

  switchThumbEnabled: {
    alignSelf: "flex-end",
  },

  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },

  confirmCard: {
    width: "100%",
    maxWidth: 470,
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.white,

    ...Platform.select({
      web: {
        boxShadow:
          "0 18px 50px rgba(0,0,0,0.18)",
      },

      default: {
        elevation: 8,
      },
    }),
  },

  confirmIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: `${colors.secondary}22`,
  },

  deleteConfirmIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: `${colors.danger}14`,
  },

  confirmTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  confirmText: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: "center",
  },

  disabled: {
    opacity: 0.45,
  },

  pressed: {
    opacity: 0.76,
  },
});
