import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Badge } from "../../../../src/components/ui/Badge";
import { Button } from "../../../../src/components/ui/Button";
import { Card } from "../../../../src/components/ui/Card";

import api from "../../../../src/lib/api";
import { colors } from "../../../../src/theme";

import { styles } from "./StudentQuizReview.styles";

function getErrorMessage(
  error,
  fallback = "Something went wrong.",
) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

async function openFileUrl(url) {
  if (!url) {
    throw new Error(
      "The file URL is unavailable.",
    );
  }

  const supported =
    await Linking.canOpenURL(url);

  if (!supported) {
    throw new Error(
      "This file cannot be opened.",
    );
  }

  await Linking.openURL(url);
}

export function StudentQuizReview({
  quizId,
  onBack,
  showBackButton = true,
}) {
  const [review, setReview] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [openingFileId, setOpeningFileId] =
    useState("");

  const [error, setError] =
    useState("");

  const loadReview = useCallback(
    async ({
      silent = false,
    } = {}) => {
      if (!quizId) {
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response =
          await api.get(
            `/quiz-student/${quizId}/review`,
          );

        setReview(
          response.data || null,
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load the quiz result.",
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [quizId],
  );

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  async function openReviewFile(
    file,
    fallbackId,
  ) {
    const fileId =
      file?.id ||
      fallbackId ||
      file?.fileUrl ||
      file?.questionFileUrl;

    setOpeningFileId(
      String(fileId || ""),
    );

    setError("");

    try {
      await openFileUrl(
        file?.fileUrl ||
          file?.url ||
          file?.questionFileUrl,
      );
    } catch (openError) {
      setError(
        openError?.message ||
          "Couldn't open the selected file.",
      );
    } finally {
      setOpeningFileId("");
    }
  }

  if (loading) {
    return (
      <Card style={styles.loadingCard}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading your result…
        </Text>
      </Card>
    );
  }

  if (!review) {
    return (
      <Card style={styles.errorCard}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color={colors.danger}
          />
        </View>

        <Text style={styles.errorTitle}>
          Result unavailable
        </Text>

        <Text style={styles.errorDescription}>
          {error ||
            "Your submitted result could not be loaded."}
        </Text>

        <Button
          title="Try again"
          onPress={() =>
            loadReview()
          }
        />

        {showBackButton ? (
          <Button
            title="Back to quizzes"
            variant="outline"
            onPress={onBack}
          />
        ) : null}
      </Card>
    );
  }

  const isMcq =
    review.reviewType === "MCQ";

  const isPaper =
    review.reviewType === "PAPER";

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={colors.danger}
          />

          <Text style={styles.errorBannerText}>
            {error}
          </Text>

          <Pressable
            onPress={() =>
              setError("")
            }
            style={styles.closeError}
          >
            <Ionicons
              name="close"
              size={18}
              color={colors.danger}
            />
          </Pressable>
        </View>
      ) : null}

      <Card style={styles.resultHeaderCard}>
        <View style={styles.resultHeader}>
          <View
            style={[
              styles.resultIcon,

              isPaper &&
                !review.submission
                  ?.isGraded &&
                styles.pendingResultIcon,
            ]}
          >
            <Ionicons
              name={
                isPaper &&
                !review.submission
                  ?.isGraded
                  ? "time-outline"
                  : "checkmark-done-outline"
              }
              size={30}
              color={
                isPaper &&
                !review.submission
                  ?.isGraded
                  ? colors.warning
                  : colors.secondary
              }
            />
          </View>

          <View style={styles.resultHeaderCopy}>
            <Text style={styles.eyebrow}>
              {isMcq
                ? "MCQ RESULT"
                : "WRITTEN EXAM RESULT"}
            </Text>

            <Text style={styles.resultTitle}>
              {review.quiz?.title ||
                "Quiz result"}
            </Text>

            <Text
              style={
                styles.resultDescription
              }
            >
              {isMcq
                ? "Review your answers and the correct answers below."
                : review.submission
                      ?.isGraded
                  ? "Your written exam has been graded."
                  : "Your written exam is awaiting manual grading."}
            </Text>
          </View>

          <Badge
            label={
              isMcq
                ? "AUTO-GRADED"
                : review.submission
                      ?.isGraded
                  ? "GRADED"
                  : "PENDING"
            }
            tone={
              isMcq ||
              review.submission
                ?.isGraded
                ? "success"
                : "warning"
            }
          />
        </View>

        <View style={styles.summaryGrid}>
          <SummaryItem
            label={
              isMcq
                ? "Final score"
                : review.submission
                      ?.isGraded
                  ? "Final grade"
                  : "Grade"
            }
            value={
              review.submission?.score ===
                null ||
              review.submission?.score ===
                undefined
                ? "Pending"
                : `${review.submission.score} / ${
                    review.submission
                      .totalPoints ??
                    review.quiz
                      ?.totalPoints ??
                    0
                  }`
            }
          />

          <SummaryItem
            label="Submitted"
            value={formatDateTime(
              review.submission
                ?.submittedAt,
            )}
          />

          <SummaryItem
            label="Submission type"
            value={
              review.submission
                ?.isAutoSubmitted
                ? "Automatic"
                : "Manual"
            }
          />

          {isPaper ? (
            <SummaryItem
              label="Grading status"
              value={
                review.submission
                  ?.isGraded
                  ? "Completed"
                  : "Awaiting grading"
              }
            />
          ) : null}
        </View>

        <Button
          title={
            refreshing
              ? "Refreshing…"
              : "Refresh result"
          }
          variant="outline"
          loading={refreshing}
          disabled={refreshing}
          onPress={() =>
            loadReview({
              silent: true,
            })
          }
        />
      </Card>

      {isMcq ? (
        <McqResult
          review={review.mcqReview}
          openingFileId={openingFileId}
          onOpenFile={
            openReviewFile
          }
        />
      ) : null}

      {isPaper ? (
        <PaperResult
          review={review}
          openingFileId={openingFileId}
          onOpenFile={
            openReviewFile
          }
        />
      ) : null}

      {showBackButton ? (
        <Button
          title="Back to quizzes"
          variant="outline"
          onPress={onBack}
          style={styles.backButton}
        />
      ) : null}
    </View>
  );
}

function SummaryItem({
  label,
  value,
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  );
}

function McqResult({
  review,
  openingFileId,
  onOpenFile,
}) {
  const questions =
    Array.isArray(review?.questions)
      ? review.questions
      : [];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Answer review
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            Correct answers are shown
            because the quiz has already
            been submitted.
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <Badge
            label={`${review?.correctCount || 0} correct`}
            tone="success"
          />

          <Badge
            label={`${review?.incorrectCount || 0} incorrect`}
            tone="danger"
          />

          <Badge
            label={`${review?.unansweredCount || 0} unanswered`}
            tone="neutral"
          />
        </View>
      </View>

      {questions.map((question) => {
        const fileId =
          question.questionId ||
          question.quizQuestionId;

        const opening =
          String(openingFileId) ===
          String(fileId);

        return (
          <Card
            key={
              question.quizQuestionId ||
              question.questionId
            }
            style={
              styles.questionCard
            }
          >
            <View
              style={
                styles.questionHeader
              }
            >
              <View
                style={
                  styles.questionNumber
                }
              >
                <Text
                  style={
                    styles.questionNumberText
                  }
                >
                  {question.number}
                </Text>
              </View>

              <View
                style={
                  styles.questionCopy
                }
              >
                <Text
                  style={
                    styles.questionTitle
                  }
                >
                  {question.title ||
                    `Question ${question.number}`}
                </Text>

                {question.reference ? (
                  <Text
                    style={
                      styles.questionReference
                    }
                  >
                    {question.reference}
                  </Text>
                ) : null}

                <Text
                  style={
                    styles.questionMarks
                  }
                >
                  {question.points || 0}{" "}
                  marks
                </Text>
              </View>

              <Badge
                label={
                  !question.answered
                    ? "UNANSWERED"
                    : question.isCorrect
                      ? "CORRECT"
                      : "INCORRECT"
                }
                tone={
                  !question.answered
                    ? "neutral"
                    : question.isCorrect
                      ? "success"
                      : "danger"
                }
              />
            </View>

            {question.questionFileUrl ? (
              <Button
                title={
                  opening
                    ? "Opening…"
                    : "Open question file"
                }
                variant="outline"
                loading={opening}
                disabled={opening}
                onPress={() =>
                  onOpenFile(
                    {
                      questionFileUrl:
                        question.questionFileUrl,
                    },
                    fileId,
                  )
                }
              />
            ) : null}

            <View
              style={
                styles.answerGrid
              }
            >
              <AnswerBox
                label="Your answer"
                value={
                  question.studentAnswer ||
                  "No answer"
                }
                status={
                  !question.answered
                    ? "neutral"
                    : question.isCorrect
                      ? "success"
                      : "danger"
                }
              />

              <AnswerBox
                label="Correct answer"
                value={
                  question.correctAnswer ||
                  "—"
                }
                status="success"
              />

              <AnswerBox
                label="Marks earned"
                value={`${
                  question.earnedPoints ||
                  0
                } / ${
                  question.points || 0
                }`}
                status="neutral"
              />
            </View>
          </Card>
        );
      })}
    </View>
  );
}

function AnswerBox({
  label,
  value,
  status,
}) {
  return (
    <View
      style={[
        styles.answerBox,

        status === "success" &&
          styles.answerBoxSuccess,

        status === "danger" &&
          styles.answerBoxDanger,
      ]}
    >
      <Text
        style={styles.answerLabel}
      >
        {label}
      </Text>

      <Text
        style={styles.answerValue}
      >
        {value}
      </Text>
    </View>
  );
}

function PaperResult({
  review,
  openingFileId,
  onOpenFile,
}) {
  const answerFiles =
    Array.isArray(
      review.paperReview
        ?.answerFiles,
    )
      ? review.paperReview
          .answerFiles
      : [];

  const correctedFiles =
    Array.isArray(
      review.paperReview
        ?.correctedFiles,
    )
      ? review.paperReview
          .correctedFiles
      : [];

  const isGraded =
    Boolean(
      review.submission?.isGraded,
    );

  return (
    <View style={styles.section}>
      {!isGraded ? (
        <Card
          style={
            styles.pendingCard
          }
        >
          <View
            style={
              styles.pendingIcon
            }
          >
            <Ionicons
              name="time-outline"
              size={27}
              color={colors.warning}
            />
          </View>

          <View
            style={
              styles.pendingCopy
            }
          >
            <Text
              style={
                styles.pendingTitle
              }
            >
              Awaiting manual grading
            </Text>

            <Text
              style={
                styles.pendingDescription
              }
            >
              Your teacher, Head
              Assistant, or an authorized
              Assistant will review your
              submitted files.
            </Text>
          </View>
        </Card>
      ) : (
        <>
          {review.submission
            ?.gradingComments ? (
            <Card
              style={
                styles.commentsCard
              }
            >
              <View
                style={
                  styles.commentsHeader
                }
              >
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={22}
                  color={colors.primary}
                />

                <Text
                  style={
                    styles.commentsTitle
                  }
                >
                  Grader comments
                </Text>
              </View>

              <Text
                style={
                  styles.commentsText
                }
              >
                {
                  review.submission
                    .gradingComments
                }
              </Text>
            </Card>
          ) : null}
        </>
      )}

      <FileList
        title="Your submitted answer files"
        description="These are the files you submitted for grading."
        emptyText="No submitted answer files were returned by the server."
        files={answerFiles}
        openingFileId={openingFileId}
        onOpenFile={onOpenFile}
      />

      <FileList
        title="Corrected files"
        description={
          isGraded
            ? "Open the corrected files returned by your grader."
            : "Corrected files will appear here after grading."
        }
        emptyText={
          isGraded
            ? "The grader has not uploaded a corrected file."
            : "Your exam has not been graded yet."
        }
        files={correctedFiles}
        openingFileId={openingFileId}
        onOpenFile={onOpenFile}
        highlighted
      />

      <View
        style={
          styles.privateNotice
        }
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={21}
          color={colors.primary}
        />

        <Text
          style={
            styles.privateNoticeText
          }
        >
          Written-question markschemes
          are private and are not shown
          to students.
        </Text>
      </View>
    </View>
  );
}

function FileList({
  title,
  description,
  emptyText,
  files,
  openingFileId,
  onOpenFile,
  highlighted = false,
}) {
  return (
    <Card
      style={[
        styles.fileSection,

        highlighted &&
          styles.correctedFileSection,
      ]}
    >
      <View
        style={
          styles.fileSectionHeader
        }
      >
        <View
          style={[
            styles.fileSectionIcon,

            highlighted &&
              styles.correctedFileIcon,
          ]}
        >
          <Ionicons
            name={
              highlighted
                ? "checkmark-done-outline"
                : "documents-outline"
            }
            size={23}
            color={
              highlighted
                ? colors.secondary
                : colors.primary
            }
          />
        </View>

        <View
          style={
            styles.fileSectionCopy
          }
        >
          <Text
            style={
              styles.fileSectionTitle
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.fileSectionDescription
            }
          >
            {description}
          </Text>
        </View>
      </View>

      {!files.length ? (
        <View style={styles.emptyFiles}>
          <Ionicons
            name="document-outline"
            size={27}
            color={colors.textMuted}
          />

          <Text
            style={
              styles.emptyFilesText
            }
          >
            {emptyText}
          </Text>
        </View>
      ) : (
        <View style={styles.fileList}>
          {files.map((file, index) => {
            const fileId =
              file.id ||
              `file-${index}`;

            const opening =
              String(openingFileId) ===
              String(fileId);

            return (
              <View
                key={fileId}
                style={styles.fileRow}
              >
                <View
                  style={
                    styles.fileIcon
                  }
                >
                  <Ionicons
                    name={
                      file.contentType
                        ?.startsWith(
                          "image/",
                        )
                        ? "image-outline"
                        : "document-text-outline"
                    }
                    size={21}
                    color={
                      highlighted
                        ? colors.secondary
                        : colors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.fileCopy
                  }
                >
                  <Text
                    numberOfLines={1}
                    style={
                      styles.fileName
                    }
                  >
                    {file.originalName ||
                      `File ${
                        index + 1
                      }`}
                  </Text>

                  <Text
                    style={
                      styles.fileMeta
                    }
                  >
                    {formatFileSize(
                      file.size,
                    )}
                  </Text>
                </View>

                <Button
                  title={
                    opening
                      ? "Opening…"
                      : highlighted
                        ? "Open corrected file"
                        : "Open"
                  }
                  variant={
                    highlighted
                      ? "warning"
                      : "outline"
                  }
                  loading={opening}
                  disabled={opening}
                  onPress={() =>
                    onOpenFile(
                      file,
                      fileId,
                    )
                  }
                />
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}