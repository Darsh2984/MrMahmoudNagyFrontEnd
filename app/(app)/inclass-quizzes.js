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
import { DatePickerInput } from "../../src/components/ui/DatePickerInput";

import api from "../../src/lib/api";
import { formatDate } from "../../src/utils/formatDate";

import {
  colors,
  spacing,
  radius,
  typography,
} from "../../src/theme";

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    fallback
  );
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "S";
}

export default function InClassQuizzes() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 980;
  const isSmallScreen = width < 640;

  const [years, setYears] = useState([]);
  const [yearId, setYearId] = useState(null);

  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState(null);

  const [studentNames, setStudentNames] = useState({});
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [gradeInputs, setGradeInputs] = useState({});

  const [quizName, setQuizName] = useState("");
  const [date, setDate] = useState("");
  const [gradeOutOf, setGradeOutOf] = useState("20");

  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [updatingQuiz, setUpdatingQuiz] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState(false);
  const [savingGrades, setSavingGrades] = useState(false);

  const [createModalVisible, setCreateModalVisible] =
    useState(false);

  const [editModalVisible, setEditModalVisible] =
    useState(false);

  const [deleteModalVisible, setDeleteModalVisible] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedYear = useMemo(() => {
    return years.find((year) => year.id === yearId) || null;
  }, [years, yearId]);

  const currentGroup = useMemo(() => {
    return groups.find((group) => group.id === groupId) || null;
  }, [groups, groupId]);

  const studentGrades = useMemo(() => {
    return Array.isArray(selectedQuiz?.studentGrades)
      ? selectedQuiz.studentGrades
      : [];
  }, [selectedQuiz]);

  const gradingSummary = useMemo(() => {
    return studentGrades.reduce(
      (summary, studentGrade) => {
        if (studentGrade.grade == null) {
          summary.ungraded += 1;
        } else {
          summary.graded += 1;
        }

        return summary;
      },
      {
        total: studentGrades.length,
        graded: 0,
        ungraded: 0,
      },
    );
  }, [studentGrades]);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const resetForm = useCallback(() => {
    setQuizName("");
    setDate("");
    setGradeOutOf("20");
  }, []);

  const loadYears = useCallback(async () => {
    setLoadingYears(true);
    setError("");

    try {
      const response = await api.get("/years/mine");

      const loadedYears = Array.isArray(response.data)
        ? response.data
        : [];

      setYears(loadedYears);

      setYearId((currentId) => {
        const currentStillExists = loadedYears.some(
          (year) => year.id === currentId,
        );

        if (currentStillExists) {
          return currentId;
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

  const loadGroups = useCallback(async (selectedYearId) => {
    if (!selectedYearId) {
      setGroups([]);
      setGroupId(null);
      return;
    }

    setLoadingGroups(true);
    setError("");

    try {
      const response = await api.get(
        `/groups/year/${selectedYearId}`,
      );

      const loadedGroups = Array.isArray(response.data)
        ? response.data
        : [];

      setGroups(loadedGroups);

      setGroupId((currentId) => {
        const currentStillExists = loadedGroups.some(
          (group) => group.id === currentId,
        );

        if (currentStillExists) {
          return currentId;
        }

        return loadedGroups[0]?.id || null;
      });
    } catch (requestError) {
      setGroups([]);
      setGroupId(null);

      setError(
        getErrorMessage(
          requestError,
          "Couldn't load groups.",
        ),
      );
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const loadQuizzes = useCallback(async (selectedGroupId) => {
    if (!selectedGroupId) {
      setQuizzes([]);
      setSelectedQuiz(null);
      setStudentNames({});
      return;
    }

    setLoadingQuizzes(true);
    setError("");

    try {
      const [quizzesResponse, groupResponse] =
        await Promise.all([
          api.get(`/inclassquiz/${selectedGroupId}`),
          api.get(`/groups/${selectedGroupId}`),
        ]);

      const loadedQuizzes = Array.isArray(
        quizzesResponse.data,
      )
        ? quizzesResponse.data
        : [];

      const names = {};

      const members = Array.isArray(
        groupResponse.data?.members,
      )
        ? groupResponse.data.members
        : [];

      members.forEach((membership) => {
        if (membership.student?.id) {
          names[membership.student.id] =
            membership.student.name;
        }
      });

      setQuizzes(loadedQuizzes);
      setStudentNames(names);

      setSelectedQuiz((currentQuiz) => {
        if (!currentQuiz) return null;

        return (
          loadedQuizzes.find(
            (quiz) => quiz.id === currentQuiz.id,
          ) || null
        );
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't load in-class quizzes.",
        ),
      );
    } finally {
      setLoadingQuizzes(false);
    }
  }, []);

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  useEffect(() => {
    if (yearId) {
      setSelectedQuiz(null);
      setGradeInputs({});
      loadGroups(yearId);
    }
  }, [yearId, loadGroups]);

  useEffect(() => {
    if (groupId) {
      setSelectedQuiz(null);
      setGradeInputs({});
      loadQuizzes(groupId);
    } else {
      setQuizzes([]);
      setSelectedQuiz(null);
    }
  }, [groupId, loadQuizzes]);

  function selectYear(selectedYearId) {
    if (selectedYearId === yearId) return;

    clearMessages();
    setYearId(selectedYearId);
  }

  function selectGroup(selectedGroupId) {
    if (selectedGroupId === groupId) return;

    clearMessages();
    setGroupId(selectedGroupId);
  }

  function selectQuiz(quiz) {
    clearMessages();
    setSelectedQuiz(quiz);

    const inputs = {};

    const grades = Array.isArray(quiz.studentGrades)
      ? quiz.studentGrades
      : [];

    grades.forEach((studentGrade) => {
      inputs[studentGrade.studentId] =
        studentGrade.grade != null
          ? String(studentGrade.grade)
          : "";
    });

    setGradeInputs(inputs);
  }

  function validateQuizForm() {
    const numericGrade = Number(gradeOutOf);

    if (!quizName.trim()) {
      return "Quiz name is required.";
    }

    if (!date.trim()) {
      return "Quiz date is required.";
    }

    if (!groupId) {
      return "Select a group first.";
    }

    if (
      !gradeOutOf.trim() ||
      !Number.isFinite(numericGrade) ||
      numericGrade <= 0
    ) {
      return "Grade out of must be greater than zero.";
    }

    return "";
  }

  function openCreateModal() {
    clearMessages();

    if (!groupId) {
      setError("Select an academic year and group before creating a quiz.");
      return;
    }

    resetForm();
    setCreateModalVisible(true);
  }

  function closeCreateModal() {
    if (creatingQuiz) return;

    setCreateModalVisible(false);
    resetForm();
  }

  function openEditModal() {
    if (!selectedQuiz) return;

    clearMessages();

    setQuizName(selectedQuiz.quizName || "");
    setDate(
      selectedQuiz.date
        ? selectedQuiz.date.slice(0, 10)
        : "",
    );

    setGradeOutOf(
      String(selectedQuiz.gradeOutOf ?? "20"),
    );

    setEditModalVisible(true);
  }

  function closeEditModal() {
    if (updatingQuiz) return;

    setEditModalVisible(false);
    resetForm();
  }

  async function handleCreate() {
    const validationError = validateQuizForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setCreatingQuiz(true);
    setError("");

    try {
      await api.post("/inclassquiz", {
        yearId,
        groupId,
        quizName: quizName.trim(),
        date: date.trim(),
        gradeOutOf: Number(gradeOutOf),
      });

      setCreateModalVisible(false);
      resetForm();

      setSuccess("In-class quiz created successfully.");

      await loadQuizzes(groupId);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't create the quiz.",
        ),
      );
    } finally {
      setCreatingQuiz(false);
    }
  }

  async function handleUpdate() {
    if (!selectedQuiz) return;

    const validationError = validateQuizForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setUpdatingQuiz(true);
    setError("");

    try {
      await api.put(
        `/inclassquiz/${selectedQuiz.id}`,
        {
          quizName: quizName.trim(),
          date: date.trim(),
          gradeOutOf: Number(gradeOutOf),
        },
      );

      setEditModalVisible(false);
      resetForm();
      setSuccess("Quiz updated successfully.");

      await loadQuizzes(groupId);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't update the quiz.",
        ),
      );
    } finally {
      setUpdatingQuiz(false);
    }
  }

  async function handleDelete() {
    if (!selectedQuiz) return;

    setDeletingQuiz(true);
    setError("");

    try {
      await api.delete(
        `/inclassquiz/${selectedQuiz.id}`,
      );

      setDeleteModalVisible(false);
      setSelectedQuiz(null);
      setGradeInputs({});
      setSuccess("Quiz deleted successfully.");

      await loadQuizzes(groupId);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't delete the quiz.",
        ),
      );
    } finally {
      setDeletingQuiz(false);
    }
  }

  function validateGrades() {
    const maximumGrade = Number(selectedQuiz?.gradeOutOf);

    for (const [studentId, value] of Object.entries(
      gradeInputs,
    )) {
      const trimmed = value.trim();

      if (trimmed === "") continue;

      const numericGrade = Number(trimmed);

      if (!Number.isFinite(numericGrade)) {
        return `Enter a valid grade for ${
          studentNames[studentId] || "the student"
        }.`;
      }

      if (numericGrade < 0) {
        return "Grades cannot be negative.";
      }

      if (numericGrade > maximumGrade) {
        return `Grades cannot exceed ${maximumGrade}.`;
      }
    }

    return "";
  }

  async function saveGrades() {
    if (!selectedQuiz) return;

    const validationError = validateGrades();

    if (validationError) {
      setError(validationError);
      return;
    }

    const maximumGrade = Number(
      selectedQuiz.gradeOutOf,
    );

    const studentGrades = Object.entries(
      gradeInputs,
    ).map(([studentId, value]) => {
      const trimmed = value.trim();

      if (trimmed === "") {
        return {
          studentId,
          grade: null,
          percentage: null,
          letterGrade: "",
        };
      }

      const numericGrade = Number(trimmed);

      return {
        studentId,
        grade: numericGrade,
        percentage: Math.round(
          (numericGrade / maximumGrade) * 100,
        ),
        letterGrade: "",
      };
    });

    setSavingGrades(true);
    setError("");

    try {
      await api.put(
        `/inclassquiz/${selectedQuiz.id}/grades`,
        {
          studentGrades,
        },
      );

      setSuccess("Grades saved successfully.");

      await loadQuizzes(groupId);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't save the grades.",
        ),
      );
    } finally {
      setSavingGrades(false);
    }
  }

  function renderYearSelector() {
    if (!years.length) {
      return (
        <Card style={styles.emptySelectorCard}>
          <Ionicons
            name="school-outline"
            size={26}
            color={colors.primary}
          />

          <View style={styles.emptySelectorText}>
            <Text style={styles.emptySelectorTitle}>
              No academic years found
            </Text>

            <Text style={styles.mutedText}>
              Create an academic year before creating quizzes.
            </Text>
          </View>
        </Card>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorList}
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

  function renderGroupSelector() {
    if (loadingGroups) {
      return (
        <View style={styles.selectorLoading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>
            Loading groups…
          </Text>
        </View>
      );
    }

    if (!groups.length) {
      return (
        <View style={styles.noGroupsBox}>
          <Ionicons
            name="people-outline"
            size={25}
            color={colors.textMuted}
          />

          <Text style={styles.noGroupsText}>
            This academic year has no groups yet.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorList}
      >
        {groups.map((group) => {
          const active = group.id === groupId;

          return (
            <Pressable
              key={group.id}
              onPress={() => selectGroup(group.id)}
              style={({ pressed }) => [
                styles.groupChip,
                active && styles.groupChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  active ? "people" : "people-outline"
                }
                size={16}
                color={
                  active ? colors.white : colors.primary
                }
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.groupChipText,
                  active && styles.groupChipTextActive,
                ]}
              >
                {group.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  function renderQuizList() {
    if (loadingQuizzes) {
      return (
        <Card style={styles.loadingCard}>
          <ActivityIndicator
            color={colors.primary}
            size="large"
          />

          <Text style={styles.loadingText}>
            Loading quizzes…
          </Text>
        </Card>
      );
    }

    if (!quizzes.length) {
      return (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="document-text-outline"
              size={34}
              color={colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No quizzes yet
          </Text>

          <Text style={styles.emptyDescription}>
            Create the first in-class quiz for{" "}
            {currentGroup?.name || "this group"}.
          </Text>

          <Button
            title="Create quiz"
            variant="warning"
            onPress={openCreateModal}
            disabled={!groupId}
          />
        </Card>
      );
    }

    return (
      <View style={styles.quizList}>
        {quizzes.map((quiz) => {
          const active = selectedQuiz?.id === quiz.id;

          const grades = Array.isArray(
            quiz.studentGrades,
          )
            ? quiz.studentGrades
            : [];

          const gradedCount = grades.filter(
            (studentGrade) =>
              studentGrade.grade != null,
          ).length;

          return (
            <Pressable
              key={quiz.id}
              onPress={() => selectQuiz(quiz)}
              style={({ pressed }) => [
                pressed && styles.pressed,
              ]}
            >
              <Card
                style={[
                  styles.quizCard,
                  active && styles.quizCardActive,
                ]}
              >
                <View
                  style={[
                    styles.quizIcon,
                    active && styles.quizIconActive,
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={
                      active
                        ? colors.white
                        : colors.primary
                    }
                  />
                </View>

                <View style={styles.quizCardText}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.quizName,
                      active && styles.quizNameActive,
                    ]}
                  >
                    {quiz.quizName}
                  </Text>

                  <Text
                    style={[
                      styles.quizMeta,
                      active && styles.quizMetaActive,
                    ]}
                  >
                    {formatDate(quiz.date)} · Out of{" "}
                    {quiz.gradeOutOf}
                  </Text>

                  <Text
                    style={[
                      styles.quizProgress,
                      active &&
                        styles.quizProgressActive,
                    ]}
                  >
                    {gradedCount} of {grades.length} graded
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={
                    active ? colors.white : colors.primary
                  }
                />
              </Card>
            </Pressable>
          );
        })}
      </View>
    );
  }

  function renderGradeRoster() {
    if (!selectedQuiz) {
      return (
        <Card style={styles.selectQuizCard}>
          <View style={styles.selectQuizIcon}>
            <Ionicons
              name="reader-outline"
              size={42}
              color={colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Select a quiz
          </Text>

          <Text style={styles.emptyDescription}>
            Choose a quiz from the list to enter or update
            student grades.
          </Text>
        </Card>
      );
    }

    return (
      <Card style={styles.rosterCard}>
        <View
          style={[
            styles.rosterHeader,
            isSmallScreen && styles.rosterHeaderSmall,
          ]}
        >
          <View style={styles.rosterTitleBlock}>
            <Text style={styles.sectionLabel}>
              SELECTED QUIZ
            </Text>

            <Text style={styles.rosterTitle}>
              {selectedQuiz.quizName}
            </Text>

            <View style={styles.rosterMetaRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.textMuted}
              />

              <Text style={styles.rosterMeta}>
                {formatDate(selectedQuiz.date)}
              </Text>

              <Text style={styles.rosterMetaDot}>·</Text>

              <Text style={styles.rosterMeta}>
                Out of {selectedQuiz.gradeOutOf}
              </Text>
            </View>
          </View>

          <View style={styles.rosterActions}>
            <Pressable
              onPress={openEditModal}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="create-outline"
                size={19}
                color={colors.primary}
              />
            </Pressable>

            <Pressable
              onPress={() =>
                setDeleteModalVisible(true)
              }
              style={({ pressed }) => [
                styles.deleteIconButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={19}
                color={colors.danger}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {gradingSummary.total}
            </Text>
            <Text style={styles.summaryLabel}>
              Students
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {gradingSummary.graded}
            </Text>
            <Text style={styles.summaryLabel}>
              Graded
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {gradingSummary.ungraded}
            </Text>
            <Text style={styles.summaryLabel}>
              Pending
            </Text>
          </View>
        </View>

        <View style={styles.rosterSectionHeader}>
          <View>
            <Text style={styles.rosterSectionTitle}>
              Grade entry
            </Text>

            <Text style={styles.rosterSectionSubtitle}>
              Enter marks from 0 to{" "}
              {selectedQuiz.gradeOutOf}.
            </Text>
          </View>
        </View>

        {!studentGrades.length ? (
          <View style={styles.emptyRoster}>
            <Ionicons
              name="people-outline"
              size={32}
              color={colors.primary}
            />

            <Text style={styles.emptyRosterTitle}>
              No students found
            </Text>

            <Text style={styles.mutedText}>
              This quiz does not currently contain student
              grade rows.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.rosterScroll}
            contentContainerStyle={styles.rosterList}
            nestedScrollEnabled
          >
            {studentGrades.map(
              (studentGrade, index) => {
                const studentName =
                  studentNames[
                    studentGrade.studentId
                  ] || studentGrade.studentId;

                const gradeValue =
                  gradeInputs[
                    studentGrade.studentId
                  ] ?? "";

                const hasGrade =
                  gradeValue.trim() !== "";

                return (
                  <View
                    key={studentGrade.studentId}
                    style={[
                      styles.studentRow,
                      index ===
                        studentGrades.length - 1 &&
                        styles.studentRowLast,
                    ]}
                  >
                    <View style={styles.studentAvatar}>
                      <Text
                        style={styles.studentAvatarText}
                      >
                        {getInitial(studentName)}
                      </Text>
                    </View>

                    <View style={styles.studentInfo}>
                      <Text
                        numberOfLines={1}
                        style={styles.studentName}
                      >
                        {studentName}
                      </Text>

                      <Text style={styles.studentStatus}>
                        {hasGrade
                          ? "Grade entered"
                          : "Awaiting grade"}
                      </Text>
                    </View>

                    <View style={styles.gradeInputWrapper}>
                      <TextInput
                        value={gradeValue}
                        onChangeText={(value) =>
                          setGradeInputs(
                            (currentInputs) => ({
                              ...currentInputs,
                              [studentGrade.studentId]:
                                value,
                            }),
                          )
                        }
                        placeholder="—"
                        keyboardType="numeric"
                        placeholderTextColor={
                          colors.textMuted
                        }
                        style={styles.gradeInput}
                      />

                      <View style={styles.gradeSuffix}>
                        <Text
                          style={styles.gradeSuffixText}
                        >
                          / {selectedQuiz.gradeOutOf}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              },
            )}
          </ScrollView>
        )}

        <View style={styles.saveBar}>
          <View style={styles.saveBarText}>
            <Text style={styles.saveBarTitle}>
              Save grade changes
            </Text>

            <Text style={styles.saveBarSubtitle}>
              Blank values will remain ungraded.
            </Text>
          </View>

          <Button
            title="Save grades"
            variant="warning"
            onPress={saveGrades}
            loading={savingGrades}
            disabled={!studentGrades.length}
          />
        </View>
      </Card>
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
          Loading in-class quizzes…
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
                  name="reader-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.eyebrow}>
                IN-CLASS ASSESSMENT
              </Text>
            </View>

            <Text style={styles.pageTitle}>
              In-class quizzes
            </Text>

            <Text style={styles.pageSubtitle}>
              Create quick classroom quizzes, record marks,
              and manage student grades by academic group.
            </Text>
          </View>

          <Button
            title="Create quiz"
            variant="warning"
            onPress={openCreateModal}
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
                name="document-text-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {quizzes.length}
            </Text>

            <Text style={styles.statLabel}>
              Quizzes in selected group
            </Text>
          </Card>
        </View>

        <Card style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <View>
              <Text style={styles.sectionLabel}>
                ACADEMIC YEAR
              </Text>

              <Text style={styles.selectorTitle}>
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

          <View style={styles.selectorDivider} />

          <View style={styles.selectorHeader}>
            <View>
              <Text style={styles.sectionLabel}>
                GROUP
              </Text>

              <Text style={styles.selectorTitle}>
                {currentGroup?.name || "Select a group"}
              </Text>
            </View>

            <Ionicons
              name="people-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          {renderGroupSelector()}
        </Card>

        {!groups.length ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="people-outline"
                size={35}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No groups available
            </Text>

            <Text style={styles.emptyDescription}>
              Create a group in the Groups page before adding
              an in-class quiz.
            </Text>
          </Card>
        ) : (
          <View
            style={[
              styles.workspace,
              isDesktop && styles.workspaceDesktop,
            ]}
          >
            <View
              style={[
                styles.quizColumn,
                isDesktop && styles.quizColumnDesktop,
              ]}
            >
              <View style={styles.columnHeader}>
                <View>
                  <Text style={styles.columnTitle}>
                    Quizzes
                  </Text>

                  <Text style={styles.columnSubtitle}>
                    {currentGroup?.name ||
                      "No group selected"}
                  </Text>
                </View>

                <Pressable
                  onPress={openCreateModal}
                  style={({ pressed }) => [
                    styles.addIconButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={22}
                    color={colors.primary}
                  />
                </Pressable>
              </View>

              {renderQuizList()}
            </View>

            <View style={styles.rosterColumn}>
              {renderGradeRoster()}
            </View>
          </View>
        )}
      </View>

      <QuizFormModal
        visible={createModalVisible}
        title="Create in-class quiz"
        subtitle={`Add a quiz for ${
          currentGroup?.name || "the selected group"
        }.`}
        quizName={quizName}
        setQuizName={setQuizName}
        date={date}
        setDate={setDate}
        gradeOutOf={gradeOutOf}
        setGradeOutOf={setGradeOutOf}
        submitTitle="Create quiz"
        loading={creatingQuiz}
        onSubmit={handleCreate}
        onClose={closeCreateModal}
        isSmallScreen={isSmallScreen}
      />

      <QuizFormModal
        visible={editModalVisible}
        title="Edit quiz"
        subtitle="Update the quiz name, date, or maximum grade."
        quizName={quizName}
        setQuizName={setQuizName}
        date={date}
        setDate={setDate}
        gradeOutOf={gradeOutOf}
        setGradeOutOf={setGradeOutOf}
        submitTitle="Save changes"
        loading={updatingQuiz}
        onSubmit={handleUpdate}
        onClose={closeEditModal}
        isSmallScreen={isSmallScreen}
      />

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deletingQuiz) {
            setDeleteModalVisible(false);
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (!deletingQuiz) {
                setDeleteModalVisible(false);
              }
            }}
          />

          <View style={styles.confirmCard}>
            <View style={styles.dangerIcon}>
              <Ionicons
                name="trash-outline"
                size={29}
                color={colors.danger}
              />
            </View>

            <Text style={styles.confirmTitle}>
              Delete quiz?
            </Text>

            <Text style={styles.confirmText}>
              “{selectedQuiz?.quizName}” and its saved grade
              records will be permanently deleted.
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() =>
                  setDeleteModalVisible(false)
                }
                disabled={deletingQuiz}
              />

              <Button
                title="Delete quiz"
                variant="danger"
                onPress={handleDelete}
                loading={deletingQuiz}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function QuizFormModal({
  visible,
  title,
  subtitle,
  quizName,
  setQuizName,
  date,
  setDate,
  gradeOutOf,
  setGradeOutOf,
  submitTitle,
  loading,
  onSubmit,
  onClose,
  isSmallScreen,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIcon}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.modalHeadingCopy}>
              <Text style={styles.modalTitle}>
                {title}
              </Text>

              <Text style={styles.mutedText}>
                {subtitle}
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Close"
              disabled={loading}
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalClose,
                loading && styles.disabled,
                pressed && !loading && styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={22}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>
            Quiz name
          </Text>

          <TextInput
            autoFocus
            value={quizName}
            onChangeText={setQuizName}
            placeholder="e.g. Algebra Quiz 1"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <View
            style={[
              styles.formRow,
              isSmallScreen && styles.formRowSmall,
            ]}
          >
            <View style={styles.formField}>
              <Text style={styles.inputLabel}>
                Quiz date
              </Text>

              <DatePickerInput
                value={date}
                onChange={setDate}
                placeholder="Select quiz date"
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
                placeholder="20"
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              disabled={loading}
            />

            <Button
              title={submitTitle}
              variant="warning"
              onPress={onSubmit}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
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

  selectorCard: {
    marginBottom: spacing.lg,
  },

  selectorHeader: {
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

  selectorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  selectorDivider: {
    height: 1,
    marginVertical: spacing.lg,
    backgroundColor: colors.background,
  },

  selectorList: {
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

  groupChip: {
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

  groupChipActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
  },

  groupChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  groupChipTextActive: {
    color: colors.white,
  },

  emptySelectorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.background,
  },

  emptySelectorText: {
    flex: 1,
  },

  emptySelectorTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  selectorLoading: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  noGroupsBox: {
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  noGroupsText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },

  workspace: {
    gap: spacing.lg,
  },

  workspaceDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  quizColumn: {
    width: "100%",
  },

  quizColumnDesktop: {
    width: 390,
  },

  rosterColumn: {
    flex: 1,
    minWidth: 0,
  },

  columnHeader: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  columnTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  columnSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  addIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  quizList: {
    gap: spacing.sm,
  },

  quizCard: {
    minHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  quizCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  quizIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  quizIconActive: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  quizCardText: {
    flex: 1,
    minWidth: 0,
  },

  quizName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },

  quizNameActive: {
    color: colors.white,
  },

  quizMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 3,
  },

  quizMetaActive: {
    color: "#C9D6D3",
  },

  quizProgress: {
    fontSize: 11,
    color: colors.textMuted,
  },

  quizProgressActive: {
    color: "#C9D6D3",
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
    width: 70,
    height: 70,
    borderRadius: 35,
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
    maxWidth: 430,
    color: colors.textMuted,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  selectQuizCard: {
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  selectQuizIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: `${colors.secondary}22`,
  },

  rosterCard: {
    minHeight: 480,
  },

  rosterHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  rosterHeaderSmall: {
    flexDirection: "column",
  },

  rosterTitleBlock: {
    flex: 1,
  },

  rosterTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 5,
  },

  rosterMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  rosterMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },

  rosterMetaDot: {
    fontSize: 12,
    color: colors.textMuted,
  },

  rosterActions: {
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

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: colors.border,
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  rosterSectionHeader: {
    marginBottom: spacing.sm,
  },

  rosterSectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  rosterSectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  rosterScroll: {
    maxHeight: 480,
  },

  rosterList: {
    paddingBottom: spacing.sm,
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },

  studentRowLast: {
    borderBottomWidth: 0,
  },

  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  studentAvatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },

  studentInfo: {
    flex: 1,
    minWidth: 0,
  },

  studentName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  studentStatus: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },

  gradeInputWrapper: {
    width: 130,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  gradeInput: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: spacing.sm,
    color: colors.textPrimary,
    fontSize: 14,
    textAlign: "center",
  },

  gradeSuffix: {
    paddingHorizontal: spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },

  gradeSuffixText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },

  emptyRoster: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },

  emptyRosterTitle: {
    marginTop: spacing.sm,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  saveBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },

  saveBarText: {
    flex: 1,
    minWidth: 190,
  },

  saveBarTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  saveBarSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  mutedText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
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

  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
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

  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  confirmCard: {
    width: "100%",
    maxWidth: 460,
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

  dangerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
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