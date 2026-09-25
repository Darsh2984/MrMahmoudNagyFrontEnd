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
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Badge } from "../../src/components/ui/Badge";
import { DateTimePickerInput } from "../../src/components/ui/DateTimePickerInput";
import { useAuth } from "../../src/contexts/AuthContext";

import api from "../../src/lib/api";
import { formatEgyptDateTime } from "../../src/utils/egyptTime";

import {
  colors,
  spacing,
  radius,
  typography,
} from "../../src/theme";

const TASK_TYPES = [
  {
    value: "HOMEWORK",
    label: "Homework",
    description: "Work students complete outside the class.",
    icon: "home-outline",
  },
  {
    value: "IN_CLASS_QUIZ",
    label: "In Class Quiz",
    description: "A graded activity completed during class.",
    icon: "school-outline",
  },
];

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    fallback
  );
}

function normalizeDeadline(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  const parsed = value instanceof Date ? value : new Date(value);

  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toISOString();
}

function getRouteParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getUngradedSubmissionCount(task, groupId = "ALL") {
  const byGroup = task?._ungradedSubmissionsByGroup;

  if (byGroup && typeof byGroup === "object") {
    if (groupId !== "ALL") {
      return Number(byGroup[String(groupId)] || 0);
    }

    return Object.values(byGroup).reduce(
      (total, count) => total + Number(count || 0),
      0,
    );
  }

  return Number(task?._count?.submissions || 0);
}

export default function Tasks() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 980;
  const isSmallScreen = width < 640;

  const requestedYearId = getRouteParam(params.yearId);
  const requestedGroupId = getRouteParam(params.groupId);

  const [years, setYears] = useState([]);
  const [yearId, setYearId] = useState(requestedYearId || null);

  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [filterGroupId, setFilterGroupId] =
    useState(requestedGroupId || "ALL");
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [gradeOutOf, setGradeOutOf] = useState("100");
  const [taskType, setTaskType] = useState("HOMEWORK");
  const [allowLate, setAllowLate] = useState(true);
  const [taskFile, setTaskFile] = useState(null);

  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const [createModalVisible, setCreateModalVisible] =
    useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAllUndelegated, setShowAllUndelegated] = useState(false);

  const selectedYear = useMemo(() => {
    return years.find((year) => year.id === yearId) || null;
  }, [years, yearId]);

  const filteredTasks = useMemo(() => {
    const groupTasks = filterGroupId === "ALL"
      ? tasks
      : tasks.filter((task) =>
          Array.isArray(task.groups) &&
          task.groups.some(
            (taskGroup) =>
              String(taskGroup.groupId) === String(filterGroupId) ||
              String(taskGroup.group?.id) === String(filterGroupId),
          ),
        );

    return [...groupTasks].sort((first, second) => {
      const firstNeedsGrading =
        getUngradedSubmissionCount(first, filterGroupId) > 0 ? 1 : 0;
      const secondNeedsGrading =
        getUngradedSubmissionCount(second, filterGroupId) > 0 ? 1 : 0;

      if (firstNeedsGrading !== secondNeedsGrading) {
        return secondNeedsGrading - firstNeedsGrading;
      }

      return (
        new Date(second.createdAt || 0).getTime() -
        new Date(first.createdAt || 0).getTime()
      );
    });
  }, [tasks, filterGroupId]);

  const isDelegationAdmin =
    user?.role === "TEACHER" ||
    (user?.role === "ASSISTANT" && user?.isHeadAssistant === true);

  const undelegatedSubmissions = useMemo(() => {
    if (!isDelegationAdmin) return [];

    const submissionsById = new Map();

    filteredTasks.forEach((task) => {
      (task.submissions || []).forEach((submission) => {
        const isInSelectedGroup =
          filterGroupId === "ALL" ||
          (submission.student?.groupMemberships || []).some(
            (membership) =>
              String(membership.groupId) === String(filterGroupId),
          );

        if (!isInSelectedGroup) return;

        submissionsById.set(submission.id, {
          ...submission,
          taskId: task.id,
          taskTitle: task.title,
        });
      });
    });

    return Array.from(submissionsById.values());
  }, [filteredTasks, filterGroupId, isDelegationAdmin]);

  const visibleUndelegatedSubmissions = showAllUndelegated
    ? undelegatedSubmissions
    : undelegatedSubmissions.slice(0, 8);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setGradeOutOf("100");
    setTaskType("HOMEWORK");
    setAllowLate(true);
    setTaskFile(null);
    setSelectedGroupIds([]);
    setEditingTask(null);
  }, []);

  const loadTasksForYear = useCallback(async (yearGroups) => {
    if (!Array.isArray(yearGroups)) {
      setTasks([]);
      return;
    }

    setLoadingTasks(true);
    setError("");

    try {
      const responses = await Promise.allSettled(
        yearGroups.map((group) =>
          api.get(`/tasks/group/${group.id}`),
        ),
      );

      const uniqueTasks = new Map();

      responses.forEach((response, index) => {
        if (
          response.status === "fulfilled" &&
          Array.isArray(response.value.data)
        ) {
          response.value.data.forEach((task) => {
            const existing = uniqueTasks.get(task.id);
            const responseGroupId = String(yearGroups[index]?.id || "");
            const ungradedSubmissionCount = Number(
              task?._count?.submissions || 0,
            );

            uniqueTasks.set(task.id, {
              ...(existing || {}),
              ...task,
              _count: {
                ...(existing?._count || {}),
                ...(task?._count || {}),
                submissions: ungradedSubmissionCount,
              },
              _ungradedSubmissionsByGroup: {
                ...(existing?._ungradedSubmissionsByGroup || {}),
                ...(responseGroupId
                  ? { [responseGroupId]: ungradedSubmissionCount }
                  : {}),
              },
            });
          });
        }
      });

      const loadedTasks = Array.from(uniqueTasks.values());

      loadedTasks.sort((first, second) => {
        const firstCreatedAt = new Date(
          first.createdAt || 0
        ).getTime();

        const secondCreatedAt = new Date(
          second.createdAt || 0
        ).getTime();

        return secondCreatedAt - firstCreatedAt;
      });

      setTasks(loadedTasks);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't load tasks.",
        ),
      );
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const loadGroupsAndTasks = useCallback(
    async (selectedYearId) => {
      if (!selectedYearId) {
        setGroups([]);
        setTasks([]);
        return;
      }

      setLoadingTasks(true);
      setError("");

      try {
        const response = await api.get(
          `/groups/year/${selectedYearId}`,
        );

        const loadedGroups = Array.isArray(response.data)
          ? response.data
          : [];

        setGroups(loadedGroups);
        setSelectedGroupIds([]);
        setFilterGroupId((currentGroupId) =>
          currentGroupId !== "ALL" &&
          loadedGroups.some(
            (group) => String(group.id) === String(currentGroupId),
          )
            ? currentGroupId
            : "ALL",
        );

        await loadTasksForYear(loadedGroups);
      } catch (requestError) {
        setGroups([]);
        setTasks([]);

        setError(
          getErrorMessage(
            requestError,
            "Couldn't load groups and tasks.",
          ),
        );
      } finally {
        setLoadingTasks(false);
      }
    },
    [loadTasksForYear],
  );

  const loadYears = useCallback(async () => {
    setLoadingYears(true);
    setError("");

    try {
      const response = await api.get("/years/mine");

      const loadedYears = Array.isArray(response.data)
        ? response.data
        : [];

      setYears(loadedYears);

      setYearId((currentYearId) => {
        const currentStillExists = loadedYears.some(
          (year) => year.id === currentYearId,
        );

        if (currentStillExists) {
          return currentYearId;
        }

        return loadedYears[0]?.id || null;
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't load academic years.",
        ),
      );
    } finally {
      setLoadingYears(false);
    }
  }, []);

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  useEffect(() => {
    if (requestedYearId) {
      setYearId(requestedYearId);
    }

    if (requestedGroupId) {
      setFilterGroupId(requestedGroupId);
    }
  }, [requestedGroupId, requestedYearId]);

  useEffect(() => {
    if (yearId) {
      loadGroupsAndTasks(yearId);
    }
  }, [yearId, loadGroupsAndTasks]);

  function selectYear(selectedYearId) {
    if (selectedYearId === yearId) return;

    clearMessages();
    setShowAllUndelegated(false);
    setFilterGroupId("ALL");
    setYearId(selectedYearId);
    router.setParams({
      yearId: selectedYearId,
      groupId: "ALL",
    });
  }

  function selectTaskGroupFilter(selectedGroupId) {
    setShowAllUndelegated(false);
    setFilterGroupId(selectedGroupId);
    router.setParams({
      yearId,
      groupId: selectedGroupId,
    });
  }

  function openTask(taskId) {
    router.push({
      pathname: "/(app)/tasks/[taskId]",
      params: {
        taskId,
        yearId,
        groupId: filterGroupId,
      },
    });
  }

  function toggleGroup(groupId) {
    setSelectedGroupIds((currentIds) => {
      if (currentIds.includes(groupId)) {
        return currentIds.filter((id) => id !== groupId);
      }

      return [...currentIds, groupId];
    });
  }

  function selectAllGroups() {
    setSelectedGroupIds(groups.map((group) => group.id));
  }

  function clearSelectedGroups() {
    setSelectedGroupIds([]);
  }

  async function pickFile() {
    clearMessages();

    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
          multiple: false,
          copyToCacheDirectory: true,
        });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setTaskFile(result.assets[0]);
    } catch {
      setError("Couldn't select the PDF file.");
    }
  }

  async function appendFileToFormData(formData, file) {
    if (Platform.OS === "web") {
      const response = await fetch(file.uri);
      const blob = await response.blob();

      formData.append("file", blob, file.name);
      return;
    }

    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/pdf",
    });
  }

  function validateForm() {
    const trimmedTitle = title.trim();
    const numericGrade = Number(gradeOutOf);

    if (!trimmedTitle) {
      return "Task title is required.";
    }

    const normalizedDeadline = normalizeDeadline(deadline);

    if (!normalizedDeadline) {
      return "Deadline is required.";
    }

    if (Number.isNaN(new Date(normalizedDeadline).getTime())) {
      return "Choose a valid deadline date and time.";
    }

    if (selectedGroupIds.length === 0) {
      return "Select at least one group.";
    }

    if (
      !gradeOutOf.trim() ||
      Number.isNaN(numericGrade) ||
      numericGrade <= 0
    ) {
      return "Grade out of must be greater than zero.";
    }

    return "";
  }

  async function handleSave() {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setCreatingTask(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("yearId", yearId);
      formData.append("deadline", normalizeDeadline(deadline));
      formData.append("gradeOutOf", gradeOutOf.trim());
      formData.append("taskType", taskType);

      formData.append(
        "allowLateSubmission",
        String(allowLate),
      );

      formData.append(
        "groupIds",
        JSON.stringify(selectedGroupIds),
      );

      if (taskFile) {
        await appendFileToFormData(formData, taskFile);
      }

      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, formData);
      } else {
        await api.post("/tasks", formData);
      }

      const wasEditing = Boolean(editingTask);
      resetForm();
      setCreateModalVisible(false);
      setSuccess(
        wasEditing
          ? "Task updated successfully."
          : "Task created successfully.",
      );

      const groupsResponse = await api.get(
        `/groups/year/${yearId}`,
      );

      const loadedGroups = Array.isArray(groupsResponse.data)
        ? groupsResponse.data
        : [];

      setGroups(loadedGroups);
      await loadTasksForYear(loadedGroups);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't create the task.",
        ),
      );
    } finally {
      setCreatingTask(false);
    }
  }

  function openCreateModal() {
    clearMessages();
    resetForm();
    setCreateModalVisible(true);
  }

  function openEditModal(task) {
    clearMessages();
    setEditingTask(task);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setDeadline(normalizeDeadline(task.deadline));
    setGradeOutOf(String(task.gradeOutOf ?? 100));
    setTaskType(task.taskType || "HOMEWORK");
    setAllowLate(task.allowLateSubmission !== false);
    setTaskFile(null);
    setSelectedGroupIds(
      Array.isArray(task.groups)
        ? task.groups
            .map((taskGroup) => taskGroup.groupId || taskGroup.group?.id)
            .filter(Boolean)
        : [],
    );
    setCreateModalVisible(true);
  }

  function closeCreateModal() {
    if (creatingTask) return;

    setCreateModalVisible(false);
    resetForm();
  }

  function isPastDeadline(deadlineValue) {
    if (!deadlineValue) return false;

    return new Date(deadlineValue).getTime() < Date.now();
  }

  function renderYearSelector() {
    if (!years.length) {
      return (
        <Card style={styles.emptyYearCard}>
          <View style={styles.emptyYearIcon}>
            <Ionicons
              name="school-outline"
              size={26}
              color={colors.primary}
            />
          </View>

          <View style={styles.emptyYearText}>
            <Text style={styles.emptyYearTitle}>
              No academic years found
            </Text>

            <Text style={styles.mutedText}>
              Create an academic year before adding tasks.
            </Text>
          </View>
        </Card>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.yearList}
      >
        {years.map((year) => {
          const active = year.id === yearId;

          return (
            <Pressable
              key={year.id}
              onPress={() => selectYear(year.id)}
              style={({ pressed }) => [
                styles.yearChip,
                active && styles.yearChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  active ? "school" : "school-outline"
                }
                size={16}
                color={
                  active ? colors.white : colors.primary
                }
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.yearChipText,
                  active && styles.yearChipTextActive,
                ]}
              >
                {year.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  function renderTaskCard(task) {
    const expired = isPastDeadline(task.deadline);
    const ungradedSubmissionCount = getUngradedSubmissionCount(
      task,
      filterGroupId,
    );
    const taskGroups = Array.isArray(task.groups)
      ? task.groups
          .map((taskGroup) => taskGroup.group)
          .filter(Boolean)
      : [];

    return (
      <Card key={task.id} style={styles.taskCard}>
        <View style={styles.taskCardTop}>
          <View
            style={[
              styles.taskIcon,
              expired && styles.taskIconExpired,
            ]}
          >
            <Ionicons
              name="clipboard-outline"
              size={23}
              color={
                expired ? colors.danger : colors.primary
              }
            />
          </View>

          <View style={styles.taskTitleBlock}>
            <Text style={styles.taskTypeLabel}>
              {task.taskType === "IN_CLASS_QUIZ"
                ? "IN CLASS QUIZ"
                : "HOMEWORK"}
            </Text>
            <Text
              numberOfLines={2}
              style={styles.taskTitle}
            >
              {task.title}
            </Text>

            <View style={styles.taskMetaRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.textMuted}
              />

              <Text style={styles.taskMeta}>
                Due {formatEgyptDateTime(task.deadline)}
              </Text>
            </View>
            <View style={styles.taskGroupsRow}>
              <Ionicons
                name="people-outline"
                size={14}
                color={colors.textMuted}
              />

              {taskGroups.length > 0 ? (
                <View style={styles.taskGroupBadges}>
                  {taskGroups.map((group) => (
                    <View
                      key={group.id}
                      style={styles.taskGroupBadge}
                    >
                      <Text
                        numberOfLines={1}
                        style={styles.taskGroupBadgeText}
                      >
                        {group.name}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.taskMeta}>
                  Group unavailable
                </Text>
              )}
            </View>
          </View>

          <Pressable
            onPress={() => openTask(task.id)}
            style={({ pressed }) => [
              styles.openButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-forward"
              size={18}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {task.description ? (
          <Text
            numberOfLines={2}
            style={styles.taskDescription}
          >
            {task.description}
          </Text>
        ) : null}

        <View style={styles.taskFooter}>
          <View style={styles.badgeRow}>
            {ungradedSubmissionCount > 0 ? (
              <Badge
                label={`${ungradedSubmissionCount} not graded`}
                tone="warning"
              />
            ) : null}

            <Badge
              label={
                task.allowLateSubmission
                  ? "Late allowed"
                  : "No late submissions"
              }
              tone={
                task.allowLateSubmission
                  ? "success"
                  : "danger"
              }
            />

            {expired ? (
              <Badge label="Past deadline" tone="danger" />
            ) : (
              <Badge label="Active" tone="success" />
            )}
          </View>

          <View style={styles.taskActions}>
            <Pressable
              onPress={() => openEditModal(task)}
              style={({ pressed }) => [
                styles.viewLink,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="create-outline" size={16} color={colors.warning} />
              <Text style={styles.editLinkText}>Edit task</Text>
            </Pressable>

            <Pressable
              onPress={() => openTask(task.id)}
              style={({ pressed }) => [
                styles.viewLink,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.viewLinkText}>
                View task
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={colors.primary}
              />
            </Pressable>
          </View>
        </View>
      </Card>
    );
  }

  function renderUndelegatedQueue() {
    if (!isDelegationAdmin) return null;

    return (
      <Card style={styles.undelegatedCard}>
        <View style={styles.undelegatedHeader}>
          <View style={styles.undelegatedHeadingRow}>
            <View style={styles.undelegatedIcon}>
              <Ionicons
                name="person-add-outline"
                size={21}
                color={colors.warning}
              />
            </View>

            <View style={styles.undelegatedHeadingCopy}>
              <Text style={styles.undelegatedTitle}>
                Waiting for delegation
              </Text>
              <Text style={styles.mutedText}>
                Submitted homework that has not been assigned to an assistant yet.
              </Text>
            </View>
          </View>

          <View style={styles.undelegatedCount}>
            <Text style={styles.undelegatedCountText}>
              {undelegatedSubmissions.length}
            </Text>
          </View>
        </View>

        {undelegatedSubmissions.length ? (
          <View style={styles.undelegatedList}>
            {visibleUndelegatedSubmissions.map((submission) => (
              <Pressable
                key={submission.id}
                onPress={() => openTask(submission.taskId)}
                style={({ pressed }) => [
                  styles.undelegatedRow,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.undelegatedStudentIcon}>
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.undelegatedRowCopy}>
                  <Text numberOfLines={1} style={styles.undelegatedStudentName}>
                    {submission.student?.name || "Student"}
                  </Text>
                  <Text numberOfLines={1} style={styles.undelegatedTaskName}>
                    {submission.taskTitle}
                    {submission.submittedAt
                      ? ` · ${formatEgyptDateTime(submission.submittedAt)}`
                      : ""}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={colors.primary}
                />
              </Pressable>
            ))}

            {undelegatedSubmissions.length > 8 ? (
              <Pressable
                onPress={() => setShowAllUndelegated((current) => !current)}
                style={({ pressed }) => [
                  styles.undelegatedToggle,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.undelegatedToggleText}>
                  {showAllUndelegated
                    ? "Show fewer"
                    : `Show all ${undelegatedSubmissions.length} submissions`}
                </Text>
                <Ionicons
                  name={showAllUndelegated ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.primary}
                />
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.undelegatedEmpty}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.undelegatedEmptyText}>
              Every submitted, ungraded paper in this view has been delegated.
            </Text>
          </View>
        )}
      </Card>
    );
  }

  function renderTasks() {
    if (loadingTasks) {
      return (
        <Card style={styles.loadingCard}>
          <ActivityIndicator
            color={colors.primary}
            size="large"
          />

          <Text style={styles.loadingText}>
            Loading tasks…
          </Text>
        </Card>
      );
    }

      if (!filteredTasks.length) {
        return (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="clipboard-outline"
              size={34}
              color={colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No tasks yet
          </Text>

          <Text style={styles.emptyDescription}>
            {filterGroupId === "ALL"
              ? `Create the first task for ${
                  selectedYear?.name ||
                  "this academic year"
                }.`
              : "No tasks are assigned to the selected group."}
          </Text>
          <Button
            title="Create task"
            variant="warning"
            onPress={openCreateModal}
            disabled={!yearId || groups.length === 0}
          />
        </Card>
      );
    }

    return (
      <View style={styles.taskList}>
        {filteredTasks.map(renderTaskCard)}
      </View>
    );
  }

  if (loadingYears) {
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
          Loading tasks workspace…
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
                  name="clipboard-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.eyebrow}>
                HOMEWORK MANAGEMENT
              </Text>
            </View>

            <Text style={styles.pageTitle}>
              Student tasks
            </Text>

            <Text style={styles.pageSubtitle}>
              Create Homework or In Class Quiz tasks, attach files,
              choose target groups, and monitor submissions.
            </Text>
          </View>

          <Button
            title="Create task"
            variant="warning"
            onPress={openCreateModal}
            disabled={!yearId || groups.length === 0}
          />
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
                name="school-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {years.length}
            </Text>

            <Text style={styles.statLabel}>
              Academic years
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="people-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {groups.length}
            </Text>

            <Text style={styles.statLabel}>
              Groups in selected year
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="clipboard-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {tasks.length}
            </Text>

            <Text style={styles.statLabel}>
              Tasks in selected year
            </Text>
          </Card>

          {isDelegationAdmin ? (
            <Card style={styles.statCard}>
              <View style={styles.statIconWarning}>
                <Ionicons
                  name="person-add-outline"
                  size={22}
                  color={colors.warning}
                />
              </View>

              <Text style={styles.statValue}>
                {undelegatedSubmissions.length}
              </Text>

              <Text style={styles.statLabel}>
                Submissions awaiting delegation
              </Text>
            </Card>
          ) : null}
        </View>

        <Card style={styles.yearCard}>
          <View style={styles.yearCardHeader}>
            <View>
              <Text style={styles.sectionLabel}>
                ACADEMIC YEAR
              </Text>

              <Text style={styles.yearTitle}>
                {selectedYear?.name || "Select a year"}
              </Text>
            </View>

            <Ionicons
              name="calendar-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          {renderYearSelector()}
        </Card>
        <Card style={styles.groupFilterCard}>
          <View style={styles.groupFilterHeader}>
            <View>
              <Text style={styles.sectionLabel}>
                FILTER BY GROUP
              </Text>

              <Text style={styles.groupFilterTitle}>
                Show tasks assigned to
              </Text>
            </View>

            <Ionicons
              name="filter-outline"
              size={21}
              color={colors.primary}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupFilterList}
          >
            <Pressable
              onPress={() => selectTaskGroupFilter("ALL")}
              style={({ pressed }) => [
                styles.groupFilterChip,
                filterGroupId === "ALL" &&
                  styles.groupFilterChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  filterGroupId === "ALL"
                    ? "apps"
                    : "apps-outline"
                }
                size={16}
                color={
                  filterGroupId === "ALL"
                    ? colors.white
                    : colors.primary
                }
              />

              <Text
                style={[
                  styles.groupFilterChipText,
                  filterGroupId === "ALL" &&
                    styles.groupFilterChipTextActive,
                ]}
              >
                All groups
              </Text>
            </Pressable>

            {groups.map((group) => {
              const active =
                String(filterGroupId) ===
                String(group.id);

              const groupTaskCount = tasks.filter(
                (task) =>
                  Array.isArray(task.groups) &&
                  task.groups.some(
                    (taskGroup) =>
                      String(taskGroup.groupId) ===
                        String(group.id) ||
                      String(taskGroup.group?.id) ===
                        String(group.id)
                  )
              ).length;

              return (
                <Pressable
                  key={group.id}
                  onPress={() => selectTaskGroupFilter(group.id)}
                  style={({ pressed }) => [
                    styles.groupFilterChip,
                    active &&
                      styles.groupFilterChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={
                      active
                        ? "people"
                        : "people-outline"
                    }
                    size={16}
                    color={
                      active
                        ? colors.white
                        : colors.primary
                    }
                  />

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.groupFilterChipText,
                      active &&
                        styles.groupFilterChipTextActive,
                    ]}
                  >
                    {group.name}
                  </Text>

                  <View
                    style={[
                      styles.groupFilterCount,
                      active &&
                        styles.groupFilterCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.groupFilterCountText,
                        active &&
                          styles.groupFilterCountTextActive,
                      ]}
                    >
                      {groupTaskCount}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>

        {renderUndelegatedQueue()}

        <View
          style={[
            styles.contentLayout,
            isDesktop && styles.contentLayoutDesktop,
          ]}
        >
          <View style={styles.tasksColumn}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Assigned tasks
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {filteredTasks.length}{" "}
                  {filteredTasks.length === 1
                    ? "task"
                    : "tasks"}
                  {filterGroupId !== "ALL"
                    ? " in selected group"
                    : ""}
                </Text>
              </View>

              {loadingTasks ? (
                <ActivityIndicator
                  color={colors.primary}
                />
              ) : null}
            </View>

            {renderTasks()}
          </View>

          <View
            style={[
              styles.sideColumn,
              isDesktop && styles.sideColumnDesktop,
            ]}
          >
            <Card style={styles.quickCreateCard}>
              <View style={styles.sideCardHeader}>
                <View style={styles.sideCardIcon}>
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.sideCardCopy}>
                  <Text style={styles.sideCardTitle}>
                    Create task
                  </Text>

                  <Text style={styles.mutedText}>
                    Set a deadline, grade value, and target
                    groups.
                  </Text>
                </View>
              </View>

              <Button
                title="Create task"
                variant="warning"
                onPress={openCreateModal}
                disabled={!yearId || groups.length === 0}
              />
            </Card>

            <Card style={styles.helpCard}>
              <View style={styles.sideCardIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.sideCardTitle}>
                Task workflow
              </Text>

              <Text style={styles.helpText}>
                Select one or more groups, upload an optional
                PDF, then open the task to review submissions,
                grades, and delegation.
              </Text>
            </Card>
          </View>
        </View>
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
                  name="clipboard-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View style={styles.modalHeadingCopy}>
                <Text style={styles.modalTitle}>
                  {editingTask ? "Edit task" : "Create task"}
                </Text>

                <Text style={styles.mutedText}>
                  {editingTask
                    ? "Update the task type, details, deadline, file, or target groups."
                    : "Choose a task type, add its details, and select the groups that should receive it."}
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Close"
                disabled={creatingTask}
                onPress={closeCreateModal}
                style={({ pressed }) => [
                  styles.modalClose,
                  creatingTask && styles.disabled,
                  pressed &&
                    !creatingTask &&
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
              contentContainerStyle={
                styles.formContent
              }
            >
              <Text style={styles.inputLabel}>
                Task type
              </Text>

              <View
                style={[
                  styles.taskTypeOptions,
                  isSmallScreen && styles.taskTypeOptionsSmall,
                ]}
              >
                {TASK_TYPES.map((option) => {
                  const selected = taskType === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setTaskType(option.value)}
                      style={({ pressed }) => [
                        styles.taskTypeOption,
                        selected && styles.taskTypeOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.taskTypeIcon,
                          selected && styles.taskTypeIconSelected,
                        ]}
                      >
                        <Ionicons
                          name={option.icon}
                          size={20}
                          color={selected ? colors.white : colors.primary}
                        />
                      </View>

                      <View style={styles.taskTypeCopy}>
                        <Text
                          style={[
                            styles.taskTypeOptionTitle,
                            selected && styles.taskTypeOptionTitleSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text style={styles.taskTypeOptionDescription}>
                          {option.description}
                        </Text>
                      </View>

                      <Ionicons
                        name={selected ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={selected ? colors.primary : colors.textMuted}
                      />
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>
                Task title
              </Text>

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Description or instructions
              </Text>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the task or provide instructions"
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.descriptionInput,
                ]}
              />

              <View
                style={[
                  styles.formRow,
                  isSmallScreen && styles.formRowSmall,
                ]}
              >
                <View style={styles.formField}>
                  <Text style={styles.inputLabel}>
                    Deadline
                  </Text>

                  <DateTimePickerInput
                    value={deadline}
                    onChange={setDeadline}
                    placeholder="Select date and time"
                    style={styles.datePicker}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.inputLabel}>
                    Grade out of
                  </Text>

                  <TextInput
                    value={gradeOutOf}
                    onChangeText={setGradeOutOf}
                    placeholder="100"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>
                Task file
              </Text>

              <Pressable
                onPress={pickFile}
                style={({ pressed }) => [
                  styles.filePicker,
                  taskFile && styles.filePickerSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.fileIcon}>
                  <Ionicons
                    name="document-attach-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.fileText}>
                  <Text
                    numberOfLines={1}
                    style={styles.fileTitle}
                  >
                    {taskFile
                      ? taskFile.name
                      : "Attach task PDF"}
                  </Text>

                  <Text style={styles.fileSubtitle}>
                    {taskFile
                      ? "Tap to choose a different file"
                      : "Optional PDF attachment"}
                  </Text>
                </View>

                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color={colors.primary}
                />
              </Pressable>

              {taskFile ? (
                <Pressable
                  onPress={() => setTaskFile(null)}
                  style={styles.removeFileButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={15}
                    color={colors.danger}
                  />

                  <Text style={styles.removeFileText}>
                    Remove attachment
                  </Text>
                </Pressable>
              ) : null}

              <Text style={styles.inputLabel}>
                Late submissions
              </Text>

              <Pressable
                onPress={() =>
                  setAllowLate((current) => !current)
                }
                style={({ pressed }) => [
                  styles.toggleRow,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.toggleCopy}>
                  <Text style={styles.toggleTitle}>
                    Allow late submissions
                  </Text>

                  <Text style={styles.toggleDescription}>
                    Students may submit after the deadline.
                  </Text>
                </View>

                <View
                  style={[
                    styles.toggleTrack,
                    allowLate && styles.toggleTrackActive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      allowLate &&
                        styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </Pressable>

              <View style={styles.groupHeader}>
                <View>
                  <Text style={styles.inputLabel}>
                    Target groups
                  </Text>

                  <Text style={styles.groupHint}>
                    Select at least one group.
                  </Text>
                </View>

                {groups.length ? (
                  <View style={styles.groupActions}>
                    <Pressable onPress={selectAllGroups}>
                      <Text style={styles.groupActionText}>
                        Select all
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={clearSelectedGroups}
                    >
                      <Text style={styles.groupActionText}>
                        Clear
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>

              {!groups.length ? (
                <View style={styles.noGroupsBox}>
                  <Ionicons
                    name="people-outline"
                    size={24}
                    color={colors.textMuted}
                  />

                  <Text style={styles.noGroupsText}>
                    No groups exist in this academic year.
                  </Text>
                </View>
              ) : (
                <View style={styles.groupGrid}>
                  {groups.map((group) => {
                    const selected =
                      selectedGroupIds.includes(group.id);

                    return (
                      <Pressable
                        key={group.id}
                        onPress={() =>
                          toggleGroup(group.id)
                        }
                        style={({ pressed }) => [
                          styles.groupChip,
                          selected &&
                            styles.groupChipSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name={
                            selected
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={18}
                          color={
                            selected
                              ? colors.white
                              : colors.primary
                          }
                        />

                        <Text
                          numberOfLines={1}
                          style={[
                            styles.groupChipText,
                            selected &&
                              styles.groupChipTextSelected,
                          ]}
                        >
                          {group.name}
                        </Text>
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
                disabled={creatingTask}
              />

              <Button
                title={editingTask ? "Save changes" : "Create task"}
                variant="warning"
                onPress={handleSave}
                loading={creatingTask}
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
    color: colors.textMuted,
    lineHeight: 23,
    maxWidth: 700,
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
    minWidth: 190,
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

  statIconWarning: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: `${colors.warning}18`,
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

  yearCard: {
    marginBottom: spacing.lg,
  },
  groupFilterCard: {
    marginBottom: spacing.lg,
  },

  undelegatedCard: {
    gap: spacing.md,
    marginBottom: spacing.lg,
    borderColor: `${colors.warning}45`,
  },

  undelegatedHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  undelegatedHeadingRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  undelegatedIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.warning}18`,
  },

  undelegatedHeadingCopy: {
    flex: 1,
    minWidth: 0,
  },

  undelegatedTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  undelegatedCount: {
    minWidth: 42,
    height: 42,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.warning}18`,
  },

  undelegatedCountText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.warning,
  },

  undelegatedList: {
    gap: spacing.xs,
  },

  undelegatedRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  undelegatedStudentIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  undelegatedRowCopy: {
    flex: 1,
    minWidth: 0,
  },

  undelegatedStudentName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 3,
  },

  undelegatedTaskName: {
    fontSize: 11,
    color: colors.textMuted,
  },

  undelegatedToggle: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },

  undelegatedToggleText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  undelegatedEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: `${colors.secondary}15`,
  },

  undelegatedEmptyText: {
    flex: 1,
    ...typography.caption,
    color: colors.textMuted,
  },

  groupFilterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  groupFilterTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  groupFilterList: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },

  groupFilterChip: {
    minHeight: 42,
    maxWidth: 230,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },

  groupFilterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  groupFilterChipText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  groupFilterChipTextActive: {
    color: colors.white,
  },

  groupFilterCount: {
    minWidth: 23,
    height: 23,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  groupFilterCountActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  groupFilterCountText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
  },

  groupFilterCountTextActive: {
    color: colors.white,
  },

  yearCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 4,
  },

  yearTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  yearList: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },

  yearChip: {
    minHeight: 42,
    maxWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },

  yearChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  yearChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  yearChipTextActive: {
    color: colors.white,
  },

  emptyYearCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.background,
  },

  emptyYearIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  emptyYearText: {
    flex: 1,
  },

  emptyYearTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  contentLayout: {
    gap: spacing.lg,
  },

  contentLayoutDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  tasksColumn: {
    flex: 1,
    minWidth: 0,
  },

  sideColumn: {
    width: "100%",
    gap: spacing.md,
  },

  sideColumnDesktop: {
    width: 330,
  },

  sectionHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  taskList: {
    gap: spacing.sm,
  },

  taskCard: {
    gap: spacing.md,
  },

  taskCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },

  taskIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  taskIconExpired: {
    backgroundColor: `${colors.danger}12`,
  },

  taskTitleBlock: {
    flex: 1,
    minWidth: 0,
  },

  taskTypeLabel: {
    marginBottom: 3,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: colors.primary,
  },

  taskTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 5,
  },

  taskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  taskMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },

  openButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  taskDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 21,
  },

  taskFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },

  viewLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: spacing.xs,
  },

  taskActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
  },

  viewLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  editLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.warning,
  },

  loadingCard: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },

  emptyCard: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: `${colors.secondary}22`,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  emptyDescription: {
    ...typography.body,
    maxWidth: 420,
    color: colors.textMuted,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  quickCreateCard: {
    gap: spacing.md,
  },

  sideCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  sideCardIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  sideCardCopy: {
    flex: 1,
  },

  sideCardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  mutedText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  helpCard: {
    backgroundColor: `${colors.secondary}16`,
  },

  helpText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: spacing.sm,
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
    maxWidth: 720,
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

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
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

  taskTypeOptions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  taskTypeOptionsSmall: {
    flexDirection: "column",
  },

  taskTypeOption: {
    flex: 1,
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  taskTypeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.secondary}18`,
  },

  taskTypeIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  taskTypeIconSelected: {
    backgroundColor: colors.primary,
  },

  taskTypeCopy: {
    flex: 1,
    minWidth: 0,
  },

  taskTypeOptionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  taskTypeOptionTitleSelected: {
    color: colors.primary,
  },

  taskTypeOptionDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
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

  descriptionInput: {
    minHeight: 105,
  },

  formRow: {
    flexDirection: "row",
    gap: spacing.md,
  },

  formRowSmall: {
    flexDirection: "column",
    gap: 0,
  },

  formField: {
    flex: 1,
  },

  datePicker: {
    marginBottom: 0,
  },

  filePicker: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  filePickerSelected: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}15`,
  },

  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  fileText: {
    flex: 1,
    minWidth: 0,
  },

  fileTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 3,
  },

  fileSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },

  removeFileButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },

  removeFileText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.danger,
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  taskGroupsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: 7,
  },

  taskGroupBadges: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  taskGroupBadge: {
    maxWidth: 180,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: `${colors.secondary}20`,
    borderWidth: 1,
    borderColor: `${colors.secondary}45`,
  },

  taskGroupBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },

  toggleCopy: {
    flex: 1,
  },

  toggleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 3,
  },

  toggleDescription: {
    fontSize: 11,
    color: colors.textMuted,
  },

  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 3,
    backgroundColor: colors.border,
  },

  toggleTrackActive: {
    backgroundColor: colors.secondary,
  },

  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
  },

  toggleThumbActive: {
    alignSelf: "flex-end",
  },

  groupHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  groupHint: {
    fontSize: 11,
    color: colors.textMuted,
  },

  groupActions: {
    flexDirection: "row",
    gap: spacing.md,
  },

  groupActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  groupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  groupChip: {
    maxWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },

  groupChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  groupChipText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  groupChipTextSelected: {
    color: colors.white,
  },

  noGroupsBox: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  noGroupsText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },

  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },

  disabled: {
    opacity: 0.45,
  },

  pressed: {
    opacity: 0.76,
  },
});
