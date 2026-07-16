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
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";

import api from "../../../src/lib/api";
import { formatDate } from "../../../src/utils/formatDate";

import {
  colors,
  spacing,
  radius,
  typography,
} from "../../../src/theme";

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

export default function TeacherTaskDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const taskId = Array.isArray(params.taskId)
    ? params.taskId[0]
    : params.taskId;

  const isDesktop = width >= 980;
  const isSmallScreen = width < 640;

  const [task, setTask] = useState(null);
  const [assistants, setAssistants] = useState([]);

  const [gradeInputs, setGradeInputs] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingAssistants, setLoadingAssistants] =
    useState(false);

  const [gradingSubmissionId, setGradingSubmissionId] =
    useState(null);

  const [delegatingSubmissionId, setDelegatingSubmissionId] =
    useState(null);

  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [delegateModalVisible, setDelegateModalVisible] =
    useState(false);

  const [assistantSearch, setAssistantSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submissions = useMemo(() => {
    return Array.isArray(task?.submissions)
      ? task.submissions
      : [];
  }, [task]);

  const filteredAssistants = useMemo(() => {
    const query = assistantSearch.trim().toLowerCase();

    if (!query) {
      return assistants;
    }

    return assistants.filter((assistant) =>
      assistant.name?.toLowerCase().includes(query),
    );
  }, [assistantSearch, assistants]);

  const summary = useMemo(() => {
    return submissions.reduce(
      (result, submission) => {
        if (submission.grade != null) {
          result.graded += 1;
        } else if (submission.delegation) {
          result.delegated += 1;
        } else {
          result.pending += 1;
        }

        return result;
      },
      {
        total: submissions.length,
        graded: 0,
        delegated: 0,
        pending: 0,
      },
    );
  }, [submissions]);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const loadTask = useCallback(async () => {
    if (!taskId) {
      setError("Task ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/tasks/${taskId}`);
      setTask(response.data);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't load task details.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const loadAssistants = useCallback(async () => {
    setLoadingAssistants(true);

    try {
      const response = await api.get("/auth/assistants");

      setAssistants(
        Array.isArray(response.data) ? response.data : [],
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't load assistants.",
        ),
      );
    } finally {
      setLoadingAssistants(false);
    }
  }, []);

  useEffect(() => {
    loadTask();
    loadAssistants();
  }, [loadTask, loadAssistants]);

  async function openExternalFile(url) {
    if (!url) return;

    clearMessages();

    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        setError("This file link cannot be opened.");
        return;
      }

      await Linking.openURL(url);
    } catch {
      setError("Couldn't open the file.");
    }
  }

  function validateGrade(submissionId) {
    const rawValue = gradeInputs[submissionId];
    const grade = Number(rawValue);

    if (
      rawValue === undefined ||
      rawValue === "" ||
      !Number.isFinite(grade)
    ) {
      return {
        valid: false,
        message: "Enter a valid numeric grade.",
      };
    }

    if (grade < 0) {
      return {
        valid: false,
        message: "Grade cannot be negative.",
      };
    }

    if (
      task?.gradeOutOf != null &&
      grade > Number(task.gradeOutOf)
    ) {
      return {
        valid: false,
        message: `Grade cannot exceed ${task.gradeOutOf}.`,
      };
    }

    return {
      valid: true,
      grade,
    };
  }

  async function gradeDirectly(submissionId) {
    clearMessages();

    const validation = validateGrade(submissionId);

    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setGradingSubmissionId(submissionId);

    try {
      await api.patch(
        `/submissions/${submissionId}/grade`,
        {
          grade: validation.grade,
        },
      );

      setGradeInputs((current) => {
        const updated = { ...current };
        delete updated[submissionId];
        return updated;
      });

      setSuccess("Grade saved successfully.");
      await loadTask();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't save the grade.",
        ),
      );
    } finally {
      setGradingSubmissionId(null);
    }
  }

  function openDelegateModal(submission) {
    clearMessages();
    setSelectedSubmission(submission);
    setAssistantSearch("");
    setDelegateModalVisible(true);
  }

  function closeDelegateModal() {
    if (delegatingSubmissionId) return;

    setDelegateModalVisible(false);
    setSelectedSubmission(null);
    setAssistantSearch("");
  }

  async function delegate(assistantId) {
    if (!selectedSubmission) return;

    clearMessages();
    setDelegatingSubmissionId(selectedSubmission.id);

    try {
      await api.post("/delegations", {
        submissionId: selectedSubmission.id,
        assistantId,
      });

      setSuccess("Submission delegated successfully.");
      setDelegateModalVisible(false);
      setSelectedSubmission(null);
      setAssistantSearch("");

      await loadTask();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't delegate the submission.",
        ),
      );
    } finally {
      setDelegatingSubmissionId(null);
    }
  }

  function renderSubmissionCard(submission) {
    const graded = submission.grade != null;
    const delegated = Boolean(submission.delegation);
    const pending = !graded && !delegated;

    return (
      <Card
        key={submission.id}
        style={styles.submissionCard}
      >
        <View
          style={[
            styles.submissionHeader,
            isSmallScreen &&
              styles.submissionHeaderSmall,
          ]}
        >
          <View style={styles.studentIdentity}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>
                {getInitial(submission.student?.name)}
              </Text>
            </View>

            <View style={styles.studentInfo}>
              <Text
                numberOfLines={1}
                style={styles.studentName}
              >
                {submission.student?.name ||
                  "Unknown student"}
              </Text>

              <Text style={styles.studentMeta}>
                Homework submission
              </Text>
            </View>
          </View>

          {graded ? (
            <Badge
              label={`Graded: ${submission.grade}/${task?.gradeOutOf}`}
              tone="success"
            />
          ) : delegated ? (
            <Badge
              label={`Delegated to ${
                submission.delegation?.assistant?.name ||
                "assistant"
              }`}
              tone="warning"
            />
          ) : (
            <Badge label="Ungraded" tone="neutral" />
          )}
        </View>

        <View style={styles.submissionDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.textMuted}
            />

            <Text style={styles.detailText}>
              Submitted{" "}
              {submission.createdAt
                ? formatDate(submission.createdAt)
                : "date unavailable"}
            </Text>
          </View>

          {submission.fileUrl ? (
            <Pressable
              onPress={() =>
                openExternalFile(submission.fileUrl)
              }
              style={({ pressed }) => [
                styles.fileButton,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.fileButtonIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={colors.primary}
                />
              </View>

              <View style={styles.fileButtonText}>
                <Text style={styles.fileButtonTitle}>
                  View submission file
                </Text>

                <Text style={styles.fileButtonSubtitle}>
                  Open the student's uploaded answer
                </Text>
              </View>

              <Ionicons
                name="open-outline"
                size={18}
                color={colors.primary}
              />
            </Pressable>
          ) : (
            <View style={styles.noFileBox}>
              <Ionicons
                name="document-outline"
                size={18}
                color={colors.textMuted}
              />

              <Text style={styles.noFileText}>
                No submission file attached
              </Text>
            </View>
          )}
        </View>

        {pending ? (
          <View style={styles.gradingPanel}>
            <View style={styles.gradingHeading}>
              <View>
                <Text style={styles.gradingTitle}>
                  Grade submission
                </Text>

                <Text style={styles.gradingSubtitle}>
                  Enter a grade out of{" "}
                  {task?.gradeOutOf ?? "the task total"}.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.gradeRow,
                isSmallScreen && styles.gradeRowSmall,
              ]}
            >
              <View style={styles.gradeInputWrapper}>
                <TextInput
                  value={gradeInputs[submission.id] || ""}
                  onChangeText={(value) =>
                    setGradeInputs((current) => ({
                      ...current,
                      [submission.id]: value,
                    }))
                  }
                  placeholder={`Grade out of ${
                    task?.gradeOutOf ?? ""
                  }`}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                  style={styles.gradeInput}
                />

                <View style={styles.gradeSuffix}>
                  <Text style={styles.gradeSuffixText}>
                    / {task?.gradeOutOf ?? "-"}
                  </Text>
                </View>
              </View>

              <Button
                title="Save grade"
                variant="secondary"
                onPress={() =>
                  gradeDirectly(submission.id)
                }
                loading={
                  gradingSubmissionId === submission.id
                }
                disabled={Boolean(gradingSubmissionId)}
              />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <Button
              title="Delegate to assistant"
              variant="outline"
              onPress={() =>
                openDelegateModal(submission)
              }
            />
          </View>
        ) : null}

        {delegated && !graded ? (
          <View style={styles.delegationPanel}>
            <View style={styles.delegationIcon}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.warning}
              />
            </View>

            <View style={styles.delegationText}>
              <Text style={styles.delegationTitle}>
                Waiting for assistant grading
              </Text>

              <Text style={styles.delegationSubtitle}>
                Assigned to{" "}
                {submission.delegation?.assistant?.name ||
                  "an assistant"}.
              </Text>
            </View>
          </View>
        ) : null}

        {graded ? (
          <View style={styles.gradedPanel}>
            <View style={styles.gradedIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <View style={styles.gradedText}>
              <Text style={styles.gradedTitle}>
                Grading completed
              </Text>

              <Text style={styles.gradedSubtitle}>
                Final grade: {submission.grade}/
                {task?.gradeOutOf}
              </Text>
            </View>
          </View>
        ) : null}
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
          Loading task details…
        </Text>
      </Screen>
    );
  }

  if (!task) {
    return (
      <Screen>
        <Card style={styles.notFoundCard}>
          <View style={styles.notFoundIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color={colors.danger}
            />
          </View>

          <Text style={styles.notFoundTitle}>
            Task unavailable
          </Text>

          <Text style={styles.notFoundText}>
            The task could not be loaded or may no longer
            exist.
          </Text>

          <Button
            title="Go back"
            variant="outline"
            onPress={() => router.back()}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={colors.primary}
          />

          <Text style={styles.backButtonText}>
            Back to tasks
          </Text>
        </Pressable>

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

        <Card style={styles.heroCard}>
          <View
            style={[
              styles.heroContent,
              isSmallScreen && styles.heroContentSmall,
            ]}
          >
            <View style={styles.heroIcon}>
              <Ionicons
                name="clipboard-outline"
                size={29}
                color={colors.primary}
              />
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>
                HOMEWORK TASK
              </Text>

              <Text style={styles.pageTitle}>
                {task.title}
              </Text>

              {task.description ? (
                <Text style={styles.pageDescription}>
                  {task.description}
                </Text>
              ) : (
                <Text style={styles.pageDescription}>
                  No additional instructions were provided.
                </Text>
              )}

              <View style={styles.heroBadges}>
                <Badge
                  label={`Due ${formatDate(
                    task.deadline,
                  )}`}
                  tone="neutral"
                />

                <Badge
                  label={
                    task.allowLateSubmission
                      ? "Late submissions allowed"
                      : "No late submissions"
                  }
                  tone={
                    task.allowLateSubmission
                      ? "success"
                      : "danger"
                  }
                />

                <Badge
                  label={`Grade out of ${task.gradeOutOf}`}
                  tone="info"
                />
              </View>
            </View>

            {task.taskFileUrl ? (
              <Button
                title="Open homework PDF"
                variant="outline"
                onPress={() =>
                  openExternalFile(task.taskFileUrl)
                }
              />
            ) : null}
          </View>
        </Card>

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
              {summary.total}
            </Text>

            <Text style={styles.statLabel}>
              Total submissions
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
              {summary.graded}
            </Text>

            <Text style={styles.statLabel}>
              Graded
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="person-outline"
                size={22}
                color={colors.warning}
              />
            </View>

            <Text style={styles.statValue}>
              {summary.delegated}
            </Text>

            <Text style={styles.statLabel}>
              Delegated
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="time-outline"
                size={22}
                color={colors.danger}
              />
            </View>

            <Text style={styles.statValue}>
              {summary.pending}
            </Text>

            <Text style={styles.statLabel}>
              Awaiting action
            </Text>
          </Card>
        </View>

        <View
          style={[
            styles.contentLayout,
            isDesktop && styles.contentLayoutDesktop,
          ]}
        >
          <View style={styles.mainColumn}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Student submissions
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Review, grade, or delegate submitted work.
                </Text>
              </View>

              <Text style={styles.sectionCount}>
                {submissions.length}{" "}
                {submissions.length === 1
                  ? "submission"
                  : "submissions"}
              </Text>
            </View>

            {!submissions.length ? (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="document-outline"
                    size={35}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No submissions yet
                </Text>

                <Text style={styles.emptyDescription}>
                  Student work will appear here after the
                  first submission is received.
                </Text>
              </Card>
            ) : (
              <View style={styles.submissionList}>
                {submissions.map(renderSubmissionCard)}
              </View>
            )}
          </View>

          <View
            style={[
              styles.sideColumn,
              isDesktop && styles.sideColumnDesktop,
            ]}
          >
            <Card style={styles.progressCard}>
              <View style={styles.sideCardIcon}>
                <Ionicons
                  name="analytics-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.sideCardTitle}>
                Grading progress
              </Text>

              <Text style={styles.progressValue}>
                {summary.total
                  ? Math.round(
                      (summary.graded / summary.total) * 100,
                    )
                  : 0}
                %
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        summary.total
                          ? Math.round(
                              (summary.graded /
                                summary.total) *
                                100,
                            )
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {summary.graded} of {summary.total} submissions
                graded
              </Text>
            </Card>

            <Card style={styles.infoCard}>
              <View style={styles.sideCardIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.sideCardTitle}>
                Grading workflow
              </Text>

              <Text style={styles.infoText}>
                Grade submissions directly or delegate them
                to an assistant. Delegated submissions remain
                visible here until grading is complete.
              </Text>
            </Card>
          </View>
        </View>
      </View>

      <Modal
        visible={delegateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDelegateModal}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeDelegateModal}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons
                  name="person-add-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View style={styles.modalHeadingCopy}>
                <Text style={styles.modalTitle}>
                  Delegate submission
                </Text>

                <Text style={styles.mutedText}>
                  Choose an assistant to grade{" "}
                  {selectedSubmission?.student?.name ||
                    "this student's"}{" "}
                  submission.
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Close"
                disabled={Boolean(
                  delegatingSubmissionId,
                )}
                onPress={closeDelegateModal}
                style={({ pressed }) => [
                  styles.modalClose,
                  delegatingSubmissionId &&
                    styles.disabled,
                  pressed &&
                    !delegatingSubmissionId &&
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

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textMuted}
              />

              <TextInput
                value={assistantSearch}
                onChangeText={setAssistantSearch}
                placeholder="Search assistants"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
            </View>

            {loadingAssistants ? (
              <View style={styles.modalState}>
                <ActivityIndicator
                  color={colors.primary}
                />

                <Text style={styles.loadingText}>
                  Loading assistants…
                </Text>
              </View>
            ) : !filteredAssistants.length ? (
              <View style={styles.modalState}>
                <Ionicons
                  name="people-outline"
                  size={38}
                  color={colors.primary}
                />

                <Text style={styles.modalEmptyTitle}>
                  No assistants found
                </Text>

                <Text style={styles.mutedText}>
                  No assistants match this search.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.assistantList}
                contentContainerStyle={
                  styles.assistantListContent
                }
                nestedScrollEnabled
              >
                {filteredAssistants.map((assistant) => (
                  <View
                    key={assistant.id}
                    style={styles.assistantRow}
                  >
                    <View style={styles.assistantAvatar}>
                      <Text
                        style={styles.assistantAvatarText}
                      >
                        {getInitial(assistant.name)}
                      </Text>
                    </View>

                    <View style={styles.assistantInfo}>
                      <Text
                        numberOfLines={1}
                        style={styles.assistantName}
                      >
                        {assistant.name}
                      </Text>

                      <Text style={styles.assistantRole}>
                        Assistant
                      </Text>
                    </View>

                    <Button
                      title="Delegate"
                      variant="secondary"
                      onPress={() =>
                        delegate(assistant.id)
                      }
                      loading={Boolean(
                        delegatingSubmissionId,
                      )}
                      disabled={Boolean(
                        delegatingSubmissionId,
                      )}
                    />
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={closeDelegateModal}
                disabled={Boolean(
                  delegatingSubmissionId,
                )}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
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

  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
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

  heroCard: {
    marginBottom: spacing.lg,
  },

  heroContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },

  heroContentSmall: {
    flexDirection: "column",
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  pageTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  pageDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 23,
    marginBottom: spacing.md,
  },

  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
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

  contentLayout: {
    gap: spacing.lg,
  },

  contentLayoutDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  mainColumn: {
    flex: 1,
    minWidth: 0,
  },

  sideColumn: {
    width: "100%",
    gap: spacing.md,
  },

  sideColumnDesktop: {
    width: 320,
  },

  sectionHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },

  sectionCount: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  submissionList: {
    gap: spacing.md,
  },

  submissionCard: {
    gap: spacing.md,
  },

  submissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  submissionHeaderSmall: {
    alignItems: "flex-start",
    flexDirection: "column",
  },

  studentIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  studentAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
  },

  studentInfo: {
    flex: 1,
    minWidth: 0,
  },

  studentName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  studentMeta: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  submissionDetails: {
    gap: spacing.sm,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  detailText: {
    fontSize: 12,
    color: colors.textMuted,
  },

  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  fileButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  fileButtonText: {
    flex: 1,
  },

  fileButtonTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  fileButtonSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  noFileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  noFileText: {
    fontSize: 12,
    color: colors.textMuted,
  },

  gradingPanel: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },

  gradingHeading: {
    marginBottom: spacing.sm,
  },

  gradingTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  gradingSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  gradeRowSmall: {
    alignItems: "stretch",
    flexDirection: "column",
  },

  gradeInputWrapper: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  gradeInput: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
  },

  gradeSuffix: {
    paddingHorizontal: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },

  gradeSuffixText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: spacing.md,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
  },

  delegationPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: `${colors.warning}12`,
  },

  delegationIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  delegationText: {
    flex: 1,
  },

  delegationTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  delegationSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  gradedPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: `${colors.secondary}18`,
  },

  gradedIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  gradedText: {
    flex: 1,
  },

  gradedTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  gradedSubtitle: {
    marginTop: 3,
    fontSize: 11,
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
  },

  progressCard: {
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

  sideCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  progressValue: {
    fontSize: 31,
    fontWeight: "800",
    color: colors.primary,
  },

  progressTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: colors.border,
  },

  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },

  progressText: {
    fontSize: 11,
    color: colors.textMuted,
  },

  infoCard: {
    backgroundColor: `${colors.secondary}16`,
  },

  infoText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: spacing.sm,
  },

  notFoundCard: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  notFoundIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: `${colors.danger}12`,
  },

  notFoundTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  notFoundText: {
    ...typography.body,
    maxWidth: 430,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.md,
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
    maxHeight: "88%",
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

  mutedText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  searchBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },

  searchInput: {
    flex: 1,
    minHeight: 46,
    color: colors.textPrimary,
    fontSize: 14,
  },

  modalState: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  modalEmptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  assistantList: {
    maxHeight: 380,
  },

  assistantListContent: {
    paddingBottom: spacing.xs,
  },

  assistantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },

  assistantAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  assistantAvatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },

  assistantInfo: {
    flex: 1,
    minWidth: 0,
  },

  assistantName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  assistantRole: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },

  disabled: {
    opacity: 0.45,
  },

  pressed: {
    opacity: 0.76,
  },
});