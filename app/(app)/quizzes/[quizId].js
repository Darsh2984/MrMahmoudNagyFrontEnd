import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import * as DocumentPicker from "expo-document-picker";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";

import api from "../../../src/lib/api";
import { colors } from "../../../src/theme";

import { styles } from "./[quizId].styles";
import { StudentQuizReview } from "./student-review/StudentQuizReview";

const OPTIONS = ["A", "B", "C", "D"];

const DESKTOP_BREAKPOINT = 900;

const FIVE_MINUTES_MS =
  5 * 60 * 1000;

function getErrorMessage(
  error,
  fallback,
) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    fallback
  );
}

function parseDateMilliseconds(
  value,
) {
  if (!value) {
    return null;
  }

  const milliseconds =
    new Date(value).getTime();

  return Number.isNaN(milliseconds)
    ? null
    : milliseconds;
}

function formatDateTime(value) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRemainingTime(
  milliseconds,
) {
  if (
    !Number.isFinite(milliseconds) ||
    milliseconds <= 0
  ) {
    return "00:00";
  }

  const totalSeconds = Math.max(
    0,
    Math.ceil(
      milliseconds / 1000,
    ),
  );

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds =
    totalSeconds % 60;

  if (hours > 0) {
    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  return [
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (
    !Number.isFinite(size) ||
    size <= 0
  ) {
    return "Unknown size";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function normalizeAnswers(
  rawAnswers,
) {
  if (!rawAnswers) {
    return {};
  }

  if (Array.isArray(rawAnswers)) {
    return rawAnswers.reduce(
      (result, answer) => {
        const questionId =
          answer.questionId ||
          answer.quizQuestionId ||
          answer.id;

        const answerText =
          answer.answerText ||
          answer.answer ||
          answer.selectedAnswer ||
          answer.value;

        if (
          questionId &&
          OPTIONS.includes(
            answerText,
          )
        ) {
          result[questionId] =
            answerText;
        }

        return result;
      },
      {},
    );
  }

  if (
    typeof rawAnswers ===
    "object"
  ) {
    return Object.entries(
      rawAnswers,
    ).reduce(
      (
        result,
        [questionId, value],
      ) => {
        const answerText =
          typeof value === "string"
            ? value
            : value?.answerText ||
              value?.answer ||
              value?.selectedAnswer ||
              value?.value;

        if (
          OPTIONS.includes(
            answerText,
          )
        ) {
          result[questionId] =
            answerText;
        }

        return result;
      },
      {},
    );
  }

  return {};
}

function normalizeAttemptResponse(
  responseData,
) {
  if (!responseData) {
    return null;
  }

  if (responseData.quiz) {
    return {
      ...responseData.quiz,

      answers:
        responseData.answers ??
        responseData.quiz.answers,

      submission:
        responseData.submission ??
        responseData.quiz.submission,

      serverTime:
        responseData.serverTime ??
        responseData.quiz.serverTime,

      expiresAt:
        responseData.expiresAt ??
        responseData.quiz.expiresAt,
    };
  }

  return responseData;
}

function normalizeSubmissionResponse(
  responseData,
) {
  if (!responseData) {
    return null;
  }

  return (
    responseData.submission ||
    responseData.result ||
    responseData
  );
}

function isAlreadySubmittedMessage(
  message,
) {
  const normalized = String(
    message || "",
  ).toLowerCase();

  return (
    normalized.includes(
      "already submitted",
    ) ||
    normalized.includes(
      "automatically submitted",
    ) ||
    normalized.includes(
      "time expired",
    )
  );
}

async function openExternalUrl(url) {
  if (!url) {
    throw new Error(
      "The file URL is missing.",
    );
  }

  const supported =
    await Linking.canOpenURL(url);

  if (!supported) {
    throw new Error(
      "This file URL is not supported.",
    );
  }

  await Linking.openURL(url);
}

function appendAssetToFormData(
  formData,
  asset,
) {
  const name =
    asset.name ||
    `paper-answer-${Date.now()}`;

  const type =
    asset.mimeType ||
    asset.type ||
    "application/octet-stream";

  if (
    Platform.OS === "web" &&
    asset.file
  ) {
    formData.append(
      "files",
      asset.file,
      name,
    );

    return;
  }

  formData.append("files", {
    uri: asset.uri,
    name,
    type,
  });
}

function LegendItem({
  style,
  label,
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          style,
        ]}
      />

      <Text style={styles.legendLabel}>
        {label}
      </Text>
    </View>
  );
}

function McqSubmitConfirmationModal({
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
      <View
        style={styles.modalBackdrop}
      >
        <Card style={styles.modalCard}>
          <View
            style={styles.modalIcon}
          >
            <Ionicons
              name="send-outline"
              size={28}
              color={colors.warning}
            />
          </View>

          <Text
            style={styles.modalTitle}
          >
            Submit this quiz?
          </Text>

          <Text
            style={
              styles.modalDescription
            }
          >
            You answered{" "}
            {answeredCount} of {total}{" "}
            {total === 1
              ? "question"
              : "questions"}
            .
          </Text>

          {unansweredCount > 0 ? (
            <View
              style={
                styles.unansweredWarning
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.warning}
              />

              <Text
                style={
                  styles.unansweredWarningText
                }
              >
                {unansweredCount}{" "}
                {unansweredCount === 1
                  ? "question is"
                  : "questions are"}{" "}
                still unanswered.
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.allAnsweredNotice
              }
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={
                  colors.secondary
                }
              />

              <Text
                style={
                  styles.allAnsweredNoticeText
                }
              >
                Every question has an
                answer.
              </Text>
            </View>
          )}

          <Text
            style={styles.modalFootnote}
          >
            After submission, your
            answers cannot be changed.
          </Text>

          <View
            style={styles.modalActions}
          >
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
              disabled={submitting}
              onPress={onConfirm}
              style={styles.modalButton}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

function PaperSubmitConfirmationModal({
  visible,
  fileCount,
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
      <View
        style={styles.modalBackdrop}
      >
        <Card style={styles.modalCard}>
          <View
            style={styles.modalIcon}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={28}
              color={colors.warning}
            />
          </View>

          <Text
            style={styles.modalTitle}
          >
            Submit Paper quiz?
          </Text>

          <Text
            style={
              styles.modalDescription
            }
          >
            You uploaded {fileCount}{" "}
            {fileCount === 1
              ? "answer file"
              : "answer files"}
            .
          </Text>

          <View
            style={
              styles.unansweredWarning
            }
          >
            <Ionicons
              name="warning-outline"
              size={20}
              color={colors.warning}
            />

            <Text
              style={
                styles.unansweredWarningText
              }
            >
              Check that every page is
              clear, complete, and in the
              correct order.
            </Text>
          </View>

          <Text
            style={styles.modalFootnote}
          >
            After submission, files
            cannot be added, replaced, or
            deleted.
          </Text>

          <View
            style={styles.modalActions}
          >
            <Button
              title="Review files"
              variant="outline"
              disabled={submitting}
              onPress={onCancel}
              style={styles.modalButton}
            />

            <Button
              title="Submit Paper quiz"
              variant="warning"
              loading={submitting}
              disabled={submitting}
              onPress={onConfirm}
              style={styles.modalButton}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

export default function QuizDetail() {
  const params =
    useLocalSearchParams();

  const router = useRouter();

  const quizId = Array.isArray(
    params.quizId,
  )
    ? params.quizId[0]
    : params.quizId;

  const [quizType, setQuizType] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function identifyQuiz() {
      if (!quizId) {
        setError(
          "Quiz ID is missing.",
        );

        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          "/quiz-student/mine",
        );

        const quizzes =
          Array.isArray(response.data)
            ? response.data
            : [];

        const selectedQuiz =
          quizzes.find(
            (item) =>
              item.id === quizId,
          );

        if (!selectedQuiz) {
          throw new Error(
            "Quiz not found or not assigned to your group.",
          );
        }

        if (mounted) {
          setQuizType(
            selectedQuiz.type,
          );
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            getErrorMessage(
              requestError,
              requestError?.message ||
                "Couldn't load the quiz.",
            ),
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    identifyQuiz();

    return () => {
      mounted = false;
    };
  }, [quizId]);

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

        <Text
          style={styles.loadingText}
        >
          Preparing your quiz…
        </Text>
      </Screen>
    );
  }

  if (!quizType) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <Card style={styles.emptyCard}>
          <View
            style={styles.emptyIcon}
          >
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={colors.danger}
            />
          </View>

          <Text
            style={styles.emptyTitle}
          >
            Quiz unavailable
          </Text>

          <Text
            style={
              styles.emptyDescription
            }
          >
            {error ||
              "This quiz could not be loaded."}
          </Text>

          <Button
            title="Back to quizzes"
            onPress={() =>
              router.replace(
                "/(app)/quizzes",
              )
            }
          />
        </Card>
      </Screen>
    );
  }

  if (quizType === "PAPER") {
    return (
      <PaperQuizPage
        quizId={quizId}
      />
    );
  }

  return (
    <McqQuizPage quizId={quizId} />
  );
}

function PaperQuizPage({ quizId }) {
  const router = useRouter();

  const mountedRef =
    useRef(true);

  const [paper, setPaper] =
    useState(null);

  const [submission, setSubmission] =
    useState(null);

  const [remainingMilliseconds, setRemainingMilliseconds] =
    useState(null);

  const [serverTimeAtSync, setServerTimeAtSync] =
    useState(null);

  const [localTimeAtSync, setLocalTimeAtSync] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [openingPaper, setOpeningPaper] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [deletingFileId, setDeletingFileId] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [
    showSubmitConfirmation,
    setShowSubmitConfirmation,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const uploadedFiles =
    submission?.files || [];

  const isSubmitted =
    Boolean(submission?.isSubmitted);

  const isGraded =
    Boolean(submission?.isGraded);

  const timerIsKnown =
    Number.isFinite(
      remainingMilliseconds,
    );

  const deadlinePassed =
    timerIsKnown &&
    remainingMilliseconds <= 0;

  const controlsDisabled =
    uploading ||
    submitting ||
    Boolean(deletingFileId) ||
    isSubmitted ||
    deadlinePassed;

  const syncTimer = useCallback(
    (data) => {
      const serverMilliseconds =
        parseDateMilliseconds(
          data?.serverTime,
        );

      const expiresMilliseconds =
        parseDateMilliseconds(
          data?.submission?.expiresAt ||
            data?.expiresAt ||
            data?.endAt,
        );

      if (
        serverMilliseconds === null ||
        expiresMilliseconds === null
      ) {
        setServerTimeAtSync(null);
        setLocalTimeAtSync(null);
        setRemainingMilliseconds(null);

        return;
      }

      const localNow = Date.now();

      setServerTimeAtSync(
        serverMilliseconds,
      );

      setLocalTimeAtSync(localNow);

      setRemainingMilliseconds(
        Math.max(
          0,
          expiresMilliseconds -
            serverMilliseconds,
        ),
      );
    },
    [],
  );

  const loadPaperStatus =
    useCallback(
      async ({
        fullLoader = true,
      } = {}) => {
        if (fullLoader) {
          setLoading(true);
        }

        setError("");

        try {
          const response =
            await api.get(
              `/quiz-student/${quizId}/paper/status`,
            );

          if (!mountedRef.current) {
            return;
          }

          setPaper(response.data);

          setSubmission(
            response.data
              ?.submission || null,
          );

          syncTimer(response.data);
        } catch (requestError) {
          if (mountedRef.current) {
            setError(
              getErrorMessage(
                requestError,
                "Couldn't load the Paper quiz.",
              ),
            );
          }
        } finally {
          if (
            mountedRef.current &&
            fullLoader
          ) {
            setLoading(false);
          }
        }
      },
      [quizId, syncTimer],
    );

  useEffect(() => {
    mountedRef.current = true;

    loadPaperStatus();

    return () => {
      mountedRef.current = false;
    };
  }, [loadPaperStatus]);

  useEffect(() => {
    if (
      isSubmitted ||
      serverTimeAtSync === null ||
      localTimeAtSync === null
    ) {
      return undefined;
    }

    const expiresMilliseconds =
      parseDateMilliseconds(
        submission?.expiresAt ||
          paper?.endAt,
      );

    if (
      expiresMilliseconds === null
    ) {
      return undefined;
    }

    function updateRemainingTime() {
      const elapsed =
        Date.now() -
        localTimeAtSync;

      const estimatedServerNow =
        serverTimeAtSync +
        Math.max(0, elapsed);

      setRemainingMilliseconds(
        Math.max(
          0,
          expiresMilliseconds -
            estimatedServerNow,
        ),
      );
    }

    updateRemainingTime();

    const intervalId = setInterval(
      updateRemainingTime,
      1000,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [
    isSubmitted,
    serverTimeAtSync,
    localTimeAtSync,
    submission?.expiresAt,
    paper?.endAt,
  ]);

  async function generateAndOpenPaper() {
    if (openingPaper) {
      return;
    }

    setOpeningPaper(true);
    setError("");

    try {
      const response =
        await api.get(
          `/quiz-student/${quizId}/paper`,
        );

      const result =
        response.data;

      setPaper((current) => ({
        ...(current || {}),
        ...result,
      }));

      setSubmission((current) => ({
        ...(current || {}),
        id:
          result.submissionId ||
          current?.id,
        startedAt:
          current?.startedAt ||
          result.paperGeneratedAt,
        expiresAt:
          result.expiresAt,
        submittedAt:
          result.submittedAt,
        isSubmitted:
          result.isSubmitted,
        isGraded:
          result.isGraded,
        score: result.score,
        files:
          current?.files || [],
      }));

      syncTimer(result);

      await openExternalUrl(
        result.paperUrl,
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't open the combined Paper quiz PDF.",
        ),
      );
    } finally {
      setOpeningPaper(false);
    }
  }

  async function chooseAndUploadFiles() {
    if (controlsDisabled) {
      return;
    }

    setError("");

    const result =
      await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/png",
          "image/jpeg",
          "image/jpg",
        ],

        multiple: true,

        copyToCacheDirectory: true,
      });

    if (
      result.canceled ||
      !result.assets?.length
    ) {
      return;
    }

    const remainingSlots =
      Math.max(
        0,
        10 - uploadedFiles.length,
      );

    if (
      result.assets.length >
      remainingSlots
    ) {
      setError(
        `You can upload only ${remainingSlots} more ${
          remainingSlots === 1
            ? "file"
            : "files"
        }.`,
      );

      return;
    }

    const formData =
      new FormData();

    result.assets.forEach(
      (asset) => {
        appendAssetToFormData(
          formData,
          asset,
        );
      },
    );

    setUploading(true);

    try {
      const response =
        await api.post(
          `/quiz-student/${quizId}/paper/files`,
          formData,
        );

      const updatedSubmission =
        response.data?.submission;

      if (updatedSubmission) {
        setSubmission(
          updatedSubmission,
        );

        syncTimer({
          ...paper,
          submission:
            updatedSubmission,
          serverTime:
            updatedSubmission.serverTime,
        });
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't upload the selected answer files.",
        ),
      );

      const backendSubmission =
        requestError?.response?.data
          ?.data?.submission;

      if (backendSubmission) {
        setSubmission(
          backendSubmission,
        );
      }
    } finally {
      setUploading(false);
    }
  }

  async function openUploadedFile(file) {
    setError("");

    try {
      await openExternalUrl(
        file.fileUrl,
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Couldn't open the uploaded file.",
      );
    }
  }

  async function deleteUploadedFile(
    fileId,
  ) {
    if (controlsDisabled) {
      return;
    }

    setDeletingFileId(fileId);
    setError("");

    try {
      const response =
        await api.delete(
          `/quiz-student/${quizId}/paper/files/${fileId}`,
        );

      if (
        response.data?.submission
      ) {
        setSubmission(
          response.data.submission,
        );
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't delete the uploaded file.",
        ),
      );
    } finally {
      setDeletingFileId(null);
    }
  }

  async function submitPaperQuiz() {
    if (
      controlsDisabled ||
      !uploadedFiles.length
    ) {
      return;
    }

    setShowSubmitConfirmation(
      false,
    );

    setSubmitting(true);
    setError("");

    try {
      const response =
        await api.post(
          `/quiz-student/${quizId}/paper/submit`,
        );

      if (
        response.data?.submission
      ) {
        setSubmission(
          response.data.submission,
        );
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't submit the Paper quiz.",
        ),
      );

      const backendSubmission =
        requestError?.response?.data
          ?.data?.submission;

      if (backendSubmission) {
        setSubmission(
          backendSubmission,
        );
      }
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
          size="large"
          color={colors.primary}
        />

        <Text
          style={styles.loadingText}
        >
          Loading Paper quiz…
        </Text>
      </Screen>
    );
  }

  if (!paper) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <Card style={styles.emptyCard}>
          <View
            style={styles.emptyIcon}
          >
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={colors.danger}
            />
          </View>

          <Text
            style={styles.emptyTitle}
          >
            Paper quiz unavailable
          </Text>

          <Text
            style={
              styles.emptyDescription
            }
          >
            {error ||
              "This Paper quiz could not be loaded."}
          </Text>

          <Button
            title="Back to quizzes"
            onPress={() =>
              router.replace(
                "/(app)/quizzes",
              )
            }
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen
      contentContainerStyle={
        styles.screenContent
      }
    >
      <View
        style={styles.pageHeader}
      >
        <View
          style={styles.pageHeaderCopy}
        >
          <Text style={styles.eyebrow}>
            PAPER QUIZ
          </Text>

          <Text
            style={styles.pageTitle}
          >
            {paper.title}
          </Text>

          <Text
            style={
              styles.pageDescription
            }
          >
            Download the combined
            question paper, complete your
            answers, then upload clear PDF
            or image files.
          </Text>
        </View>

        <View
          style={[
            styles.timerCard,

            deadlinePassed &&
              styles.timerCardExpired,
          ]}
        >
          <View
            style={
              styles.timerHeadingRow
            }
          >
            <Ionicons
              name={
                isSubmitted
                  ? "checkmark-circle-outline"
                  : "timer-outline"
              }
              size={20}
              color={
                isSubmitted
                  ? colors.secondary
                  : deadlinePassed
                    ? colors.warning
                    : colors.primary
              }
            />

            <Text
              style={[
                styles.timerHeading,

                deadlinePassed &&
                  styles.timerHeadingWarning,
              ]}
            >
              {isSubmitted
                ? "Submission status"
                : "Time remaining"}
            </Text>
          </View>

          <Text
            style={[
              styles.timerText,

              deadlinePassed &&
                styles.timerTextWarning,

              isSubmitted &&
                styles.submittedTimerText,
            ]}
          >
            {isSubmitted
              ? "SUBMITTED"
              : timerIsKnown
                ? formatRemainingTime(
                    remainingMilliseconds,
                  )
                : "Until deadline"}
          </Text>
        </View>
      </View>

      {error ? (
        <View
          style={styles.errorAlert}
        >
          <View
            style={styles.errorContent}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text
              style={styles.errorText}
            >
              {error}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              setError("")
            }
            style={
              styles.errorCloseButton
            }
          >
            <Ionicons
              name="close"
              size={20}
              color={colors.danger}
            />
          </Pressable>
        </View>
      ) : null}

      {deadlinePassed &&
      !isSubmitted ? (
        <View
          style={styles.timeWarning}
        >
          <Ionicons
            name="warning-outline"
            size={20}
            color={colors.warning}
          />

          <Text
            style={
              styles.timeWarningText
            }
          >
            The deadline has passed.
            Upload controls are now
            disabled. Refresh the page to
            retrieve the final submission
            status.
          </Text>
        </View>
      ) : null}

      <View
        style={styles.paperSummaryGrid}
      >
        <Card
          style={
            styles.paperSummaryCard
          }
        >
          <Text
            style={
              styles.paperSummaryLabel
            }
          >
            Questions
          </Text>

          <Text
            style={
              styles.paperSummaryValue
            }
          >
            {paper.totalQuestions ?? 0}
          </Text>
        </Card>

        <Card
          style={
            styles.paperSummaryCard
          }
        >
          <Text
            style={
              styles.paperSummaryLabel
            }
          >
            Total marks
          </Text>

          <Text
            style={
              styles.paperSummaryValue
            }
          >
            {paper.totalPoints ?? 0}
          </Text>
        </Card>

        <Card
          style={
            styles.paperSummaryCard
          }
        >
          <Text
            style={
              styles.paperSummaryLabel
            }
          >
            Uploaded files
          </Text>

          <Text
            style={
              styles.paperSummaryValue
            }
          >
            {uploadedFiles.length ||
              submission
                ?.uploadedFileCount ||
              0}
          </Text>
        </Card>

        <Card
          style={
            styles.paperSummaryCard
          }
        >
          <Text
            style={
              styles.paperSummaryLabel
            }
          >
            Grading
          </Text>

          <Text
            style={[
              styles.paperSummaryValue,
              styles.paperSummaryStatusValue,
            ]}
          >
            {isGraded
              ? "Graded"
              : isSubmitted
                ? "Pending"
                : "Not submitted"}
          </Text>
        </Card>
      </View>

      <Card style={styles.paperCard}>
        <View
          style={
            styles.paperSectionHeader
          }
        >
          <View
            style={
              styles.paperSectionIcon
            }
          >
            <Ionicons
              name="document-text-outline"
              size={25}
              color={colors.primary}
            />
          </View>

          <View
            style={
              styles.paperSectionCopy
            }
          >
            <Text
              style={
                styles.paperSectionTitle
              }
            >
              Question paper
            </Text>

            <Text
              style={
                styles.paperSectionDescription
              }
            >
              The selected Written
              questions are combined into
              one private PDF.
            </Text>
          </View>
        </View>

        <Button
          title={
            openingPaper
              ? "Opening Paper…"
              : "Open question paper"
          }
          loading={openingPaper}
          disabled={openingPaper}
          onPress={
            generateAndOpenPaper
          }
          style={styles.fullWidthButton}
        />
      </Card>

      <Card style={styles.paperCard}>
        <View
          style={
            styles.paperSectionHeader
          }
        >
          <View
            style={
              styles.paperSectionIcon
            }
          >
            <Ionicons
              name="cloud-upload-outline"
              size={25}
              color={colors.primary}
            />
          </View>

          <View
            style={
              styles.paperSectionCopy
            }
          >
            <Text
              style={
                styles.paperSectionTitle
              }
            >
              Answer files
            </Text>

            <Text
              style={
                styles.paperSectionDescription
              }
            >
              Upload up to 10 PDF, JPG,
              JPEG, or PNG files. Each
              file may be up to 20 MB.
            </Text>
          </View>
        </View>

        {!isSubmitted ? (
          <Pressable
            disabled={controlsDisabled}
            onPress={
              chooseAndUploadFiles
            }
            style={({ pressed }) => [
              styles.paperUploadZone,

              pressed &&
                !controlsDisabled &&
                styles.pressed,

              controlsDisabled &&
                styles.disabledControl,
            ]}
          >
            {uploading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            ) : (
              <Ionicons
                name="cloud-upload-outline"
                size={36}
                color={colors.primary}
              />
            )}

            <Text
              style={
                styles.paperUploadTitle
              }
            >
              {uploading
                ? "Uploading answer files…"
                : "Choose answer files"}
            </Text>

            <Text
              style={
                styles.paperUploadDescription
              }
            >
              Multiple files can be
              selected in one upload.
            </Text>
          </Pressable>
        ) : (
          <View
            style={
              submission.isAutoSubmitted
                ? styles.paperAutoSubmittedPanel
                : styles.paperSubmittedPanel
            }
          >
            <Ionicons
              name={
                submission.isAutoSubmitted
                  ? "timer-outline"
                  : "checkmark-circle-outline"
              }
              size={22}
              color={
                submission.isAutoSubmitted
                  ? colors.warning
                  : colors.secondary
              }
            />

            <Text
              style={
                submission.isAutoSubmitted
                  ? styles.paperAutoSubmittedText
                  : styles.paperSubmittedText
              }
            >
              {submission.isAutoSubmitted
                ? "The Paper quiz was automatically submitted when the deadline passed."
                : "The Paper quiz has been submitted successfully."}
            </Text>
          </View>
        )}

        <View
          style={styles.paperFileList}
        >
          {uploadedFiles.length ? (
            uploadedFiles.map(
              (file, index) => (
                <View
                  key={file.id}
                  style={
                    styles.paperFileRow
                  }
                >
                  <View
                    style={
                      styles.paperFileOrder
                    }
                  >
                    <Text
                      style={
                        styles.paperFileOrderText
                      }
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      openUploadedFile(
                        file,
                      )
                    }
                    style={
                      styles.paperFileCopy
                    }
                  >
                    <Text
                      numberOfLines={1}
                      style={
                        styles.paperFileName
                      }
                    >
                      {
                        file.originalName
                      }
                    </Text>

                    <Text
                      style={
                        styles.paperFileMeta
                      }
                    >
                      {formatFileSize(
                        file.size,
                      )}
                      {" · "}
                      {file.contentType}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      openUploadedFile(
                        file,
                      )
                    }
                    style={
                      styles.paperFileAction
                    }
                  >
                    <Ionicons
                      name="open-outline"
                      size={20}
                      color={
                        colors.primary
                      }
                    />
                  </Pressable>

                  {!isSubmitted ? (
                    <Pressable
                      disabled={
                        controlsDisabled
                      }
                      onPress={() =>
                        deleteUploadedFile(
                          file.id,
                        )
                      }
                      style={[
                        styles.paperFileDelete,

                        controlsDisabled &&
                          styles.disabledControl,
                      ]}
                    >
                      {deletingFileId ===
                      file.id ? (
                        <ActivityIndicator
                          size="small"
                          color={
                            colors.danger
                          }
                        />
                      ) : (
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={
                            colors.danger
                          }
                        />
                      )}
                    </Pressable>
                  ) : null}
                </View>
              ),
            )
          ) : (
            <View
              style={
                styles.paperEmptyFiles
              }
            >
              <Ionicons
                name="documents-outline"
                size={30}
                color={colors.textMuted}
              />

              <Text
                style={
                  styles.paperEmptyFilesTitle
                }
              >
                No answer files uploaded
              </Text>

              <Text
                style={
                  styles.paperEmptyFilesDescription
                }
              >
                Your uploaded answer pages
                will appear here in order.
              </Text>
            </View>
          )}
        </View>

        {!isSubmitted ? (
          <Button
            title={
              submitting
                ? "Submitting…"
                : "Submit Paper quiz"
            }
            variant="warning"
            loading={submitting}
            disabled={
              controlsDisabled ||
              !uploadedFiles.length
            }
            onPress={() =>
              setShowSubmitConfirmation(
                true,
              )
            }
            style={styles.fullWidthButton}
          />
        ) : null}
      </Card>

      {isSubmitted ? (
        <StudentQuizReview
          quizId={quizId}
          showBackButton={false}
        />
      ) : null}

      <Button
        title="Back to quizzes"
        variant="outline"
        onPress={() =>
          router.replace(
            "/(app)/quizzes",
          )
        }
        style={styles.backButton}
      />

      <PaperSubmitConfirmationModal
        visible={
          showSubmitConfirmation
        }
        fileCount={
          uploadedFiles.length
        }
        submitting={submitting}
        onCancel={() =>
          setShowSubmitConfirmation(
            false,
          )
        }
        onConfirm={
          submitPaperQuiz
        }
      />
    </Screen>
  );
}

function McqQuizPage({ quizId }) {
  const router = useRouter();

  const { width } =
    useWindowDimensions();

  const isDesktop =
    width >= DESKTOP_BREAKPOINT;

  const autoSubmitStartedRef =
    useRef(false);

  const pageMountedRef =
    useRef(true);

  const [quiz, setQuiz] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [index, setIndex] =
    useState(0);

  const [
    serverTimeAtSync,
    setServerTimeAtSync,
  ] = useState(null);

  const [
    localTimeAtSync,
    setLocalTimeAtSync,
  ] = useState(null);

  const [
    remainingMilliseconds,
    setRemainingMilliseconds,
  ] = useState(null);

  const [
    savingQuestionId,
    setSavingQuestionId,
  ] = useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(null);

  const [
    showSubmitConfirmation,
    setShowSubmitConfirmation,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    openingQuestion,
    setOpeningQuestion,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const questions = useMemo(() => {
    return Array.isArray(
      quiz?.questions,
    )
      ? quiz.questions
      : [];
  }, [quiz]);

  const total = questions.length;

  const question =
    questions[index] || null;

  const currentAnswer = question
    ? answers[question.id]
    : null;

  const answeredCount =
    useMemo(() => {
      return questions.reduce(
        (count, item) =>
          answers[item.id]
            ? count + 1
            : count,
        0,
      );
    }, [questions, answers]);

  const unansweredCount =
    Math.max(
      total - answeredCount,
      0,
    );

  const progressPercentage =
    total > 0
      ? ((index + 1) / total) *
        100
      : 0;

  const isSavingCurrentQuestion =
    question?.id ===
    savingQuestionId;

  const timerIsKnown =
    Number.isFinite(
      remainingMilliseconds,
    );

  const timeIsExpired =
    timerIsKnown &&
    remainingMilliseconds <= 0;

  const showFiveMinuteWarning =
    timerIsKnown &&
    remainingMilliseconds > 0 &&
    remainingMilliseconds <=
      FIVE_MINUTES_MS;

  const controlsDisabled =
    submitting ||
    Boolean(savingQuestionId) ||
    timeIsExpired ||
    Boolean(submitted);

  const totalPoints =
    submitted?.totalPoints ??
    quiz?.totalPoints ??
    questions.reduce(
      (sum, item) =>
        sum +
        Number(item.points || 0),
      0,
    );

  const syncAuthoritativeTimer =
    useCallback((attempt) => {
      const serverMilliseconds =
        parseDateMilliseconds(
          attempt?.serverTime,
        );

      const expiresMilliseconds =
        parseDateMilliseconds(
          attempt?.expiresAt,
        );

      if (
        serverMilliseconds === null ||
        expiresMilliseconds === null
      ) {
        setServerTimeAtSync(null);
        setLocalTimeAtSync(null);
        setRemainingMilliseconds(null);

        return;
      }

      const localNow = Date.now();

      setServerTimeAtSync(
        serverMilliseconds,
      );

      setLocalTimeAtSync(localNow);

      setRemainingMilliseconds(
        Math.max(
          0,
          expiresMilliseconds -
            serverMilliseconds,
        ),
      );
    }, []);

  const loadExistingSubmission =
    useCallback(async () => {
      try {
        const response =
          await api.get(
            `/quiz-student/${quizId}/my-submission`,
          );

        const submission =
          normalizeSubmissionResponse(
            response.data,
          );

        if (
          pageMountedRef.current &&
          submission
        ) {
          setSubmitted(submission);
          return true;
        }
      } catch {
        // Keep the caller's original error.
      }

      return false;
    }, [quizId]);

  const loadQuiz =
    useCallback(async () => {
      setLoading(true);
      setError("");

      autoSubmitStartedRef.current =
        false;

      try {
        await api.post(
          `/quiz-student/${quizId}/start`,
        );

        const response =
          await api.get(
            `/quiz-student/${quizId}/take`,
          );

        const attempt =
          normalizeAttemptResponse(
            response.data,
          );

        if (!attempt) {
          throw new Error(
            "The quiz attempt could not be loaded.",
          );
        }

        if (
          attempt.type &&
          attempt.type !== "MCQ"
        ) {
          throw new Error(
            "This is not an MCQ quiz.",
          );
        }

        if (
          !pageMountedRef.current
        ) {
          return;
        }

        setQuiz(attempt);

        setAnswers(
          normalizeAnswers(
            attempt.answers,
          ),
        );

        setSubmitted(
          attempt.submission
            ?.isSubmitted
            ? attempt.submission
            : attempt.isSubmitted
              ? attempt
              : null,
        );

        syncAuthoritativeTimer(
          attempt,
        );
      } catch (requestError) {
        const message =
          getErrorMessage(
            requestError,
            requestError?.message ||
              "Couldn't load the quiz.",
          );

        const submissionLoaded =
          isAlreadySubmittedMessage(
            message,
          )
            ? await loadExistingSubmission()
            : false;

        if (
          pageMountedRef.current &&
          !submissionLoaded
        ) {
          setError(message);
        }
      } finally {
        if (
          pageMountedRef.current
        ) {
          setLoading(false);
        }
      }
    }, [
      quizId,
      loadExistingSubmission,
      syncAuthoritativeTimer,
    ]);

  const submitQuiz =
    useCallback(
      async ({
        automatic = false,
      } = {}) => {
        if (
          submitting ||
          submitted
        ) {
          return;
        }

        if (
          automatic &&
          autoSubmitStartedRef.current
        ) {
          return;
        }

        if (automatic) {
          autoSubmitStartedRef.current =
            true;
        }

        setShowSubmitConfirmation(
          false,
        );

        setSubmitting(true);
        setError("");

        try {
          const response =
            await api.post(
              `/quiz-student/${quizId}/submit`,
            );

          const submission =
            normalizeSubmissionResponse(
              response.data,
            );

          if (!submission) {
            throw new Error(
              "The server did not return the submitted result.",
            );
          }

          if (
            pageMountedRef.current
          ) {
            setSubmitted(submission);
            setRemainingMilliseconds(
              0,
            );
          }
        } catch (requestError) {
          const message =
            getErrorMessage(
              requestError,
              automatic
                ? "Time expired, but the result could not be refreshed."
                : "Couldn't submit the quiz.",
            );

          if (
            isAlreadySubmittedMessage(
              message,
            )
          ) {
            const submissionLoaded =
              await loadExistingSubmission();

            if (
              !submissionLoaded
            ) {
              setError(message);
            }
          } else if (
            pageMountedRef.current
          ) {
            setError(message);

            if (automatic) {
              autoSubmitStartedRef.current =
                false;
            }
          }
        } finally {
          if (
            pageMountedRef.current
          ) {
            setSubmitting(false);
          }
        }
      },
      [
        loadExistingSubmission,
        quizId,
        submitted,
        submitting,
      ],
    );

  useEffect(() => {
    pageMountedRef.current = true;

    loadQuiz();

    return () => {
      pageMountedRef.current =
        false;
    };
  }, [loadQuiz]);

  useEffect(() => {
    if (
      submitted ||
      serverTimeAtSync === null ||
      localTimeAtSync === null ||
      !quiz?.expiresAt
    ) {
      return undefined;
    }

    const expiresMilliseconds =
      parseDateMilliseconds(
        quiz.expiresAt,
      );

    if (
      expiresMilliseconds === null
    ) {
      return undefined;
    }

    function updateRemainingTime() {
      const elapsedLocalTime =
        Date.now() -
        localTimeAtSync;

      const estimatedServerNow =
        serverTimeAtSync +
        Math.max(
          0,
          elapsedLocalTime,
        );

      setRemainingMilliseconds(
        Math.max(
          0,
          expiresMilliseconds -
            estimatedServerNow,
        ),
      );
    }

    updateRemainingTime();

    const intervalId = setInterval(
      updateRemainingTime,
      1000,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [
    quiz?.expiresAt,
    localTimeAtSync,
    serverTimeAtSync,
    submitted,
  ]);

  useEffect(() => {
    if (
      submitted ||
      submitting ||
      !timerIsKnown ||
      remainingMilliseconds > 0
    ) {
      return;
    }

    submitQuiz({
      automatic: true,
    });
  }, [
    remainingMilliseconds,
    submitQuiz,
    submitted,
    submitting,
    timerIsKnown,
  ]);

  async function answerMCQ(
    questionId,
    letter,
  ) {
    if (
      controlsDisabled ||
      !OPTIONS.includes(letter)
    ) {
      return;
    }

    const previousAnswer =
      answers[questionId];

    setAnswers((current) => ({
      ...current,
      [questionId]: letter,
    }));

    setSavingQuestionId(
      questionId,
    );

    setError("");

    try {
      await api.post(
        `/quiz-student/${quizId}/questions/${questionId}/answer`,
        {
          answerText: letter,
        },
      );
    } catch (requestError) {
      setAnswers((current) => {
        const next = {
          ...current,
        };

        if (previousAnswer) {
          next[questionId] =
            previousAnswer;
        } else {
          delete next[questionId];
        }

        return next;
      });

      const message =
        getErrorMessage(
          requestError,
          "Couldn't save your answer.",
        );

      setError(message);

      if (
        isAlreadySubmittedMessage(
          message,
        )
      ) {
        await loadExistingSubmission();
      }
    } finally {
      if (
        pageMountedRef.current
      ) {
        setSavingQuestionId(null);
      }
    }
  }

  async function openQuestionFile() {
    if (
      !question?.questionFileUrl ||
      openingQuestion
    ) {
      return;
    }

    setOpeningQuestion(true);
    setError("");

    try {
      await openExternalUrl(
        question.questionFileUrl,
      );
    } catch {
      setError(
        "The question file could not be opened.",
      );
    } finally {
      setOpeningQuestion(false);
    }
  }

  function goToQuestion(
    nextIndex,
  ) {
    if (
      nextIndex < 0 ||
      nextIndex >= total ||
      controlsDisabled
    ) {
      return;
    }

    setError("");
    setIndex(nextIndex);
  }

  function requestSubmit() {
    if (controlsDisabled) {
      return;
    }

    setError("");

    setShowSubmitConfirmation(
      true,
    );
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

        <Text
          style={styles.loadingText}
        >
          Preparing your quiz…
        </Text>
      </Screen>
    );
  }

  if (!quiz && !submitted) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <Card style={styles.emptyCard}>
          <View
            style={styles.emptyIcon}
          >
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={colors.danger}
            />
          </View>

          <Text
            style={styles.emptyTitle}
          >
            Quiz unavailable
          </Text>

          <Text
            style={
              styles.emptyDescription
            }
          >
            {error ||
              "This quiz could not be loaded."}
          </Text>

          <Button
            title="Back to quizzes"
            onPress={() =>
              router.replace(
                "/(app)/quizzes",
              )
            }
          />
        </Card>
      </Screen>
    );
  }

  if (submitted) {
    return (
      <Screen
        contentContainerStyle={
          styles.screenContent
        }
      >
        <StudentQuizReview
          quizId={quizId}
          onBack={() =>
            router.replace(
              "/(app)/quizzes",
            )
          }
        />
      </Screen>
    );
  }

  return (
    <Screen
      contentContainerStyle={
        styles.screenContent
      }
    >
      <View
        style={styles.pageHeader}
      >
        <View
          style={styles.pageHeaderCopy}
        >
          <Text style={styles.eyebrow}>
            TIMED MCQ
          </Text>

          <Text
            style={styles.pageTitle}
          >
            {quiz.title}
          </Text>

          <Text
            style={
              styles.pageDescription
            }
          >
            Your answers are saved
            individually. Submit before
            the timer expires.
          </Text>
        </View>

        <View
          style={[
            styles.timerCard,

            showFiveMinuteWarning &&
              styles.timerCardWarning,

            timeIsExpired &&
              styles.timerCardExpired,
          ]}
        >
          <View
            style={
              styles.timerHeadingRow
            }
          >
            <Ionicons
              name="timer-outline"
              size={20}
              color={
                showFiveMinuteWarning ||
                timeIsExpired
                  ? colors.warning
                  : colors.primary
              }
            />

            <Text
              style={[
                styles.timerHeading,

                (showFiveMinuteWarning ||
                  timeIsExpired) &&
                  styles.timerHeadingWarning,
              ]}
            >
              Time remaining
            </Text>
          </View>

          <Text
            style={[
              styles.timerText,

              (showFiveMinuteWarning ||
                timeIsExpired) &&
                styles.timerTextWarning,
            ]}
          >
            {formatRemainingTime(
              remainingMilliseconds,
            )}
          </Text>
        </View>
      </View>

      {showFiveMinuteWarning ? (
        <View
          style={styles.timeWarning}
        >
          <Ionicons
            name="warning-outline"
            size={20}
            color={colors.warning}
          />

          <Text
            style={
              styles.timeWarningText
            }
          >
            Fewer than five minutes
            remain. Review unanswered
            questions and submit soon.
          </Text>
        </View>
      ) : null}

      {submitting &&
      timeIsExpired ? (
        <View
          style={
            styles.autoSubmittingAlert
          }
        >
          <ActivityIndicator
            size="small"
            color={colors.warning}
          />

          <Text
            style={
              styles.autoSubmittingText
            }
          >
            Time expired. Submitting your
            saved answers…
          </Text>
        </View>
      ) : null}

      {error ? (
        <View
          style={styles.errorAlert}
        >
          <View
            style={styles.errorContent}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text
              style={styles.errorText}
            >
              {error}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              setError("")
            }
            style={
              styles.errorCloseButton
            }
          >
            <Ionicons
              name="close"
              size={20}
              color={colors.danger}
            />
          </Pressable>
        </View>
      ) : null}

      <View
        style={styles.progressHeader}
      >
        <View>
          <Text
            style={
              styles.questionCounter
            }
          >
            Question {index + 1} of{" "}
            {total}
          </Text>

          <Text
            style={
              styles.answeredCounter
            }
          >
            {answeredCount} of {total}{" "}
            answered
          </Text>
        </View>

        <Text
          style={
            styles.progressPercentage
          }
        >
          {Math.round(
            progressPercentage,
          )}
          %
        </Text>
      </View>

      <View
        style={styles.progressTrack}
      >
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

          isDesktop &&
            styles.workspaceDesktop,
        ]}
      >
        <View
          style={styles.mainColumn}
        >
          {question ? (
            <Card
              style={
                styles.questionCard
              }
            >
              <View
                style={
                  styles.questionTopRow
                }
              >
                <View
                  style={
                    styles.questionBadges
                  }
                >
                  <Badge
                    label="MULTIPLE CHOICE"
                    tone="neutral"
                  />

                  <Badge
                    label={`${
                      question.points ??
                      0
                    } ${
                      Number(
                        question.points,
                      ) === 1
                        ? "point"
                        : "points"
                    }`}
                    tone="neutral"
                  />
                </View>

                {currentAnswer ? (
                  <View
                    style={
                      styles.savedStatusCompact
                    }
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={
                        colors.secondary
                      }
                    />

                    <Text
                      style={
                        styles.savedStatusText
                      }
                    >
                      Saved
                    </Text>
                  </View>
                ) : null}
              </View>

              {question.title ? (
                <Text
                  style={
                    styles.questionTitle
                  }
                >
                  {question.title}
                </Text>
              ) : null}

              {question.reference ? (
                <Text
                  style={
                    styles.questionReference
                  }
                >
                  Reference:{" "}
                  {question.reference}
                </Text>
              ) : null}

              <Pressable
                onPress={
                  openQuestionFile
                }
                disabled={
                  openingQuestion ||
                  !question.questionFileUrl
                }
                style={({ pressed }) => [
                  styles.fileButton,

                  pressed &&
                    styles.pressed,

                  !question.questionFileUrl &&
                    styles.disabledControl,
                ]}
              >
                <View
                  style={
                    styles.fileIconContainer
                  }
                >
                  {openingQuestion ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        colors.primary
                      }
                    />
                  ) : (
                    <Ionicons
                      name="document-text-outline"
                      size={24}
                      color={
                        colors.primary
                      }
                    />
                  )}
                </View>

                <View
                  style={
                    styles.fileButtonTextContainer
                  }
                >
                  <Text
                    style={
                      styles.fileButtonTitle
                    }
                  >
                    View question
                  </Text>

                  <Text
                    style={
                      styles.fileButtonDescription
                    }
                  >
                    Open the uploaded
                    question document
                  </Text>
                </View>

                <Ionicons
                  name="open-outline"
                  size={20}
                  color={
                    colors.textMuted
                  }
                />
              </Pressable>

              <Text
                style={
                  styles.sectionLabel
                }
              >
                Select your answer
              </Text>

              <Text
                style={
                  styles.sectionHelp
                }
              >
                Choose A, B, C, or D. You
                may change your answer
                before submission.
              </Text>

              <View
                style={[
                  styles.optionsGrid,

                  isDesktop &&
                    styles.optionsGridDesktop,
                ]}
              >
                {OPTIONS.map(
                  (letter) => {
                    const isSelected =
                      currentAnswer ===
                      letter;

                    const isSaving =
                      isSavingCurrentQuestion &&
                      isSelected;

                    return (
                      <Pressable
                        key={letter}
                        disabled={
                          controlsDisabled
                        }
                        onPress={() =>
                          answerMCQ(
                            question.id,
                            letter,
                          )
                        }
                        style={({
                          pressed,
                        }) => [
                          styles.optionTile,

                          isDesktop &&
                            styles.optionTileDesktop,

                          isSelected &&
                            styles.optionTileSelected,

                          pressed &&
                            !controlsDisabled &&
                            styles.pressed,

                          controlsDisabled &&
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

                        <View
                          style={
                            styles.optionCheckArea
                          }
                        >
                          {isSaving ? (
                            <ActivityIndicator
                              size="small"
                              color={
                                colors.primary
                              }
                            />
                          ) : isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={23}
                              color={
                                colors.primary
                              }
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
                  },
                )}
              </View>

              {isSavingCurrentQuestion ? (
                <View
                  style={
                    styles.savingStatus
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color={
                      colors.primary
                    }
                  />

                  <Text
                    style={
                      styles.savingStatusText
                    }
                  >
                    Saving your answer…
                  </Text>
                </View>
              ) : currentAnswer ? (
                <View
                  style={
                    styles.savedStatus
                  }
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={
                      colors.secondary
                    }
                  />

                  <Text
                    style={
                      styles.savedStatusText
                    }
                  >
                    Answer{" "}
                    {currentAnswer} is
                    saved
                  </Text>
                </View>
              ) : null}
            </Card>
          ) : (
            <Card
              style={
                styles.emptyQuestionCard
              }
            >
              <Ionicons
                name="help-circle-outline"
                size={30}
                color={
                  colors.textMuted
                }
              />

              <Text
                style={
                  styles.emptyQuestionText
                }
              >
                No question is available
                at this position.
              </Text>
            </Card>
          )}

          <View
            style={[
              styles.navigationRow,

              !isDesktop &&
                styles.navigationRowMobile,
            ]}
          >
            <Button
              title="Previous"
              variant="outline"
              disabled={
                index === 0 ||
                controlsDisabled
              }
              onPress={() =>
                goToQuestion(
                  index - 1,
                )
              }
              style={
                styles.navigationButton
              }
            />

            {index <
            total - 1 ? (
              <Button
                title="Next question"
                disabled={
                  controlsDisabled
                }
                onPress={() =>
                  goToQuestion(
                    index + 1,
                  )
                }
                style={
                  styles.navigationButton
                }
              />
            ) : (
              <Button
                title={
                  submitting
                    ? "Submitting…"
                    : "Submit quiz"
                }
                variant="warning"
                loading={submitting}
                disabled={
                  controlsDisabled
                }
                onPress={
                  requestSubmit
                }
                style={
                  styles.navigationButton
                }
              />
            )}
          </View>
        </View>

        {isDesktop ? (
          <Card
            style={
              styles.navigatorCard
            }
          >
            <Text
              style={
                styles.navigatorTitle
              }
            >
              Quiz progress
            </Text>

            <Text
              style={
                styles.navigatorDescription
              }
            >
              Select a question to review
              or update your answer.
            </Text>

            <View
              style={styles.questionGrid}
            >
              {questions.map(
                (
                  item,
                  questionIndex,
                ) => {
                  const isCurrent =
                    questionIndex ===
                    index;

                  const isAnswered =
                    Boolean(
                      answers[
                        item.id
                      ],
                    );

                  return (
                    <Pressable
                      key={item.id}
                      disabled={
                        controlsDisabled
                      }
                      onPress={() =>
                        goToQuestion(
                          questionIndex,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.questionNumber,

                        isAnswered &&
                          styles.questionNumberAnswered,

                        isCurrent &&
                          styles.questionNumberCurrent,

                        pressed &&
                          !controlsDisabled &&
                          styles.pressed,

                        controlsDisabled &&
                          styles.disabledControl,
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
                        {questionIndex +
                          1}
                      </Text>

                      {isAnswered &&
                      !isCurrent ? (
                        <View
                          style={
                            styles.questionCheck
                          }
                        >
                          <Ionicons
                            name="checkmark"
                            size={10}
                            color={
                              colors.white
                            }
                          />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                },
              )}
            </View>

            <View
              style={
                styles.navigatorDivider
              }
            />

            <View
              style={
                styles.navigatorStatRow
              }
            >
              <Text
                style={
                  styles.navigatorStatLabel
                }
              >
                Answered
              </Text>

              <Text
                style={
                  styles.navigatorStatValue
                }
              >
                {answeredCount}
              </Text>
            </View>

            <View
              style={
                styles.navigatorStatRow
              }
            >
              <Text
                style={
                  styles.navigatorStatLabel
                }
              >
                Unanswered
              </Text>

              <Text
                style={
                  styles.navigatorStatValue
                }
              >
                {unansweredCount}
              </Text>
            </View>

            <View
              style={styles.legend}
            >
              <LegendItem
                style={
                  styles.legendCurrent
                }
                label="Current"
              />

              <LegendItem
                style={
                  styles.legendAnswered
                }
                label="Answered"
              />

              <LegendItem
                style={
                  styles.legendUnanswered
                }
                label="Unanswered"
              />
            </View>

            <Button
              title="Submit quiz"
              variant="warning"
              loading={submitting}
              disabled={
                controlsDisabled
              }
              onPress={requestSubmit}
              style={
                styles.navigatorSubmitButton
              }
            />
          </Card>
        ) : null}
      </View>

      <McqSubmitConfirmationModal
        visible={
          showSubmitConfirmation
        }
        answeredCount={
          answeredCount
        }
        unansweredCount={
          unansweredCount
        }
        total={total}
        submitting={submitting}
        onCancel={() =>
          setShowSubmitConfirmation(
            false,
          )
        }
        onConfirm={() =>
          submitQuiz({
            automatic: false,
          })
        }
      />
    </Screen>
  );
}