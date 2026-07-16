import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Badge } from "../../src/components/ui/Badge";
import { Input } from "../../src/components/ui/Input";
import { DatePickerInput } from "../../src/components/ui/DatePickerInput";
import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/lib/api";
import { formatDate } from "../../src/utils/formatDate";
import {
  colors,
  spacing,
  radius,
  typography,
} from "../../src/theme";

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toIsoDate(value) {
  if (!value) {
    return "";
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(
    value
  );

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    parsed.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function NoticeCard({
  message,
  tone = "error",
  onDismiss,
}) {
  if (!message) {
    return null;
  }

  const isSuccess = tone === "success";

  return (
    <View
      style={[
        styles.notice,
        {
          borderColor: isSuccess
            ? colors.secondary
            : colors.danger,
          backgroundColor: isSuccess
            ? "#F0F5F1"
            : "#FFF4F1",
        },
      ]}
    >
      <Text
        style={[
          styles.noticeText,
          {
            color: isSuccess
              ? colors.primary
              : colors.danger,
          },
        ]}
      >
        {message}
      </Text>

      {onDismiss ? (
        <Pressable onPress={onDismiss}>
          <Text style={styles.noticeClose}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SelectorSection({
  label,
  items,
  selectedId,
  onSelect,
  activeColor,
  emptyMessage,
}) {
  return (
    <View style={styles.selectorSection}>
      <Text style={styles.selectorLabel}>
        {label}
      </Text>

      {items.length === 0 ? (
        <Text style={styles.selectorEmpty}>
          {emptyMessage}
        </Text>
      ) : (
        <View style={styles.selectorRow}>
          {items.map((item) => {
            const active = item.id === selectedId;

            return (
              <Pressable
                key={item.id}
                onPress={() => onSelect(item.id)}
                style={({ pressed }) => [
                  styles.selectorChip,
                  active
                    ? {
                        backgroundColor: activeColor,
                        borderColor: activeColor,
                      }
                    : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text
                  style={[
                    styles.selectorChipText,
                    active
                      ? styles.selectorChipTextActive
                      : null,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function SessionFormModal({
  visible,
  mode,
  title,
  date,
  onTitleChange,
  onDateChange,
  onCancel,
  onSubmit,
  submitting,
  validationError,
}) {
  const isEditing = mode === "edit";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={onCancel}
      >
        <Pressable
          style={styles.formModal}
          onPress={() => {}}
        >
          <View style={styles.modalHeadingRow}>
            <View style={styles.modalHeadingText}>
              <Text style={styles.modalEyebrow}>
                {isEditing
                  ? "SESSION SETTINGS"
                  : "NEW SESSION"}
              </Text>

              <Text style={styles.modalTitle}>
                {isEditing
                  ? "Edit session"
                  : "Create a session"}
              </Text>

              <Text style={styles.modalSubtitle}>
                {isEditing
                  ? "Update the session name or scheduled date."
                  : "Add a dated session to the selected group."}
              </Text>
            </View>

            <Pressable
              onPress={onCancel}
              style={styles.modalCloseButton}
              accessibilityLabel="Close"
            >
              <Text style={styles.modalCloseText}>
                ×
              </Text>
            </Pressable>
          </View>

          <Input
            label="Session name"
            value={title}
            onChangeText={onTitleChange}
            placeholder="Example: Chapter 3 revision"
            maxLength={200}
          />

          <DatePickerInput
            label="Session date"
            value={date}
            onChange={onDateChange}
            placeholder="Select session date"
          />

          {validationError ? (
            <Text style={styles.formError}>
              {validationError}
            </Text>
          ) : null}

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onCancel}
              disabled={submitting}
              style={styles.modalActionButton}
            />

            <Button
              title={
                isEditing
                  ? "Save changes"
                  : "Create session"
              }
              variant="primary"
              onPress={onSubmit}
              loading={submitting}
              style={styles.modalActionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DeleteSessionModal({
  visible,
  session,
  onCancel,
  onConfirm,
  deleting,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={onCancel}
      >
        <Pressable
          style={styles.deleteModal}
          onPress={() => {}}
        >
          <View style={styles.deleteIcon}>
            <Text style={styles.deleteIconText}>
              !
            </Text>
          </View>

          <Text style={styles.deleteTitle}>
            Delete this session?
          </Text>

          <Text style={styles.deleteMessage}>
            {session?.title
              ? `“${session.title}” will be permanently deleted.`
              : "This session will be permanently deleted."}
          </Text>

          <View style={styles.deleteWarning}>
            <Text style={styles.deleteWarningText}>
              Attendance records, live questions, and
              submitted live-question answers belonging
              to this session will also be deleted.
            </Text>
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onCancel}
              disabled={deleting}
              style={styles.modalActionButton}
            />

            <Button
              title="Delete session"
              variant="danger"
              onPress={onConfirm}
              loading={deleting}
              style={styles.modalActionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TeacherSessionManager() {
  const [years, setYears] = useState([]);
  const [yearId, setYearId] = useState(null);

  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] =
    useState(null);

  const [attendance, setAttendance] = useState({});

  const [initialLoading, setInitialLoading] =
    useState(true);
  const [groupsLoading, setGroupsLoading] =
    useState(false);
  const [sessionsLoading, setSessionsLoading] =
    useState(false);
  const [sessionDetailsLoading, setSessionDetailsLoading] =
    useState(false);
  const [attendanceSaving, setAttendanceSaving] =
    useState(false);

  const [formVisible, setFormVisible] =
    useState(false);
  const [formMode, setFormMode] =
    useState("create");
  const [formTitle, setFormTitle] =
    useState("");
  const [formDate, setFormDate] =
    useState(getTodayIsoDate());
  const [formSubmitting, setFormSubmitting] =
    useState(false);
  const [formValidationError, setFormValidationError] =
    useState("");

  const [deleteVisible, setDeleteVisible] =
    useState(false);
  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentYear = useMemo(
    () => years.find((year) => year.id === yearId),
    [years, yearId]
  );

  const currentGroup = useMemo(
    () => groups.find((group) => group.id === groupId),
    [groups, groupId]
  );

  const attendanceSummary = useMemo(() => {
    const values = Object.values(attendance);

    return {
      total: values.length,
      present: values.filter(
        (status) => status === "PRESENT"
      ).length,
      absent: values.filter(
        (status) => status === "ABSENT"
      ).length,
    };
  }, [attendance]);

  const loadYears = useCallback(async () => {
    setInitialLoading(true);
    setError("");

    try {
      const response = await api.get("/years/mine");
      const loadedYears = response.data || [];

      setYears(loadedYears);
      setYearId(
        loadedYears.length
          ? loadedYears[0].id
          : null
      );
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Couldn't load academic years."
      );
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  useEffect(() => {
    let cancelled = false;

    async function loadGroups() {
      setGroups([]);
      setGroupId(null);
      setSessions([]);
      setSelectedSession(null);
      setAttendance({});

      if (!yearId) {
        return;
      }

      setGroupsLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/groups/year/${yearId}`
        );

        if (cancelled) {
          return;
        }

        const loadedGroups = response.data || [];

        setGroups(loadedGroups);
        setGroupId(
          loadedGroups.length
            ? loadedGroups[0].id
            : null
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.msg ||
              "Couldn't load groups."
          );
        }
      } finally {
        if (!cancelled) {
          setGroupsLoading(false);
        }
      }
    }

    loadGroups();

    return () => {
      cancelled = true;
    };
  }, [yearId]);

  const loadSessions = useCallback(
    async (
      selectedGroupId,
      preferredSessionId = null
    ) => {
      if (!selectedGroupId) {
        setSessions([]);
        setSelectedSession(null);
        setAttendance({});
        return;
      }

      setSessionsLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/sessions/group/${selectedGroupId}`
        );

        const loadedSessions = response.data || [];
        setSessions(loadedSessions);

        const sessionStillExists =
          preferredSessionId &&
          loadedSessions.some(
            (session) =>
              session.id === preferredSessionId
          );

        if (!sessionStillExists) {
          setSelectedSession(null);
          setAttendance({});
        }
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            "Couldn't load sessions."
        );
      } finally {
        setSessionsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadSessions(groupId);
  }, [groupId, loadSessions]);

  const openSession = useCallback(
    async (sessionOrId) => {
      const sessionId =
        typeof sessionOrId === "string"
          ? sessionOrId
          : sessionOrId?.id;

      if (!sessionId) {
        return;
      }

      setSessionDetailsLoading(true);
      setError("");
      setSuccess("");

      try {
        const response = await api.get(
          `/sessions/${sessionId}`
        );

        const loadedSession = response.data;
        setSelectedSession(loadedSession);

        const records = {};

        for (const attendanceRecord of
          loadedSession.attendance || []) {
          records[attendanceRecord.studentId] =
            attendanceRecord.status;
        }

        setAttendance(records);
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            "Couldn't load the session."
        );
      } finally {
        setSessionDetailsLoading(false);
      }
    },
    []
  );

  function openCreateForm() {
    setFormMode("create");
    setFormTitle("");
    setFormDate(getTodayIsoDate());
    setFormValidationError("");
    setFormVisible(true);
  }

  function openEditForm() {
    if (!selectedSession) {
      return;
    }

    setFormMode("edit");
    setFormTitle(selectedSession.title || "");
    setFormDate(
      toIsoDate(selectedSession.date) ||
        getTodayIsoDate()
    );
    setFormValidationError("");
    setFormVisible(true);
  }

  function closeForm() {
    if (formSubmitting) {
      return;
    }

    setFormVisible(false);
    setFormValidationError("");
  }

  async function submitSessionForm() {
    const normalizedTitle = formTitle.trim();

    if (!normalizedTitle) {
      setFormValidationError(
        "Enter a session name."
      );
      return;
    }

    if (!formDate) {
      setFormValidationError(
        "Select a session date."
      );
      return;
    }

    if (formMode === "create" && !groupId) {
      setFormValidationError(
        "Select a group before creating a session."
      );
      return;
    }

    setFormSubmitting(true);
    setFormValidationError("");
    setError("");
    setSuccess("");

    try {
      if (formMode === "create") {
        const response = await api.post(
          "/sessions",
          {
            title: normalizedTitle,
            date: formDate,
            yearId,
            groupId,
          }
        );

        const createdSessionId =
          response.data?.session?.id;

        await loadSessions(
          groupId,
          createdSessionId
        );

        if (createdSessionId) {
          await openSession(createdSessionId);
        }

        setSuccess("Session created successfully.");
      } else {
        await api.patch(
          `/sessions/${selectedSession.id}`,
          {
            title: normalizedTitle,
            date: formDate,
          }
        );

        await loadSessions(
          groupId,
          selectedSession.id
        );
        await openSession(selectedSession.id);

        setSuccess("Session updated successfully.");
      }

      setFormVisible(false);
    } catch (err) {
      setFormValidationError(
        err.response?.data?.msg ||
          `Couldn't ${
            formMode === "create"
              ? "create"
              : "update"
          } the session.`
      );
    } finally {
      setFormSubmitting(false);
    }
  }

  async function confirmDeleteSession() {
    if (!selectedSession) {
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/sessions/${selectedSession.id}`
      );

      setDeleteVisible(false);
      setSelectedSession(null);
      setAttendance({});

      await loadSessions(groupId);

      setSuccess("Session deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Couldn't delete the session."
      );
    } finally {
      setDeleting(false);
    }
  }

  function toggleAttendance(studentId) {
    setAttendance((current) => ({
      ...current,
      [studentId]:
        current[studentId] === "PRESENT"
          ? "ABSENT"
          : "PRESENT",
    }));
  }

  function setAllAttendance(status) {
    setAttendance((current) =>
      Object.keys(current).reduce(
        (result, studentId) => {
          result[studentId] = status;
          return result;
        },
        {}
      )
    );
  }

  async function saveAttendance() {
    if (!selectedSession) {
      return;
    }

    const records = Object.entries(
      attendance
    ).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    setAttendanceSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post(
        `/sessions/${selectedSession.id}/attendance`,
        { records }
      );

      await openSession(selectedSession.id);

      setSuccess(
        "Attendance saved successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Couldn't save attendance."
      );
    } finally {
      setAttendanceSaving(false);
    }
  }

  if (initialLoading) {
    return (
      <Screen
        scroll={false}
        style={styles.loadingScreen}
      >
        <ActivityIndicator
          color={colors.primary}
          size="large"
        />
        <Text style={styles.loadingText}>
          Loading sessions…
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.pageHeader}>
        <View style={styles.pageHeadingText}>
          <Text style={styles.pageEyebrow}>
            LEARNING MANAGEMENT
          </Text>

          <Text style={styles.pageTitle}>
            Sessions
          </Text>

          <Text style={styles.pageSubtitle}>
            Plan class sessions, manage attendance,
            and review live student responses.
          </Text>
        </View>

        <Button
          title="+ Create session"
          variant="warning"
          onPress={openCreateForm}
          disabled={!groupId}
          style={styles.createButton}
        />
      </View>

      <NoticeCard
        message={error}
        onDismiss={() => setError("")}
      />

      <NoticeCard
        message={success}
        tone="success"
        onDismiss={() => setSuccess("")}
      />

      <Card style={styles.filtersCard}>
        <SelectorSection
          label="Academic year"
          items={years}
          selectedId={yearId}
          onSelect={setYearId}
          activeColor={colors.primary}
          emptyMessage="No academic years are available."
        />

        <View style={styles.filterDivider} />

        {groupsLoading ? (
          <View style={styles.inlineLoading}>
            <ActivityIndicator
              color={colors.secondary}
            />
            <Text style={styles.inlineLoadingText}>
              Loading groups…
            </Text>
          </View>
        ) : (
          <SelectorSection
            label="Group"
            items={groups}
            selectedId={groupId}
            onSelect={setGroupId}
            activeColor={colors.secondary}
            emptyMessage={
              currentYear
                ? "This year has no groups yet."
                : "Select an academic year."
            }
          />
        )}
      </Card>

      {!groupId ? (
        <Card style={styles.emptyPageCard}>
          <View style={styles.emptyPageIcon}>
            <Text style={styles.emptyPageIconText}>
              S
            </Text>
          </View>

          <Text style={styles.emptyPageTitle}>
            No group selected
          </Text>

          <Text style={styles.emptyPageText}>
            Create or select a group before adding
            sessions and recording attendance.
          </Text>
        </Card>
      ) : (
        <View style={styles.workspace}>
          <View style={styles.sessionListColumn}>
            <Card style={styles.columnCard}>
              <View style={styles.columnHeader}>
                <View>
                  <Text style={styles.columnEyebrow}>
                    {currentYear?.name || "ACADEMIC YEAR"}
                  </Text>

                  <Text style={styles.columnTitle}>
                    {currentGroup?.name || "Sessions"}
                  </Text>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {sessions.length}
                  </Text>
                </View>
              </View>

              {sessionsLoading ? (
                <View style={styles.listLoading}>
                  <ActivityIndicator
                    color={colors.primary}
                  />
                  <Text style={styles.inlineLoadingText}>
                    Loading sessions…
                  </Text>
                </View>
              ) : sessions.length === 0 ? (
                <View style={styles.listEmpty}>
                  <Text style={styles.listEmptyTitle}>
                    No sessions yet
                  </Text>

                  <Text style={styles.listEmptyText}>
                    Create the first dated session for
                    this group.
                  </Text>

                  <Button
                    title="Create first session"
                    variant="warning"
                    onPress={openCreateForm}
                    style={styles.listEmptyButton}
                  />
                </View>
              ) : (
                <View style={styles.sessionList}>
                  {sessions.map((session) => {
                    const active =
                      selectedSession?.id ===
                      session.id;

                    return (
                      <Pressable
                        key={session.id}
                        onPress={() =>
                          openSession(session)
                        }
                        style={({ pressed }) => [
                          styles.sessionCard,
                          active
                            ? styles.sessionCardActive
                            : null,
                          pressed
                            ? styles.pressed
                            : null,
                        ]}
                      >
                        <View
                          style={[
                            styles.sessionDateBlock,
                            active
                              ? styles.sessionDateBlockActive
                              : null,
                          ]}
                        >
                          <Text
                            style={[
                              styles.sessionDateDay,
                              active
                                ? styles.sessionTextActive
                                : null,
                            ]}
                          >
                            {formatDate(
                              session.date
                            ).split("/")[0]}
                          </Text>

                          <Text
                            style={[
                              styles.sessionDateMonth,
                              active
                                ? styles.sessionTextActive
                                : null,
                            ]}
                          >
                            {formatDate(
                              session.date
                            )
                              .split("/")
                              .slice(1)
                              .join(" ")}
                          </Text>
                        </View>

                        <View style={styles.sessionCardBody}>
                          <Text
                            numberOfLines={2}
                            style={[
                              styles.sessionCardTitle,
                              active
                                ? styles.sessionTextActive
                                : null,
                            ]}
                          >
                            {session.title}
                          </Text>

                          <View
                            style={styles.sessionMetaRow}
                          >
                            <Text
                              style={[
                                styles.sessionMeta,
                                active
                                  ? styles.sessionMetaActive
                                  : null,
                              ]}
                            >
                              {session._count
                                ?.attendance ?? 0}{" "}
                              students
                            </Text>

                            <Text
                              style={[
                                styles.sessionMetaDot,
                                active
                                  ? styles.sessionMetaActive
                                  : null,
                              ]}
                            >
                              •
                            </Text>

                            <Text
                              style={[
                                styles.sessionMeta,
                                active
                                  ? styles.sessionMetaActive
                                  : null,
                              ]}
                            >
                              {session._count
                                ?.liveQuestions ?? 0}{" "}
                              questions
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={[
                            styles.sessionArrow,
                            active
                              ? styles.sessionTextActive
                              : null,
                          ]}
                        >
                          ›
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </Card>
          </View>

          <View style={styles.detailsColumn}>
            {sessionDetailsLoading ? (
              <Card style={styles.detailsLoadingCard}>
                <ActivityIndicator
                  color={colors.primary}
                  size="large"
                />
                <Text style={styles.loadingText}>
                  Loading session details…
                </Text>
              </Card>
            ) : !selectedSession ? (
              <Card style={styles.detailsPlaceholder}>
                <View
                  style={styles.detailsPlaceholderIcon}
                >
                  <Text
                    style={
                      styles.detailsPlaceholderIconText
                    }
                  >
                    ✓
                  </Text>
                </View>

                <Text
                  style={styles.detailsPlaceholderTitle}
                >
                  Select a session
                </Text>

                <Text
                  style={styles.detailsPlaceholderText}
                >
                  Choose a session from the left to
                  manage attendance and live questions.
                </Text>
              </Card>
            ) : (
              <View style={styles.detailsStack}>
                <Card style={styles.sessionDetailsCard}>
                  <View style={styles.detailsHeader}>
                    <View style={styles.detailsHeading}>
                      <Text style={styles.detailsEyebrow}>
                        {selectedSession.group?.name ||
                          currentGroup?.name}
                      </Text>

                      <Text style={styles.detailsTitle}>
                        {selectedSession.title}
                      </Text>

                      <View
                        style={styles.detailsDateRow}
                      >
                        <Text style={styles.dateIcon}>
                          📅
                        </Text>

                        <Text style={styles.detailsDate}>
                          {formatDate(
                            selectedSession.date
                          )}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailsActions}>
                      <Button
                        title="Edit"
                        variant="outline"
                        onPress={openEditForm}
                        style={styles.smallActionButton}
                      />

                      <Button
                        title="Delete"
                        variant="danger"
                        onPress={() =>
                          setDeleteVisible(true)
                        }
                        style={styles.smallActionButton}
                      />
                    </View>
                  </View>

                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryValue}>
                        {attendanceSummary.total}
                      </Text>
                      <Text style={styles.summaryLabel}>
                        Students
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.summaryCard,
                        styles.summaryPresent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.summaryValue,
                          styles.summaryPresentText,
                        ]}
                      >
                        {attendanceSummary.present}
                      </Text>
                      <Text style={styles.summaryLabel}>
                        Present
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.summaryCard,
                        styles.summaryAbsent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.summaryValue,
                          styles.summaryAbsentText,
                        ]}
                      >
                        {attendanceSummary.absent}
                      </Text>
                      <Text style={styles.summaryLabel}>
                        Absent
                      </Text>
                    </View>
                  </View>
                </Card>

                <Card style={styles.attendanceCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionHeadingText}>
                      <Text style={styles.sectionTitle}>
                        Attendance
                      </Text>

                      <Text style={styles.sectionSubtitle}>
                        Tap a student's status to switch
                        between present and absent.
                      </Text>
                    </View>

                    <View
                      style={styles.bulkAttendanceActions}
                    >
                      <Pressable
                        onPress={() =>
                          setAllAttendance("PRESENT")
                        }
                        style={styles.bulkAction}
                      >
                        <Text
                          style={styles.bulkActionText}
                        >
                          Mark all present
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          setAllAttendance("ABSENT")
                        }
                        style={styles.bulkAction}
                      >
                        <Text
                          style={[
                            styles.bulkActionText,
                            {
                              color: colors.danger,
                            },
                          ]}
                        >
                          Mark all absent
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {(selectedSession.attendance || [])
                    .length === 0 ? (
                    <View style={styles.rosterEmpty}>
                      <Text
                        style={styles.rosterEmptyTitle}
                      >
                        No students in this roster
                      </Text>

                      <Text
                        style={styles.rosterEmptyText}
                      >
                        Add students to the group before
                        recording attendance.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.roster}>
                      {selectedSession.attendance.map(
                        (record, index) => {
                          const isPresent =
                            attendance[
                              record.studentId
                            ] === "PRESENT";

                          return (
                            <Pressable
                              key={record.studentId}
                              onPress={() =>
                                toggleAttendance(
                                  record.studentId
                                )
                              }
                              style={({ pressed }) => [
                                styles.rosterRow,
                                index ===
                                selectedSession
                                  .attendance.length -
                                  1
                                  ? styles.rosterRowLast
                                  : null,
                                pressed
                                  ? styles.pressed
                                  : null,
                              ]}
                            >
                              <View
                                style={
                                  styles.studentIdentity
                                }
                              >
                                <View
                                  style={
                                    styles.studentAvatar
                                  }
                                >
                                  <Text
                                    style={
                                      styles.studentAvatarText
                                    }
                                  >
                                    {record.student.name
                                      ?.charAt(0)
                                      ?.toUpperCase() ||
                                      "S"}
                                  </Text>
                                </View>

                                <Text
                                  style={
                                    styles.studentName
                                  }
                                >
                                  {record.student.name}
                                </Text>
                              </View>

                              <View
                                style={[
                                  styles.attendanceStatus,
                                  isPresent
                                    ? styles.presentStatus
                                    : styles.absentStatus,
                                ]}
                              >
                                <View
                                  style={[
                                    styles.statusDot,
                                    {
                                      backgroundColor:
                                        isPresent
                                          ? colors.secondary
                                          : colors.danger,
                                    },
                                  ]}
                                />

                                <Text
                                  style={[
                                    styles.attendanceStatusText,
                                    {
                                      color: isPresent
                                        ? colors.primary
                                        : colors.danger,
                                    },
                                  ]}
                                >
                                  {isPresent
                                    ? "Present"
                                    : "Absent"}
                                </Text>
                              </View>
                            </Pressable>
                          );
                        }
                      )}
                    </View>
                  )}

                  <View style={styles.attendanceFooter}>
                    <Text
                      style={styles.attendanceFooterText}
                    >
                      {attendanceSummary.present} of{" "}
                      {attendanceSummary.total} students
                      marked present
                    </Text>

                    <Button
                      title="Save attendance"
                      variant="warning"
                      onPress={saveAttendance}
                      loading={attendanceSaving}
                      disabled={
                        attendanceSummary.total === 0
                      }
                    />
                  </View>
                </Card>

                <Card style={styles.liveQuestionsCard}>
                  <LiveQuestionsPanel
                    session={selectedSession}
                    onPosted={() =>
                      openSession(selectedSession.id)
                    }
                  />
                </Card>
              </View>
            )}
          </View>
        </View>
      )}

      <SessionFormModal
        visible={formVisible}
        mode={formMode}
        title={formTitle}
        date={formDate}
        onTitleChange={setFormTitle}
        onDateChange={setFormDate}
        onCancel={closeForm}
        onSubmit={submitSessionForm}
        submitting={formSubmitting}
        validationError={formValidationError}
      />

      <DeleteSessionModal
        visible={deleteVisible}
        session={selectedSession}
        onCancel={() => {
          if (!deleting) {
            setDeleteVisible(false);
          }
        }}
        onConfirm={confirmDeleteSession}
        deleting={deleting}
      />
    </Screen>
  );
}

function LiveQuestionsPanel({
  session,
  onPosted,
}) {
  const [prompt, setPrompt] = useState("");
  const [gradeOutOf, setGradeOutOf] =
    useState("5");
  const [expandedId, setExpandedId] =
    useState(null);
  const [answers, setAnswers] = useState([]);
  const [gradeInputs, setGradeInputs] =
    useState({});
  const [posting, setPosting] = useState(false);
  const [gradingAnswerId, setGradingAnswerId] =
    useState(null);
  const [loadingAnswers, setLoadingAnswers] =
    useState(false);
  const [error, setError] = useState("");

  async function postQuestion() {
    const normalizedPrompt = prompt.trim();
    const parsedGradeOutOf = Number(
      gradeOutOf
    );

    if (!normalizedPrompt) {
      setError("Enter a question prompt.");
      return;
    }

    if (
      !Number.isFinite(parsedGradeOutOf) ||
      parsedGradeOutOf <= 0
    ) {
      setError(
        "Marks must be a number greater than zero."
      );
      return;
    }

    setPosting(true);
    setError("");

    try {
      await api.post("/live-questions", {
        sessionId: session.id,
        prompt: normalizedPrompt,
        gradeOutOf: parsedGradeOutOf,
      });

      setPrompt("");
      setGradeOutOf("5");

      await onPosted();
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Couldn't post the question."
      );
    } finally {
      setPosting(false);
    }
  }

  async function expand(liveQuestionId) {
    if (expandedId === liveQuestionId) {
      setExpandedId(null);
      setAnswers([]);
      return;
    }

    setLoadingAnswers(true);
    setError("");

    try {
      const response = await api.get(
        `/live-questions/${liveQuestionId}/answers`
      );

      setAnswers(response.data || []);
      setExpandedId(liveQuestionId);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Couldn't load submitted answers."
      );
    } finally {
      setLoadingAnswers(false);
    }
  }

  async function saveGrade(answerId) {
    const grade = Number(
      gradeInputs[answerId]
    );

    if (!Number.isFinite(grade)) {
      setError("Enter a valid grade.");
      return;
    }

    setGradingAnswerId(answerId);
    setError("");

    try {
      await api.patch(
        `/live-questions/answer/${answerId}/grade`,
        { grade }
      );

      const response = await api.get(
        `/live-questions/${expandedId}/answers`
      );

      setAnswers(response.data || []);
      setGradeInputs((current) => ({
        ...current,
        [answerId]: "",
      }));
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Couldn't save the grade."
      );
    } finally {
      setGradingAnswerId(null);
    }
  }

  return (
    <View>
      <View style={styles.liveHeader}>
        <View style={styles.sectionHeadingText}>
          <Text style={styles.sectionTitle}>
            Live questions
          </Text>

          <Text style={styles.sectionSubtitle}>
            Post a question during the session and
            grade photographed responses.
          </Text>
        </View>

        <View style={styles.liveCountBadge}>
          <Text style={styles.liveCountText}>
            {(session.liveQuestions || []).length}
          </Text>
        </View>
      </View>

      {error ? (
        <Text style={styles.inlineError}>
          {error}
        </Text>
      ) : null}

      <View style={styles.questionComposer}>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Question prompt or reference"
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.questionPromptInput}
        />

        <View style={styles.questionComposerFooter}>
          <View style={styles.marksField}>
            <Text style={styles.marksLabel}>
              Marks
            </Text>

            <TextInput
              value={gradeOutOf}
              onChangeText={setGradeOutOf}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor={colors.textMuted}
              style={styles.marksInput}
            />
          </View>

          <Button
            title="Post question"
            variant="warning"
            onPress={postQuestion}
            loading={posting}
          />
        </View>
      </View>

      {(session.liveQuestions || []).length ===
      0 ? (
        <View style={styles.questionsEmpty}>
          <Text style={styles.questionsEmptyTitle}>
            No live questions yet
          </Text>

          <Text style={styles.questionsEmptyText}>
            Use the form above to post the first
            question for this session.
          </Text>
        </View>
      ) : (
        <View style={styles.questionList}>
          {(session.liveQuestions || []).map(
            (question, index) => {
              const expanded =
                expandedId === question.id;

              return (
                <View
                  key={question.id}
                  style={styles.questionItem}
                >
                  <Pressable
                    onPress={() =>
                      expand(question.id)
                    }
                    style={({ pressed }) => [
                      styles.questionHeader,
                      pressed
                        ? styles.pressed
                        : null,
                    ]}
                  >
                    <View
                      style={styles.questionNumber}
                    >
                      <Text
                        style={
                          styles.questionNumberText
                        }
                      >
                        {index + 1}
                      </Text>
                    </View>

                    <View
                      style={styles.questionHeading}
                    >
                      <Text
                        style={styles.questionPrompt}
                      >
                        {question.prompt}
                      </Text>

                      <Text
                        style={styles.questionMeta}
                      >
                        {question.gradeOutOf} marks •{" "}
                        {question.answers?.length || 0}{" "}
                        submissions
                      </Text>
                    </View>

                    <Text
                      style={styles.questionChevron}
                    >
                      {expanded ? "▲" : "▼"}
                    </Text>
                  </Pressable>

                  {expanded ? (
                    <View
                      style={styles.answerSection}
                    >
                      {loadingAnswers ? (
                        <View
                          style={
                            styles.inlineLoading
                          }
                        >
                          <ActivityIndicator
                            color={colors.primary}
                          />
                          <Text
                            style={
                              styles.inlineLoadingText
                            }
                          >
                            Loading answers…
                          </Text>
                        </View>
                      ) : answers.length === 0 ? (
                        <Text
                          style={
                            styles.noAnswersText
                          }
                        >
                          No student answers have been
                          submitted.
                        </Text>
                      ) : (
                        answers.map((answer) => (
                          <View
                            key={answer.id}
                            style={styles.answerRow}
                          >
                            <Pressable
                              onPress={() =>
                                Linking.openURL(
                                  answer.answerImageUrl
                                )
                              }
                              style={
                                styles.answerStudent
                              }
                            >
                              <View
                                style={
                                  styles.answerAvatar
                                }
                              >
                                <Text
                                  style={
                                    styles.answerAvatarText
                                  }
                                >
                                  {answer.student?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    "S"}
                                </Text>
                              </View>

                              <View>
                                <Text
                                  style={
                                    styles.answerStudentName
                                  }
                                >
                                  {answer.student?.name ||
                                    "Student"}
                                </Text>

                                <Text
                                  style={
                                    styles.answerOpenText
                                  }
                                >
                                  Open submitted file
                                </Text>
                              </View>
                            </Pressable>

                            {answer.status ===
                            "GRADED" ? (
                              <Badge
                                label={`Graded: ${answer.grade}/${question.gradeOutOf}`}
                                tone="success"
                              />
                            ) : (
                              <View
                                style={
                                  styles.gradeControls
                                }
                              >
                                <TextInput
                                  value={
                                    gradeInputs[
                                      answer.id
                                    ] || ""
                                  }
                                  onChangeText={(value) =>
                                    setGradeInputs(
                                      (current) => ({
                                        ...current,
                                        [answer.id]:
                                          value,
                                      })
                                    )
                                  }
                                  placeholder="Grade"
                                  keyboardType="numeric"
                                  placeholderTextColor={
                                    colors.textMuted
                                  }
                                  style={
                                    styles.gradeInput
                                  }
                                />

                                <Button
                                  title="Save"
                                  variant="secondary"
                                  onPress={() =>
                                    saveGrade(
                                      answer.id
                                    )
                                  }
                                  loading={
                                    gradingAnswerId ===
                                    answer.id
                                  }
                                  style={
                                    styles.gradeButton
                                  }
                                />
                              </View>
                            )}
                          </View>
                        ))
                      )}
                    </View>
                  ) : null}
                </View>
              );
            }
          )}
        </View>
      )}
    </View>
  );
}

function StudentSessionView() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] =
    useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(true);
  const [uploadingQuestionId, setUploadingQuestionId] =
    useState(null);

  const { user } = useAuth();

  const openSession = useCallback(
    async (sessionId) => {
      try {
        const response = await api.get(
          `/sessions/${sessionId}`
        );

        setSelected(response.data);
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            "Couldn't load the session."
        );
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadStudentSessions() {
      try {
        const profileResponse = await api.get(
          `/students/${user.id}`
        );

        const group =
          profileResponse.data.groupMemberships?.[0]
            ?.group;

        if (!group) {
          setError("Not in a group yet.");
          return;
        }

        const sessionsResponse = await api.get(
          `/sessions/group/${group.id}`
        );

        if (cancelled) {
          return;
        }

        const loadedSessions =
          sessionsResponse.data || [];

        setSessions(loadedSessions);

        if (loadedSessions.length) {
          await openSession(
            loadedSessions[0].id
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.msg ||
              "Couldn't load sessions."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStudentSessions();

    return () => {
      cancelled = true;
    };
  }, [openSession, user.id]);

  async function answerQuestion(
    liveQuestionId
  ) {
    const result =
      await DocumentPicker.getDocumentAsync({
        type: [
          "image/*",
          "application/pdf",
        ],
      });

    if (result.canceled) {
      return;
    }

    const file = result.assets[0];
    const formData = new FormData();

    if (Platform.OS === "web") {
      formData.append(
        "file",
        file.file || file
      );
    } else {
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type:
          file.mimeType || "image/jpeg",
      });
    }

    setUploadingQuestionId(liveQuestionId);
    setError("");

    try {
      await api.post(
        `/live-questions/${liveQuestionId}/answer`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      await openSession(selected.id);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Couldn't upload the answer."
      );
    } finally {
      setUploadingQuestionId(null);
    }
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={styles.loadingScreen}
      >
        <ActivityIndicator
          color={colors.primary}
          size="large"
        />
        <Text style={styles.loadingText}>
          Loading sessions…
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.pageHeader}>
        <View style={styles.pageHeadingText}>
          <Text style={styles.pageEyebrow}>
            MY LEARNING
          </Text>

          <Text style={styles.pageTitle}>
            Sessions
          </Text>

          <Text style={styles.pageSubtitle}>
            Review session questions and submit your
            photographed answers.
          </Text>
        </View>
      </View>

      <NoticeCard
        message={error}
        onDismiss={() => setError("")}
      />

      {sessions.length > 1 ? (
        <View style={styles.studentSessionTabs}>
          {sessions.map((session) => {
            const active =
              selected?.id === session.id;

            return (
              <Pressable
                key={session.id}
                onPress={() =>
                  openSession(session.id)
                }
                style={[
                  styles.studentSessionTab,
                  active
                    ? styles.studentSessionTabActive
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.studentSessionTabTitle,
                    active
                      ? styles.sessionTextActive
                      : null,
                  ]}
                >
                  {session.title}
                </Text>

                <Text
                  style={[
                    styles.studentSessionTabDate,
                    active
                      ? styles.sessionMetaActive
                      : null,
                  ]}
                >
                  {formatDate(session.date)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {!selected ? (
        <Card style={styles.emptyPageCard}>
          <Text style={styles.emptyPageTitle}>
            No sessions yet
          </Text>

          <Text style={styles.emptyPageText}>
            Your teacher has not added a session for
            this group.
          </Text>
        </Card>
      ) : (
        <View>
          <Card style={styles.studentSessionHero}>
            <Text style={styles.studentHeroEyebrow}>
              CURRENT SESSION
            </Text>

            <Text style={styles.studentHeroTitle}>
              {selected.title}
            </Text>

            <Text style={styles.studentHeroDate}>
              {formatDate(selected.date)}
            </Text>
          </Card>

          <Text style={styles.studentQuestionsHeading}>
            Live questions
          </Text>

          {(selected.liveQuestions || []).length ===
          0 ? (
            <Card>
              <Text style={styles.listEmptyTitle}>
                No live questions posted
              </Text>

              <Text style={styles.listEmptyText}>
                Questions posted during this session
                will appear here.
              </Text>
            </Card>
          ) : (
            selected.liveQuestions.map(
              (question, index) => {
                const myAnswer =
                  question.answers.find(
                    (answer) =>
                      answer.studentId === user.id
                  );

                return (
                  <Card
                    key={question.id}
                    style={styles.studentQuestionCard}
                  >
                    <View
                      style={
                        styles.studentQuestionHeader
                      }
                    >
                      <View
                        style={styles.questionNumber}
                      >
                        <Text
                          style={
                            styles.questionNumberText
                          }
                        >
                          {index + 1}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.studentQuestionHeading
                        }
                      >
                        <Text
                          style={
                            styles.studentQuestionPrompt
                          }
                        >
                          {question.prompt}
                        </Text>

                        <Text
                          style={
                            styles.studentQuestionMarks
                          }
                        >
                          {question.gradeOutOf} marks
                        </Text>
                      </View>
                    </View>

                    {myAnswer ? (
                      myAnswer.status ===
                      "GRADED" ? (
                        <View
                          style={
                            styles.studentAnswerStatus
                          }
                        >
                          <Badge
                            label={`Graded: ${myAnswer.grade}/${question.gradeOutOf}`}
                            tone="success"
                          />
                        </View>
                      ) : (
                        <View
                          style={
                            styles.studentAnswerStatus
                          }
                        >
                          <Badge
                            label="Answered — awaiting grade"
                            tone="warning"
                          />
                        </View>
                      )
                    ) : (
                      <Button
                        title="Upload answer photo"
                        variant="warning"
                        onPress={() =>
                          answerQuestion(
                            question.id
                          )
                        }
                        loading={
                          uploadingQuestionId ===
                          question.id
                        }
                        style={
                          styles.studentUploadButton
                        }
                      />
                    )}
                  </Card>
                );
              }
            )
          )}
        </View>
      )}
    </Screen>
  );
}

export default function Sessions() {
  const { user } = useAuth();

  if (user?.role === "STUDENT") {
    return <StudentSessionView />;
  }

  return <TeacherSessionManager />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  pressed: {
    opacity: 0.82,
  },

  pageHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  pageHeadingText: {
    flex: 1,
    minWidth: 240,
  },

  pageEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },

  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: -0.7,
  },

  pageSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: spacing.xs,
    maxWidth: 620,
  },

  createButton: {
    minWidth: 160,
  },

  notice: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  noticeText: {
    ...typography.body,
    flex: 1,
  },

  noticeClose: {
    fontSize: 22,
    color: colors.textMuted,
    marginLeft: spacing.md,
  },

  filtersCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },

  selectorSection: {
    gap: spacing.sm,
  },

  selectorLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.textMuted,
    textTransform: "uppercase",
  },

  selectorEmpty: {
    ...typography.caption,
    color: colors.textMuted,
  },

  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  selectorChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },

  selectorChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  selectorChipTextActive: {
    color: colors.white,
  },

  filterDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },

  inlineLoadingText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  workspace: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: spacing.lg,
  },

  sessionListColumn: {
    flex: 0.82,
    minWidth: 290,
  },

  detailsColumn: {
    flex: 1.55,
    minWidth: 340,
  },

  columnCard: {
    padding: 0,
    overflow: "hidden",
  },

  columnHeader: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  columnEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#B7CDC8",
    textTransform: "uppercase",
  },

  columnTitle: {
    ...typography.h2,
    color: colors.white,
    marginTop: 2,
  },

  countBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  countBadgeText: {
    color: colors.white,
    fontWeight: "800",
  },

  listLoading: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  listEmpty: {
    padding: spacing.xl,
    alignItems: "center",
  },

  listEmptyTitle: {
    ...typography.h3,
    color: colors.primary,
    textAlign: "center",
  },

  listEmptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    marginTop: spacing.xs,
  },

  listEmptyButton: {
    marginTop: spacing.md,
  },

  sessionList: {
    padding: spacing.sm,
  },

  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "transparent",
  },

  sessionCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  sessionDateBlock: {
    width: 64,
    minHeight: 60,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
  },

  sessionDateBlockActive: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  sessionDateDay: {
    fontSize: 21,
    lineHeight: 23,
    fontWeight: "800",
    color: colors.primary,
  },

  sessionDateMonth: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    textAlign: "center",
  },

  sessionCardBody: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },

  sessionCardTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  sessionMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: spacing.xs,
  },

  sessionMeta: {
    fontSize: 10,
    color: colors.textMuted,
  },

  sessionMetaDot: {
    fontSize: 10,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },

  sessionTextActive: {
    color: colors.white,
  },

  sessionMetaActive: {
    color: "#C8D8D5",
  },

  sessionArrow: {
    fontSize: 25,
    color: colors.textMuted,
  },

  detailsStack: {
    gap: spacing.md,
  },

  detailsLoadingCard: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },

  detailsPlaceholder: {
    minHeight: 390,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  detailsPlaceholderIcon: {
    width: 66,
    height: 66,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  detailsPlaceholderIconText: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.secondary,
  },

  detailsPlaceholderTitle: {
    ...typography.h2,
    color: colors.primary,
  },

  detailsPlaceholderText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 350,
    lineHeight: 22,
    marginTop: spacing.xs,
  },

  sessionDetailsCard: {
    padding: spacing.lg,
  },

  detailsHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },

  detailsHeading: {
    flex: 1,
    minWidth: 220,
  },

  detailsEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  detailsTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.primary,
    marginTop: spacing.xs,
  },

  detailsDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },

  dateIcon: {
    fontSize: 15,
    marginRight: spacing.xs,
  },

  detailsDate: {
    ...typography.body,
    color: colors.textMuted,
  },

  detailsActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  smallActionButton: {
    minWidth: 88,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  summaryCard: {
    flex: 1,
    minWidth: 105,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  summaryPresent: {
    backgroundColor: "#F0F5F1",
    borderColor: "#D8E5DB",
  },

  summaryAbsent: {
    backgroundColor: "#FFF4F1",
    borderColor: "#F0D7D0",
  },

  summaryValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: colors.primary,
  },

  summaryPresentText: {
    color: "#577762",
  },

  summaryAbsentText: {
    color: colors.danger,
  },

  summaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: spacing.xs,
    textTransform: "uppercase",
  },

  attendanceCard: {
    padding: spacing.lg,
  },

  sectionHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  sectionHeadingText: {
    flex: 1,
    minWidth: 220,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.primary,
  },

  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },

  bulkAttendanceActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  bulkAction: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },

  bulkActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.secondary,
  },

  roster: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },

  rosterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },

  rosterRowLast: {
    borderBottomWidth: 0,
  },

  studentIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 170,
  },

  studentAvatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  studentAvatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },

  studentName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  attendanceStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    minWidth: 92,
    justifyContent: "center",
  },

  presentStatus: {
    backgroundColor: "#EDF4EF",
  },

  absentStatus: {
    backgroundColor: "#FFF0EC",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    marginRight: 6,
  },

  attendanceStatusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  rosterEmpty: {
    padding: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  rosterEmptyTitle: {
    ...typography.bodyBold,
    color: colors.primary,
    textAlign: "center",
  },

  rosterEmptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  attendanceFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
  },

  attendanceFooterText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  liveQuestionsCard: {
    padding: spacing.lg,
  },

  liveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  liveCountBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  liveCountText: {
    fontWeight: "800",
    color: colors.primary,
  },

  inlineError: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },

  questionComposer: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  questionPromptInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    padding: spacing.sm,
    fontSize: 14,
    textAlignVertical: "top",
  },

  questionComposerFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  marksField: {
    minWidth: 110,
  },

  marksLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },

  marksInput: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
  },

  questionsEmpty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },

  questionsEmptyTitle: {
    ...typography.bodyBold,
    color: colors.primary,
    textAlign: "center",
  },

  questionsEmptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  questionList: {
    gap: spacing.sm,
  },

  questionItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },

  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.white,
  },

  questionNumber: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  questionNumberText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.white,
  },

  questionHeading: {
    flex: 1,
  },

  questionPrompt: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  questionMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  questionChevron: {
    color: colors.primary,
    marginLeft: spacing.sm,
  },

  answerSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "#FCFBF9",
    padding: spacing.sm,
  },

  noAnswersText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    padding: spacing.md,
  },

  answerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  answerStudent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 190,
  },

  answerAvatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  answerAvatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  answerStudentName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  answerOpenText: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
  },

  gradeControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  gradeInput: {
    width: 72,
    minHeight: 38,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    color: colors.textPrimary,
    fontSize: 12,
  },

  gradeButton: {
    minHeight: 38,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },

  emptyPageCard: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  emptyPageIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  emptyPageIconText: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.secondary,
  },

  emptyPageTitle: {
    ...typography.h2,
    color: colors.primary,
    textAlign: "center",
  },

  emptyPageText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 440,
    lineHeight: 22,
    marginTop: spacing.xs,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 60, 73, 0.48)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },

  formModal: {
    width: "100%",
    maxWidth: 520,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },

  modalHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },

  modalHeadingText: {
    flex: 1,
    paddingRight: spacing.md,
  },

  modalEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.secondary,
  },

  modalTitle: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.xs,
  },

  modalSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: spacing.xs,
  },

  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  modalCloseText: {
    fontSize: 22,
    lineHeight: 24,
    color: colors.textMuted,
  },

  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  modalActionButton: {
    minWidth: 130,
  },

  formError: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },

  deleteModal: {
    width: "100%",
    maxWidth: 470,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.lg,
    alignItems: "center",
  },

  deleteIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: "#FFF0EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  deleteIconText: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.danger,
  },

  deleteTitle: {
    ...typography.h2,
    color: colors.primary,
    textAlign: "center",
  },

  deleteMessage: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginTop: spacing.sm,
  },

  deleteWarning: {
    width: "100%",
    borderRadius: radius.md,
    backgroundColor: "#FFF4F1",
    borderWidth: 1,
    borderColor: "#F0D7D0",
    padding: spacing.md,
    marginTop: spacing.md,
  },

  deleteWarningText: {
    ...typography.caption,
    color: colors.danger,
    lineHeight: 19,
    textAlign: "center",
  },

  studentSessionTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  studentSessionTab: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 150,
  },

  studentSessionTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  studentSessionTabTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  studentSessionTabDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  studentSessionHero: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  studentHeroEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#B7CDC8",
  },

  studentHeroTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
    color: colors.white,
    marginTop: spacing.xs,
  },

  studentHeroDate: {
    ...typography.body,
    color: "#D8E4E1",
    marginTop: spacing.sm,
  },

  studentQuestionsHeading: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.md,
  },

  studentQuestionCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },

  studentQuestionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  studentQuestionHeading: {
    flex: 1,
  },

  studentQuestionPrompt: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  studentQuestionMarks: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  studentAnswerStatus: {
    marginTop: spacing.md,
    alignItems: "flex-start",
  },

  studentUploadButton: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
  },
});