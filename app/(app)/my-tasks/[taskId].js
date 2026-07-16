import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
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
import { useAuth } from "../../../src/contexts/AuthContext";
import api from "../../../src/lib/api";
import { formatDate } from "../../../src/utils/formatDate";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../src/theme";

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    fallback
  );
}

export default function MyTaskDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const rawTaskId = params.taskId;
  const taskId = Array.isArray(rawTaskId)
    ? rawTaskId[0]
    : rawTaskId;

  const [task, setTask] = useState(null);
  const [mySubmission, setMySubmission] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [uploading, setUploading] =
    useState(false);

  const [
    openingTaskFile,
    setOpeningTaskFile,
  ] = useState(false);

  const [
    openingSubmissionFile,
    setOpeningSubmissionFile,
  ] = useState(false);

  const [
    openingCorrectedFile,
    setOpeningCorrectedFile,
  ] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const isPastDeadline = useMemo(() => {
    if (!task?.deadline) {
      return false;
    }

    const deadline = new Date(
      task.deadline
    ).getTime();

    return (
      Number.isFinite(deadline) &&
      deadline < Date.now()
    );
  }, [task?.deadline]);

  const canSubmit = useMemo(() => {
    if (mySubmission) {
      return false;
    }

    if (!isPastDeadline) {
      return true;
    }

    return Boolean(
      task?.allowLateSubmission
    );
  }, [
    isPastDeadline,
    mySubmission,
    task?.allowLateSubmission,
  ]);

  const status = useMemo(() => {
    if (mySubmission?.grade != null) {
      return {
        label: "Graded",
        tone: "success",
        icon: "checkmark-done-outline",
        helper:
          "Your homework has been reviewed and graded.",
      };
    }

    if (mySubmission) {
      return {
        label: "Submitted",
        tone: "info",
        icon: "cloud-done-outline",
        helper:
          "Your submission is waiting for grading.",
      };
    }

    if (
      isPastDeadline &&
      !task?.allowLateSubmission
    ) {
      return {
        label: "Closed",
        tone: "danger",
        icon: "lock-closed-outline",
        helper:
          "The deadline passed and late submissions are not allowed.",
      };
    }

    if (isPastDeadline) {
      return {
        label: "Overdue",
        tone: "warning",
        icon: "alert-circle-outline",
        helper:
          "The deadline passed, but late submission is still allowed.",
      };
    }

    return {
      label: "Pending",
      tone: "neutral",
      icon: "time-outline",
      helper:
        "Submit your completed homework before the deadline.",
    };
  }, [
    isPastDeadline,
    mySubmission,
    task?.allowLateSubmission,
  ]);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!taskId || !user?.id) {
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await api.get(
          `/tasks/${taskId}`
        );

        const loadedTask = response.data;
        const submissions = Array.isArray(
          loadedTask?.submissions
        )
          ? loadedTask.submissions
          : [];

        const mine = submissions.find(
          (submission) =>
            submission.student?.id ===
              user.id ||
            submission.studentId ===
              user.id
        );

        setTask(loadedTask);
        setMySubmission(mine || null);
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load this homework."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [taskId, user?.id]
  );

  useEffect(() => {
    load();
  }, [load]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function openExternalFile(
    url,
    setOpening
  ) {
    if (!url) {
      setError(
        "This file does not have a valid link."
      );
      return;
    }

    clearMessages();
    setOpening(true);

    try {
      const supported =
        await Linking.canOpenURL(url);

      if (!supported) {
        setError(
          "This file cannot be opened on this device."
        );
        return;
      }

      await Linking.openURL(url);
    } catch {
      setError(
        "Couldn't open the file. Please try again."
      );
    } finally {
      setOpening(false);
    }
  }

  async function submitHomework() {
    if (
      uploading ||
      !canSubmit ||
      !taskId
    ) {
      return;
    }

    clearMessages();

    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: [
            "application/pdf",
            "image/*",
          ],
          multiple: false,
          copyToCacheDirectory: true,
        });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];

      if (!file?.uri) {
        setError(
          "The selected file could not be read."
        );
        return;
      }

      const formData = new FormData();

      formData.append(
        "file",
        createUploadFile(file)
      );

      setUploading(true);

      await api.post(
        `/submissions/task/${taskId}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setSuccess(
        "Your homework was submitted successfully."
      );

      await load({
        silent: true,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't submit your homework."
        )
      );
    } finally {
      setUploading(false);
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
          Loading homework...
        </Text>
      </Screen>
    );
  }

  if (!task) {
    return (
      <Screen>
        <View style={styles.page}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.pressedOpacity,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={colors.primary}
            />

            <Text
              style={styles.backButtonText}
            >
              Back to my tasks
            </Text>
          </Pressable>

          <Card style={styles.notFoundCard}>
            <View
              style={styles.notFoundIcon}
            >
              <Ionicons
                name="alert-circle-outline"
                size={38}
                color={colors.danger}
              />
            </View>

            <Text
              style={styles.notFoundTitle}
            >
              Homework unavailable
            </Text>

            <Text
              style={styles.notFoundText}
            >
              {error ||
                "The homework could not be loaded or may no longer exist."}
            </Text>

            <View
              style={styles.notFoundActions}
            >
              <Button
                title="Try again"
                variant="secondary"
                onPress={() => load()}
              />

              <Button
                title="Go back"
                variant="outline"
                onPress={() => router.back()}
              />
            </View>
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.pressedOpacity,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={colors.primary}
          />

          <Text
            style={styles.backButtonText}
          >
            Back to my tasks
          </Text>
        </Pressable>

        {error ? (
          <MessageBanner
            type="error"
            message={error}
            onDismiss={() => setError("")}
            onRetry={() =>
              load({ silent: true })
            }
          />
        ) : null}

        {success ? (
          <MessageBanner
            type="success"
            message={success}
            onDismiss={() =>
              setSuccess("")
            }
          />
        ) : null}

        <Card style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="book-outline"
                size={30}
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

              <Text
                style={styles.pageDescription}
              >
                {task.description?.trim() ||
                  "No additional instructions were provided."}
              </Text>

              <View
                style={styles.heroBadges}
              >
                <Badge
                  label={`Due ${formatDate(
                    task.deadline
                  )}`}
                  tone={
                    isPastDeadline
                      ? "danger"
                      : "neutral"
                  }
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
                  label={`Grade out of ${
                    task.gradeOutOf ?? "—"
                  }`}
                  tone="info"
                />
              </View>
            </View>

            {task.taskFileUrl ? (
              <Button
                title={
                  openingTaskFile
                    ? "Opening..."
                    : "Open homework file"
                }
                variant="outline"
                loading={openingTaskFile}
                disabled={openingTaskFile}
                onPress={() =>
                  openExternalFile(
                    task.taskFileUrl,
                    setOpeningTaskFile
                  )
                }
              />
            ) : null}
          </View>
        </Card>

        <View style={styles.workspace}>
          <View style={styles.mainColumn}>
            <Card style={styles.detailsCard}>
              <View style={styles.cardHeader}>
                <View
                  style={styles.cardHeaderIcon}
                >
                  <Ionicons
                    name="reader-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View
                  style={styles.cardHeaderCopy}
                >
                  <Text
                    style={styles.cardTitle}
                  >
                    Task details
                  </Text>

                  <Text
                    style={
                      styles.cardSubtitle
                    }
                  >
                    Review the task information
                    and attached files before
                    submitting.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View
                style={styles.detailGrid}
              >
                <DetailItem
                  icon="calendar-outline"
                  label="Deadline"
                  value={
                    formatDate(
                      task.deadline
                    ) || "No deadline"
                  }
                  tone={
                    isPastDeadline
                      ? "danger"
                      : "default"
                  }
                />

                <DetailItem
                  icon="trophy-outline"
                  label="Maximum grade"
                  value={`${
                    task.gradeOutOf ?? "—"
                  } marks`}
                />

                <DetailItem
                  icon="time-outline"
                  label="Late submissions"
                  value={
                    task.allowLateSubmission
                      ? "Allowed"
                      : "Not allowed"
                  }
                  tone={
                    task.allowLateSubmission
                      ? "success"
                      : "default"
                  }
                />
              </View>

              <View style={styles.divider} />

              <Text
                style={styles.sectionLabel}
              >
                Instructions
              </Text>

              <Text
                style={styles.instructions}
              >
                {task.description?.trim() ||
                  "No additional instructions were provided for this homework."}
              </Text>

              {task.taskFileUrl ? (
                <Pressable
                  accessibilityRole="link"
                  disabled={
                    openingTaskFile
                  }
                  onPress={() =>
                    openExternalFile(
                      task.taskFileUrl,
                      setOpeningTaskFile
                    )
                  }
                  style={({ pressed }) => [
                    styles.fileCard,
                    pressed &&
                      styles.pressedOpacity,
                  ]}
                >
                  <View
                    style={styles.fileIcon}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>

                  <View
                    style={styles.fileInfo}
                  >
                    <Text
                      style={styles.fileTitle}
                    >
                      Homework attachment
                    </Text>

                    <Text
                      style={styles.fileSubtitle}
                    >
                      Open the task file or
                      additional instructions
                    </Text>
                  </View>

                  {openingTaskFile ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                    />
                  ) : (
                    <Ionicons
                      name="open-outline"
                      size={19}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              ) : (
                <View
                  style={styles.noFileBox}
                >
                  <Ionicons
                    name="document-outline"
                    size={20}
                    color={colors.textMuted}
                  />

                  <Text
                    style={styles.noFileText}
                  >
                    No homework file was
                    attached.
                  </Text>
                </View>
              )}
            </Card>
          </View>

          <View style={styles.sideColumn}>
            <Card style={styles.submissionCard}>
              <View
                style={styles.submissionHeader}
              >
                <View
                  style={[
                    styles.submissionIcon,
                    mySubmission &&
                      styles.submissionIconDone,
                  ]}
                >
                  <Ionicons
                    name={
                      mySubmission
                        ? "checkmark"
                        : "cloud-upload-outline"
                    }
                    size={23}
                    color={
                      mySubmission
                        ? colors.white
                        : colors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.submissionHeaderCopy
                  }
                >
                  <Text
                    style={styles.cardTitle}
                  >
                    Your submission
                  </Text>

                  <Text
                    style={
                      styles.cardSubtitle
                    }
                  >
                    {mySubmission
                      ? "Your homework has been received."
                      : "Upload a PDF or image of your completed work."}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <StatusPanel status={status} />

              {mySubmission ? (
                <SubmittedPanel
                  submission={mySubmission}
                  gradeOutOf={
                    task.gradeOutOf
                  }
                  openingSubmissionFile={
                    openingSubmissionFile
                  }
                  openingCorrectedFile={
                    openingCorrectedFile
                  }
                  onOpenSubmission={() =>
                    openExternalFile(
                      mySubmission.fileUrl,
                      setOpeningSubmissionFile
                    )
                  }
                  onOpenCorrected={() =>
                    openExternalFile(
                      mySubmission.correctedFileUrl,
                      setOpeningCorrectedFile
                    )
                  }
                />
              ) : canSubmit ? (
                <View>
                  {isPastDeadline ? (
                    <NoticeBox
                      type="warning"
                      title="Deadline passed"
                      message="Late submissions are still allowed for this homework."
                    />
                  ) : null}

                  <View
                    style={styles.uploadInfo}
                  >
                    <View
                      style={
                        styles.uploadInfoIcon
                      }
                    >
                      <Ionicons
                        name="attach-outline"
                        size={21}
                        color={colors.primary}
                      />
                    </View>

                    <View
                      style={
                        styles.uploadInfoCopy
                      }
                    >
                      <Text
                        style={
                          styles.uploadInfoTitle
                        }
                      >
                        Accepted file types
                      </Text>

                      <Text
                        style={
                          styles.uploadInfoText
                        }
                      >
                        PDF, JPG, JPEG, PNG,
                        or another supported
                        image format.
                      </Text>
                    </View>
                  </View>

                  <Button
                    title={
                      uploading
                        ? "Uploading..."
                        : "Choose file and submit"
                    }
                    variant="secondary"
                    loading={uploading}
                    disabled={uploading}
                    onPress={submitHomework}
                    style={
                      styles.submitButton
                    }
                  />

                  <Text
                    style={styles.uploadNote}
                  >
                    Check that you selected the
                    correct completed homework
                    before confirming the upload.
                  </Text>
                </View>
              ) : (
                <View
                  style={styles.closedPanel}
                >
                  <View
                    style={styles.closedIcon}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={25}
                      color={colors.danger}
                    />
                  </View>

                  <Text
                    style={styles.closedTitle}
                  >
                    Submissions are closed
                  </Text>

                  <Text
                    style={styles.closedText}
                  >
                    The deadline has passed and
                    late submissions are not
                    allowed.
                  </Text>
                </View>
              )}

              {refreshing ? (
                <View
                  style={styles.refreshingRow}
                >
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />

                  <Text
                    style={
                      styles.refreshingText
                    }
                  >
                    Updating submission...
                  </Text>
                </View>
              ) : null}
            </Card>
          </View>
        </View>
      </View>
    </Screen>
  );
}

function DetailItem({
  icon,
  label,
  value,
  tone = "default",
}) {
  const color =
    tone === "danger"
      ? colors.danger
      : tone === "success"
        ? colors.secondary
        : colors.primary;

  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text
          style={[
            styles.detailValue,
            tone === "danger" &&
              styles.detailValueDanger,
            tone === "success" &&
              styles.detailValueSuccess,
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function StatusPanel({ status }) {
  const color =
    status.tone === "success"
      ? colors.secondary
      : status.tone === "warning"
        ? colors.warning
        : status.tone === "danger"
          ? colors.danger
          : colors.primary;

  return (
    <View
      style={[
        styles.statusPanel,
        {
          borderColor: `${color}50`,
          backgroundColor: `${color}10`,
        },
      ]}
    >
      <View style={styles.statusIcon}>
        <Ionicons
          name={status.icon}
          size={21}
          color={color}
        />
      </View>

      <View style={styles.statusCopy}>
        <Text
          style={[
            styles.statusLabel,
            {
              color,
            },
          ]}
        >
          {status.label}
        </Text>

        <Text style={styles.statusHelper}>
          {status.helper}
        </Text>
      </View>
    </View>
  );
}

function SubmittedPanel({
  submission,
  gradeOutOf,
  openingSubmissionFile,
  openingCorrectedFile,
  onOpenSubmission,
  onOpenCorrected,
}) {
  const hasGrade =
    submission.grade != null;

  return (
    <View>
      <NoticeBox
        type="success"
        title="Submission received"
        message={
          submission.submittedAt ||
          submission.createdAt
            ? `Submitted on ${formatDate(
                submission.submittedAt ||
                  submission.createdAt
              )}`
            : "Your file was submitted successfully."
        }
      />

      {submission.fileUrl ? (
        <Pressable
          accessibilityRole="link"
          disabled={openingSubmissionFile}
          onPress={onOpenSubmission}
          style={({ pressed }) => [
            styles.submittedFile,
            pressed &&
              styles.pressedOpacity,
          ]}
        >
          <View style={styles.fileIcon}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.fileInfo}>
            <Text style={styles.fileTitle}>
              Submitted homework
            </Text>

            <Text
              style={styles.fileSubtitle}
            >
              Review the file you uploaded
            </Text>
          </View>

          {openingSubmissionFile ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          ) : (
            <Ionicons
              name="open-outline"
              size={19}
              color={colors.primary}
            />
          )}
        </Pressable>
      ) : null}

      <View style={styles.gradeBox}>
        <Text style={styles.gradeLabel}>
          Grade
        </Text>

        {hasGrade ? (
          <>
            <View
              style={styles.gradeValueRow}
            >
              <Text
                style={styles.gradeValue}
              >
                {submission.grade}
              </Text>

              <Text
                style={styles.gradeMaximum}
              >
                / {gradeOutOf}
              </Text>
            </View>

            <Text
              style={styles.gradeStatus}
            >
              Grading completed
            </Text>
          </>
        ) : (
          <>
            <Text
              style={styles.pendingGrade}
            >
              Not graded yet
            </Text>

            <Text
              style={styles.gradeStatus}
            >
              Your teacher or assistant will
              review your submission.
            </Text>
          </>
        )}
      </View>

      {submission.comments ? (
        <View style={styles.feedbackBox}>
          <Text
            style={styles.feedbackLabel}
          >
            Teacher feedback
          </Text>

          <Text
            style={styles.feedbackText}
          >
            {submission.comments}
          </Text>
        </View>
      ) : null}

      {submission.correctedFileUrl ? (
        <Pressable
          accessibilityRole="link"
          disabled={openingCorrectedFile}
          onPress={onOpenCorrected}
          style={({ pressed }) => [
            styles.correctedFile,
            pressed &&
              styles.pressedOpacity,
          ]}
        >
          <View
            style={styles.correctedFileIcon}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={21}
              color={colors.secondary}
            />
          </View>

          <View style={styles.fileInfo}>
            <Text style={styles.fileTitle}>
              Corrected homework
            </Text>

            <Text
              style={styles.fileSubtitle}
            >
              Open the corrected file
              uploaded by your teacher
            </Text>
          </View>

          {openingCorrectedFile ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          ) : (
            <Ionicons
              name="open-outline"
              size={19}
              color={colors.primary}
            />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

function NoticeBox({
  type,
  title,
  message,
}) {
  const isSuccess =
    type === "success";

  const color = isSuccess
    ? colors.secondary
    : colors.warning;

  return (
    <View
      style={[
        styles.noticeBox,
        {
          borderColor: `${color}50`,
          backgroundColor: `${color}10`,
        },
      ]}
    >
      <Ionicons
        name={
          isSuccess
            ? "checkmark-circle-outline"
            : "alert-circle-outline"
        }
        size={21}
        color={color}
      />

      <View style={styles.noticeCopy}>
        <Text
          style={[
            styles.noticeTitle,
            {
              color,
            },
          ]}
        >
          {title}
        </Text>

        <Text style={styles.noticeText}>
          {message}
        </Text>
      </View>
    </View>
  );
}

function MessageBanner({
  type,
  message,
  onDismiss,
  onRetry,
}) {
  const isError = type === "error";
  const color = isError
    ? colors.danger
    : colors.secondary;

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.messageBanner,
        {
          borderColor: `${color}55`,
          backgroundColor: `${color}10`,
        },
      ]}
    >
      <View
        style={[
          styles.messageIndicator,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Ionicons
        name={
          isError
            ? "alert-circle-outline"
            : "checkmark-circle-outline"
        }
        size={20}
        color={color}
      />

      <Text
        style={[
          styles.messageText,
          {
            color: isError
              ? colors.danger
              : colors.textPrimary,
          },
        ]}
      >
        {message}
      </Text>

      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.messageAction,
            pressed &&
              styles.pressedOpacity,
          ]}
        >
          <Text
            style={[
              styles.messageActionText,
              {
                color,
              },
            ]}
          >
            Retry
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss message"
        onPress={onDismiss}
        style={({ pressed }) => [
          styles.messageClose,
          pressed &&
            styles.pressedOpacity,
        ]}
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

function createUploadFile(file) {
  const name =
    file.name ||
    `homework-${Date.now()}`;

  const type =
    file.mimeType ||
    "application/octet-stream";

  if (Platform.OS === "web") {
    return (
      file.file || {
        uri: file.uri,
        name,
        type,
      }
    );
  }

  return {
    uri: file.uri,
    name,
    type,
  };
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 1280,
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },

  centeredScreen: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
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

  heroCard: {
    marginBottom: spacing.lg,
  },

  heroContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: spacing.lg,
  },

  heroIcon: {
    width: 58,
    height: 58,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: `${colors.secondary}25`,
  },

  heroCopy: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 320,
    minWidth: 0,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 1.1,
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

  workspace: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: spacing.lg,
  },

  mainColumn: {
    flexGrow: 1.6,
    flexShrink: 1,
    flexBasis: 500,
    minWidth: 300,
  },

  sideColumn: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 340,
    minWidth: 280,
  },

  detailsCard: {
    padding: spacing.lg,
  },

  submissionCard: {
    padding: spacing.lg,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  cardHeaderIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: `${colors.secondary}25`,
  },

  cardHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },

  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  cardSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  detailItem: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 180,
    minWidth: 160,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  detailIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: colors.white,
  },

  detailCopy: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 2,
  },

  detailValueDanger: {
    color: colors.danger,
  },

  detailValueSuccess: {
    color: colors.secondary,
  },

  sectionLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  instructions: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 23,
  },

  fileCard: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  submittedFile: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  correctedFile: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.secondary}55`,
    borderRadius: radius.md,
    backgroundColor: `${colors.secondary}10`,
  },

  fileIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  correctedFileIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  fileInfo: {
    flex: 1,
    minWidth: 0,
  },

  fileTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  fileSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 2,
  },

  noFileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  noFileText: {
    ...typography.body,
    color: colors.textMuted,
  },

  submissionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  submissionIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: `${colors.primary}12`,
  },

  submissionIconDone: {
    backgroundColor: colors.secondary,
  },

  submissionHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },

  statusPanel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
  },

  statusIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.white,
  },

  statusCopy: {
    flex: 1,
    minWidth: 0,
  },

  statusLabel: {
    ...typography.bodyBold,
  },

  statusHelper: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 3,
  },

  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
  },

  noticeCopy: {
    flex: 1,
    minWidth: 0,
  },

  noticeTitle: {
    ...typography.bodyBold,
  },

  noticeText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
    marginTop: 3,
  },

  uploadInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  uploadInfoIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: colors.white,
  },

  uploadInfoCopy: {
    flex: 1,
    minWidth: 0,
  },

  uploadInfoTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  uploadInfoText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 3,
  },

  submitButton: {
    marginTop: spacing.md,
  },

  uploadNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 17,
    marginTop: spacing.sm,
  },

  closedPanel: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },

  closedIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    backgroundColor: `${colors.danger}12`,
    marginBottom: spacing.sm,
  },

  closedTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: "center",
  },

  closedText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    marginTop: spacing.xs,
  },

  gradeBox: {
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  gradeLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },

  gradeValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  gradeValue: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.primary,
  },

  gradeMaximum: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: 4,
  },

  pendingGrade: {
    ...typography.h3,
    color: colors.warning,
  },

  gradeStatus: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginTop: spacing.xs,
  },

  feedbackBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  feedbackLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  feedbackText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 21,
  },

  refreshingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },

  refreshingText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  messageBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    overflow: "hidden",
    marginBottom: spacing.md,
    paddingRight: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.md,
  },

  messageIndicator: {
    alignSelf: "stretch",
    width: 4,
  },

  messageText: {
    ...typography.body,
    flex: 1,
    paddingVertical: spacing.sm,
  },

  messageAction: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },

  messageActionText: {
    fontSize: 12,
    fontWeight: "800",
  },

  messageClose: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  notFoundCard: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  notFoundIcon: {
    width: 74,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 37,
    backgroundColor: `${colors.danger}12`,
    marginBottom: spacing.md,
  },

  notFoundTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
  },

  notFoundText: {
    ...typography.body,
    maxWidth: 440,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginTop: spacing.sm,
  },

  notFoundActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  pressedOpacity: {
    opacity: 0.72,
  },
});