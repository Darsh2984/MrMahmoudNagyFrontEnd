import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";

import api from "../../../src/lib/api";
import {
  colors,
  spacing,
  radius,
  typography,
} from "../../../src/theme";

const OPTIONS = ["A", "B", "C", "D"];
const DESKTOP_BREAKPOINT = 900;

export default function TakeQuiz() {
  const { quizId } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);

  // questionId -> { answered, answerText, fileName }
  const [answers, setAnswers] = useState({});

  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const [showSubmitConfirmation, setShowSubmitConfirmation] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [openingQuestion, setOpeningQuestion] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadQuiz() {
      setLoading(true);
      setError("");

      try {
        await api.post(`/quiz-student/${quizId}/start`);

        const response = await api.get(
          `/quiz-student/${quizId}/take`
        );

        if (mounted) {
          setQuiz(response.data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.msg ||
              err.response?.data?.message ||
              "Couldn't load the quiz."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadQuiz();

    return () => {
      mounted = false;
    };
  }, [quizId]);

  const questions = quiz?.questions ?? [];
  const total = questions.length;
  const question = questions[index];

  const currentAnswer = question
    ? answers[question.id]
    : undefined;

  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter(
        (answer) => answer?.answered
      ).length,
    [answers]
  );

  const unansweredCount = Math.max(total - answeredCount, 0);

  const progressPercentage =
    total > 0 ? ((index + 1) / total) * 100 : 0;

  const isSavingCurrentQuestion =
    question?.id === savingQuestionId;

  async function answerMCQ(questionId, letter) {
    if (savingQuestionId || submitting) return;

    setSavingQuestionId(questionId);
    setError("");

    try {
      await api.post(
        `/quiz-student/${quizId}/questions/${questionId}/answer`,
        {
          answerText: letter,
        }
      );

      setAnswers((current) => ({
        ...current,
        [questionId]: {
          answered: true,
          answerText: letter,
          fileName: null,
        },
      }));
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Couldn't save your answer."
      );
    } finally {
      setSavingQuestionId(null);
    }
  }

  async function answerWritten(questionId) {
    if (savingQuestionId || submitting) return;

    setError("");

    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const file = result.assets[0];
    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      name: file.name || `written-answer-${questionId}.jpg`,
      type: file.mimeType || "image/jpeg",
    });

    setSavingQuestionId(questionId);

    try {
      // Do not manually set the multipart Content-Type.
      // Axios will add the correct boundary automatically.
      await api.post(
        `/quiz-student/${quizId}/questions/${questionId}/answer`,
        formData
      );

      setAnswers((current) => ({
        ...current,
        [questionId]: {
          answered: true,
          answerText: null,
          fileName:
            file.name || `written-answer-${questionId}`,
        },
      }));
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Couldn't upload your written answer."
      );
    } finally {
      setSavingQuestionId(null);
    }
  }

  async function openQuestionFile() {
    if (!question?.questionFileUrl || openingQuestion) {
      return;
    }

    setOpeningQuestion(true);
    setError("");

    try {
      const supported = await Linking.canOpenURL(
        question.questionFileUrl
      );

      if (!supported) {
        throw new Error("Unsupported question file URL.");
      }

      await Linking.openURL(question.questionFileUrl);
    } catch {
      setError(
        "The question file could not be opened. Please try again."
      );
    } finally {
      setOpeningQuestion(false);
    }
  }

  function goToQuestion(nextIndex) {
    if (
      nextIndex < 0 ||
      nextIndex >= total ||
      savingQuestionId ||
      submitting
    ) {
      return;
    }

    setError("");
    setIndex(nextIndex);
  }

  function requestSubmit() {
    if (savingQuestionId || submitting) return;

    setError("");
    setShowSubmitConfirmation(true);
  }

  async function handleSubmit() {
    setShowSubmitConfirmation(false);
    setSubmitting(true);
    setError("");

    try {
      const response = await api.post(
        `/quiz-student/${quizId}/submit`
      );

      setSubmitted(response.data.submission);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Couldn't submit the quiz."
      );
    } finally {
      setSubmitting(false);
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
          Preparing your quiz...
        </Text>
      </Screen>
    );
  }

  if (!quiz) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={colors.danger}
            />
          </View>

          <Text style={[typography.h2, styles.emptyTitle]}>
            Quiz unavailable
          </Text>

          <Text style={styles.emptyDescription}>
            {error || "This quiz could not be loaded."}
          </Text>

          <Button
            title="Back to quizzes"
            onPress={() =>
              router.replace("/(app)/quizzes")
            }
          />
        </Card>
      </Screen>
    );
  }

  if (submitted) {
    const writtenQuestionCount = questions.filter(
      (item) => item.type === "WRITTEN"
    ).length;

    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <Card style={styles.submittedCard}>
          <View style={styles.successIcon}>
            <Ionicons
              name="checkmark"
              size={34}
              color={colors.secondary}
            />
          </View>

          <Text style={[typography.h2, styles.submittedTitle]}>
            Quiz submitted successfully
          </Text>

          <Text style={styles.submittedDescription}>
            Your answers have been submitted.
          </Text>

          <View style={styles.scorePanel}>
            <Text style={styles.scoreLabel}>
              Current score
            </Text>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreValue}>
                {submitted.score}
              </Text>

              <Text style={styles.scoreTotal}>
                / {total}
              </Text>
            </View>
          </View>

          {writtenQuestionCount > 0 ? (
            <View style={styles.reviewNotice}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.warning}
              />

              <Text style={styles.reviewNoticeText}>
                Written answers remain ungraded until they
                are reviewed. Your final score may increase
                after grading.
              </Text>
            </View>
          ) : null}

          <Button
            title="Back to quizzes"
            onPress={() =>
              router.replace("/(app)/quizzes")
            }
            style={styles.fullWidthButton}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View style={styles.pageHeader}>
        <Text style={styles.eyebrow}>QUIZ</Text>

        <Text style={[typography.h1, styles.pageTitle]}>
          {quiz.title}
        </Text>

        <Text style={styles.pageDescription}>
          Answer each question carefully, then submit your
          quiz when you are ready.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorAlert}>
          <View style={styles.errorContent}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text style={styles.errorText}>{error}</Text>
          </View>

          <Pressable
            onPress={() => setError("")}
            accessibilityRole="button"
            accessibilityLabel="Dismiss error"
            style={styles.errorCloseButton}
          >
            <Ionicons
              name="close"
              size={20}
              color={colors.danger}
            />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.progressHeader}>
        <View>
          <Text style={styles.questionCounter}>
            Question {index + 1} of {total}
          </Text>

          <Text style={styles.answeredCounter}>
            {answeredCount} of {total} answered
          </Text>
        </View>

        <Text style={styles.progressPercentage}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercentage}%`,
            },
          ]}
        />
      </View>

      <View
        style={[
          styles.workspace,
          isDesktop && styles.workspaceDesktop,
        ]}
      >
        <View style={styles.mainColumn}>
          {question ? (
            <Card style={styles.questionCard}>
              <View style={styles.questionTopRow}>
                <Badge
                  label={
                    question.type === "MCQ"
                      ? "MULTIPLE CHOICE"
                      : "WRITTEN ANSWER"
                  }
                  variant={
                    question.type === "MCQ"
                      ? "primary"
                      : "secondary"
                  }
                />

                {currentAnswer?.answered ? (
                  <View style={styles.savedStatusCompact}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.secondary}
                    />

                    <Text style={styles.savedStatusText}>
                      Saved
                    </Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                onPress={openQuestionFile}
                disabled={
                  openingQuestion ||
                  !question.questionFileUrl
                }
                style={({ pressed }) => [
                  styles.fileButton,
                  pressed && styles.pressed,
                  !question.questionFileUrl &&
                    styles.disabledControl,
                ]}
              >
                <View style={styles.fileIconContainer}>
                  {openingQuestion ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                    />
                  ) : (
                    <Ionicons
                      name="document-text-outline"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </View>

                <View style={styles.fileButtonTextContainer}>
                  <Text style={styles.fileButtonTitle}>
                    View question
                  </Text>

                  <Text style={styles.fileButtonDescription}>
                    Open the question document
                  </Text>
                </View>

                <Ionicons
                  name="open-outline"
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>

              {question.type === "MCQ" ? (
                <View>
                  <Text style={styles.sectionLabel}>
                    Select your answer
                  </Text>

                  <Text style={styles.sectionHelp}>
                    Choose one option. You can change your
                    answer before submitting the quiz.
                  </Text>

                  <View
                    style={[
                      styles.optionsGrid,
                      isDesktop && styles.optionsGridDesktop,
                    ]}
                  >
                    {OPTIONS.map((letter) => {
                      const isSelected =
                        currentAnswer?.answerText === letter;

                      return (
                        <Pressable
                          key={letter}
                          disabled={
                            Boolean(savingQuestionId) ||
                            submitting
                          }
                          onPress={() =>
                            answerMCQ(question.id, letter)
                          }
                          style={({ pressed }) => [
                            styles.optionTile,
                            isDesktop &&
                              styles.optionTileDesktop,
                            isSelected &&
                              styles.optionTileSelected,
                            pressed && styles.pressed,
                            (savingQuestionId ||
                              submitting) &&
                              styles.disabledControl,
                          ]}
                        >
                          <View
                            style={[
                              styles.optionLetterCircle,
                              isSelected &&
                                styles.optionLetterCircleSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionLetter,
                                isSelected &&
                                  styles.optionLetterSelected,
                              ]}
                            >
                              {letter}
                            </Text>
                          </View>

                          <Text
                            style={[
                              styles.optionText,
                              isSelected &&
                                styles.optionTextSelected,
                            ]}
                          >
                            Option {letter}
                          </Text>

                          <View style={styles.optionCheckArea}>
                            {isSavingCurrentQuestion &&
                            isSelected ? (
                              <ActivityIndicator
                                size="small"
                                color={colors.primary}
                              />
                            ) : isSelected ? (
                              <Ionicons
                                name="checkmark-circle"
                                size={23}
                                color={colors.primary}
                              />
                            ) : (
                              <View
                                style={
                                  styles.unselectedCircle
                                }
                              />
                            )}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.sectionLabel}>
                    Upload your written answer
                  </Text>

                  <Text style={styles.sectionHelp}>
                    Upload a clear photo or PDF of your
                    completed work.
                  </Text>

                  <View
                    style={[
                      styles.uploadPanel,
                      currentAnswer?.answered &&
                        styles.uploadPanelComplete,
                    ]}
                  >
                    <View style={styles.uploadIcon}>
                      <Ionicons
                        name={
                          currentAnswer?.answered
                            ? "checkmark-circle-outline"
                            : "cloud-upload-outline"
                        }
                        size={30}
                        color={
                          currentAnswer?.answered
                            ? colors.secondary
                            : colors.primary
                        }
                      />
                    </View>

                    <View style={styles.uploadContent}>
                      <Text style={styles.uploadTitle}>
                        {currentAnswer?.answered
                          ? "Written answer uploaded"
                          : "Choose an answer file"}
                      </Text>

                      <Text
                        style={styles.uploadDescription}
                        numberOfLines={2}
                      >
                        {currentAnswer?.fileName ||
                          "Accepted formats: image or PDF"}
                      </Text>
                    </View>

                    <Button
                      title={
                        currentAnswer?.answered
                          ? "Replace"
                          : "Choose file"
                      }
                      variant="secondary"
                      onPress={() =>
                        answerWritten(question.id)
                      }
                      loading={isSavingCurrentQuestion}
                      disabled={
                        Boolean(savingQuestionId) ||
                        submitting
                      }
                    />
                  </View>
                </View>
              )}

              {isSavingCurrentQuestion ? (
                <View style={styles.savingStatus}>
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />

                  <Text style={styles.savingStatusText}>
                    Saving your answer...
                  </Text>
                </View>
              ) : currentAnswer?.answered ? (
                <View style={styles.savedStatus}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.secondary}
                  />

                  <Text style={styles.savedStatusText}>
                    Answer saved successfully
                  </Text>
                </View>
              ) : null}
            </Card>
          ) : (
            <Card style={styles.emptyQuestionCard}>
              <Ionicons
                name="help-circle-outline"
                size={30}
                color={colors.textMuted}
              />

              <Text style={styles.emptyQuestionText}>
                No question is available at this position.
              </Text>
            </Card>
          )}

          <View
            style={[
              styles.navigationRow,
              !isDesktop && styles.navigationRowMobile,
            ]}
          >
            <Button
              title="Previous"
              variant="outline"
              disabled={
                index === 0 ||
                Boolean(savingQuestionId) ||
                submitting
              }
              onPress={() => goToQuestion(index - 1)}
              style={styles.navigationButton}
            />

            {index < total - 1 ? (
              <Button
                title="Next question"
                disabled={
                  Boolean(savingQuestionId) ||
                  submitting
                }
                onPress={() => goToQuestion(index + 1)}
                style={styles.navigationButton}
              />
            ) : (
              <Button
                title="Submit quiz"
                variant="warning"
                loading={submitting}
                disabled={Boolean(savingQuestionId)}
                onPress={requestSubmit}
                style={styles.navigationButton}
              />
            )}
          </View>
        </View>

        {isDesktop ? (
          <Card style={styles.navigatorCard}>
            <Text style={styles.navigatorTitle}>
              Quiz progress
            </Text>

            <Text style={styles.navigatorDescription}>
              Select a question to review or update your
              answer.
            </Text>

            <View style={styles.questionGrid}>
              {questions.map((item, questionIndex) => {
                const isCurrent = questionIndex === index;
                const isAnswered =
                  answers[item.id]?.answered;

                return (
                  <Pressable
                    key={item.id}
                    disabled={
                      Boolean(savingQuestionId) ||
                      submitting
                    }
                    onPress={() =>
                      goToQuestion(questionIndex)
                    }
                    style={({ pressed }) => [
                      styles.questionNumber,
                      isAnswered &&
                        styles.questionNumberAnswered,
                      isCurrent &&
                        styles.questionNumberCurrent,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.questionNumberText,
                        isAnswered &&
                          styles.questionNumberTextAnswered,
                        isCurrent &&
                          styles.questionNumberTextCurrent,
                      ]}
                    >
                      {questionIndex + 1}
                    </Text>

                    {isAnswered && !isCurrent ? (
                      <View style={styles.questionCheck}>
                        <Ionicons
                          name="checkmark"
                          size={10}
                          color={colors.white}
                        />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.navigatorDivider} />

            <View style={styles.navigatorStatRow}>
              <Text style={styles.navigatorStatLabel}>
                Answered
              </Text>

              <Text style={styles.navigatorStatValue}>
                {answeredCount}
              </Text>
            </View>

            <View style={styles.navigatorStatRow}>
              <Text style={styles.navigatorStatLabel}>
                Unanswered
              </Text>

              <Text style={styles.navigatorStatValue}>
                {unansweredCount}
              </Text>
            </View>

            <View style={styles.legend}>
              <LegendItem
                style={styles.legendCurrent}
                label="Current"
              />

              <LegendItem
                style={styles.legendAnswered}
                label="Answered"
              />

              <LegendItem
                style={styles.legendUnanswered}
                label="Unanswered"
              />
            </View>
          </Card>
        ) : null}
      </View>

      <SubmitConfirmationModal
        visible={showSubmitConfirmation}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        total={total}
        submitting={submitting}
        onCancel={() =>
          setShowSubmitConfirmation(false)
        }
        onConfirm={handleSubmit}
      />
    </Screen>
  );
}

function LegendItem({ style, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, style]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function SubmitConfirmationModal({
  visible,
  answeredCount,
  unansweredCount,
  total,
  submitting,
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
      <View style={styles.modalBackdrop}>
        <Card style={styles.modalCard}>
          <View style={styles.modalIcon}>
            <Ionicons
              name="send-outline"
              size={28}
              color={colors.warning}
            />
          </View>

          <Text style={[typography.h2, styles.modalTitle]}>
            Submit this quiz?
          </Text>

          <Text style={styles.modalDescription}>
            You answered {answeredCount} of {total} questions.
          </Text>

          {unansweredCount > 0 ? (
            <View style={styles.unansweredWarning}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.warning}
              />

              <Text style={styles.unansweredWarningText}>
                {unansweredCount}{" "}
                {unansweredCount === 1
                  ? "question is"
                  : "questions are"}{" "}
                still unanswered.
              </Text>
            </View>
          ) : (
            <View style={styles.allAnsweredNotice}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={colors.secondary}
              />

              <Text style={styles.allAnsweredNoticeText}>
                Every question has an answer.
              </Text>
            </View>
          )}

          <Text style={styles.modalFootnote}>
            After submission, you will not be able to change
            your answers.
          </Text>

          <View style={styles.modalActions}>
            <Button
              title="Continue quiz"
              variant="outline"
              disabled={submitting}
              onPress={onCancel}
              style={styles.modalButton}
            />

            <Button
              title={
                unansweredCount > 0
                  ? "Submit anyway"
                  : "Submit quiz"
              }
              variant="warning"
              loading={submitting}
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
    padding: spacing.lg,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },

  pageHeader: {
    marginBottom: spacing.lg,
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
    maxWidth: 660,
    lineHeight: 23,
  },

  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${colors.danger}12`,
    borderColor: `${colors.danger}40`,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  errorContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  errorText: {
    ...typography.body,
    color: colors.danger,
    flex: 1,
  },

  errorCloseButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
  },

  questionCounter: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  answeredCounter: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  progressPercentage: {
    ...typography.bodyBold,
    color: colors.primary,
  },

  progressTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },

  progressFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },

  workspace: {
    width: "100%",
  },

  workspaceDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },

  mainColumn: {
    flex: 1,
    minWidth: 0,
  },

  questionCard: {
    padding: spacing.lg,
  },

  questionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  savedStatusCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },

  fileIconContainer: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}12`,
    marginRight: spacing.sm,
  },

  fileButtonTextContainer: {
    flex: 1,
  },

  fileButtonTitle: {
    ...typography.bodyBold,
    color: colors.primary,
    marginBottom: 2,
  },

  fileButtonDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },

  sectionLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  sectionHelp: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.md,
  },

  optionsGrid: {
    gap: spacing.sm,
  },

  optionsGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  optionTile: {
    width: "100%",
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  optionTileDesktop: {
    width: "48.8%",
  },

  optionTileSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`,
    borderWidth: 2,
  },

  optionLetterCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },

  optionLetterCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  optionLetter: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  optionLetterSelected: {
    color: colors.white,
  },

  optionText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },

  optionTextSelected: {
    color: colors.primary,
  },

  optionCheckArea: {
    width: 26,
    alignItems: "flex-end",
  },

  unselectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
  },

  uploadPanel: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    padding: spacing.md,
  },

  uploadPanelComplete: {
    borderStyle: "solid",
    borderColor: `${colors.secondary}80`,
    backgroundColor: `${colors.secondary}0D`,
  },

  uploadIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  uploadContent: {
    flex: 1,
    minWidth: 150,
  },

  uploadTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  uploadDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },

  savingStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  savingStatusText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },

  savedStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  savedStatusText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "700",
  },

  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.md,
  },

  navigationRowMobile: {
    alignItems: "stretch",
  },

  navigationButton: {
    flex: 1,
  },

  navigatorCard: {
    width: 290,
    padding: spacing.lg,
  },

  navigatorTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  navigatorDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.md,
  },

  questionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  questionNumber: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  questionNumberAnswered: {
    borderColor: `${colors.secondary}80`,
    backgroundColor: `${colors.secondary}18`,
  },

  questionNumberCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  questionNumberText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  questionNumberTextAnswered: {
    color: colors.secondary,
  },

  questionNumberTextCurrent: {
    color: colors.white,
  },

  questionCheck: {
    position: "absolute",
    right: -3,
    top: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },

  navigatorDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  navigatorStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  navigatorStatLabel: {
    ...typography.body,
    color: colors.textMuted,
  },

  navigatorStatValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  legend: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },

  legendCurrent: {
    backgroundColor: colors.primary,
  },

  legendAnswered: {
    backgroundColor: `${colors.secondary}55`,
    borderWidth: 1,
    borderColor: colors.secondary,
  },

  legendUnanswered: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  legendLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  pressed: {
    opacity: 0.76,
  },

  disabledControl: {
    opacity: 0.55,
  },

  emptyQuestionCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },

  emptyQuestionText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    padding: spacing.lg,
  },

  modalCard: {
    width: "100%",
    maxWidth: 480,
    padding: spacing.xl,
  },

  modalIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.warning}15`,
    marginBottom: spacing.md,
  },

  modalTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  modalDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 23,
    marginBottom: spacing.md,
  },

  unansweredWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: `${colors.warning}12`,
    borderWidth: 1,
    borderColor: `${colors.warning}45`,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  unansweredWarningText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },

  allAnsweredNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: `${colors.secondary}12`,
    borderWidth: 1,
    borderColor: `${colors.secondary}45`,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  allAnsweredNoticeText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },

  modalFootnote: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: spacing.md,
  },

  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  modalButton: {
    flex: 1,
  },

  submittedCard: {
    width: "100%",
    maxWidth: 460,
    alignItems: "center",
    padding: spacing.xl,
  },

  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}18`,
    marginBottom: spacing.md,
  },

  submittedTitle: {
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  submittedDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },

  scorePanel: {
    width: "100%",
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  scoreLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  scoreValue: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: "800",
    color: colors.primary,
  },

  scoreTotal: {
    fontSize: 22,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },

  reviewNotice: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: `${colors.warning}10`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  reviewNoticeText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },

  fullWidthButton: {
    width: "100%",
  },

  emptyCard: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    padding: spacing.xl,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.danger}12`,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  emptyDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
});