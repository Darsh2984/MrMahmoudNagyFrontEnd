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
import { useRouter } from "expo-router";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";

import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/lib/api";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    fallback
  );
}

function getQuestionType(question) {
  return question.type || "QUESTION";
}

function getQuestionTitle(question, index) {
  return (
    question.title ||
    question.name ||
    question.questionText ||
    `${getQuestionType(question)} question ${index + 1}`
  );
}

function TeacherQuizManager() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 980;
  const isSmallScreen = width < 640;

  const [years, setYears] = useState([]);
  const [yearId, setYearId] = useState(null);

  const [groups, setGroups] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30");

  const [selectedGroupIds, setSelectedGroupIds] =
    useState([]);

  const [selectedQuestionIds, setSelectedQuestionIds] =
    useState([]);

  const [questionSearch, setQuestionSearch] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] =
    useState("ALL");

  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  const [createModalVisible, setCreateModalVisible] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedYear = useMemo(() => {
    return years.find((year) => year.id === yearId) || null;
  }, [years, yearId]);

  const questionTypes = useMemo(() => {
    const types = new Set(
      questions
        .map((question) => question.type)
        .filter(Boolean),
    );

    return ["ALL", ...Array.from(types)];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const search = questionSearch.trim().toLowerCase();

    return questions.filter((question, index) => {
      const matchesType =
        questionTypeFilter === "ALL" ||
        question.type === questionTypeFilter;

      const titleText = getQuestionTitle(
        question,
        index,
      ).toLowerCase();

      const matchesSearch =
        !search ||
        titleText.includes(search) ||
        question.type?.toLowerCase().includes(search);

      return matchesType && matchesSearch;
    });
  }, [
    questions,
    questionSearch,
    questionTypeFilter,
  ]);

  const totalAssignedGroups = useMemo(() => {
    const groupIds = new Set();

    quizzes.forEach((quiz) => {
      quiz.groups?.forEach((quizGroup) => {
        const id = quizGroup.group?.id || quizGroup.groupId;

        if (id) {
          groupIds.add(id);
        }
      });
    });

    return groupIds.size;
  }, [quizzes]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        yearsResponse,
        questionsResponse,
        quizzesResponse,
      ] = await Promise.all([
        api.get("/years/mine"),
        api.get("/questions"),
        api.get("/quiz/teacher"),
      ]);

      const loadedYears = Array.isArray(
        yearsResponse.data,
      )
        ? yearsResponse.data
        : [];

      setYears(loadedYears);

      setQuestions(
        Array.isArray(questionsResponse.data)
          ? questionsResponse.data
          : [],
      );

      setQuizzes(
        Array.isArray(quizzesResponse.data)
          ? quizzesResponse.data
          : [],
      );

      setYearId(loadedYears[0]?.id || null);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't load quiz management data.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGroups = useCallback(async (selectedYearId) => {
    if (!selectedYearId) {
      setGroups([]);
      return;
    }

    setLoadingGroups(true);
    setError("");

    try {
      const response = await api.get(
        `/groups/year/${selectedYearId}`,
      );

      setGroups(
        Array.isArray(response.data) ? response.data : [],
      );

      setSelectedGroupIds([]);
    } catch (requestError) {
      setGroups([]);

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

  const reloadQuizzes = useCallback(async () => {
    const response = await api.get("/quiz/teacher");

    setQuizzes(
      Array.isArray(response.data) ? response.data : [],
    );
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (yearId) {
      loadGroups(yearId);
    }
  }, [yearId, loadGroups]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setTitle("");
    setDuration("30");
    setSelectedGroupIds([]);
    setSelectedQuestionIds([]);
    setQuestionSearch("");
    setQuestionTypeFilter("ALL");
  }

  function selectYear(selectedYearId) {
    if (selectedYearId === yearId) return;

    clearMessages();
    setYearId(selectedYearId);
  }

  function toggleGroup(groupId) {
    setSelectedGroupIds((currentIds) => {
      if (currentIds.includes(groupId)) {
        return currentIds.filter((id) => id !== groupId);
      }

      return [...currentIds, groupId];
    });
  }

  function toggleQuestion(questionId) {
    setSelectedQuestionIds((currentIds) => {
      if (currentIds.includes(questionId)) {
        return currentIds.filter(
          (id) => id !== questionId,
        );
      }

      return [...currentIds, questionId];
    });
  }

  function selectAllGroups() {
    setSelectedGroupIds(
      groups.map((group) => group.id),
    );
  }

  function selectAllFilteredQuestions() {
    setSelectedQuestionIds((currentIds) => {
      const combined = new Set(currentIds);

      filteredQuestions.forEach((question) => {
        combined.add(question.id);
      });

      return Array.from(combined);
    });
  }

  function clearSelectedQuestions() {
    setSelectedQuestionIds([]);
  }

  function openCreateModal() {
    clearMessages();

    if (!yearId) {
      setError(
        "Select an academic year before creating a quiz.",
      );
      return;
    }

    if (!groups.length) {
      setError(
        "The selected academic year has no groups.",
      );
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

  function validateQuizForm() {
    const numericDuration = Number(duration);

    if (!title.trim()) {
      return "Quiz title is required.";
    }

    if (
      !Number.isFinite(numericDuration) ||
      numericDuration <= 0
    ) {
      return "Duration must be greater than zero.";
    }

    if (!selectedGroupIds.length) {
      return "Select at least one group.";
    }

    if (!selectedQuestionIds.length) {
      return "Select at least one question.";
    }

    return "";
  }

  async function handleCreateQuiz() {
    const validationError = validateQuizForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setCreatingQuiz(true);
    setError("");

    try {
      await api.post("/quiz", {
        title: title.trim(),
        duration: Number(duration),
        groupIds: selectedGroupIds,
        questionIds: selectedQuestionIds,
      });

      setCreateModalVisible(false);
      resetForm();

      setSuccess("Quiz created successfully.");

      await reloadQuizzes();
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

  function renderYearSelector() {
    if (!years.length) {
      return (
        <Card style={styles.emptySelectorCard}>
          <View style={styles.emptySelectorIcon}>
            <Ionicons
              name="school-outline"
              size={25}
              color={colors.primary}
            />
          </View>

          <View style={styles.emptySelectorCopy}>
            <Text style={styles.emptySelectorTitle}>
              No academic years
            </Text>

            <Text style={styles.mutedText}>
              Create an academic year before assigning quizzes.
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

  function renderQuizCard(quiz) {
    const assignedGroups = Array.isArray(quiz.groups)
      ? quiz.groups
      : [];

    const assignedQuestions =
      quiz.questions?.length ??
      quiz._count?.questions ??
      0;

    return (
      <Card key={quiz.id} style={styles.quizCard}>
        <View style={styles.quizCardHeader}>
          <View style={styles.quizIcon}>
            <Ionicons
              name="help-circle-outline"
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.quizCardCopy}>
            <Text
              numberOfLines={2}
              style={styles.quizTitle}
            >
              {quiz.title}
            </Text>

            <View style={styles.quizMetaRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.textMuted}
              />

              <Text style={styles.quizMeta}>
                {quiz.duration || 30} minutes
              </Text>

              {assignedQuestions ? (
                <>
                  <Text style={styles.quizMetaDot}>·</Text>

                  <Text style={styles.quizMeta}>
                    {assignedQuestions} questions
                  </Text>
                </>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.quizGroupsSection}>
          <Text style={styles.quizGroupsLabel}>
            Assigned groups
          </Text>

          <View style={styles.quizGroupBadges}>
            {assignedGroups.length ? (
              assignedGroups.map((quizGroup) => {
                const group =
                  quizGroup.group || quizGroup;

                return (
                  <Badge
                    key={
                      quizGroup.id ||
                      group.id ||
                      group.name
                    }
                    label={group.name || "Group"}
                    tone="neutral"
                  />
                );
              })
            ) : (
              <Text style={styles.noGroupText}>
                No groups listed
              </Text>
            )}
          </View>
        </View>
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
          Loading quiz management…
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
                  name="help-circle-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.eyebrow}>
                QUIZ MANAGEMENT
              </Text>
            </View>

            <Text style={styles.pageTitle}>
              Question-bank quizzes
            </Text>

            <Text style={styles.pageSubtitle}>
              Build quizzes from the question bank, assign
              them to groups, and manage student assessments.
            </Text>
          </View>

          <Button
            title="Create quiz"
            variant="warning"
            onPress={openCreateModal}
            disabled={!yearId || !groups.length}
          />
        </View>

        {error ? (
          <View style={[styles.alert, styles.errorAlert]}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text style={styles.errorText}>{error}</Text>

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
                name="help-circle-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {questions.length}
            </Text>

            <Text style={styles.statLabel}>
              Bank questions
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
              Existing quizzes
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
              {totalAssignedGroups}
            </Text>

            <Text style={styles.statLabel}>
              Assigned groups
            </Text>
          </Card>
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

        <View
          style={[
            styles.contentLayout,
            isDesktop && styles.contentLayoutDesktop,
          ]}
        >
          <View style={styles.quizColumn}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Existing quizzes
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {quizzes.length}{" "}
                  {quizzes.length === 1
                    ? "quiz"
                    : "quizzes"}
                </Text>
              </View>
            </View>

            {!quizzes.length ? (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="help-circle-outline"
                    size={35}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No quizzes yet
                </Text>

                <Text style={styles.emptyDescription}>
                  Create the first quiz using questions from
                  the question bank.
                </Text>

                <Button
                  title="Create quiz"
                  variant="warning"
                  onPress={openCreateModal}
                  disabled={!groups.length}
                />
              </Card>
            ) : (
              <View style={styles.quizList}>
                {quizzes.map(renderQuizCard)}
              </View>
            )}
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
                    Build a quiz
                  </Text>

                  <Text style={styles.mutedText}>
                    Choose groups and select questions from
                    the protected question bank.
                  </Text>
                </View>
              </View>

              <Button
                title="Create quiz"
                variant="warning"
                onPress={openCreateModal}
                disabled={!groups.length}
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
                Quiz workflow
              </Text>

              <Text style={styles.helpText}>
                MCQ responses can be graded automatically.
                Written answers remain available for manual
                grading after students submit their work.
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
                  name="help-circle-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View style={styles.modalHeadingCopy}>
                <Text style={styles.modalTitle}>
                  Create quiz
                </Text>

                <Text style={styles.mutedText}>
                  Assign groups and choose questions from the
                  question bank.
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Close"
                disabled={creatingQuiz}
                onPress={closeCreateModal}
                style={({ pressed }) => [
                  styles.modalClose,
                  creatingQuiz && styles.disabled,
                  pressed &&
                    !creatingQuiz &&
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
                Quiz title
              </Text>

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter quiz title"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>
                Duration in minutes
              </Text>

              <TextInput
                value={duration}
                onChangeText={setDuration}
                placeholder="30"
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <View style={styles.formSectionHeader}>
                <View>
                  <Text style={styles.inputLabel}>
                    Groups
                  </Text>

                  <Text style={styles.fieldHint}>
                    Select at least one target group.
                  </Text>
                </View>

                {groups.length ? (
                  <View style={styles.inlineActions}>
                    <Pressable onPress={selectAllGroups}>
                      <Text style={styles.inlineActionText}>
                        Select all
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        setSelectedGroupIds([])
                      }
                    >
                      <Text style={styles.inlineActionText}>
                        Clear
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>

              {loadingGroups ? (
                <View style={styles.inlineLoading}>
                  <ActivityIndicator
                    color={colors.primary}
                  />

                  <Text style={styles.loadingText}>
                    Loading groups…
                  </Text>
                </View>
              ) : !groups.length ? (
                <View style={styles.noGroupsBox}>
                  <Ionicons
                    name="people-outline"
                    size={26}
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

              <View style={styles.formSectionHeader}>
                <View>
                  <Text style={styles.inputLabel}>
                    Questions
                  </Text>

                  <Text style={styles.fieldHint}>
                    {selectedQuestionIds.length} selected
                  </Text>
                </View>

                <View style={styles.inlineActions}>
                  <Pressable
                    onPress={selectAllFilteredQuestions}
                  >
                    <Text style={styles.inlineActionText}>
                      Select visible
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={clearSelectedQuestions}
                  >
                    <Text style={styles.inlineActionText}>
                      Clear
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.searchBox}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={colors.textMuted}
                />

                <TextInput
                  value={questionSearch}
                  onChangeText={setQuestionSearch}
                  placeholder="Search questions"
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                  styles.questionTypeList
                }
              >
                {questionTypes.map((type) => {
                  const active =
                    questionTypeFilter === type;

                  return (
                    <Pressable
                      key={type}
                      onPress={() =>
                        setQuestionTypeFilter(type)
                      }
                      style={({ pressed }) => [
                        styles.typeChip,
                        active && styles.typeChipActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          active &&
                            styles.typeChipTextActive,
                        ]}
                      >
                        {type === "ALL" ? "All" : type}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {!filteredQuestions.length ? (
                <View style={styles.noQuestionsBox}>
                  <Ionicons
                    name="help-circle-outline"
                    size={30}
                    color={colors.primary}
                  />

                  <Text style={styles.noQuestionsTitle}>
                    No questions found
                  </Text>

                  <Text style={styles.mutedText}>
                    Adjust the search or question-type filter.
                  </Text>
                </View>
              ) : (
                <View style={styles.questionList}>
                  {filteredQuestions.map(
                    (question, index) => {
                      const selected =
                        selectedQuestionIds.includes(
                          question.id,
                        );

                      return (
                        <Pressable
                          key={question.id}
                          onPress={() =>
                            toggleQuestion(question.id)
                          }
                          style={({ pressed }) => [
                            styles.questionRow,
                            selected &&
                              styles.questionRowSelected,
                            pressed && styles.pressed,
                          ]}
                        >
                          <View
                            style={[
                              styles.questionCheck,
                              selected &&
                                styles.questionCheckSelected,
                            ]}
                          >
                            <Ionicons
                              name={
                                selected
                                  ? "checkmark"
                                  : "ellipse-outline"
                              }
                              size={17}
                              color={
                                selected
                                  ? colors.white
                                  : colors.primary
                              }
                            />
                          </View>

                          <View style={styles.questionCopy}>
                            <Text
                              numberOfLines={2}
                              style={styles.questionTitle}
                            >
                              {getQuestionTitle(
                                question,
                                index,
                              )}
                            </Text>

                            <Text
                              style={styles.questionMeta}
                            >
                              {getQuestionType(question)}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    },
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={closeCreateModal}
                disabled={creatingQuiz}
              />

              <Button
                title="Create quiz"
                variant="warning"
                onPress={handleCreateQuiz}
                loading={creatingQuiz}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function StudentQuizList() {
  const router = useRouter();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    return quizzes.reduce(
      (result, quiz) => {
        if (quiz.alreadySubmitted) {
          result.completed += 1;
        } else if (quiz.hasStarted) {
          result.inProgress += 1;
        } else {
          result.notStarted += 1;
        }

        return result;
      },
      {
        completed: 0,
        inProgress: 0,
        notStarted: 0,
      },
    );
  }, [quizzes]);

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        "/quiz-student/mine",
      );

      setQuizzes(
        Array.isArray(response.data) ? response.data : [],
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't load assigned quizzes.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  function renderStudentQuiz(quiz) {
    const completed = quiz.alreadySubmitted;
    const inProgress = quiz.hasStarted && !completed;

    const iconName = completed
      ? "checkmark-circle-outline"
      : inProgress
        ? "time-outline"
        : "play-circle-outline";

    const iconColor = completed
      ? colors.primary
      : inProgress
        ? colors.warning
        : colors.primary;

    return (
      <Pressable
        key={quiz.id}
        onPress={() =>
          router.push(`/(app)/quizzes/${quiz.id}`)
        }
        style={({ pressed }) => [
          pressed && styles.pressed,
        ]}
      >
        <Card style={styles.studentQuizCard}>
          <View
            style={[
              styles.studentQuizIcon,
              inProgress &&
                styles.studentQuizIconWarning,
            ]}
          >
            <Ionicons
              name={iconName}
              size={25}
              color={iconColor}
            />
          </View>

          <View style={styles.studentQuizCopy}>
            <Text
              numberOfLines={2}
              style={styles.studentQuizTitle}
            >
              {quiz.title}
            </Text>

            <View style={styles.studentQuizMetaRow}>
              <Ionicons
                name="help-circle-outline"
                size={14}
                color={colors.textMuted}
              />

              <Text style={styles.studentQuizMeta}>
                {quiz.total}{" "}
                {quiz.total === 1
                  ? "question"
                  : "questions"}
              </Text>

              {quiz.duration ? (
                <>
                  <Text
                    style={styles.studentQuizMetaDot}
                  >
                    ·
                  </Text>

                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={colors.textMuted}
                  />

                  <Text style={styles.studentQuizMeta}>
                    {quiz.duration} minutes
                  </Text>
                </>
              ) : null}
            </View>
          </View>

          <View style={styles.studentQuizStatus}>
            {completed ? (
              <Badge
                label={`Score: ${quiz.score}/${quiz.total}`}
                tone="success"
              />
            ) : inProgress ? (
              <Badge
                label="In progress"
                tone="warning"
              />
            ) : (
              <Badge
                label="Not started"
                tone="neutral"
              />
            )}

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.primary}
            />
          </View>
        </Card>
      </Pressable>
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
          Loading your quizzes…
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
                  name="help-circle-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.eyebrow}>
                MY ASSESSMENTS
              </Text>
            </View>

            <Text style={styles.pageTitle}>
              Quizzes
            </Text>

            <Text style={styles.pageSubtitle}>
              Review assigned quizzes, continue attempts, and
              view completed scores.
            </Text>
          </View>
        </View>

        {error ? (
          <View style={[styles.alert, styles.errorAlert]}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text style={styles.errorText}>{error}</Text>

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

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="documents-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {quizzes.length}
            </Text>

            <Text style={styles.statLabel}>
              Assigned quizzes
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {summary.completed}
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="time-outline"
                size={22}
                color={colors.warning}
              />
            </View>

            <Text style={styles.statValue}>
              {summary.inProgress}
            </Text>

            <Text style={styles.statLabel}>
              In progress
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="play-circle-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>
              {summary.notStarted}
            </Text>

            <Text style={styles.statLabel}>
              Not started
            </Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Assigned quizzes
            </Text>

            <Text style={styles.sectionSubtitle}>
              Select a quiz to start or continue.
            </Text>
          </View>
        </View>

        {!quizzes.length ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="help-circle-outline"
                size={35}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No quizzes assigned
            </Text>

            <Text style={styles.emptyDescription}>
              New quizzes will appear here when your teacher
              assigns them to your group.
            </Text>
          </Card>
        ) : (
          <View style={styles.studentQuizList}>
            {quizzes.map(renderStudentQuiz)}
          </View>
        )}
      </View>
    </Screen>
  );
}

export default function Quizzes() {
  const { user } = useAuth();

  if (user?.role === "STUDENT") {
    return <StudentQuizList />;
  }

  return <TeacherQuizManager />;
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
    marginBottom: spacing.lg,
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

  yearCard: {
    marginBottom: spacing.lg,
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

  emptySelectorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.background,
  },

  emptySelectorIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  emptySelectorCopy: {
    flex: 1,
  },

  emptySelectorTitle: {
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

  quizColumn: {
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
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.md,
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

  quizList: {
    gap: spacing.md,
  },

  quizCard: {
    gap: spacing.md,
  },

  quizCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },

  quizIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  quizCardCopy: {
    flex: 1,
    minWidth: 0,
  },

  quizTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 5,
  },

  quizMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5,
  },

  quizMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },

  quizMetaDot: {
    fontSize: 12,
    color: colors.textMuted,
  },

  quizGroupsSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },

  quizGroupsLabel: {
    marginBottom: spacing.sm,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.textMuted,
  },

  quizGroupBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },

  noGroupText: {
    fontSize: 12,
    color: colors.textMuted,
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
    maxWidth: 760,
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

  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  inlineActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  inlineLoading: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
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

  searchBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
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

  questionTypeList: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },

  typeChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.white,
  },

  typeChipActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
  },

  typeChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  typeChipTextActive: {
    color: colors.white,
  },

  questionList: {
    maxHeight: 360,
    gap: spacing.xs,
  },

  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },

  questionRowSelected: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}12`,
  },

  questionCheck: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  questionCheckSelected: {
    backgroundColor: colors.primary,
  },

  questionCopy: {
    flex: 1,
    minWidth: 0,
  },

  questionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  questionMeta: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },

  noQuestionsBox: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  noQuestionsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
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

  studentQuizList: {
    gap: spacing.md,
  },

  studentQuizCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  studentQuizIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  studentQuizIconWarning: {
    backgroundColor: `${colors.warning}15`,
  },

  studentQuizCopy: {
    flex: 1,
    minWidth: 0,
  },

  studentQuizTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 5,
  },

  studentQuizMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5,
  },

  studentQuizMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },

  studentQuizMetaDot: {
    fontSize: 12,
    color: colors.textMuted,
  },

  studentQuizStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  disabled: {
    opacity: 0.45,
  },

  pressed: {
    opacity: 0.76,
  },
});