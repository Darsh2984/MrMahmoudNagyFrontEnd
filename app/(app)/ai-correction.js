import React, {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import api from "../../src/lib/api";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

function getApiError(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function formatFileSize(size) {
  const bytes = Number(size || 0);

  if (!bytes) {
    return "";
  }

  const mb = bytes / (1024 * 1024);

  return `${mb.toFixed(2)} MB`;
}

function ResultValue({
  label,
  value,
}) {
  return (
    <View style={styles.resultValue}>
      <Text style={styles.resultLabel}>
        {label}
      </Text>

      <Text style={styles.resultNumber}>
        {value}
      </Text>
    </View>
  );
}

function FilePickerRow({
  label,
  description,
  file,
  onPick,
}) {
  return (
    <View style={styles.fileRow}>
      <View style={styles.fileIcon}>
        <Ionicons
          name="document-text-outline"
          size={24}
          color={colors.primary}
        />
      </View>

      <View style={styles.fileContent}>
        <Text style={styles.fileLabel}>
          {label}
        </Text>

        <Text style={styles.fileDescription}>
          {file
            ? `${file.name} · ${formatFileSize(file.size)}`
            : description}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onPick}
        style={({ pressed }) => [
          styles.pickButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.pickButtonText}>
          {file ? "Change" : "Choose PDF"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function AiCorrection() {
  const questionInputRef = useRef(null);
  const markSchemeInputRef = useRef(null);
  const studentAnswerInputRef = useRef(null);

  const [questionPaper, setQuestionPaper] =
    useState(null);

  const [markScheme, setMarkScheme] =
    useState(null);

  const [studentAnswer, setStudentAnswer] =
    useState(null);

  const [teacherNote, setTeacherNote] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const canSubmit =
    questionPaper &&
    markScheme &&
    studentAnswer &&
    !loading;

  const scoreText = useMemo(() => {
    if (!result) {
      return "—";
    }

    const awarded =
      result.totalAwarded ?? "—";

    const possible =
      result.totalPossible ?? "—";

    return `${awarded}/${possible}`;
  }, [result]);

  function selectSingleFile(event, setter) {
    const file =
      event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    setter(file);
    setError("");
    setResult(null);
    event.target.value = "";
  }

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append(
        "questionPaper",
        questionPaper
      );

      formData.append(
        "markScheme",
        markScheme
      );

      formData.append(
        "studentAnswer",
        studentAnswer
      );

      formData.append(
        "teacherNote",
        teacherNote
      );

      const response = await api.post(
        "/ai-correction/correct-paper",
        formData,
        {
          timeout: 180000,

          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setResult(response.data?.result || null);
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Couldn't correct the paper."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  if (Platform.OS !== "web") {
    return (
      <Screen scroll>
        <Card style={styles.stateCard}>
          <Ionicons
            name="desktop-outline"
            size={42}
            color={colors.primary}
          />

          <Text style={styles.stateTitle}>
            Web only for now
          </Text>

          <Text style={styles.stateText}>
            AI paper correction currently uses
            browser PDF upload. Open this page on
            the teacher web account.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      contentContainerStyle={
        styles.screenContent
      }
    >
      <input
        ref={questionInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={(event) =>
          selectSingleFile(
            event,
            setQuestionPaper
          )
        }
      />

      <input
        ref={markSchemeInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={(event) =>
          selectSingleFile(
            event,
            setMarkScheme
          )
        }
      />

      <input
        ref={studentAnswerInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={(event) =>
          selectSingleFile(
            event,
            setStudentAnswer
          )
        }
      />

      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="sparkles-outline"
              size={30}
              color={colors.white}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              TEACHER AI TOOL
            </Text>

            <Text style={styles.title}>
              AI Paper Correction
            </Text>

            <Text style={styles.subtitle}>
              Upload a question paper, mark
              scheme, and student answer PDF.
              Gemini will correct the paper and
              generate feedback.
            </Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color={colors.danger}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              onPress={() => setError("")}
              style={styles.dismissButton}
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.danger}
              />
            </Pressable>
          </View>
        ) : null}

        <Card style={styles.uploadCard}>
          <Text style={styles.sectionTitle}>
            Upload PDFs
          </Text>

          <Text style={styles.sectionSubtitle}>
            Use clear scanned PDFs. For this MVP,
            keep each PDF under 50 MB.
          </Text>

          <View style={styles.fileList}>
            <FilePickerRow
              label="Question paper"
              description="Upload the question paper PDF"
              file={questionPaper}
              onPick={() =>
                questionInputRef.current?.click()
              }
            />

            <FilePickerRow
              label="Mark scheme"
              description="Upload the official mark scheme PDF"
              file={markScheme}
              onPick={() =>
                markSchemeInputRef.current?.click()
              }
            />

            <FilePickerRow
              label="Student answer"
              description="Upload the student's answer PDF"
              file={studentAnswer}
              onPick={() =>
                studentAnswerInputRef.current?.click()
              }
            />
          </View>

          <View style={styles.noteBlock}>
            <Text style={styles.noteLabel}>
              Optional teacher note
            </Text>

            <TextInput
              value={teacherNote}
              onChangeText={setTeacherNote}
              placeholder="Example: Cambridge IGCSE Physics Paper 4, mark strictly."
              placeholderTextColor={
                colors.textMuted
              }
              multiline
              style={styles.noteInput}
            />
          </View>

          <Button
            title={
              loading
                ? "Correcting paper..."
                : "Correct paper with Gemini"
            }
            onPress={handleSubmit}
            loading={loading}
            disabled={!canSubmit}
          />

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator
                size="small"
                color={colors.primary}
              />

              <Text style={styles.loadingText}>
                Gemini is reading the PDFs and
                preparing correction feedback.
                This can take 1–3 minutes.
              </Text>
            </View>
          ) : null}
        </Card>

        {result ? (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Correction Result
                </Text>

                <Text
                  style={styles.sectionSubtitle}
                >
                  Review before sending feedback
                  to the student.
                </Text>
              </View>

              <View style={styles.scorePill}>
                <Text style={styles.scorePillText}>
                  {scoreText}
                </Text>
              </View>
            </View>

            <View style={styles.resultGrid}>
              <ResultValue
                label="Score"
                value={scoreText}
              />

              <ResultValue
                label="Percentage"
                value={
                  result.percentage !==
                    undefined &&
                  result.percentage !== null
                    ? `${result.percentage}%`
                    : "—"
                }
              />

              <ResultValue
                label="Questions"
                value={
                  Array.isArray(
                    result.questionBreakdown
                  )
                    ? result.questionBreakdown
                        .length
                    : 0
                }
              />
            </View>

            {result.summary ? (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>
                  Summary
                </Text>

                <Text style={styles.bodyText}>
                  {result.summary}
                </Text>
              </View>
            ) : null}

            {result.gradeComment ? (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>
                  Grade Comment
                </Text>

                <Text style={styles.bodyText}>
                  {result.gradeComment}
                </Text>
              </View>
            ) : null}

            {Array.isArray(
              result.questionBreakdown
            ) &&
            result.questionBreakdown.length ? (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>
                  Question Breakdown
                </Text>

                {result.questionBreakdown.map(
                  (item, index) => (
                    <View
                      key={`${item.question}-${index}`}
                      style={styles.questionRow}
                    >
                      <View
                        style={
                          styles.questionTop
                        }
                      >
                        <Text
                          style={
                            styles.questionTitle
                          }
                        >
                          {item.question ||
                            `Question ${
                              index + 1
                            }`}
                        </Text>

                        <Text
                          style={
                            styles.questionMark
                          }
                        >
                          {item.awarded ?? "—"}/
                          {item.possible ?? "—"}
                        </Text>
                      </View>

                      {item.feedback ? (
                        <Text
                          style={styles.bodyText}
                        >
                          {item.feedback}
                        </Text>
                      ) : null}

                      {Array.isArray(
                        item.missingMarks
                      ) &&
                      item.missingMarks.length ? (
                        <View
                          style={
                            styles.bulletList
                          }
                        >
                          {item.missingMarks.map(
                            (
                              reason,
                              reasonIndex
                            ) => (
                              <Text
                                key={
                                  reasonIndex
                                }
                                style={
                                  styles.bullet
                                }
                              >
                                • {reason}
                              </Text>
                            )
                          )}
                        </View>
                      ) : null}

                      {item.needsTeacherReview ? (
                        <Text
                          style={
                            styles.reviewText
                          }
                        >
                          Needs teacher review
                        </Text>
                      ) : null}
                    </View>
                  )
                )}
              </View>
            ) : null}

            {Array.isArray(result.strengths) &&
            result.strengths.length ? (
              <ListSection
                title="Strengths"
                items={result.strengths}
              />
            ) : null}

            {Array.isArray(result.weaknesses) &&
            result.weaknesses.length ? (
              <ListSection
                title="Weaknesses"
                items={result.weaknesses}
              />
            ) : null}

            {result.studentFeedback ? (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>
                  Feedback for Student
                </Text>

                <Text style={styles.bodyText}>
                  {result.studentFeedback}
                </Text>
              </View>
            ) : null}

            {result.teacherNotes ? (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>
                  Teacher Notes
                </Text>

                <Text style={styles.bodyText}>
                  {result.teacherNotes}
                </Text>
              </View>
            ) : null}

            {result.rawFeedback ? (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>
                  Raw Gemini Feedback
                </Text>

                <Text style={styles.bodyText}>
                  {result.rawFeedback}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

function ListSection({
  title,
  items,
}) {
  return (
    <View style={styles.resultSection}>
      <Text style={styles.resultSectionTitle}>
        {title}
      </Text>

      <View style={styles.bulletList}>
        {items.map((item, index) => (
          <Text
            key={index}
            style={styles.bullet}
          >
            • {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },

  page: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    padding: spacing.lg,
    gap: spacing.lg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 1,
  },

  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: 3,
  },

  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 22,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    backgroundColor:
      colors.danger + "10",
  },

  errorText: {
    flex: 1,
    color: colors.danger,
    fontWeight: "800",
  },

  dismissButton: {
    padding: spacing.xs,
  },

  uploadCard: {
    gap: spacing.md,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 3,
  },

  fileList: {
    gap: spacing.sm,
  },

  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },

  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.primary + "10",
  },

  fileContent: {
    flex: 1,
    minWidth: 0,
  },

  fileLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  fileDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },

  pickButton: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  pickButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  noteBlock: {
    gap: spacing.xs,
  },

  noteLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  noteInput: {
    minHeight: 94,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 14,
    textAlignVertical: "top",
    outlineStyle: "none",
  },

  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor:
      colors.primary + "08",
  },

  loadingText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },

  resultCard: {
    gap: spacing.md,
  },

  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  scorePill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor:
      colors.secondary + "18",
  },

  scorePillText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.secondary,
  },

  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  resultValue: {
    flex: 1,
    minWidth: 170,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  resultLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
  },

  resultNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
    marginTop: 5,
  },

  resultSection: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  resultSectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  bodyText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  questionRow: {
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },

  questionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  questionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  questionMark: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.primary,
  },

  bulletList: {
    gap: 4,
  },

  bullet: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  reviewText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.danger,
  },

  stateCard: {
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },

  stateTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },

  stateText: {
    ...typography.body,
    maxWidth: 520,
    textAlign: "center",
    color: colors.textMuted,
  },

  pressed: {
    opacity: 0.72,
  },
});