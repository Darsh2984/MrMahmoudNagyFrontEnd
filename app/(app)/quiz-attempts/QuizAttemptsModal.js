import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import { Badge } from "../../../src/components/ui/Badge";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";

import api from "../../../src/lib/api";
import { colors } from "../../../src/theme";

import { styles } from "./QuizAttemptsModal.styles";

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

  return date.toLocaleString();
}

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size <= 0) {
    return "Unknown size";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function getStatusTone(status) {
  if (
    status === "SUBMITTED" ||
    status === "AUTO_SUBMITTED"
  ) {
    return "success";
  }

  return "warning";
}

function getStatusLabel(status) {
  if (status === "AUTO_SUBMITTED") {
    return "Auto-submitted";
  }

  if (status === "SUBMITTED") {
    return "Submitted";
  }

  return "In progress";
}

function getGroupNames(student) {
  const groups = Array.isArray(student?.groups)
    ? student.groups
    : [];

  return groups
    .map((group) => group?.name)
    .filter(Boolean)
    .join(", ");
}

async function appendFileToFormData(
  formData,
  file,
) {
  const name =
    file?.name ||
    file?.fileName ||
    `corrected-file-${Date.now()}`;

  const type =
    file?.mimeType ||
    file?.type ||
    "application/octet-stream";

  if (Platform.OS === "web" && file?.file) {
    formData.append(
      "correctedFiles",
      file.file,
      name,
    );

    return;
  }

  if (Platform.OS === "web" && file?.uri) {
    const response = await fetch(file.uri);

    if (!response.ok) {
      throw new Error(
        `Could not prepare "${name}" for upload.`,
      );
    }

    const blob = await response.blob();

    formData.append(
      "correctedFiles",
      blob,
      name,
    );

    return;
  }

  if (!file?.uri) {
    throw new Error(
      `The file "${name}" has no valid URI.`,
    );
  }

  formData.append("correctedFiles", {
    uri: file.uri,
    name,
    type,
  });
}

export function QuizAttemptsModal({
  visible,
  quiz,
  onClose,
  onUpdated,
}) {
  const [data, setData] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] =
    useState("");

  const [detail, setDetail] = useState(null);

  const [loadingList, setLoadingList] =
    useState(false);

  const [loadingDetail, setLoadingDetail] =
    useState(false);

  const [savingGrade, setSavingGrade] =
    useState(false);

  const [deletingFileId, setDeletingFileId] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [grade, setGrade] = useState("");
  const [comments, setComments] = useState("");

  const [correctedFiles, setCorrectedFiles] =
    useState([]);

  const quizType =
    data?.quiz?.type ||
    detail?.quiz?.type ||
    quiz?.type;

  const submissions =
    Array.isArray(data?.submissions)
      ? data.submissions
      : [];

  const selectedSubmission = useMemo(
    () =>
      submissions.find(
        (item) =>
          String(item.id) ===
          String(selectedSubmissionId),
      ) || null,
    [submissions, selectedSubmissionId],
  );

  const loadSubmissions = useCallback(
    async ({ preserveSelection = true } = {}) => {
      if (!visible || !quiz?.id) {
        return;
      }

      setLoadingList(true);
      setError("");

      try {
        const response = await api.get(
          `/quizzes/${quiz.id}/submissions`,
        );

        const nextData = response.data || null;

        setData(nextData);

        const nextSubmissions =
          Array.isArray(nextData?.submissions)
            ? nextData.submissions
            : [];

        setSelectedSubmissionId((current) => {
          if (
            preserveSelection &&
            current &&
            nextSubmissions.some(
              (item) =>
                String(item.id) ===
                String(current),
            )
          ) {
            return current;
          }

          return nextSubmissions[0]?.id || "";
        });
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load quiz attempts.",
          ),
        );
      } finally {
        setLoadingList(false);
      }
    },
    [visible, quiz?.id],
  );

  const loadSubmissionDetail = useCallback(
    async (submissionId) => {
      if (!quiz?.id || !submissionId) {
        setDetail(null);
        return;
      }

      setLoadingDetail(true);
      setError("");
      setSuccess("");

      try {
        const response = await api.get(
          `/quizzes/${quiz.id}/submissions/${submissionId}`,
        );

        const nextDetail = response.data || null;

        setDetail(nextDetail);

        setGrade(
          nextDetail?.submission?.score === null ||
            nextDetail?.submission?.score === undefined
            ? ""
            : String(nextDetail.submission.score),
        );

        setComments(
          nextDetail?.submission?.gradingComments || "",
        );

        setCorrectedFiles([]);
      } catch (requestError) {
        setDetail(null);

        setError(
          getErrorMessage(
            requestError,
            "Couldn't load the student's attempt.",
          ),
        );
      } finally {
        setLoadingDetail(false);
      }
    },
    [quiz?.id],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    setData(null);
    setDetail(null);
    setSelectedSubmissionId("");
    setError("");
    setSuccess("");
    setGrade("");
    setComments("");
    setCorrectedFiles([]);

    loadSubmissions({
      preserveSelection: false,
    });
  }, [visible, quiz?.id, loadSubmissions]);

  useEffect(() => {
    if (!visible || !selectedSubmissionId) {
      return;
    }

    loadSubmissionDetail(selectedSubmissionId);
  }, [
    visible,
    selectedSubmissionId,
    loadSubmissionDetail,
  ]);

  function closeModal() {
    if (savingGrade) {
      return;
    }

    onClose?.();
  }

  async function openUrl(url) {
    if (!url) {
      setError("This file does not have an available URL.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        throw new Error("This URL cannot be opened.");
      }

      await Linking.openURL(url);
    } catch (openError) {
      setError(
        openError?.message ||
          "Couldn't open the selected file.",
      );
    }
  }

  async function chooseCorrectedFiles() {
    setError("");
    setSuccess("");

    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: [
            "application/pdf",
            "image/jpeg",
            "image/png",
          ],

          multiple: true,
          copyToCacheDirectory: true,
        });

      if (
        result.canceled ||
        !Array.isArray(result.assets)
      ) {
        return;
      }

      setCorrectedFiles((current) => {
        const remaining = 20 - current.length;

        return [
          ...current,
          ...result.assets.slice(0, remaining),
        ];
      });
    } catch (pickerError) {
      setError(
        pickerError?.message ||
          "Couldn't choose corrected files.",
      );
    }
  }

  function removeSelectedCorrectedFile(index) {
    setCorrectedFiles((current) =>
      current.filter(
        (_, fileIndex) => fileIndex !== index,
      ),
    );
  }

  async function savePaperGrade() {
    if (!quiz?.id || !selectedSubmissionId) {
      return;
    }

    const numericGrade = Number(grade);

    if (!String(grade).trim()) {
      setError("Enter the student's grade.");
      return;
    }

    if (!Number.isFinite(numericGrade)) {
      setError("The grade must be a valid number.");
      return;
    }

    const maximum = Number(
      detail?.quiz?.totalPoints,
    );

    if (
      numericGrade < 0 ||
      (Number.isFinite(maximum) &&
        numericGrade > maximum)
    ) {
      setError(
        `The grade must be between 0 and ${
          Number.isFinite(maximum)
            ? maximum
            : "the quiz total"
        }.`,
      );

      return;
    }

    setSavingGrade(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("grade", String(numericGrade));
      formData.append("comments", comments.trim());

      for (const file of correctedFiles) {
        await appendFileToFormData(formData, file);
      }

      await api.patch(
        `/quizzes/${quiz.id}/submissions/${selectedSubmissionId}/grade-paper`,
        formData,
      );

      setCorrectedFiles([]);

      setSuccess(
        "Paper exam grade and corrections saved successfully.",
      );

      await Promise.all([
        loadSubmissions(),
        loadSubmissionDetail(selectedSubmissionId),
      ]);

      onUpdated?.();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't save the Paper exam grade.",
        ),
      );
    } finally {
      setSavingGrade(false);
    }
  }

  async function deleteCorrectedFile(file) {
    if (
      !quiz?.id ||
      !selectedSubmissionId ||
      !file?.id
    ) {
      return;
    }

    setDeletingFileId(file.id);
    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/quizzes/${quiz.id}/submissions/${selectedSubmissionId}/corrected-files/${file.id}`,
      );

      setSuccess("Corrected file deleted.");

      await Promise.all([
        loadSubmissions(),
        loadSubmissionDetail(selectedSubmissionId),
      ]);

      onUpdated?.();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't delete the corrected file.",
        ),
      );
    } finally {
      setDeletingFileId("");
    }
  }

  function confirmDeleteCorrectedFile(file) {
    const message =
      `Delete "${file?.originalName || "this file"}"?`;

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        deleteCorrectedFile(file);
      }

      return;
    }

    Alert.alert(
      "Delete corrected file",
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCorrectedFile(file),
        },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="people-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.headerCopy}>
              <Text style={styles.title}>
                Quiz attempts
              </Text>

              <Text style={styles.subtitle}>
                {quiz?.title || "Quiz"}
              </Text>
            </View>

            <Pressable
              onPress={closeModal}
              disabled={savingGrade}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={23}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.danger}
              />

              <Text style={styles.errorText}>
                {error}
              </Text>

              <Pressable onPress={() => setError("")}>
                <Ionicons
                  name="close"
                  size={18}
                  color={colors.danger}
                />
              </Pressable>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBanner}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={colors.primary}
              />

              <Text style={styles.successText}>
                {success}
              </Text>

              <Pressable onPress={() => setSuccess("")}>
                <Ionicons
                  name="close"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          ) : null}

          {loadingList ? (
            <View style={styles.loadingState}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

              <Text style={styles.loadingText}>
                Loading attempts...
              </Text>
            </View>
          ) : (
            <View style={styles.body}>
              <View style={styles.attemptsColumn}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Students
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                      {submissions.length}{" "}
                      {submissions.length === 1
                        ? "attempt"
                        : "attempts"}
                    </Text>
                  </View>

                  <Button
                    title="Refresh"
                    variant="outline"
                    onPress={() => loadSubmissions()}
                  />
                </View>

                {data?.summary ? (
                  <View style={styles.summaryGrid}>
                    <SummaryBox
                      label="Attempts"
                      value={data.summary.totalAttempts}
                    />

                    <SummaryBox
                      label="Submitted"
                      value={data.summary.submitted}
                    />

                    <SummaryBox
                      label="In progress"
                      value={data.summary.inProgress}
                    />

                    {quizType === "PAPER" ? (
                      <SummaryBox
                        label="Pending grading"
                        value={
                          data.summary
                            .pendingPaperGrading
                        }
                        warning
                      />
                    ) : null}
                  </View>
                ) : null}

                <ScrollView
                  style={styles.attemptList}
                  contentContainerStyle={
                    styles.attemptListContent
                  }
                  showsVerticalScrollIndicator={false}
                >
                  {!submissions.length ? (
                    <View style={styles.emptyState}>
                      <Ionicons
                        name="people-outline"
                        size={34}
                        color={colors.textMuted}
                      />

                      <Text style={styles.emptyTitle}>
                        No attempts yet
                      </Text>

                      <Text style={styles.emptyText}>
                        No student has started this quiz.
                      </Text>
                    </View>
                  ) : (
                    submissions.map((submission) => {
                      const selected =
                        String(submission.id) ===
                        String(selectedSubmissionId);

                      return (
                        <Pressable
                          key={submission.id}
                          onPress={() =>
                            setSelectedSubmissionId(
                              submission.id,
                            )
                          }
                          style={({ pressed }) => [
                            styles.attemptCard,
                            selected &&
                              styles.attemptCardSelected,
                            pressed && styles.pressed,
                          ]}
                        >
                          <View
                            style={styles.attemptCardHeader}
                          >
                            <View style={styles.studentAvatar}>
                              <Text style={styles.avatarText}>
                                {String(
                                  submission.student?.name ||
                                    "?",
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </Text>
                            </View>

                            <View style={styles.studentCopy}>
                              <Text
                                numberOfLines={1}
                                style={styles.studentName}
                              >
                                {submission.student?.name ||
                                  "Unknown student"}
                              </Text>

                              <Text
                                numberOfLines={1}
                                style={styles.studentGroup}
                              >
                                {getGroupNames(
                                  submission.student,
                                ) || "No matching group"}
                              </Text>
                            </View>

                            <Badge
                              label={getStatusLabel(
                                submission.status,
                              )}
                              tone={getStatusTone(
                                submission.status,
                              )}
                            />
                          </View>

                          <View style={styles.attemptMeta}>
                            <MetaValue
                              label="Started"
                              value={formatDateTime(
                                submission.startedAt,
                              )}
                            />

                            <MetaValue
                              label={
                                quizType === "PAPER"
                                  ? "Grade"
                                  : "Score"
                              }
                              value={
                                submission.score === null ||
                                submission.score === undefined
                                  ? "—"
                                  : `${submission.score} / ${
                                      submission.totalPoints ??
                                      data?.quiz?.totalPoints ??
                                      "—"
                                    }`
                              }
                            />
                          </View>

                          {quizType === "PAPER" ? (
                            <View style={styles.paperStatusRow}>
                              <Badge
                                label={
                                  submission.isGraded
                                    ? "Graded"
                                    : submission.isSubmitted
                                      ? "Awaiting grading"
                                      : "Not submitted"
                                }
                                tone={
                                  submission.isGraded
                                    ? "success"
                                    : "warning"
                                }
                              />

                              <Text style={styles.fileCountText}>
                                {submission.answerFileCount || 0}{" "}
                                answer files
                              </Text>
                            </View>
                          ) : null}
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>
              </View>

              <View style={styles.detailColumn}>
                {!selectedSubmissionId ? (
                  <View style={styles.emptyDetail}>
                    <Ionicons
                      name="document-text-outline"
                      size={38}
                      color={colors.textMuted}
                    />

                    <Text style={styles.emptyTitle}>
                      Select an attempt
                    </Text>
                  </View>
                ) : loadingDetail ? (
                  <View style={styles.loadingState}>
                    <ActivityIndicator
                      size="large"
                      color={colors.primary}
                    />

                    <Text style={styles.loadingText}>
                      Loading attempt details...
                    </Text>
                  </View>
                ) : detail ? (
                  <ScrollView
                    style={styles.detailScroll}
                    contentContainerStyle={
                      styles.detailContent
                    }
                    showsVerticalScrollIndicator={false}
                  >
                    <SubmissionHeader
                      submission={detail.submission}
                      quiz={detail.quiz}
                    />

                    {detail.mcqReview ? (
                      <McqReview
                        review={detail.mcqReview}
                        onOpenFile={openUrl}
                      />
                    ) : null}

                    {detail.paperReview ? (
                      <PaperReview
                        detail={detail}
                        grade={grade}
                        setGrade={setGrade}
                        comments={comments}
                        setComments={setComments}
                        correctedFiles={correctedFiles}
                        onChooseFiles={chooseCorrectedFiles}
                        onRemoveSelectedFile={
                          removeSelectedCorrectedFile
                        }
                        onOpenFile={openUrl}
                        onSave={savePaperGrade}
                        saving={savingGrade}
                        deletingFileId={deletingFileId}
                        onDeleteCorrectedFile={
                          confirmDeleteCorrectedFile
                        }
                      />
                    ) : null}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyDetail}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={38}
                      color={colors.textMuted}
                    />

                    <Text style={styles.emptyTitle}>
                      Attempt unavailable
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SummaryBox({
  label,
  value,
  warning = false,
}) {
  return (
    <View
      style={[
        styles.summaryBox,
        warning && styles.summaryBoxWarning,
      ]}
    >
      <Text style={styles.summaryValue}>
        {value ?? 0}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}

function MetaValue({
  label,
  value,
}) {
  return (
    <View style={styles.metaValue}>
      <Text style={styles.metaLabel}>
        {label}
      </Text>

      <Text
        numberOfLines={1}
        style={styles.metaText}
      >
        {value}
      </Text>
    </View>
  );
}

function SubmissionHeader({
  submission,
  quiz,
}) {
  return (
    <Card style={styles.submissionHeader}>
      <View style={styles.submissionTopRow}>
        <View style={styles.largeAvatar}>
          <Text style={styles.largeAvatarText}>
            {String(
              submission?.student?.name || "?",
            )
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.submissionStudentCopy}>
          <Text style={styles.submissionStudentName}>
            {submission?.student?.name ||
              "Unknown student"}
          </Text>

          <Text style={styles.submissionStudentInfo}>
            {submission?.student?.email || "No email"}
          </Text>

          <Text style={styles.submissionStudentInfo}>
            {getGroupNames(submission?.student) ||
              "No matching group"}
          </Text>
        </View>

        <Badge
          label={
            submission?.isGraded
              ? "Graded"
              : getStatusLabel(submission?.status)
          }
          tone={
            submission?.isGraded
              ? "success"
              : getStatusTone(submission?.status)
          }
        />
      </View>

      <View style={styles.submissionDates}>
        <MetaValue
          label="Started"
          value={formatDateTime(
            submission?.startedAt,
          )}
        />

        <MetaValue
          label="Submitted"
          value={formatDateTime(
            submission?.submittedAt,
          )}
        />

        <MetaValue
          label="Score"
          value={
            submission?.score === null ||
            submission?.score === undefined
              ? "—"
              : `${submission.score} / ${
                  submission.totalPoints ??
                  quiz?.totalPoints ??
                  "—"
                }`
          }
        />
      </View>
    </Card>
  );
}

function McqReview({
  review,
  onOpenFile,
}) {
  const answers = Array.isArray(review?.answers)
    ? review.answers
    : [];

  return (
    <View style={styles.reviewSection}>
      <View style={styles.reviewHeading}>
        <View>
          <Text style={styles.reviewTitle}>
            MCQ answer review
          </Text>

          <Text style={styles.reviewSubtitle}>
            Student answers and correct answers
          </Text>
        </View>

        <View style={styles.resultBadges}>
          <Badge
            label={`${review.correctCount || 0} correct`}
            tone="success"
          />

          <Badge
            label={`${review.incorrectCount || 0} incorrect`}
            tone="danger"
          />

          <Badge
            label={`${review.unansweredCount || 0} unanswered`}
            tone="neutral"
          />
        </View>
      </View>

      {answers.map((answer) => (
        <Card
          key={answer.quizQuestionId || answer.questionId}
          style={styles.questionReviewCard}
        >
          <View style={styles.questionReviewHeader}>
            <View style={styles.questionNumber}>
              <Text style={styles.questionNumberText}>
                {answer.number}
              </Text>
            </View>

            <View style={styles.questionReviewCopy}>
              <Text style={styles.questionReviewTitle}>
                {answer.title ||
                  `Question ${answer.number}`}
              </Text>

              <Text style={styles.questionPoints}>
                {answer.points} marks
              </Text>
            </View>

            <Badge
              label={
                !answer.answered
                  ? "Unanswered"
                  : answer.isCorrect
                    ? "Correct"
                    : "Incorrect"
              }
              tone={
                !answer.answered
                  ? "neutral"
                  : answer.isCorrect
                    ? "success"
                    : "danger"
              }
            />
          </View>

          {answer.questionFileUrl ? (
            <Button
              title="Open question file"
              variant="outline"
              onPress={() =>
                onOpenFile(answer.questionFileUrl)
              }
            />
          ) : null}

          <View style={styles.answerComparison}>
            <AnswerBox
              label="Student answer"
              value={answer.studentAnswer || "No answer"}
              danger={
                answer.answered && !answer.isCorrect
              }
            />

            <AnswerBox
              label="Correct answer"
              value={answer.correctAnswer || "—"}
              success
            />

            <AnswerBox
              label="Marks earned"
              value={`${answer.earnedPoints || 0} / ${
                answer.points || 0
              }`}
            />
          </View>
        </Card>
      ))}
    </View>
  );
}

function AnswerBox({
  label,
  value,
  success = false,
  danger = false,
}) {
  return (
    <View
      style={[
        styles.answerBox,
        success && styles.answerBoxSuccess,
        danger && styles.answerBoxDanger,
      ]}
    >
      <Text style={styles.answerBoxLabel}>
        {label}
      </Text>

      <Text style={styles.answerBoxValue}>
        {value}
      </Text>
    </View>
  );
}

function PaperReview({
  detail,
  grade,
  setGrade,
  comments,
  setComments,
  correctedFiles,
  onChooseFiles,
  onRemoveSelectedFile,
  onOpenFile,
  onSave,
  saving,
  deletingFileId,
  onDeleteCorrectedFile,
}) {
  const review = detail.paperReview || {};

  const answerFiles = Array.isArray(review.answerFiles)
    ? review.answerFiles
    : [];

  const returnedFiles = Array.isArray(
    review.correctedFiles,
  )
    ? review.correctedFiles
    : [];

  const questions = Array.isArray(review.questions)
    ? review.questions
    : [];

  return (
    <View style={styles.reviewSection}>
      <Text style={styles.reviewTitle}>
        Written Paper review
      </Text>

      <Text style={styles.reviewSubtitle}>
        Markschemes are visible only to authorized staff.
      </Text>

      <FileSection
        title="Student answer files"
        emptyText="The student did not upload any answer files."
        files={answerFiles}
        onOpenFile={onOpenFile}
      />

      <View style={styles.reviewSection}>
        <Text style={styles.subsectionTitle}>
          Questions and markschemes
        </Text>

        {questions.map((question) => (
          <Card
            key={question.quizQuestionId || question.questionId}
            style={styles.writtenQuestionCard}
          >
            <View style={styles.questionReviewHeader}>
              <View style={styles.questionNumber}>
                <Text style={styles.questionNumberText}>
                  {question.number}
                </Text>
              </View>

              <View style={styles.questionReviewCopy}>
                <Text style={styles.questionReviewTitle}>
                  {question.title ||
                    `Question ${question.number}`}
                </Text>

                <Text style={styles.questionPoints}>
                  {question.points} marks
                </Text>
              </View>
            </View>

            <View style={styles.fileActionRow}>
              <Button
                title="Open question"
                variant="outline"
                onPress={() =>
                  onOpenFile(question.questionFileUrl)
                }
              />

              {question.markschemeFileUrl ? (
                <Button
                  title="Open markscheme"
                  variant="warning"
                  onPress={() =>
                    onOpenFile(
                      question.markschemeFileUrl,
                    )
                  }
                />
              ) : (
                <Text style={styles.noMarkschemeText}>
                  No markscheme uploaded
                </Text>
              )}
            </View>
          </Card>
        ))}
      </View>

      <FileSection
        title="Corrected files already returned"
        emptyText="No corrected files have been returned yet."
        files={returnedFiles}
        onOpenFile={onOpenFile}
        deletingFileId={deletingFileId}
        onDeleteFile={onDeleteCorrectedFile}
      />

      <Card style={styles.gradingCard}>
        <Text style={styles.subsectionTitle}>
          Grade and feedback
        </Text>

        <Text style={styles.inputLabel}>
          Grade out of {detail.quiz?.totalPoints ?? "—"}
        </Text>

        <TextInput
          value={grade}
          onChangeText={setGrade}
          keyboardType="decimal-pad"
          placeholder="Enter grade"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>
          Comments
        </Text>

        <TextInput
          value={comments}
          onChangeText={setComments}
          placeholder="Enter feedback for the student"
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.commentsInput,
          ]}
        />

        <View style={styles.correctedPickerHeader}>
          <View>
            <Text style={styles.inputLabel}>
              New corrected files
            </Text>

            <Text style={styles.fieldHint}>
              Upload PDFs or images to return to the student.
            </Text>
          </View>

          <Button
            title="Choose files"
            variant="outline"
            onPress={onChooseFiles}
            disabled={saving}
          />
        </View>

        {correctedFiles.length ? (
          <View style={styles.selectedFiles}>
            {correctedFiles.map((file, index) => (
              <View
                key={`${file.name}-${index}`}
                style={styles.selectedFileRow}
              >
                <Ionicons
                  name="attach-outline"
                  size={18}
                  color={colors.primary}
                />

                <View style={styles.fileCopy}>
                  <Text
                    numberOfLines={1}
                    style={styles.fileName}
                  >
                    {file.name ||
                      `Corrected file ${index + 1}`}
                  </Text>

                  <Text style={styles.fileMeta}>
                    {formatFileSize(file.size)}
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    onRemoveSelectedFile(index)
                  }
                  style={styles.removeFileButton}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={colors.danger}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <Button
          title={
            detail.submission?.isGraded
              ? "Update grade"
              : "Save grade"
          }
          variant="warning"
          loading={saving}
          disabled={saving}
          onPress={onSave}
        />
      </Card>
    </View>
  );
}

function FileSection({
  title,
  emptyText,
  files,
  onOpenFile,
  deletingFileId,
  onDeleteFile,
}) {
  return (
    <View style={styles.reviewSection}>
      <Text style={styles.subsectionTitle}>
        {title}
      </Text>

      {!files.length ? (
        <Text style={styles.emptyFileText}>
          {emptyText}
        </Text>
      ) : (
        <View style={styles.fileList}>
          {files.map((file, index) => (
            <View
              key={file.id || `${file.originalName}-${index}`}
              style={styles.fileRow}
            >
              <View style={styles.fileIcon}>
                <Ionicons
                  name={
                    file.contentType?.startsWith("image/")
                      ? "image-outline"
                      : "document-text-outline"
                  }
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View style={styles.fileCopy}>
                <Text
                  numberOfLines={1}
                  style={styles.fileName}
                >
                  {file.originalName ||
                    `File ${index + 1}`}
                </Text>

                <Text style={styles.fileMeta}>
                  {formatFileSize(file.size)}
                </Text>
              </View>

              <Button
                title="Open"
                variant="outline"
                onPress={() => onOpenFile(file.url)}
              />

              {onDeleteFile ? (
                <Pressable
                  disabled={deletingFileId === file.id}
                  onPress={() => onDeleteFile(file)}
                  style={styles.deleteFileButton}
                >
                  {deletingFileId === file.id ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.danger}
                    />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color={colors.danger}
                    />
                  )}
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}