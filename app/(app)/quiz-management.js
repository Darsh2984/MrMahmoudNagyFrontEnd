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
  Pressable,
  ScrollView,
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
import { DateTimePickerInput } from "../../src/components/ui/DateTimePickerInput";

import api from "../../src/lib/api";
import { colors } from "../../src/theme";

import { styles } from "./quiz-management.styles";

const STATUS_FILTERS = [
  "ALL",
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
];

const TYPE_FILTERS = [
  "ALL",
  "MCQ",
  "PAPER",
];

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getStatusTone(status) {
  switch (status) {
    case "PUBLISHED":
      return "success";

    case "CLOSED":
      return "danger";

    default:
      return "neutral";
  }
}

function getTypeLabel(type) {
  return type === "PAPER"
    ? "Paper quiz"
    : "MCQ quiz";
}

function formatDateTime(value) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString();
}

function getQuizGroups(quiz) {
  if (!Array.isArray(quiz?.groups)) {
    return [];
  }

  return quiz.groups
    .map((item) => item?.group || item)
    .filter(Boolean);
}

function getLinkedTopic(item) {
  return item?.topic || item;
}

function getQuestionTopics(question) {
  if (!Array.isArray(question?.topics)) {
    return [];
  }

  return question.topics
    .map(getLinkedTopic)
    .filter(Boolean);
}

function getQuestionLocation(question) {
  const firstTopic =
    getQuestionTopics(question)[0];

  if (!firstTopic) {
    return {
      unitName: "",
      chapterName: "",
      topicName: "",
    };
  }

  return {
    unitName:
      firstTopic.chapter?.unit?.name || "",

    chapterName:
      firstTopic.chapter?.name || "",

    topicName:
      firstTopic.name || "",
  };
}

function normalizeExistingQuizQuestions(quiz) {
  if (!Array.isArray(quiz?.questions)) {
    return [];
  }

  return [...quiz.questions]
    .sort(
      (first, second) =>
        Number(first.order || 0) -
        Number(second.order || 0)
    )
    .map((item) => ({
      questionId:
        item.questionId ||
        item.question?.id,

      points: String(
        item.points ??
          item.question?.points ??
          1
      ),

      question:
        item.question || item,
    }))
    .filter(
      (item) =>
        item.questionId &&
        item.question
    );
}

export default function QuizManagement() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1050;

  const [quizzes, setQuizzes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [
    processingQuizId,
    setProcessingQuizId,
  ] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [formVisible, setFormVisible] =
    useState(false);

  const [editingQuiz, setEditingQuiz] =
    useState(null);

  const loadQuizzes = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const params = {};

        if (statusFilter !== "ALL") {
          params.status = statusFilter;
        }

        if (typeFilter !== "ALL") {
          params.type = typeFilter;
        }

        if (search.trim()) {
          params.search = search.trim();
        }

        const response = await api.get(
          "/quizzes",
          {
            params,
          }
        );

        setQuizzes(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load quizzes."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      statusFilter,
      typeFilter,
      search,
    ]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadQuizzes();
    }, 250);

    return () =>
      clearTimeout(timeout);
  }, [loadQuizzes]);

  const summary = useMemo(() => {
    return quizzes.reduce(
      (result, quiz) => {
        result.total += 1;

        if (quiz.status === "DRAFT") {
          result.draft += 1;
        }

        if (
          quiz.status === "PUBLISHED"
        ) {
          result.published += 1;
        }

        if (quiz.status === "CLOSED") {
          result.closed += 1;
        }

        return result;
      },
      {
        total: 0,
        draft: 0,
        published: 0,
        closed: 0,
      }
    );
  }, [quizzes]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function openCreateForm() {
    clearMessages();
    setEditingQuiz(null);
    setFormVisible(true);
  }

  async function openEditForm(quiz) {
    clearMessages();
    setProcessingQuizId(quiz.id);

    try {
      const response = await api.get(
        `/quizzes/${quiz.id}`
      );

      setEditingQuiz(response.data);
      setFormVisible(true);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't load quiz details."
        )
      );
    } finally {
      setProcessingQuizId("");
    }
  }

  function closeForm() {
    setFormVisible(false);
    setEditingQuiz(null);
  }

  async function runQuizAction({
    quiz,
    endpoint,
    successMessage,
  }) {
    setProcessingQuizId(quiz.id);
    setError("");
    setSuccess("");

    try {
      await api.post(
        `/quizzes/${quiz.id}/${endpoint}`
      );

      setSuccess(successMessage);

      await loadQuizzes({
        silent: true,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          `Couldn't ${endpoint} the quiz.`
        )
      );
    } finally {
      setProcessingQuizId("");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) {
      return;
    }

    setProcessingQuizId(
      deleteTarget.id
    );

    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/quizzes/${deleteTarget.id}`
      );

      setDeleteTarget(null);

      setSuccess(
        "Quiz deleted successfully."
      );

      await loadQuizzes({
        silent: true,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't delete the quiz."
        )
      );
    } finally {
      setProcessingQuizId("");
    }
  }

  function clearFilters() {
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setSearch("");
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={styles.loadingScreen}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading quizzes...
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <View
              style={styles.eyebrowRow}
            >
              <View
                style={styles.eyebrowIcon}
              >
                <Ionicons
                  name="clipboard-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <Text
                style={styles.eyebrow}
              >
                QUIZ MANAGEMENT
              </Text>
            </View>

            <Text
              style={styles.pageTitle}
            >
              Quizzes
            </Text>

            <Text
              style={styles.pageSubtitle}
            >
              Create, schedule, publish,
              and manage MCQ and written
              paper quizzes.
            </Text>
          </View>

          <Button
            title="Create quiz"
            variant="warning"
            onPress={openCreateForm}
          />
        </View>

        {error ? (
          <AlertBanner
            tone="danger"
            message={error}
            onDismiss={() =>
              setError("")
            }
          />
        ) : null}

        {success ? (
          <AlertBanner
            tone="success"
            message={success}
            onDismiss={() =>
              setSuccess("")
            }
          />
        ) : null}

        <View style={styles.statsGrid}>
          <SummaryCard
            icon="documents-outline"
            label="Displayed quizzes"
            value={summary.total}
          />

          <SummaryCard
            icon="create-outline"
            label="Draft"
            value={summary.draft}
          />

          <SummaryCard
            icon="radio-outline"
            label="Published"
            value={summary.published}
          />

          <SummaryCard
            icon="lock-closed-outline"
            label="Closed"
            value={summary.closed}
          />
        </View>

        <Card style={styles.filtersCard}>
          <View
            style={styles.filtersHeader}
          >
            <View>
              <Text
                style={styles.filtersTitle}
              >
                Filter quizzes
              </Text>

              <Text
                style={
                  styles.filtersSubtitle
                }
              >
                Search by title or
                description and filter by
                status or type.
              </Text>
            </View>

            <Pressable
              onPress={clearFilters}
              style={({ pressed }) => [
                styles.clearButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={16}
                color={colors.primary}
              />

              <Text
                style={
                  styles.clearButtonText
                }
              >
                Clear filters
              </Text>
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={19}
              color={colors.textMuted}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search quizzes"
              placeholderTextColor={
                colors.textMuted
              }
              style={styles.searchInput}
            />
          </View>

          <FilterSection label="Status">
            <View style={styles.chipList}>
              {STATUS_FILTERS.map(
                (status) => (
                  <FilterChip
                    key={status}
                    label={
                      status === "ALL"
                        ? "All statuses"
                        : status
                    }
                    active={
                      statusFilter ===
                      status
                    }
                    onPress={() =>
                      setStatusFilter(
                        status
                      )
                    }
                  />
                )
              )}
            </View>
          </FilterSection>

          <FilterSection label="Type">
            <View style={styles.chipList}>
              {TYPE_FILTERS.map(
                (type) => (
                  <FilterChip
                    key={type}
                    label={
                      type === "ALL"
                        ? "All types"
                        : getTypeLabel(type)
                    }
                    active={
                      typeFilter === type
                    }
                    onPress={() =>
                      setTypeFilter(type)
                    }
                  />
                )
              )}
            </View>
          </FilterSection>
        </Card>

        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Quiz list
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              {quizzes.length}{" "}
              {quizzes.length === 1
                ? "quiz"
                : "quizzes"}{" "}
              displayed
            </Text>
          </View>

          <Button
            title="Refresh"
            variant="outline"
            loading={refreshing}
            disabled={refreshing}
            onPress={() =>
              loadQuizzes({
                silent: true,
              })
            }
          />
        </View>

        {!quizzes.length ? (
          <EmptyState
            onCreate={openCreateForm}
          />
        ) : (
          <View
            style={[
              styles.quizGrid,
              isDesktop &&
                styles.quizGridDesktop,
            ]}
          >
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                processing={
                  processingQuizId ===
                  quiz.id
                }
                onEdit={() =>
                  openEditForm(quiz)
                }
                onPublish={() =>
                  runQuizAction({
                    quiz,
                    endpoint: "publish",
                    successMessage:
                      "Quiz published successfully.",
                  })
                }
                onClose={() =>
                  runQuizAction({
                    quiz,
                    endpoint: "close",
                    successMessage:
                      "Quiz closed successfully.",
                  })
                }
                onReopen={() =>
                  runQuizAction({
                    quiz,
                    endpoint: "reopen",
                    successMessage:
                      "Quiz reopened successfully.",
                  })
                }
                onDelete={() =>
                  setDeleteTarget(quiz)
                }
              />
            ))}
          </View>
        )}
      </View>

      <QuizBuilderModal
        visible={formVisible}
        quiz={editingQuiz}
        onClose={closeForm}
        onSaved={async (message) => {
          closeForm();
          setSuccess(message);

          await loadQuizzes({
            silent: true,
          });
        }}
      />

      <DeleteModal
        visible={Boolean(deleteTarget)}
        quiz={deleteTarget}
        deleting={
          processingQuizId ===
          deleteTarget?.id
        }
        onCancel={() =>
          setDeleteTarget(null)
        }
        onConfirm={confirmDelete}
      />
    </Screen>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <Card style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Ionicons
          name={icon}
          size={21}
          color={colors.primary}
        />
      </View>

      <Text style={styles.summaryValue}>
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </Card>
  );
}

function FilterSection({
  label,
  children,
}) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>
        {label}
      </Text>

      {children}
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        active &&
          styles.filterChipActive,
        pressed && styles.pressed,
      ]}
    >
      <Text
        numberOfLines={1}
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
}

function QuizCard({
  quiz,
  processing,
  onEdit,
  onPublish,
  onClose,
  onReopen,
  onDelete,
}) {
  const groups =
    getQuizGroups(quiz);

  const questionCount =
    quiz?._count?.questions ??
    quiz?.questions?.length ??
    0;

  const submissionCount =
    quiz?._count?.submissions ??
    quiz?.submissions?.length ??
    0;

  return (
    <Card style={styles.quizCard}>
      <View style={styles.quizCardHeader}>
        <View
          style={[
            styles.quizTypeIcon,
            quiz.type === "PAPER" &&
              styles.paperQuizIcon,
          ]}
        >
          <Ionicons
            name={
              quiz.type === "PAPER"
                ? "document-text-outline"
                : "list-outline"
            }
            size={23}
            color={
              quiz.type === "PAPER"
                ? colors.secondary
                : colors.primary
            }
          />
        </View>

        <View style={styles.quizHeading}>
          <Text
            numberOfLines={2}
            style={styles.quizTitle}
          >
            {quiz.title}
          </Text>

          <View style={styles.badgeRow}>
            <Badge
              label={quiz.status}
              tone={getStatusTone(
                quiz.status
              )}
            />

            <Badge
              label={getTypeLabel(
                quiz.type
              )}
              tone="info"
            />
          </View>
        </View>
      </View>

      {quiz.description ? (
        <Text
          numberOfLines={3}
          style={styles.description}
        >
          {quiz.description}
        </Text>
      ) : null}

      <View style={styles.detailsGrid}>
        <DetailItem
          icon="timer-outline"
          label="Duration"
          value={`${quiz.durationMinutes} min`}
        />

        <DetailItem
          icon="ribbon-outline"
          label="Total marks"
          value={String(
            quiz.totalPoints ?? 0
          )}
        />

        <DetailItem
          icon="help-circle-outline"
          label="Questions"
          value={String(questionCount)}
        />

        <DetailItem
          icon="people-outline"
          label="Attempts"
          value={String(submissionCount)}
        />
      </View>

      <View style={styles.scheduleBox}>
        <ScheduleRow
          label="Starts"
          value={formatDateTime(
            quiz.startAt
          )}
        />

        <ScheduleRow
          label="Ends"
          value={formatDateTime(
            quiz.endAt
          )}
        />
      </View>

      <View style={styles.groupSection}>
        <Text style={styles.groupLabel}>
          Assigned groups
        </Text>

        <View style={styles.groupList}>
          {groups.length ? (
            groups.map((group) => (
              <View
                key={group.id}
                style={styles.groupBadge}
              >
                <Text
                  style={
                    styles.groupBadgeText
                  }
                >
                  {group.name}
                </Text>
              </View>
            ))
          ) : (
            <Text
              style={styles.noGroupsText}
            >
              No groups assigned
            </Text>
          )}
        </View>
      </View>

      {processing ? (
        <View
          style={styles.processingRow}
        >
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />

          <Text
            style={styles.processingText}
          >
            Processing...
          </Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <Button
            title="Edit"
            variant="outline"
            onPress={onEdit}
            style={styles.actionButton}
          />

          {quiz.status === "DRAFT" ? (
            <Button
              title="Publish"
              variant="warning"
              onPress={onPublish}
              style={styles.actionButton}
            />
          ) : null}

          {quiz.status ===
          "PUBLISHED" ? (
            <Button
              title="Close"
              variant="danger"
              onPress={onClose}
              style={styles.actionButton}
            />
          ) : null}

          {quiz.status === "CLOSED" ? (
            <Button
              title="Reopen"
              variant="warning"
              onPress={onReopen}
              style={styles.actionButton}
            />
          ) : null}

          <Button
            title="Delete"
            variant="danger"
            onPress={onDelete}
            style={styles.actionButton}
          />
        </View>
      )}
    </Card>
  );
}

function DetailItem({
  icon,
  label,
  value,
}) {
  return (
    <View style={styles.detailItem}>
      <Ionicons
        name={icon}
        size={17}
        color={colors.textMuted}
      />

      <View>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ScheduleRow({
  label,
  value,
}) {
  return (
    <View style={styles.scheduleRow}>
      <Text style={styles.scheduleLabel}>
        {label}
      </Text>

      <Text style={styles.scheduleValue}>
        {value}
      </Text>
    </View>
  );
}

function EmptyState({
  onCreate,
}) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="clipboard-outline"
          size={35}
          color={colors.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        No quizzes found
      </Text>

      <Text
        style={styles.emptyDescription}
      >
        Create a Draft quiz or adjust the
        active filters.
      </Text>

      <Button
        title="Create quiz"
        variant="warning"
        onPress={onCreate}
      />
    </Card>
  );
}

function AlertBanner({
  tone,
  message,
  onDismiss,
}) {
  const isDanger =
    tone === "danger";

  const toneColor = isDanger
    ? colors.danger
    : colors.secondary;

  return (
    <View
      style={[
        styles.alert,
        isDanger
          ? styles.alertDanger
          : styles.alertSuccess,
      ]}
    >
      <Ionicons
        name={
          isDanger
            ? "alert-circle-outline"
            : "checkmark-circle-outline"
        }
        size={20}
        color={toneColor}
      />

      <Text
        style={[
          styles.alertText,
          {
            color: toneColor,
          },
        ]}
      >
        {message}
      </Text>

      <Pressable onPress={onDismiss}>
        <Ionicons
          name="close"
          size={19}
          color={toneColor}
        />
      </Pressable>
    </View>
  );
}

function QuizBuilderModal({
  visible,
  quiz,
  onClose,
  onSaved,
}) {
  const isEditing =
    Boolean(quiz?.id);

  const [years, setYears] =
    useState([]);

  const [groups, setGroups] =
    useState([]);

  const [units, setUnits] =
    useState([]);

  const [chapters, setChapters] =
    useState([]);

  const [topics, setTopics] =
    useState([]);

  const [
    availableQuestions,
    setAvailableQuestions,
  ] = useState([]);

  const [
    selectedQuestions,
    setSelectedQuestions,
  ] = useState([]);

  const [
    selectedYearId,
    setSelectedYearId,
  ] = useState("");

  const [
    selectedGroupIds,
    setSelectedGroupIds,
  ] = useState([]);

  const [
    selectedUnitId,
    setSelectedUnitId,
  ] = useState("");

  const [
    selectedChapterId,
    setSelectedChapterId,
  ] = useState("");

  const [
    selectedTopicId,
    setSelectedTopicId,
  ] = useState("");

  const [
    questionSearch,
    setQuestionSearch,
  ] = useState("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [type, setType] =
    useState("MCQ");

  const [
    durationMinutes,
    setDurationMinutes,
  ] = useState("30");

  const [startAt, setStartAt] =
    useState(null);

  const [endAt, setEndAt] =
    useState(null);

  const [loadingSetup, setLoadingSetup] =
    useState(false);

  const [loadingGroups, setLoadingGroups] =
    useState(false);

  const [
    loadingQuestions,
    setLoadingQuestions,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    openingQuestionId,
    setOpeningQuestionId,
  ] = useState("");

  const [formError, setFormError] =
    useState("");

  const existingQuizGroups =
    useMemo(() => {
      return getQuizGroups(quiz);
    }, [quiz]);

  const filteredChapters =
    useMemo(() => {
      if (!selectedUnitId) {
        return chapters;
      }

      return chapters.filter(
        (chapter) =>
          chapter.unitId ===
            selectedUnitId ||
          chapter.unit?.id ===
            selectedUnitId
      );
    }, [
      chapters,
      selectedUnitId,
    ]);

  const filteredTopics =
    useMemo(() => {
      return topics.filter((topic) => {
        if (
          selectedChapterId &&
          topic.chapterId !==
            selectedChapterId &&
          topic.chapter?.id !==
            selectedChapterId
        ) {
          return false;
        }

        if (
          selectedUnitId &&
          topic.chapter?.unit?.id !==
            selectedUnitId
        ) {
          return false;
        }

        return true;
      });
    }, [
      topics,
      selectedUnitId,
      selectedChapterId,
    ]);

  const totalPoints =
    useMemo(() => {
      return selectedQuestions.reduce(
        (total, item) => {
          const points =
            Number(item.points);

          return (
            total +
            (Number.isFinite(points)
              ? points
              : 0)
          );
        },
        0
      );
    }, [selectedQuestions]);

  const selectedQuestionIds =
    useMemo(() => {
      return new Set(
        selectedQuestions.map(
          (item) => item.questionId
        )
      );
    }, [selectedQuestions]);

  const setupModal =
    useCallback(async () => {
      if (!visible) {
        return;
      }

      setLoadingSetup(true);
      setFormError("");

      try {
        const [
          yearsResponse,
          unitsResponse,
          chaptersResponse,
          topicsResponse,
        ] = await Promise.all([
          api.get("/years/mine"),
          api.get("/units"),
          api.get("/chapters"),
          api.get("/topics"),
        ]);

        setYears(
          Array.isArray(
            yearsResponse.data
          )
            ? yearsResponse.data
            : []
        );

        setUnits(
          Array.isArray(
            unitsResponse.data
          )
            ? unitsResponse.data
            : []
        );

        setChapters(
          Array.isArray(
            chaptersResponse.data
          )
            ? chaptersResponse.data
            : []
        );

        setTopics(
          Array.isArray(
            topicsResponse.data
          )
            ? topicsResponse.data
            : []
        );
      } catch (requestError) {
        setFormError(
          getErrorMessage(
            requestError,
            "Couldn't load quiz-builder data."
          )
        );
      } finally {
        setLoadingSetup(false);
      }
    }, [visible]);

  const loadGroupsForYear =
    useCallback(async (yearId) => {
      setGroups([]);

      if (!yearId) {
        return;
      }

      setLoadingGroups(true);

      try {
        const response =
          await api.get(
            `/groups/year/${yearId}`
          );

        setGroups(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (requestError) {
        setFormError(
          getErrorMessage(
            requestError,
            "Couldn't load Groups."
          )
        );
      } finally {
        setLoadingGroups(false);
      }
    }, []);

  const loadAvailableQuestions =
    useCallback(async () => {
      if (!visible) {
        return;
      }

      setLoadingQuestions(true);

      try {
        const params = {
          type:
            type === "MCQ"
              ? "MCQ"
              : "WRITTEN",
        };

        if (selectedUnitId) {
          params.unitId =
            selectedUnitId;
        }

        if (selectedChapterId) {
          params.chapterId =
            selectedChapterId;
        }

        if (selectedTopicId) {
          params.topicId =
            selectedTopicId;
        }

        if (questionSearch.trim()) {
          params.search =
            questionSearch.trim();
        }

        const response =
          await api.get(
            "/questions",
            {
              params,
            }
          );

        setAvailableQuestions(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (requestError) {
        setFormError(
          getErrorMessage(
            requestError,
            "Couldn't load Question Bank."
          )
        );
      } finally {
        setLoadingQuestions(false);
      }
    }, [
      visible,
      type,
      selectedUnitId,
      selectedChapterId,
      selectedTopicId,
      questionSearch,
    ]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle(quiz?.title || "");

    setDescription(
      quiz?.description || ""
    );

    setType(quiz?.type || "MCQ");

    setDurationMinutes(
      quiz?.durationMinutes
        ? String(
            quiz.durationMinutes
          )
        : "30"
    );

    setStartAt(
      quiz?.startAt
        ? new Date(quiz.startAt)
        : null
    );

    setEndAt(
      quiz?.endAt
        ? new Date(quiz.endAt)
        : null
    );

    const existingYearId =
      existingQuizGroups[0]?.yearId ||
      existingQuizGroups[0]?.year?.id ||
      "";

    setSelectedYearId(
      existingYearId
    );

    setSelectedGroupIds(
      existingQuizGroups.map(
        (group) => group.id
      )
    );

    setSelectedQuestions(
      normalizeExistingQuizQuestions(
        quiz
      )
    );

    setSelectedUnitId("");
    setSelectedChapterId("");
    setSelectedTopicId("");
    setQuestionSearch("");
    setAvailableQuestions([]);
    setFormError("");

    setupModal();

    if (existingYearId) {
      loadGroupsForYear(
        existingYearId
      );
    } else {
      setGroups([]);
    }
  }, [
    visible,
    quiz,
    existingQuizGroups,
    setupModal,
    loadGroupsForYear,
  ]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const timeout = setTimeout(
      () => {
        loadAvailableQuestions();
      },
      250
    );

    return () =>
      clearTimeout(timeout);
  }, [
    visible,
    loadAvailableQuestions,
  ]);

  function handleYearSelection(
    yearId
  ) {
    if (
      yearId === selectedYearId
    ) {
      return;
    }

    setSelectedYearId(yearId);
    setSelectedGroupIds([]);

    loadGroupsForYear(yearId);
  }

  function toggleGroup(groupId) {
    setSelectedGroupIds(
      (current) =>
        current.includes(groupId)
          ? current.filter(
              (id) => id !== groupId
            )
          : [...current, groupId]
    );
  }

  function selectAllGroups() {
    setSelectedGroupIds(
      groups.map(
        (group) => group.id
      )
    );
  }

  function clearSelectedGroups() {
    setSelectedGroupIds([]);
  }

  function handleQuizTypeChange(
    nextType
  ) {
    if (nextType === type) {
      return;
    }

    if (
      selectedQuestions.length > 0
    ) {
      const confirmed =
        typeof window === "undefined"
          ? true
          : window.confirm(
              "Changing the quiz type will clear the selected questions. Continue?"
            );

      if (!confirmed) {
        return;
      }
    }

    setType(nextType);
    setSelectedQuestions([]);
    setSelectedUnitId("");
    setSelectedChapterId("");
    setSelectedTopicId("");
    setQuestionSearch("");
  }

  function selectQuestion(question) {
    if (
      selectedQuestionIds.has(
        question.id
      )
    ) {
      return;
    }

    setSelectedQuestions(
      (current) => [
        ...current,
        {
          questionId: question.id,
          points: String(
            question.points ?? 1
          ),
          question,
        },
      ]
    );
  }

  function removeQuestion(
    questionId
  ) {
    setSelectedQuestions(
      (current) =>
        current.filter(
          (item) =>
            item.questionId !==
            questionId
        )
    );
  }

  function updateQuestionPoints(
    questionId,
    value
  ) {
    setSelectedQuestions(
      (current) =>
        current.map((item) =>
          item.questionId ===
          questionId
            ? {
                ...item,
                points: value,
              }
            : item
        )
    );
  }

  function moveQuestion(
    index,
    direction
  ) {
    const targetIndex =
      index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >=
        selectedQuestions.length
    ) {
      return;
    }

    setSelectedQuestions(
      (current) => {
        const next = [...current];

        const temporary =
          next[index];

        next[index] =
          next[targetIndex];

        next[targetIndex] =
          temporary;

        return next;
      }
    );
  }

  function clearQuestionFilters() {
    setSelectedUnitId("");
    setSelectedChapterId("");
    setSelectedTopicId("");
    setQuestionSearch("");
  }

  async function openQuestionFile(
    question
  ) {
    if (
      !question?.questionFileUrl
    ) {
      return;
    }

    setOpeningQuestionId(
      question.id
    );

    try {
      const supported =
        await Linking.canOpenURL(
          question.questionFileUrl
        );

      if (!supported) {
        throw new Error(
          "The question file cannot be opened."
        );
      }

      await Linking.openURL(
        question.questionFileUrl
      );
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          "Couldn't open the question file."
        )
      );
    } finally {
      setOpeningQuestionId("");
    }
  }

  function validate() {
    if (!title.trim()) {
      return "Quiz title is required.";
    }

    const duration = Number(
      durationMinutes
    );

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return "Duration must be a positive whole number.";
    }

    if (!selectedYearId) {
      return "Select an Academic Year.";
    }

    if (!selectedGroupIds.length) {
      return "Select at least one Group.";
    }

    if (!startAt) {
      return "Select the quiz start date and time.";
    }

    if (!endAt) {
      return "Select the quiz end date and time.";
    }

    if (endAt <= startAt) {
      return "End time must be after start time.";
    }

    if (!selectedQuestions.length) {
      return "Select at least one question from the Question Bank.";
    }

    for (
      let index = 0;
      index <
      selectedQuestions.length;
      index += 1
    ) {
      const points = Number(
        selectedQuestions[index].points
      );

      if (
        !Number.isFinite(points) ||
        points <= 0
      ) {
        return `Question ${
          index + 1
        } must have points greater than zero.`;
      }
    }

    return "";
  }

  async function submit() {
    const validationError =
      validate();

    if (validationError) {
      setFormError(
        validationError
      );

      return;
    }

    setSaving(true);
    setFormError("");

    const payload = {
      title: title.trim(),

      description:
        description.trim() || null,

      type,

      durationMinutes:
        Number(durationMinutes),

      startAt:
        startAt.toISOString(),

      endAt:
        endAt.toISOString(),

      groupIds:
        selectedGroupIds,

      questions:
        selectedQuestions.map(
          (item) => ({
            questionId:
              item.questionId,

            points:
              Number(item.points),
          })
        ),
    };

    try {
      if (isEditing) {
        await api.patch(
          `/quizzes/${quiz.id}`,
          payload
        );

        await onSaved(
          "Quiz updated successfully."
        );
      } else {
        await api.post(
          "/quizzes",
          payload
        );

        await onSaved(
          "Draft quiz created successfully."
        );
      }
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          isEditing
            ? "Couldn't update the quiz."
            : "Couldn't create the quiz."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={styles.modalBackdrop}
      >
        <View
          style={[
            styles.formModalCard,
            {
              maxWidth: 1100,
              maxHeight: "96%",
            },
          ]}
        >
          <View
            style={styles.modalHeader}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={styles.modalTitle}
              >
                {isEditing
                  ? "Edit quiz"
                  : "Create quiz"}
              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                Configure quiz details,
                select Groups, and choose
                ordered questions from the
                Question Bank.
              </Text>
            </View>

            <Pressable
              disabled={saving}
              onPress={onClose}
              style={styles.modalClose}
            >
              <Ionicons
                name="close"
                size={21}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>

          {loadingSetup ? (
            <View
              style={{
                minHeight: 300,
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

              <Text
                style={{
                  color:
                    colors.textMuted,
                }}
              >
                Loading quiz builder...
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingBottom: 20,
              }}
            >
              {formError ? (
                <View
                  style={
                    styles.formErrorBox
                  }
                >
                  <Text
                    style={
                      styles.formErrorText
                    }
                  >
                    {formError}
                  </Text>
                </View>
              ) : null}

              <BuilderSection
                icon="information-circle-outline"
                title="Quiz details"
                description="Set the quiz title, type, duration, and schedule."
              >
                <FormField label="Quiz title">
                  <TextInput
                    value={title}
                    onChangeText={
                      setTitle
                    }
                    placeholder="Example: Algebra assessment"
                    placeholderTextColor={
                      colors.textMuted
                    }
                    style={styles.input}
                  />
                </FormField>

                <FormField label="Description">
                  <TextInput
                    value={description}
                    onChangeText={
                      setDescription
                    }
                    multiline
                    placeholder="Optional quiz description"
                    placeholderTextColor={
                      colors.textMuted
                    }
                    style={[
                      styles.input,
                      styles.textArea,
                    ]}
                  />
                </FormField>

                <FormField label="Quiz type">
                  <View
                    style={
                      styles.typeSelector
                    }
                  >
                    {[
                      "MCQ",
                      "PAPER",
                    ].map((item) => {
                      const active =
                        type === item;

                      return (
                        <Pressable
                          key={item}
                          onPress={() =>
                            handleQuizTypeChange(
                              item
                            )
                          }
                          style={[
                            styles.typeOption,
                            active &&
                              styles.typeOptionActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeOptionText,
                              active &&
                                styles.typeOptionTextActive,
                            ]}
                          >
                            {getTypeLabel(
                              item
                            )}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </FormField>

                <FormField label="Duration in minutes">
                  <TextInput
                    value={
                      durationMinutes
                    }
                    onChangeText={
                      setDurationMinutes
                    }
                    keyboardType="number-pad"
                    placeholder="30"
                    placeholderTextColor={
                      colors.textMuted
                    }
                    style={styles.input}
                  />
                </FormField>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flexGrow: 1,
                      flexBasis: 300,
                    }}
                  >
                    <FormField label="Start date and time">
                      <DateTimePickerInput
                        value={startAt}
                        onChange={(
                          date
                        ) => {
                          setStartAt(
                            date
                          );

                          if (
                            endAt &&
                            date &&
                            endAt <= date
                          ) {
                            setEndAt(
                              null
                            );
                          }
                        }}
                        minimumDate={
                          isEditing
                            ? undefined
                            : new Date()
                        }
                        placeholder="Select start date and time"
                      />
                    </FormField>
                  </View>

                  <View
                    style={{
                      flexGrow: 1,
                      flexBasis: 300,
                    }}
                  >
                    <FormField label="End date and time">
                      <DateTimePickerInput
                        value={endAt}
                        onChange={
                          setEndAt
                        }
                        minimumDate={
                          startAt ||
                          (isEditing
                            ? undefined
                            : new Date())
                        }
                        placeholder="Select end date and time"
                      />
                    </FormField>
                  </View>
                </View>
              </BuilderSection>

              <BuilderSection
                icon="people-outline"
                title="Year and Groups"
                description="Select one Academic Year and one or multiple Groups."
              >
                <FormField
                  label="Academic Year"
                  hint="Selecting another Year clears the selected Groups"
                >
                  {!years.length ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          colors.textMuted,
                      }}
                    >
                      No Academic Years
                      were found.
                    </Text>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={
                        false
                      }
                      contentContainerStyle={{
                        flexDirection:
                          "row",
                        gap: 8,
                        paddingRight: 12,
                      }}
                    >
                      {years.map(
                        (year) => {
                          const active =
                            selectedYearId ===
                            year.id;

                          return (
                            <FilterChip
                              key={
                                year.id
                              }
                              label={
                                year.name
                              }
                              active={
                                active
                              }
                              onPress={() =>
                                handleYearSelection(
                                  year.id
                                )
                              }
                            />
                          );
                        }
                      )}
                    </ScrollView>
                  )}
                </FormField>

                <FormField
                  label="Assigned Groups"
                  hint={`${selectedGroupIds.length} selected`}
                >
                  {!selectedYearId ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          colors.textMuted,
                      }}
                    >
                      Select an Academic
                      Year first.
                    </Text>
                  ) : loadingGroups ? (
                    <ActivityIndicator
                      color={
                        colors.primary
                      }
                    />
                  ) : !groups.length ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          colors.textMuted,
                      }}
                    >
                      No Groups were
                      found for this Year.
                    </Text>
                  ) : (
                    <>
                      <View
                        style={{
                          flexDirection:
                            "row",
                          justifyContent:
                            "space-between",
                          marginBottom: 10,
                        }}
                      >
                        <Pressable
                          onPress={
                            selectAllGroups
                          }
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight:
                                "800",
                              color:
                                colors.primary,
                            }}
                          >
                            Select all
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={
                            clearSelectedGroups
                          }
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight:
                                "800",
                              color:
                                colors.textMuted,
                            }}
                          >
                            Clear
                          </Text>
                        </Pressable>
                      </View>

                      <View
                        style={{
                          flexDirection:
                            "row",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {groups.map(
                          (group) => {
                            const selected =
                              selectedGroupIds.includes(
                                group.id
                              );

                            return (
                              <SelectableBox
                                key={
                                  group.id
                                }
                                selected={
                                  selected
                                }
                                label={
                                  group.name
                                }
                                subtitle={
                                  group
                                    .year
                                    ?.name
                                }
                                onPress={() =>
                                  toggleGroup(
                                    group.id
                                  )
                                }
                              />
                            );
                          }
                        )}
                      </View>
                    </>
                  )}
                </FormField>
              </BuilderSection>

              <BuilderSection
                icon="library-outline"
                title="Question Bank"
                description={
                  type === "MCQ"
                    ? "Only MCQ questions are shown."
                    : "Only Written questions are shown for Paper quizzes."
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    minHeight: 48,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderColor:
                      colors.border,
                    borderRadius: 12,
                    marginBottom: 14,
                  }}
                >
                  <Ionicons
                    name="search-outline"
                    size={19}
                    color={
                      colors.textMuted
                    }
                  />

                  <TextInput
                    value={
                      questionSearch
                    }
                    onChangeText={
                      setQuestionSearch
                    }
                    placeholder="Search question title or reference"
                    placeholderTextColor={
                      colors.textMuted
                    }
                    style={{
                      flex: 1,
                      minHeight: 46,
                      color:
                        colors.textPrimary,
                    }}
                  />

                  {questionSearch ? (
                    <Pressable
                      onPress={() =>
                        setQuestionSearch(
                          ""
                        )
                      }
                    >
                      <Ionicons
                        name="close-circle"
                        size={19}
                        color={
                          colors.textMuted
                        }
                      />
                    </Pressable>
                  ) : null}
                </View>

                <QuestionFilterRow
                  label="Unit"
                  items={units}
                  selectedId={
                    selectedUnitId
                  }
                  allLabel="All units"
                  onSelect={(id) => {
                    setSelectedUnitId(
                      id
                    );
                    setSelectedChapterId(
                      ""
                    );
                    setSelectedTopicId(
                      ""
                    );
                  }}
                />

                <QuestionFilterRow
                  label="Chapter"
                  items={
                    filteredChapters
                  }
                  selectedId={
                    selectedChapterId
                  }
                  allLabel="All chapters"
                  onSelect={(id) => {
                    setSelectedChapterId(
                      id
                    );
                    setSelectedTopicId(
                      ""
                    );
                  }}
                />

                <QuestionFilterRow
                  label="Topic"
                  items={
                    filteredTopics
                  }
                  selectedId={
                    selectedTopicId
                  }
                  allLabel="All topics"
                  onSelect={
                    setSelectedTopicId
                  }
                />

                <Pressable
                  onPress={
                    clearQuestionFilters
                  }
                  style={{
                    alignSelf:
                      "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 14,
                  }}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={15}
                    color={
                      colors.primary
                    }
                  />

                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      color:
                        colors.primary,
                    }}
                  >
                    Clear question
                    filters
                  </Text>
                </Pressable>

                {loadingQuestions ? (
                  <View
                    style={{
                      minHeight: 130,
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <ActivityIndicator
                      color={
                        colors.primary
                      }
                    />
                  </View>
                ) : !availableQuestions.length ? (
                  <View
                    style={{
                      minHeight: 130,
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      borderRadius: 12,
                      backgroundColor:
                        colors.background,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          colors.textMuted,
                      }}
                    >
                      No matching
                      questions found.
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      gap: 10,
                    }}
                  >
                    {availableQuestions.map(
                      (question) => (
                        <AvailableQuestionCard
                          key={
                            question.id
                          }
                          question={
                            question
                          }
                          selected={selectedQuestionIds.has(
                            question.id
                          )}
                          opening={
                            openingQuestionId ===
                            question.id
                          }
                          onPreview={() =>
                            openQuestionFile(
                              question
                            )
                          }
                          onSelect={() =>
                            selectQuestion(
                              question
                            )
                          }
                        />
                      )
                    )}
                  </View>
                )}
              </BuilderSection>

              <BuilderSection
                icon="reorder-four-outline"
                title="Selected questions"
                description="Set the marks and control the question order."
              >
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent:
                      "space-between",
                    gap: 10,
                    marginBottom: 14,
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor:
                      colors.background,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color:
                        colors.textPrimary,
                    }}
                  >
                    {
                      selectedQuestions.length
                    }{" "}
                    selected
                  </Text>

                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color:
                        colors.primary,
                    }}
                  >
                    Total marks:{" "}
                    {totalPoints}
                  </Text>
                </View>

                {!selectedQuestions.length ? (
                  <View
                    style={{
                      minHeight: 130,
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      borderRadius: 12,
                      backgroundColor:
                        colors.background,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          colors.textMuted,
                      }}
                    >
                      Select questions from
                      the Question Bank.
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      gap: 10,
                    }}
                  >
                    {selectedQuestions.map(
                      (item, index) => (
                        <SelectedQuestionCard
                          key={
                            item.questionId
                          }
                          item={item}
                          index={index}
                          total={
                            selectedQuestions.length
                          }
                          onPointsChange={(
                            value
                          ) =>
                            updateQuestionPoints(
                              item.questionId,
                              value
                            )
                          }
                          onMoveUp={() =>
                            moveQuestion(
                              index,
                              -1
                            )
                          }
                          onMoveDown={() =>
                            moveQuestion(
                              index,
                              1
                            )
                          }
                          onRemove={() =>
                            removeQuestion(
                              item.questionId
                            )
                          }
                        />
                      )
                    )}
                  </View>
                )}
              </BuilderSection>
            </ScrollView>
          )}

          <View
            style={styles.modalActions}
          >
            <Button
              title="Cancel"
              variant="outline"
              disabled={saving}
              onPress={onClose}
            />

            <Button
              title={
                isEditing
                  ? "Save changes"
                  : "Create Draft"
              }
              variant="warning"
              loading={saving}
              disabled={
                loadingSetup ||
                saving
              }
              onPress={submit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function BuilderSection({
  icon,
  title,
  description,
  children,
}) {
  return (
    <View
      style={{
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        backgroundColor: colors.white,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              `${colors.primary}12`,
          }}
        >
          <Ionicons
            name={icon}
            size={20}
            color={colors.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: colors.textPrimary,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              marginTop: 3,
              fontSize: 12,
              lineHeight: 18,
              color: colors.textMuted,
            }}
          >
            {description}
          </Text>
        </View>
      </View>

      {children}
    </View>
  );
}

function SelectableBox({
  selected,
  label,
  subtitle,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minWidth: 170,
        flexGrow: 1,
        flexBasis: 200,
        minHeight: 50,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: selected
          ? colors.primary
          : colors.border,
        borderRadius: 12,
        backgroundColor: selected
          ? colors.primary
          : colors.white,
      }}
    >
      <Ionicons
        name={
          selected
            ? "checkbox"
            : "square-outline"
        }
        size={20}
        color={
          selected
            ? colors.white
            : colors.primary
        }
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: selected
              ? colors.white
              : colors.textPrimary,
          }}
        >
          {label}
        </Text>

        {subtitle ? (
          <Text
            style={{
              marginTop: 2,
              fontSize: 10,
              color: selected
                ? "rgba(255,255,255,0.72)"
                : colors.textMuted,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function QuestionFilterRow({
  label,
  items,
  selectedId,
  allLabel,
  onSelect,
}) {
  return (
    <View
      style={{
        marginBottom: 13,
      }}
    >
      <Text
        style={{
          marginBottom: 7,
          fontSize: 12,
          fontWeight: "800",
          color: colors.textPrimary,
        }}
      >
        {label}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={{
          flexDirection: "row",
          gap: 7,
          paddingRight: 12,
        }}
      >
        <FilterChip
          label={allLabel}
          active={!selectedId}
          onPress={() =>
            onSelect("")
          }
        />

        {items.map((item) => (
          <FilterChip
            key={item.id}
            label={item.name}
            active={
              selectedId === item.id
            }
            onPress={() =>
              onSelect(item.id)
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

function AvailableQuestionCard({
  question,
  selected,
  opening,
  onPreview,
  onSelect,
}) {
  const location =
    getQuestionLocation(question);

  const topics =
    getQuestionTopics(question);

  return (
    <View
      style={{
        padding: 13,
        borderWidth: 1,
        borderColor: selected
          ? colors.secondary
          : colors.border,
        borderRadius: 12,
        backgroundColor: selected
          ? `${colors.secondary}0F`
          : colors.white,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              `${colors.primary}12`,
          }}
        >
          <Ionicons
            name={
              question.type === "MCQ"
                ? "list-outline"
                : "document-text-outline"
            }
            size={18}
            color={colors.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: colors.textPrimary,
            }}
          >
            {question.title}
          </Text>

          {question.reference ? (
            <Text
              style={{
                marginTop: 3,
                fontSize: 11,
                color: colors.textMuted,
              }}
            >
              {question.reference}
            </Text>
          ) : null}

          <Text
            style={{
              marginTop: 5,
              fontSize: 11,
              color: colors.textMuted,
            }}
          >
            {[
              location.unitName,
              location.chapterName,
              location.topicName,
            ]
              .filter(Boolean)
              .join(" › ") ||
              "No taxonomy location"}
          </Text>
        </View>
      </View>

      {topics.length ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 10,
          }}
        >
          {topics.map((topic) => (
            <View
              key={topic.id}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor:
                  colors.background,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color:
                    colors.textMuted,
                }}
              >
                {topic.name}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 12,
        }}
      >
        <Button
          title="Preview"
          variant="outline"
          loading={opening}
          disabled={opening}
          onPress={onPreview}
          style={{
            flexGrow: 1,
            flexBasis: 110,
          }}
        />

        <Button
          title={
            selected
              ? "Selected"
              : "Add question"
          }
          variant={
            selected
              ? "outline"
              : "warning"
          }
          disabled={selected}
          onPress={onSelect}
          style={{
            flexGrow: 1,
            flexBasis: 130,
          }}
        />
      </View>
    </View>
  );
}

function SelectedQuestionCard({
  item,
  index,
  total,
  onPointsChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}) {
  const question =
    item.question;

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.white,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            colors.primary,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "800",
            color: colors.white,
          }}
        >
          {index + 1}
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          minWidth: 190,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: colors.textPrimary,
          }}
        >
          {question?.title ||
            "Question"}
        </Text>

        {question?.reference ? (
          <Text
            style={{
              marginTop: 3,
              fontSize: 10,
              color: colors.textMuted,
            }}
          >
            {question.reference}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          width: 100,
        }}
      >
        <Text
          style={{
            marginBottom: 4,
            fontSize: 10,
            fontWeight: "800",
            color: colors.textMuted,
          }}
        >
          MARKS
        </Text>

        <TextInput
          value={item.points}
          onChangeText={
            onPointsChange
          }
          keyboardType="decimal-pad"
          style={{
            minHeight: 40,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            color: colors.textPrimary,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 5,
        }}
      >
        <IconAction
          icon="arrow-up"
          disabled={index === 0}
          onPress={onMoveUp}
        />

        <IconAction
          icon="arrow-down"
          disabled={
            index === total - 1
          }
          onPress={onMoveDown}
        />

        <IconAction
          icon="trash-outline"
          danger
          onPress={onRemove}
        />
      </View>
    </View>
  );
}

function IconAction({
  icon,
  disabled,
  danger,
  onPress,
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: danger
          ? `${colors.danger}12`
          : colors.background,
        opacity: disabled
          ? 0.35
          : pressed
          ? 0.7
          : 1,
      })}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          danger
            ? colors.danger
            : colors.primary
        }
      />
    </Pressable>
  );
}

function FormField({
  label,
  hint,
  children,
}) {
  return (
    <View style={styles.formField}>
      <View
        style={styles.formFieldHeader}
      >
        <Text
          style={styles.formFieldLabel}
        >
          {label}
        </Text>

        {hint ? (
          <Text
            style={styles.formFieldHint}
          >
            {hint}
          </Text>
        ) : null}
      </View>

      {children}
    </View>
  );
}

function DeleteModal({
  visible,
  quiz,
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={styles.modalBackdrop}
      >
        <Card
          style={styles.deleteModalCard}
        >
          <View style={styles.deleteIcon}>
            <Ionicons
              name="trash-outline"
              size={29}
              color={colors.danger}
            />
          </View>

          <Text
            style={styles.deleteTitle}
          >
            Delete quiz?
          </Text>

          <Text
            style={
              styles.deleteDescription
            }
          >
            {quiz?.title ||
              "This quiz"}{" "}
            will be permanently deleted.
            Quizzes with student attempts
            cannot be deleted.
          </Text>

          <View
            style={styles.deleteActions}
          >
            <Button
              title="Cancel"
              variant="outline"
              disabled={deleting}
              onPress={onCancel}
              style={styles.deleteButton}
            />

            <Button
              title="Delete"
              variant="danger"
              loading={deleting}
              onPress={onConfirm}
              style={styles.deleteButton}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}