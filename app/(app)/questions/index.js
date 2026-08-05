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
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";

import api from "../../../src/lib/api";
import { colors } from "../../../src/theme";

import { styles } from "./index.styles";

const QUESTION_TYPES = ["ALL", "MCQ", "WRITTEN"];
const MCQ_ANSWERS = ["A", "B", "C", "D"];

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getTopicFromLink(link) {
  return link?.topic || link;
}

function getQuestionTopics(question) {
  return Array.isArray(question?.topics)
    ? question.topics
        .map(getTopicFromLink)
        .filter(Boolean)
    : [];
}

function getQuestionTypeLabel(type) {
  return type === "MCQ"
    ? "Multiple choice"
    : "Written";
}

function getFileLabel(file, fallback) {
  return (
    file?.name ||
    file?.fileName ||
    fallback
  );
}

async function appendDocumentToFormData(
  formData,
  fieldName,
  file
) {
  if (!file?.uri) {
    return;
  }

  const fileName =
    file.name ||
    `${fieldName}-${Date.now()}`;

  const mimeType =
    file.mimeType ||
    "application/octet-stream";

  if (Platform.OS === "web") {
    if (file.file instanceof File) {
      formData.append(
        fieldName,
        file.file,
        fileName
      );

      return;
    }

    const response = await fetch(file.uri);

    if (!response.ok) {
      throw new Error(
        `Could not prepare ${fileName} for upload.`
      );
    }

    const blob = await response.blob();

    formData.append(
      fieldName,
      blob,
      fileName
    );

    return;
  }

  formData.append(fieldName, {
    uri: file.uri,
    name: fileName,
    type: mimeType,
  });
}

export default function QuestionBank() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1040;

  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [unitId, setUnitId] = useState("");
  const [chapterId, setChapterId] =
    useState("");
  const [topicId, setTopicId] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadingQuestions, setLoadingQuestions] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingQuestionId, setDeletingQuestionId] =
    useState(null);

  const [openingFileKey, setOpeningFileKey] =
    useState("");

  const [formVisible, setFormVisible] =
    useState(false);

  const [editingQuestion, setEditingQuestion] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const selectedUnit = useMemo(
    () =>
      units.find(
        (unit) => unit.id === unitId
      ) || null,
    [units, unitId]
  );

  const selectedChapter = useMemo(
    () =>
      chapters.find(
        (chapter) =>
          chapter.id === chapterId
      ) || null,
    [chapters, chapterId]
  );

  const filteredChapters = useMemo(() => {
    if (!unitId) {
      return chapters;
    }

    return chapters.filter(
      (chapter) =>
        chapter.unitId === unitId ||
        chapter.unit?.id === unitId
    );
  }, [chapters, unitId]);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const topicChapter =
        topic.chapter;

      if (
        chapterId &&
        topic.chapterId !== chapterId &&
        topicChapter?.id !== chapterId
      ) {
        return false;
      }

      if (
        unitId &&
        topicChapter?.unit?.id !== unitId
      ) {
        return false;
      }

      return true;
    });
  }, [
    topics,
    unitId,
    chapterId,
  ]);

  const summary = useMemo(() => {
    return questions.reduce(
      (result, question) => {
        if (question.type === "MCQ") {
          result.mcq += 1;
        }

        if (
          question.type === "WRITTEN"
        ) {
          result.written += 1;
        }

        if (
          question.markschemeFileUrl
        ) {
          result.withMarkscheme += 1;
        }

        return result;
      },
      {
        total: questions.length,
        mcq: 0,
        written: 0,
        withMarkscheme: 0,
      }
    );
  }, [questions]);

  const loadTaxonomy =
    useCallback(async () => {
      const [
        unitsResponse,
        chaptersResponse,
        topicsResponse,
      ] = await Promise.all([
        api.get("/units"),
        api.get("/chapters"),
        api.get("/topics"),
      ]);

      setUnits(
        Array.isArray(unitsResponse.data)
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
        Array.isArray(topicsResponse.data)
          ? topicsResponse.data
          : []
      );
    }, []);

  const loadQuestions =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!silent) {
          setLoadingQuestions(true);
        }

        setError("");

        try {
          const params = {};

          if (unitId) {
            params.unitId = unitId;
          }

          if (chapterId) {
            params.chapterId =
              chapterId;
          }

          if (topicId) {
            params.topicId = topicId;
          }

          if (
            typeFilter &&
            typeFilter !== "ALL"
          ) {
            params.type = typeFilter;
          }

          if (search.trim()) {
            params.search =
              search.trim();
          }

          const response =
            await api.get(
              "/questions",
              {
                params,
              }
            );

          setQuestions(
            Array.isArray(response.data)
              ? response.data
              : []
          );
        } catch (requestError) {
          setError(
            getErrorMessage(
              requestError,
              "Couldn't load questions."
            )
          );
        } finally {
          setLoadingQuestions(false);
        }
      },
      [
        unitId,
        chapterId,
        topicId,
        typeFilter,
        search,
      ]
    );

  const loadInitialData =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        await loadTaxonomy();
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load question-bank data."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [loadTaxonomy]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(
        () => {
          loadQuestions();
        },
        250
      );

      return () =>
        clearTimeout(timeout);
    }

    return undefined;
  }, [
    loading,
    loadQuestions,
  ]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function handleUnitFilter(
    nextUnitId
  ) {
    setUnitId(nextUnitId);
    setChapterId("");
    setTopicId("");
  }

  function handleChapterFilter(
    nextChapterId
  ) {
    setChapterId(nextChapterId);
    setTopicId("");
  }

  function clearFilters() {
    setUnitId("");
    setChapterId("");
    setTopicId("");
    setTypeFilter("ALL");
    setSearch("");
  }

  function openCreateForm() {
    clearMessages();
    setEditingQuestion(null);
    setFormVisible(true);
  }

  function openEditForm(question) {
    clearMessages();
    setEditingQuestion(question);
    setFormVisible(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormVisible(false);
    setEditingQuestion(null);
  }

  async function openFile(
    url,
    key
  ) {
    if (!url || openingFileKey) {
      return;
    }

    setOpeningFileKey(key);
    setError("");

    try {
      const supported =
        await Linking.canOpenURL(url);

      if (!supported) {
        throw new Error(
          "This file URL cannot be opened."
        );
      }

      await Linking.openURL(url);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "The file could not be opened."
        )
      );
    } finally {
      setOpeningFileKey("");
    }
  }

  async function handleSavedQuestion(
    message
  ) {
    setFormVisible(false);
    setEditingQuestion(null);
    setSuccess(message);

    await loadQuestions({
      silent: true,
    });
  }

  function requestDelete(question) {
    clearMessages();
    setDeleteTarget(question);
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) {
      return;
    }

    setDeletingQuestionId(
      deleteTarget.id
    );

    setError("");

    try {
      await api.delete(
        `/questions/${deleteTarget.id}`
      );

      setDeleteTarget(null);

      setSuccess(
        "Question deleted successfully."
      );

      await loadQuestions({
        silent: true,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't delete the question."
        )
      );
    } finally {
      setDeletingQuestionId(null);
    }
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading question bank...
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
                  name="library-outline"
                  size={17}
                  color={colors.primary}
                />
              </View>

              <Text
                style={styles.eyebrow}
              >
                QUESTION BANK
              </Text>
            </View>

            <Text
              style={styles.pageTitle}
            >
              Manage Questions
            </Text>

            <Text
              style={styles.pageSubtitle}
            >
              Upload and organize MCQ
              and written questions using
              the global Unit, Chapter,
              and Topic structure.
            </Text>
          </View>

          <Button
            title="Upload question"
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
            label="Total questions"
            value={summary.total}
          />

          <SummaryCard
            icon="list-outline"
            label="MCQ"
            value={summary.mcq}
          />

          <SummaryCard
            icon="create-outline"
            label="Written"
            value={summary.written}
          />

          <SummaryCard
            icon="document-attach-outline"
            label="With markscheme"
            value={
              summary.withMarkscheme
            }
          />
        </View>

        <Card style={styles.filtersCard}>
          <View
            style={styles.filtersHeader}
          >
            <View>
              <Text
                style={
                  styles.filtersTitle
                }
              >
                Filter questions
              </Text>

              <Text
                style={
                  styles.filtersSubtitle
                }
              >
                Narrow the bank by
                taxonomy, type, or text.
              </Text>
            </View>

            <Pressable
              onPress={clearFilters}
              style={({ pressed }) => [
                styles.clearFiltersButton,
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
                  styles.clearFiltersText
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
              placeholder="Search title, reference, or topic"
              placeholderTextColor={
                colors.textMuted
              }
              style={styles.searchInput}
            />
          </View>

          <FilterSection
            label="Question type"
          >
            <View style={styles.chipList}>
              {QUESTION_TYPES.map(
                (type) => (
                  <FilterChip
                    key={type}
                    label={
                      type === "ALL"
                        ? "All types"
                        : getQuestionTypeLabel(
                            type
                          )
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

          <FilterSection label="Unit">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.horizontalChipList
              }
            >
              <FilterChip
                label="All units"
                active={!unitId}
                onPress={() =>
                  handleUnitFilter("")
                }
              />

              {units.map((unit) => (
                <FilterChip
                  key={unit.id}
                  label={unit.name}
                  active={
                    unitId === unit.id
                  }
                  onPress={() =>
                    handleUnitFilter(
                      unit.id
                    )
                  }
                />
              ))}
            </ScrollView>
          </FilterSection>

          <FilterSection label="Chapter">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.horizontalChipList
              }
            >
              <FilterChip
                label="All chapters"
                active={!chapterId}
                onPress={() =>
                  handleChapterFilter("")
                }
              />

              {filteredChapters.map(
                (chapter) => (
                  <FilterChip
                    key={chapter.id}
                    label={chapter.name}
                    active={
                      chapterId ===
                      chapter.id
                    }
                    onPress={() =>
                      handleChapterFilter(
                        chapter.id
                      )
                    }
                  />
                )
              )}
            </ScrollView>
          </FilterSection>

          <FilterSection label="Topic">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.horizontalChipList
              }
            >
              <FilterChip
                label="All topics"
                active={!topicId}
                onPress={() =>
                  setTopicId("")
                }
              />

              {filteredTopics.map(
                (topic) => (
                  <FilterChip
                    key={topic.id}
                    label={topic.name}
                    active={
                      topicId === topic.id
                    }
                    onPress={() =>
                      setTopicId(topic.id)
                    }
                  />
                )
              )}
            </ScrollView>
          </FilterSection>

          <View
            style={styles.activeFilterText}
          >
            <Ionicons
              name="information-circle-outline"
              size={17}
              color={colors.textMuted}
            />

            <Text
              style={
                styles.activeFilterLabel
              }
            >
              {selectedUnit
                ? selectedUnit.name
                : "All units"}

              {" · "}

              {selectedChapter
                ? selectedChapter.name
                : "All chapters"}

              {" · "}

              {topicId
                ? filteredTopics.find(
                    (topic) =>
                      topic.id === topicId
                  )?.name ||
                  "Selected topic"
                : "All topics"}
            </Text>
          </View>
        </Card>

        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Questions
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              {questions.length}{" "}
              {questions.length === 1
                ? "question"
                : "questions"}{" "}
              currently displayed
            </Text>
          </View>

          <Button
            title="Refresh"
            variant="outline"
            loading={loadingQuestions}
            disabled={loadingQuestions}
            onPress={() =>
              loadQuestions()
            }
          />
        </View>

        {loadingQuestions ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator
              color={colors.primary}
            />

            <Text
              style={styles.loadingText}
            >
              Loading questions...
            </Text>
          </Card>
        ) : !questions.length ? (
          <EmptyQuestionState
            onCreate={openCreateForm}
          />
        ) : (
          <View
            style={[
              styles.questionGrid,
              isDesktop &&
                styles.questionGridDesktop,
            ]}
          >
            {questions.map(
              (question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  openingFileKey={
                    openingFileKey
                  }
                  onOpenFile={openFile}
                  onEdit={() =>
                    openEditForm(question)
                  }
                  onDelete={() =>
                    requestDelete(question)
                  }
                />
              )
            )}
          </View>
        )}
      </View>

      <QuestionFormModal
        visible={formVisible}
        question={editingQuestion}
        units={units}
        chapters={chapters}
        topics={topics}
        saving={saving}
        setSaving={setSaving}
        onClose={closeForm}
        onSaved={handleSavedQuestion}
        onError={setError}
      />

      <DeleteQuestionModal
        visible={Boolean(deleteTarget)}
        question={deleteTarget}
        deleting={Boolean(
          deletingQuestionId
        )}
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

function QuestionCard({
  question,
  openingFileKey,
  onOpenFile,
  onEdit,
  onDelete,
}) {
  const topics =
    getQuestionTopics(question);

  const questionOpenKey =
    `${question.id}:question`;

  const markschemeOpenKey =
    `${question.id}:markscheme`;

  return (
    <Card style={styles.questionCard}>
      <View
        style={styles.questionCardHeader}
      >
        <View
          style={[
            styles.questionTypeIcon,
            question.type === "WRITTEN" &&
              styles.questionTypeIconWritten,
          ]}
        >
          <Ionicons
            name={
              question.type === "MCQ"
                ? "list-outline"
                : "create-outline"
            }
            size={22}
            color={
              question.type === "MCQ"
                ? colors.primary
                : colors.secondary
            }
          />
        </View>

        <View
          style={styles.questionHeading}
        >
          <Text
            numberOfLines={2}
            style={styles.questionTitle}
          >
            {question.title}
          </Text>

          <View
            style={styles.questionBadges}
          >
            <Badge
              label={getQuestionTypeLabel(
                question.type
              )}
              tone={
                question.type === "MCQ"
                  ? "info"
                  : "success"
              }
            />

            <Badge
              label={`${question.points} ${
                Number(question.points) === 1
                  ? "mark"
                  : "marks"
              }`}
              tone="neutral"
            />
          </View>
        </View>
      </View>

      {question.reference ? (
        <View style={styles.referenceRow}>
          <Ionicons
            name="pricetag-outline"
            size={15}
            color={colors.textMuted}
          />

          <Text
            style={styles.referenceText}
          >
            {question.reference}
          </Text>
        </View>
      ) : null}

      {question.type === "MCQ" ? (
        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>
            Correct answer
          </Text>

          <View
            style={styles.answerValueCircle}
          >
            <Text
              style={styles.answerValue}
            >
              {question.correctAnswer}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>
            Markscheme
          </Text>

          <Text
            style={
              question.markschemeFileUrl
                ? styles.markschemeAvailable
                : styles.markschemeMissing
            }
          >
            {question.markschemeFileUrl
              ? "Available"
              : "Not uploaded"}
          </Text>
        </View>
      )}

      <View style={styles.topicSection}>
        <Text style={styles.topicLabel}>
          Topics
        </Text>

        <View style={styles.topicList}>
          {topics.length ? (
            topics.map((topic) => (
              <View
                key={topic.id}
                style={styles.topicBadge}
              >
                <Text
                  numberOfLines={1}
                  style={styles.topicBadgeText}
                >
                  {topic.name}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTopicsText}>
              No topics linked
            </Text>
          )}
        </View>
      </View>

      <View style={styles.fileActions}>
        <Pressable
          disabled={
            openingFileKey ===
            questionOpenKey
          }
          onPress={() =>
            onOpenFile(
              question.questionFileUrl,
              questionOpenKey
            )
          }
          style={({ pressed }) => [
            styles.fileAction,
            pressed && styles.pressed,
          ]}
        >
          {openingFileKey ===
          questionOpenKey ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          ) : (
            <Ionicons
              name="document-text-outline"
              size={18}
              color={colors.primary}
            />
          )}

          <Text
            style={styles.fileActionText}
          >
            Question
          </Text>
        </Pressable>

        {question.markschemeFileUrl ? (
          <Pressable
            disabled={
              openingFileKey ===
              markschemeOpenKey
            }
            onPress={() =>
              onOpenFile(
                question.markschemeFileUrl,
                markschemeOpenKey
              )
            }
            style={({ pressed }) => [
              styles.fileAction,
              pressed && styles.pressed,
            ]}
          >
            {openingFileKey ===
            markschemeOpenKey ? (
              <ActivityIndicator
                size="small"
                color={colors.secondary}
              />
            ) : (
              <Ionicons
                name="checkmark-done-outline"
                size={18}
                color={colors.secondary}
              />
            )}

            <Text
              style={styles.fileActionText}
            >
              Markscheme
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.cardActions}>
        <Button
          title="Edit"
          variant="outline"
          onPress={onEdit}
          style={styles.cardButton}
        />

        <Button
          title="Delete"
          variant="danger"
          onPress={onDelete}
          style={styles.cardButton}
        />
      </View>
    </Card>
  );
}

function EmptyQuestionState({
  onCreate,
}) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="library-outline"
          size={34}
          color={colors.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        No questions found
      </Text>

      <Text
        style={styles.emptyDescription}
      >
        Upload a new question or adjust
        the active filters.
      </Text>

      <Button
        title="Upload question"
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

  const color = isDanger
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
        color={color}
      />

      <Text
        style={[
          styles.alertText,
          {
            color,
          },
        ]}
      >
        {message}
      </Text>

      <Pressable
        onPress={onDismiss}
        style={styles.alertClose}
      >
        <Ionicons
          name="close"
          size={18}
          color={color}
        />
      </Pressable>
    </View>
  );
}

function QuestionFormModal({
  visible,
  question,
  units,
  chapters,
  topics,
  saving,
  setSaving,
  onClose,
  onSaved,
  onError,
}) {
  const isEditing =
    Boolean(question?.id);

  const [title, setTitle] =
    useState("");

  const [reference, setReference] =
    useState("");

  const [type, setType] =
    useState("MCQ");

  const [points, setPoints] =
    useState("1");

  const [correctAnswer, setCorrectAnswer] =
    useState("A");

  const [selectedTopicIds, setSelectedTopicIds] =
    useState([]);

  const [unitId, setUnitId] =
    useState("");

  const [chapterId, setChapterId] =
    useState("");

  const [questionFile, setQuestionFile] =
    useState(null);

  const [markschemeFile, setMarkschemeFile] =
    useState(null);

  const [removeMarkscheme, setRemoveMarkscheme] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    if (!visible) {
      return;
    }

    const existingTopics =
      getQuestionTopics(question);

    setTitle(question?.title || "");
    setReference(
      question?.reference || ""
    );

    setType(
      question?.type || "MCQ"
    );

    setPoints(
      question?.points != null
        ? String(question.points)
        : "1"
    );

    setCorrectAnswer(
      question?.correctAnswer || "A"
    );

    setSelectedTopicIds(
      existingTopics.map(
        (topic) => topic.id
      )
    );

    setUnitId("");
    setChapterId("");
    setQuestionFile(null);
    setMarkschemeFile(null);
    setRemoveMarkscheme(false);
    setFormError("");
  }, [visible, question]);

  const filteredChapters =
    useMemo(() => {
      if (!unitId) {
        return chapters;
      }

      return chapters.filter(
        (chapter) =>
          chapter.unitId === unitId ||
          chapter.unit?.id === unitId
      );
    }, [chapters, unitId]);

  const filteredTopics =
    useMemo(() => {
      return topics.filter((topic) => {
        if (
          chapterId &&
          topic.chapterId !==
            chapterId &&
          topic.chapter?.id !==
            chapterId
        ) {
          return false;
        }

        if (
          unitId &&
          topic.chapter?.unit?.id !==
            unitId
        ) {
          return false;
        }

        return true;
      });
    }, [
      topics,
      unitId,
      chapterId,
    ]);

  function toggleTopic(topicId) {
    setSelectedTopicIds(
      (current) => {
        if (
          current.includes(topicId)
        ) {
          return current.filter(
            (id) => id !== topicId
          );
        }

        return [...current, topicId];
      }
    );
  }

  async function pickQuestionFile() {
    const result =
      await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/png",
          "image/jpeg",
        ],

        multiple: false,
        copyToCacheDirectory: true,
      });

    if (
      result.canceled ||
      !result.assets?.length
    ) {
      return;
    }

    setQuestionFile(
      result.assets[0]
    );
  }

  async function pickMarkschemeFile() {
    const result =
      await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/png",
          "image/jpeg",
        ],

        multiple: false,
        copyToCacheDirectory: true,
      });

    if (
      result.canceled ||
      !result.assets?.length
    ) {
      return;
    }

    setMarkschemeFile(
      result.assets[0]
    );

    setRemoveMarkscheme(false);
  }

  function validate() {
    if (!title.trim()) {
      return "Question title is required.";
    }

    const numericPoints =
      Number(points);

    if (
      !Number.isFinite(
        numericPoints
      ) ||
      numericPoints <= 0
    ) {
      return "Points must be greater than zero.";
    }

    if (!selectedTopicIds.length) {
      return "Select at least one Topic.";
    }

    if (
      !isEditing &&
      !questionFile
    ) {
      return "Select a question PDF or image.";
    }

    if (
      type === "MCQ" &&
      !MCQ_ANSWERS.includes(
        correctAnswer
      )
    ) {
      return "Select the correct MCQ answer.";
    }

    return "";
  }

  async function submitForm() {
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
    onError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "reference",
        reference.trim()
      );

      formData.append(
        "type",
        type
      );

      formData.append(
        "points",
        String(Number(points))
      );

      formData.append(
        "topicIds",
        JSON.stringify(
          selectedTopicIds
        )
      );

      if (type === "MCQ") {
        formData.append(
          "correctAnswer",
          correctAnswer
        );

        if (
          question?.markschemeFileUrl
        ) {
          formData.append(
            "removeMarkscheme",
            "true"
          );
        }
      } else {
        formData.append(
          "correctAnswer",
          ""
        );

        if (removeMarkscheme) {
          formData.append(
            "removeMarkscheme",
            "true"
          );
        }
      }

      await appendDocumentToFormData(
        formData,
        "questionFile",
        questionFile
      );

      if (type === "WRITTEN") {
        await appendDocumentToFormData(
          formData,
          "markschemeFile",
          markschemeFile
        );
      }

      if (isEditing) {
        await api.patch(
          `/questions/${question.id}`,
          formData
        );

        await onSaved(
          "Question updated successfully."
        );
      } else {
        await api.post(
          "/questions",
          formData
        );

        await onSaved(
          "Question uploaded successfully."
        );
      }
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          isEditing
            ? "Couldn't update the question."
            : "Couldn't upload the question."
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
        <Pressable
          style={
            styles.modalBackdropPress
          }
          onPress={onClose}
        />

        <View
          style={styles.formModalCard}
        >
          <View
            style={styles.modalHeader}
          >
            <View
              style={styles.modalHeaderIcon}
            >
              <Ionicons
                name={
                  isEditing
                    ? "create-outline"
                    : "cloud-upload-outline"
                }
                size={23}
                color={colors.primary}
              />
            </View>

            <View
              style={
                styles.modalHeaderCopy
              }
            >
              <Text
                style={styles.modalTitle}
              >
                {isEditing
                  ? "Edit question"
                  : "Upload question"}
              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                Link the question to one
                or more global Topics.
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

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.formContent
            }
          >
            {formError ? (
              <View
                style={
                  styles.formErrorBox
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.danger}
                />

                <Text
                  style={
                    styles.formErrorText
                  }
                >
                  {formError}
                </Text>
              </View>
            ) : null}

            <FormField label="Question title">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Example: Solving linear equations"
                placeholderTextColor={
                  colors.textMuted
                }
                style={styles.input}
              />
            </FormField>

            <FormField
              label="Reference"
              hint="Optional internal code"
            >
              <TextInput
                value={reference}
                onChangeText={setReference}
                placeholder="Example: ALG-LIN-001"
                placeholderTextColor={
                  colors.textMuted
                }
                style={styles.input}
              />
            </FormField>

            <FormField label="Question type">
              <View
                style={styles.typeSelector}
              >
                {["MCQ", "WRITTEN"].map(
                  (item) => {
                    const active =
                      type === item;

                    return (
                      <Pressable
                        key={item}
                        onPress={() => {
                          setType(item);

                          if (
                            item === "MCQ"
                          ) {
                            setRemoveMarkscheme(
                              true
                            );
                          }
                        }}
                        style={({ pressed }) => [
                          styles.typeOption,
                          active &&
                            styles.typeOptionActive,
                          pressed &&
                            styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name={
                            item === "MCQ"
                              ? "list-outline"
                              : "create-outline"
                          }
                          size={19}
                          color={
                            active
                              ? colors.white
                              : colors.primary
                          }
                        />

                        <Text
                          style={[
                            styles.typeOptionText,
                            active &&
                              styles.typeOptionTextActive,
                          ]}
                        >
                          {getQuestionTypeLabel(
                            item
                          )}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </View>
            </FormField>

            <FormField label="Points">
              <TextInput
                value={points}
                onChangeText={setPoints}
                keyboardType="decimal-pad"
                placeholder="1"
                placeholderTextColor={
                  colors.textMuted
                }
                style={styles.input}
              />
            </FormField>

            {type === "MCQ" ? (
              <FormField label="Correct answer">
                <View
                  style={
                    styles.answerSelector
                  }
                >
                  {MCQ_ANSWERS.map(
                    (answer) => {
                      const active =
                        correctAnswer ===
                        answer;

                      return (
                        <Pressable
                          key={answer}
                          onPress={() =>
                            setCorrectAnswer(
                              answer
                            )
                          }
                          style={({ pressed }) => [
                            styles.answerOption,
                            active &&
                              styles.answerOptionActive,
                            pressed &&
                              styles.pressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.answerOptionText,
                              active &&
                                styles.answerOptionTextActive,
                            ]}
                          >
                            {answer}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </View>
              </FormField>
            ) : null}

            <FormField
              label="Question file"
              hint={
                isEditing
                  ? "Leave unchanged unless replacing the current file."
                  : "PDF, JPG, JPEG, or PNG."
              }
            >
              <FilePickerBox
                file={questionFile}
                existing={
                  isEditing
                }
                fallback={
                  isEditing
                    ? "Current question file will be kept"
                    : "No file selected"
                }
                onPick={
                  pickQuestionFile
                }
                onClear={() =>
                  setQuestionFile(null)
                }
              />
            </FormField>

            {type === "WRITTEN" ? (
              <FormField
                label="Markscheme"
                hint="Optional but recommended"
              >
                <FilePickerBox
                  file={markschemeFile}
                  existing={Boolean(
                    question?.markschemeFileUrl &&
                      !removeMarkscheme
                  )}
                  fallback={
                    question?.markschemeFileUrl &&
                    !removeMarkscheme
                      ? "Current markscheme will be kept"
                      : "No markscheme selected"
                  }
                  onPick={
                    pickMarkschemeFile
                  }
                  onClear={() =>
                    setMarkschemeFile(null)
                  }
                />

                {question?.markschemeFileUrl ? (
                  <Pressable
                    onPress={() => {
                      setRemoveMarkscheme(
                        (current) =>
                          !current
                      );

                      setMarkschemeFile(
                        null
                      );
                    }}
                    style={
                      styles.removeMarkschemeRow
                    }
                  >
                    <Ionicons
                      name={
                        removeMarkscheme
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={19}
                      color={
                        removeMarkscheme
                          ? colors.danger
                          : colors.textMuted
                      }
                    />

                    <Text
                      style={
                        styles.removeMarkschemeText
                      }
                    >
                      Remove current
                      markscheme
                    </Text>
                  </Pressable>
                ) : null}
              </FormField>
            ) : null}

            <FormField
              label="Filter Topics"
              hint="These filters only help find Topics; they do not limit question availability by Year."
            >
              <Text
                style={
                  styles.taxonomyMiniLabel
                }
              >
                Unit
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.horizontalChipList
                }
              >
                <FilterChip
                  label="All units"
                  active={!unitId}
                  onPress={() => {
                    setUnitId("");
                    setChapterId("");
                  }}
                />

                {units.map((unit) => (
                  <FilterChip
                    key={unit.id}
                    label={unit.name}
                    active={
                      unitId === unit.id
                    }
                    onPress={() => {
                      setUnitId(unit.id);
                      setChapterId("");
                    }}
                  />
                ))}
              </ScrollView>

              <Text
                style={
                  styles.taxonomyMiniLabel
                }
              >
                Chapter
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.horizontalChipList
                }
              >
                <FilterChip
                  label="All chapters"
                  active={!chapterId}
                  onPress={() =>
                    setChapterId("")
                  }
                />

                {filteredChapters.map(
                  (chapter) => (
                    <FilterChip
                      key={chapter.id}
                      label={chapter.name}
                      active={
                        chapterId ===
                        chapter.id
                      }
                      onPress={() =>
                        setChapterId(
                          chapter.id
                        )
                      }
                    />
                  )
                )}
              </ScrollView>
            </FormField>

            <FormField
              label="Topics"
              hint={`${selectedTopicIds.length} selected`}
            >
              {!filteredTopics.length ? (
                <View
                  style={
                    styles.noTopicsBox
                  }
                >
                  <Ionicons
                    name="folder-open-outline"
                    size={28}
                    color={
                      colors.textMuted
                    }
                  />

                  <Text
                    style={
                      styles.noTopicsBoxText
                    }
                  >
                    No Topics match the
                    current filters.
                  </Text>
                </View>
              ) : (
                <View
                  style={
                    styles.topicSelectionGrid
                  }
                >
                  {filteredTopics.map(
                    (topic) => {
                      const selected =
                        selectedTopicIds.includes(
                          topic.id
                        );

                      return (
                        <Pressable
                          key={topic.id}
                          onPress={() =>
                            toggleTopic(
                              topic.id
                            )
                          }
                          style={({ pressed }) => [
                            styles.topicSelectionItem,
                            selected &&
                              styles.topicSelectionItemSelected,
                            pressed &&
                              styles.pressed,
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
                            numberOfLines={2}
                            style={[
                              styles.topicSelectionText,
                              selected &&
                                styles.topicSelectionTextSelected,
                            ]}
                          >
                            {topic.name}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </View>
              )}
            </FormField>
          </ScrollView>

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
                  : "Upload question"
              }
              variant="warning"
              loading={saving}
              onPress={submitForm}
            />
          </View>
        </View>
      </View>
    </Modal>
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

function FilePickerBox({
  file,
  existing,
  fallback,
  onPick,
  onClear,
}) {
  return (
    <View style={styles.filePickerBox}>
      <View style={styles.filePickerIcon}>
        <Ionicons
          name={
            file || existing
              ? "document-attach-outline"
              : "cloud-upload-outline"
          }
          size={24}
          color={
            file || existing
              ? colors.secondary
              : colors.primary
          }
        />
      </View>

      <View style={styles.filePickerCopy}>
        <Text
          numberOfLines={1}
          style={styles.filePickerTitle}
        >
          {getFileLabel(
            file,
            fallback
          )}
        </Text>

        <Text
          style={
            styles.filePickerSubtitle
          }
        >
          PDF or image, maximum 20 MB
        </Text>
      </View>

      {file ? (
        <Pressable
          onPress={onClear}
          style={styles.fileClearButton}
        >
          <Ionicons
            name="close"
            size={18}
            color={colors.danger}
          />
        </Pressable>
      ) : null}

      <Button
        title={file ? "Replace" : "Choose"}
        variant="outline"
        onPress={onPick}
      />
    </View>
  );
}

function DeleteQuestionModal({
  visible,
  question,
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
          <View
            style={styles.deleteIcon}
          >
            <Ionicons
              name="trash-outline"
              size={28}
              color={colors.danger}
            />
          </View>

          <Text
            style={styles.deleteModalTitle}
          >
            Delete question?
          </Text>

          <Text
            style={
              styles.deleteModalDescription
            }
          >
            {question?.title ||
              "This question"}{" "}
            will be removed from the
            question bank. Its stored files
            will also be deleted.
          </Text>

          <View
            style={
              styles.deleteModalActions
            }
          >
            <Button
              title="Cancel"
              variant="outline"
              disabled={deleting}
              onPress={onCancel}
              style={styles.deleteModalButton}
            />

            <Button
              title="Delete"
              variant="danger"
              loading={deleting}
              onPress={onConfirm}
              style={styles.deleteModalButton}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}