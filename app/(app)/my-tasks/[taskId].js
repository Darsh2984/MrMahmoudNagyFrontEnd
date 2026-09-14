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
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";

import { useAuth } from "../../../src/contexts/AuthContext";

import api from "../../../src/lib/api";

import { formatDate } from "../../../src/utils/formatDate";

import { colors } from "../../../src/theme";

import { styles } from "./[taskId].styles";

const MAX_HOMEWORK_FILES = 20;
const MAX_PARALLEL_UPLOADS = 2;

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
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

function createUploadClientId() {
  return (
    `homework-${Date.now()}-` +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}

async function uploadAssetToSignedUrl({
  asset,
  upload,
  onProgress,
  onCancelReady,
}) {
  const contentType =
    upload.contentType ||
    asset.mimeType ||
    "application/octet-stream";

  if (Platform.OS !== "web") {
    const task =
      FileSystem.createUploadTask(
        upload.uploadUrl,
        asset.uri,
        {
          httpMethod: "PUT",
          uploadType:
            FileSystem
              .FileSystemUploadType
              .BINARY_CONTENT,
          headers: {
            "Content-Type": contentType,
          },
        },
        (progress) => {
          const total = Number(
            progress.totalBytesExpectedToSend,
          );

          if (total > 0) {
            onProgress(
              Math.min(
                99,
                Math.round(
                  (Number(
                    progress.totalBytesSent,
                  ) /
                    total) *
                    100,
                ),
              ),
            );
          }
        },
      );

    onCancelReady(() =>
      task.cancelAsync(),
    );

    const result =
      await task.uploadAsync();

    if (
      !result ||
      result.status < 200 ||
      result.status >= 300
    ) {
      throw new Error(
        `Upload failed with status ${
          result?.status || "unknown"
        }.`
      );
    }

    return;
  }

  let uploadBody = asset.file;

  if (!uploadBody) {
    const fileResponse =
      await fetch(asset.uri);

    if (!fileResponse.ok) {
      throw new Error(
        `The file "${asset.name}" could not be prepared for upload.`,
      );
    }

    uploadBody =
      await fileResponse.blob();
  }

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    onCancelReady(() => xhr.abort());

    xhr.open("PUT", upload.uploadUrl);
    xhr.timeout = 0;
    xhr.setRequestHeader(
      "Content-Type",
      contentType,
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(
          Math.min(
            99,
            Math.round(
              (event.loaded /
                event.total) *
                100,
            ),
          ),
        );
      }
    };

    xhr.onload = () => {
      if (
        xhr.status >= 200 &&
        xhr.status < 300
      ) {
        resolve();
      } else {
        reject(
          new Error(
            `Upload failed with status ${xhr.status}.`,
          ),
        );
      }
    };

    xhr.onerror = () =>
      reject(
        new Error(
          "Direct upload failed. Check the connection and try again.",
        ),
      );

    xhr.onabort = () =>
      reject(
        new Error("UPLOAD_CANCELLED"),
      );

    xhr.send(uploadBody);
  });
}

export default function MyTaskDetail() {
  const params =
    useLocalSearchParams();

  const router =
    useRouter();

  const { user } =
    useAuth();

  const rawTaskId =
    params.taskId;

  const taskId =
    Array.isArray(rawTaskId)
      ? rawTaskId[0]
      : rawTaskId;

  const [task, setTask] =
    useState(null);

  const [
    mySubmission,
    setMySubmission,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [uploadItems, setUploadItems] =
    useState([]);

  const uploadItemsRef = useRef([]);
  const uploadCancelRef = useRef(
    new Map(),
  );
  const cancelledUploadIdsRef =
    useRef(new Set());

  const [
    openingTaskFile,
    setOpeningTaskFile,
  ] = useState(false);

  const [
    openingSubmissionFileId,
    setOpeningSubmissionFileId,
  ] = useState(null);

  const [
    openingCorrectedFileId,
    setOpeningCorrectedFileId,
  ] = useState(null);

  const [
    deletingFileId,
    setDeletingFileId,
  ] = useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const isPastDeadline =
    useMemo(() => {
      if (!task?.deadline) {
        return false;
      }

      const deadline =
        new Date(
          task.deadline,
        ).getTime();

      return (
        Number.isFinite(deadline) &&
        deadline < Date.now()
      );
    }, [task?.deadline]);

  const submissionFiles =
    useMemo(() => {
      return Array.isArray(
        mySubmission?.files,
      )
        ? mySubmission.files
        : [];
    }, [mySubmission?.files]);

  const correctedFiles =
    useMemo(() => {
      return Array.isArray(
        mySubmission?.correctedFiles,
      )
        ? mySubmission.correctedFiles
        : [];
    }, [
      mySubmission?.correctedFiles,
    ]);

  const canModifySubmission =
    useMemo(() => {
      if (!mySubmission) {
        if (!isPastDeadline) {
          return true;
        }

        return Boolean(
          task?.allowLateSubmission,
        );
      }

      if (
        mySubmission.grade != null
      ) {
        return false;
      }

      if (
        mySubmission.canModify ===
        false
      ) {
        return false;
      }

      if (!isPastDeadline) {
        return true;
      }

      return Boolean(
        task?.allowLateSubmission,
      );
    }, [
      isPastDeadline,
      mySubmission,
      task?.allowLateSubmission,
    ]);

  const status =
    useMemo(() => {
      if (
        mySubmission?.grade != null
      ) {
        return {
          label: "Graded",
          tone: "success",
          icon:
            "checkmark-done-outline",
          helper:
            "Your homework has been reviewed and graded.",
        };
      }

      if (mySubmission) {
        return {
          label: "Submitted",
          tone: "info",
          icon:
            "cloud-done-outline",
          helper:
            canModifySubmission
              ? "Your homework is waiting for grading. You may still update its files."
              : "Your submission is waiting for grading and is currently locked.",
        };
      }

      if (
        isPastDeadline &&
        !task?.allowLateSubmission
      ) {
        return {
          label: "Closed",
          tone: "danger",
          icon:
            "lock-closed-outline",
          helper:
            "The deadline passed and late submissions are not allowed.",
        };
      }

      if (isPastDeadline) {
        return {
          label: "Overdue",
          tone: "warning",
          icon:
            "alert-circle-outline",
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
      canModifySubmission,
      isPastDeadline,
      mySubmission,
      task?.allowLateSubmission,
    ]);

  const load =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (
          !taskId ||
          !user?.id
        ) {
          return;
        }

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const [
            taskResponse,
            submissionResponse,
          ] = await Promise.all([
            api.get(
              `/tasks/${taskId}`,
            ),

            api.get(
              `/submissions/task/${taskId}/mine`,
            ),
          ]);

          setTask(
            taskResponse.data,
          );

          setMySubmission(
            submissionResponse.data
              ?.submission || null,
          );
        } catch (requestError) {
          setError(
            getErrorMessage(
              requestError,
              "Couldn't load this homework.",
            ),
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [taskId, user?.id],
    );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      uploadCancelRef.current.forEach(
        (cancel) => {
          Promise.resolve(cancel()).catch(
            () => {},
          );
        },
      );

      const unfinishedObjectKeys =
        uploadItemsRef.current
          .filter(
            (item) =>
              [
                "preparing",
                "queued",
                "uploading",
                "failed",
                "cancelled",
              ].includes(item.status),
          )
          .map((item) => item.objectKey)
          .filter(Boolean);

      if (unfinishedObjectKeys.length) {
        api
          .post(
            `/submissions/task/${taskId}/uploads/abort`,
            {
              objectKeys:
                unfinishedObjectKeys,
            },
          )
          .catch(() => {});
      }
    };
  }, [taskId]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  const updateUploadItems =
    useCallback((updater) => {
      setUploadItems((current) => {
        const next =
          typeof updater === "function"
            ? updater(current)
            : updater;

        uploadItemsRef.current = next;
        return next;
      });
    }, []);

  function updateUploadItem(
    clientId,
    changes,
  ) {
    updateUploadItems((current) =>
      current.map((item) =>
        item.clientId === clientId
          ? {
              ...item,
              ...(typeof changes ===
              "function"
                ? changes(item)
                : changes),
            }
          : item,
      ),
    );
  }

  async function removePreparedUploads(
    objectKeys,
  ) {
    const validKeys = objectKeys.filter(
      Boolean,
    );

    if (!validKeys.length) {
      return;
    }

    try {
      await api.post(
        `/submissions/task/${taskId}/uploads/abort`,
        { objectKeys: validKeys },
      );
    } catch {
      // Cleanup is best-effort. The signed URL expires quickly.
    }
  }

  async function uploadAssets(
    queuedItems,
  ) {
    if (
      uploading ||
      !queuedItems.length
    ) {
      return;
    }

    setUploading(true);
    clearMessages();

    const preparedKeys = [];
    const completed = [];
    let confirmationStarted = false;

    try {
      queuedItems.forEach((item) => {
        cancelledUploadIdsRef.current.delete(
          item.clientId,
        );

        updateUploadItem(
          item.clientId,
          {
            status: "preparing",
            progress: 0,
            error: "",
            objectKey: null,
          },
        );
      });

      const prepareResponse =
        await api.post(
          `/submissions/task/${taskId}/uploads/prepare`,
          {
            files: queuedItems.map(
              (item) => ({
                clientId:
                  item.clientId,
                name: item.asset.name,
                contentType:
                  item.asset.mimeType ||
                  item.asset.type ||
                  "application/octet-stream",
                size: item.asset.size,
              }),
            ),
          },
        );

      const preparedUploads =
        prepareResponse.data?.uploads || [];

      const preparedById = new Map(
        preparedUploads.map((upload) => [
          upload.clientId,
          upload,
        ]),
      );

      preparedUploads.forEach((upload) => {
        preparedKeys.push(
          upload.objectKey,
        );
        updateUploadItem(
          upload.clientId,
          {
            status: "queued",
            objectKey:
              upload.objectKey,
          },
        );
      });

      let nextIndex = 0;

      async function worker() {
        while (
          nextIndex < queuedItems.length
        ) {
          const item =
            queuedItems[nextIndex];
          nextIndex += 1;

          const upload =
            preparedById.get(
              item.clientId,
            );

          if (!upload) {
            updateUploadItem(
              item.clientId,
              {
                status: "failed",
                error:
                  "The server did not prepare this file.",
              },
            );
            continue;
          }

          if (
            cancelledUploadIdsRef.current.has(
              item.clientId,
            )
          ) {
            updateUploadItem(
              item.clientId,
              { status: "cancelled" },
            );
            continue;
          }

          updateUploadItem(
            item.clientId,
            { status: "uploading" },
          );

          try {
            await uploadAssetToSignedUrl({
              asset: item.asset,
              upload,
              onProgress: (progress) =>
                updateUploadItem(
                  item.clientId,
                  { progress },
                ),
              onCancelReady:
                (cancel) => {
                  uploadCancelRef.current.set(
                    item.clientId,
                    cancel,
                  );
                },
            });

            uploadCancelRef.current.delete(
              item.clientId,
            );

            if (
              cancelledUploadIdsRef.current.has(
                item.clientId,
              )
            ) {
              updateUploadItem(
                item.clientId,
                { status: "cancelled" },
              );
              continue;
            }

            completed.push({
              clientId:
                item.clientId,
              objectKey:
                upload.objectKey,
            });

            updateUploadItem(
              item.clientId,
              {
                status: "confirming",
                progress: 100,
              },
            );
          } catch (uploadError) {
            uploadCancelRef.current.delete(
              item.clientId,
            );

            const cancelled =
              uploadError?.message ===
                "UPLOAD_CANCELLED" ||
              cancelledUploadIdsRef.current.has(
                item.clientId,
              );

            updateUploadItem(
              item.clientId,
              {
                status: cancelled
                  ? "cancelled"
                  : "failed",
                error: cancelled
                  ? "Upload cancelled."
                  : getErrorMessage(
                      uploadError,
                      "Upload failed.",
                    ),
              },
            );
          }
        }
      }

      await Promise.all(
        Array.from(
          {
            length: Math.min(
              MAX_PARALLEL_UPLOADS,
              queuedItems.length,
            ),
          },
          () => worker(),
        ),
      );

      if (completed.length) {
        confirmationStarted = true;

        const confirmResponse =
          await api.post(
            `/submissions/task/${taskId}/uploads/confirm`,
            { uploads: completed },
          );

        if (
          confirmResponse.data?.submission
        ) {
          setMySubmission(
            confirmResponse.data.submission,
          );
        }

        const completedIds = new Set(
          completed.map(
            (item) => item.clientId,
          ),
        );

        updateUploadItems((current) =>
          current.map((item) =>
            completedIds.has(
              item.clientId,
            )
              ? {
                  ...item,
                  status: "complete",
                  progress: 100,
                  error: "",
                }
              : item,
          ),
        );

        setSuccess(
          `${completed.length} ${
            completed.length === 1
              ? "file was"
              : "files were"
          } uploaded successfully.`,
        );
      }

      const completedKeys = new Set(
        completed.map(
          (item) => item.objectKey,
        ),
      );

      await removePreparedUploads(
        preparedKeys.filter(
          (key) =>
            !completedKeys.has(key),
        ),
      );
    } catch (requestError) {
      const completedIds = new Set(
        completed.map(
          (item) => item.clientId,
        ),
      );

      const affectedIds = new Set(
        queuedItems.map((item) =>
          item.clientId,
        ),
      );

      updateUploadItems((current) =>
        current.map((item) =>
          affectedIds.has(item.clientId) &&
          item.status !== "complete" &&
          item.status !== "cancelled"
            ? {
                ...item,
                status:
                  confirmationStarted &&
                  completedIds.has(
                    item.clientId,
                  )
                    ? "confirm_failed"
                    : "failed",
                error: getErrorMessage(
                  requestError,
                  confirmationStarted
                    ? "The file reached storage, but the submission could not be confirmed. Retry to finish saving it."
                    : "Couldn't upload this file.",
                ),
              }
            : item,
        ),
      );

      await removePreparedUploads(
        confirmationStarted
          ? preparedKeys.filter(
              (key) =>
                !completed.some(
                  (item) =>
                    item.objectKey === key,
                ),
            )
          : preparedKeys,
      );

      setError(
        getErrorMessage(
          requestError,
          "Couldn't upload your homework files.",
        ),
      );
    } finally {
      setUploading(false);
    }
  }

  async function openExternalFile(
    url,
    setOpening,
  ) {
    if (!url) {
      setError(
        "This file does not have a valid link.",
      );

      return;
    }

    clearMessages();
    setOpening(true);

    try {
      const supported =
        await Linking.canOpenURL(
          url,
        );

      if (!supported) {
        throw new Error(
          "This file cannot be opened on this device.",
        );
      }

      await Linking.openURL(url);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Couldn't open the file. Please try again.",
      );
    } finally {
      setOpening(false);
    }
  }

  async function submitHomework() {
    if (
      uploading ||
      !canModifySubmission ||
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

            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",

            "text/plain",
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

      const existingFileCount =
        submissionFiles.length;

      const remainingSlots =
        Math.max(
          0,
          MAX_HOMEWORK_FILES -
            existingFileCount,
        );

      if (
        result.assets.length >
        remainingSlots
      ) {
        setError(
          remainingSlots > 0
            ? `You may upload only ${remainingSlots} more ${
                remainingSlots === 1
                  ? "file"
                  : "files"
              }.`
            : `This submission already contains the maximum of ${MAX_HOMEWORK_FILES} files.`,
        );

        return;
      }

      const queuedItems =
        result.assets.map((asset) => ({
          clientId:
            createUploadClientId(),
          asset,
          name:
            asset.name ||
            "Homework file",
          size: asset.size,
          status: "queued",
          progress: 0,
          error: "",
          objectKey: null,
        }));

      updateUploadItems((current) => [
        ...current.filter(
          (item) =>
            item.status !== "complete",
        ),
        ...queuedItems,
      ]);

      await uploadAssets(queuedItems);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't upload your homework files.",
        ),
      );
    } finally {
      // uploadAssets owns the active upload state.
    }
  }

  function cancelUpload(item) {
    cancelledUploadIdsRef.current.add(
      item.clientId,
    );

    const cancel =
      uploadCancelRef.current.get(
        item.clientId,
      );

    if (cancel) {
      Promise.resolve(cancel()).catch(
        () => {},
      );
    }

    updateUploadItem(item.clientId, {
      status: "cancelled",
      error: "Upload cancelled.",
    });

    removePreparedUploads([
      item.objectKey,
    ]);
  }

  function retryUpload(item) {
    if (uploading || !item?.asset) {
      return;
    }

    if (
      item.status === "confirm_failed" &&
      item.objectKey
    ) {
      retryUploadConfirmation(item);
      return;
    }

    uploadAssets([item]);
  }

  async function retryUploadConfirmation(
    item,
  ) {
    setUploading(true);
    clearMessages();
    updateUploadItem(item.clientId, {
      status: "confirming",
      error: "",
      progress: 100,
    });

    try {
      const response = await api.post(
        `/submissions/task/${taskId}/uploads/confirm`,
        {
          uploads: [
            {
              clientId: item.clientId,
              objectKey: item.objectKey,
            },
          ],
        },
      );

      setMySubmission(
        response.data?.submission || null,
      );
      updateUploadItem(item.clientId, {
        status: "complete",
        error: "",
      });
      setSuccess(
        "Homework file uploaded successfully.",
      );
    } catch (requestError) {
      updateUploadItem(item.clientId, {
        status: "confirm_failed",
        error: getErrorMessage(
          requestError,
          "Couldn't finish saving this uploaded file.",
        ),
      });
      setError(
        getErrorMessage(
          requestError,
          "Couldn't finish saving this uploaded file.",
        ),
      );
    } finally {
      setUploading(false);
    }
  }

  async function deleteHomeworkFile(
    fileId,
  ) {
    if (
      !mySubmission?.id ||
      !fileId ||
      deletingFileId ||
      !canModifySubmission
    ) {
      return;
    }

    clearMessages();
    setDeletingFileId(fileId);

    try {
      const response =
        await api.delete(
          `/submissions/${mySubmission.id}/files/${fileId}`,
        );

      setMySubmission(
        response.data
          ?.submission || null,
      );

      setSuccess(
        "Homework file deleted.",
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't delete the homework file.",
        ),
      );
    } finally {
      setDeletingFileId(null);
    }
  }

  function openSubmissionFile(
    file,
  ) {
    openExternalFile(
      file.fileUrl,
      (opening) =>
        setOpeningSubmissionFileId(
          opening
            ? file.id
            : null,
        ),
    );
  }

  function openLegacySubmissionFile() {
    openExternalFile(
      mySubmission?.fileUrl,
      (opening) =>
        setOpeningSubmissionFileId(
          opening
            ? "legacy"
            : null,
        ),
    );
  }

  function openCorrectedFile(
    file,
  ) {
    openExternalFile(
      file.fileUrl,
      (opening) =>
        setOpeningCorrectedFileId(
          opening
            ? file.id
            : null,
        ),
    );
  }

  function openLegacyCorrectedFile() {
    openExternalFile(
      mySubmission
        ?.correctedFileUrl,
      (opening) =>
        setOpeningCorrectedFileId(
          opening
            ? "legacy-corrected"
            : null,
        ),
    );
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={
          styles.centeredScreen
        }
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={styles.loadingText}
        >
          Loading homework...
        </Text>
      </Screen>
    );
  }

  if (!task) {
    return (
      <Screen>
        <View style={styles.page}>
          <BackButton
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(app)/my-tasks")
            }
          />

          <Card
            style={
              styles.notFoundCard
            }
          >
            <View
              style={
                styles.notFoundIcon
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={38}
                color={colors.danger}
              />
            </View>

            <Text
              style={
                styles.notFoundTitle
              }
            >
              Homework unavailable
            </Text>

            <Text
              style={
                styles.notFoundText
              }
            >
              {error ||
                "The homework could not be loaded or may no longer exist."}
            </Text>

            <View
              style={
                styles.notFoundActions
              }
            >
              <Button
                title="Try again"
                variant="secondary"
                onPress={() =>
                  load()
                }
              />

              <Button
                title="Go back"
                variant="outline"
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace("/(app)/my-tasks")
                }
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
        <BackButton
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(app)/my-tasks")
          }
        />

        {error ? (
          <MessageBanner
            type="error"
            message={error}
            onDismiss={() =>
              setError("")
            }
            onRetry={() =>
              load({
                silent: true,
              })
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
          <View
            style={styles.heroContent}
          >
            <View
              style={styles.heroIcon}
            >
              <Ionicons
                name="book-outline"
                size={30}
                color={colors.primary}
              />
            </View>

            <View
              style={styles.heroCopy}
            >
              <Text
                style={styles.eyebrow}
              >
                HOMEWORK TASK
              </Text>

              <Text
                style={styles.pageTitle}
              >
                {task.title}
              </Text>

              <Text
                style={
                  styles.pageDescription
                }
              >
                {task.description?.trim() ||
                  "No additional instructions were provided."}
              </Text>

              <View
                style={
                  styles.heroBadges
                }
              >
                <Badge
                  label={`Due ${formatDate(
                    task.deadline,
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
                    task.gradeOutOf ??
                    "—"
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
                loading={
                  openingTaskFile
                }
                disabled={
                  openingTaskFile
                }
                onPress={() =>
                  openExternalFile(
                    task.taskFileUrl,
                    setOpeningTaskFile,
                  )
                }
              />
            ) : null}
          </View>
        </Card>

        <View style={styles.workspace}>
          <View
            style={styles.mainColumn}
          >
            <Card
              style={
                styles.detailsCard
              }
            >
              <View
                style={styles.cardHeader}
              >
                <View
                  style={
                    styles.cardHeaderIcon
                  }
                >
                  <Ionicons
                    name="reader-outline"
                    size={22}
                    color={
                      colors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.cardHeaderCopy
                  }
                >
                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    Task details
                  </Text>

                  <Text
                    style={
                      styles.cardSubtitle
                    }
                  >
                    Review the task
                    information and attached
                    files before submitting.
                  </Text>
                </View>
              </View>

              <View
                style={styles.divider}
              />

              <View
                style={styles.detailGrid}
              >
                <DetailItem
                  icon="calendar-outline"
                  label="Deadline"
                  value={
                    formatDate(
                      task.deadline,
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
                    task.gradeOutOf ??
                    "—"
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

              <View
                style={styles.divider}
              />

              <Text
                style={
                  styles.sectionLabel
                }
              >
                Instructions
              </Text>

              <Text
                style={
                  styles.instructions
                }
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
                      setOpeningTaskFile,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.fileCard,

                    pressed &&
                      styles.pressedOpacity,
                  ]}
                >
                  <View
                    style={
                      styles.fileIcon
                    }
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={22}
                      color={
                        colors.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.fileInfo
                    }
                  >
                    <Text
                      style={
                        styles.fileTitle
                      }
                    >
                      Homework attachment
                    </Text>

                    <Text
                      style={
                        styles.fileSubtitle
                      }
                    >
                      Open the task file
                      or additional
                      instructions
                    </Text>
                  </View>

                  {openingTaskFile ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        colors.primary
                      }
                    />
                  ) : (
                    <Ionicons
                      name="open-outline"
                      size={19}
                      color={
                        colors.primary
                      }
                    />
                  )}
                </Pressable>
              ) : (
                <View
                  style={
                    styles.noFileBox
                  }
                >
                  <Ionicons
                    name="document-outline"
                    size={20}
                    color={
                      colors.textMuted
                    }
                  />

                  <Text
                    style={
                      styles.noFileText
                    }
                  >
                    No homework file was
                    attached.
                  </Text>
                </View>
              )}
            </Card>
          </View>

          <View
            style={styles.sideColumn}
          >
            <Card
              style={
                styles.submissionCard
              }
            >
              <View
                style={
                  styles.submissionHeader
                }
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
                    style={
                      styles.cardTitle
                    }
                  >
                    Your submission
                  </Text>

                  <Text
                    style={
                      styles.cardSubtitle
                    }
                  >
                    {mySubmission
                      ? "Your homework files have been received."
                      : "Upload one or more files containing your completed work."}
                  </Text>
                </View>
              </View>

              <View
                style={styles.divider}
              />

              <StatusPanel
                status={status}
              />

              {mySubmission ? (
                <SubmittedPanel
                  submission={
                    mySubmission
                  }
                  files={
                    submissionFiles
                  }
                  correctedFiles={
                    correctedFiles
                  }
                  gradeOutOf={
                    task.gradeOutOf
                  }
                  canModify={
                    canModifySubmission
                  }
                  uploading={uploading}
                  deletingFileId={
                    deletingFileId
                  }
                  openingSubmissionFileId={
                    openingSubmissionFileId
                  }
                  openingCorrectedFileId={
                    openingCorrectedFileId
                  }
                  onAddFiles={
                    submitHomework
                  }
                  onDeleteFile={
                    deleteHomeworkFile
                  }
                  onOpenSubmissionFile={
                    openSubmissionFile
                  }
                  onOpenLegacySubmission={
                    openLegacySubmissionFile
                  }
                  onOpenCorrectedFile={
                    openCorrectedFile
                  }
                  onOpenLegacyCorrected={
                    openLegacyCorrectedFile
                  }
                />
              ) : canModifySubmission ? (
                <InitialUploadPanel
                  isPastDeadline={
                    isPastDeadline
                  }
                  uploading={
                    uploading
                  }
                  onUpload={
                    submitHomework
                  }
                />
              ) : (
                <ClosedSubmissionPanel />
              )}

              {refreshing ? (
                <View
                  style={
                    styles.refreshingRow
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
                      styles.refreshingText
                    }
                  >
                    Updating submission...
                  </Text>
                </View>
              ) : null}

              <HomeworkUploadQueue
                items={uploadItems}
                uploading={uploading}
                onCancel={cancelUpload}
                onRetry={retryUpload}
              />
            </Card>
          </View>
        </View>
      </View>
    </Screen>
  );
}

function BackButton({ onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
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
        style={
          styles.backButtonText
        }
      >
        Back to my tasks
      </Text>
    </Pressable>
  );
}

function HomeworkUploadQueue({
  items,
  uploading,
  onCancel,
  onRetry,
}) {
  if (!items.length) {
    return null;
  }

  const visibleItems = items.filter(
    (item) =>
      item.status !== "complete",
  );

  if (!visibleItems.length) {
    return null;
  }

  const statusText = {
    preparing: "Preparing secure upload...",
    queued: "Waiting to upload...",
    uploading: "Uploading directly to storage...",
    confirming: "Saving submission...",
    confirm_failed:
      "Uploaded, but not yet saved",
    failed: "Upload failed",
    cancelled: "Upload cancelled",
  };

  return (
    <View style={styles.uploadQueue}>
      <Text style={styles.uploadQueueTitle}>
        Upload progress
      </Text>

      {visibleItems.map((item) => {
        const active = [
          "preparing",
          "queued",
          "uploading",
        ].includes(item.status);

        const retryable = [
          "failed",
          "cancelled",
          "confirm_failed",
        ].includes(item.status);

        return (
          <View
            key={item.clientId}
            style={styles.uploadQueueItem}
          >
            <View
              style={
                styles.uploadQueueHeader
              }
            >
              <View
                style={
                  styles.uploadQueueFileCopy
                }
              >
                <Text
                  numberOfLines={1}
                  style={
                    styles.uploadQueueFileName
                  }
                >
                  {item.name}
                </Text>

                <Text
                  style={
                    styles.uploadQueueStatus
                  }
                >
                  {statusText[item.status] ||
                    item.status}
                  {item.size
                    ? ` • ${formatFileSize(
                        item.size,
                      )}`
                    : ""}
                </Text>
              </View>

              {active ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    onCancel(item)
                  }
                  style={
                    styles.uploadQueueAction
                  }
                >
                  <Text
                    style={
                      styles.uploadQueueCancelText
                    }
                  >
                    Cancel
                  </Text>
                </Pressable>
              ) : retryable ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={uploading}
                  onPress={() =>
                    onRetry(item)
                  }
                  style={
                    styles.uploadQueueAction
                  }
                >
                  <Text
                    style={[
                      styles.uploadQueueRetryText,
                      uploading &&
                        styles.uploadQueueActionDisabled,
                    ]}
                  >
                    Retry
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View
              style={styles.uploadProgressTrack}
            >
              <View
                style={[
                  styles.uploadProgressFill,
                  {
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        Number(
                          item.progress,
                        ) || 0,
                      ),
                    )}%`,
                  },
                  retryable &&
                    styles.uploadProgressFillError,
                ]}
              />
            </View>

            {item.error ? (
              <Text
                style={styles.uploadQueueError}
              >
                {item.error}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function InitialUploadPanel({
  isPastDeadline,
  uploading,
  onUpload,
}) {
  return (
    <View>
      {isPastDeadline ? (
        <NoticeBox
          type="warning"
          title="Deadline passed"
          message="Late submissions are still allowed. Files uploaded now will be marked as submitted after the deadline."
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
            Upload multiple PDF, image,
            Word, Excel, PowerPoint, or
            text files.
          </Text>
        </View>
      </View>

      <Button
        title={
          uploading
            ? "Uploading..."
            : "Choose files and submit"
        }
        variant="secondary"
        loading={uploading}
        disabled={uploading}
        onPress={onUpload}
        style={
          styles.submitButton
        }
      />

      <Text
        style={styles.uploadNote}
      >
        You can upload up to 20 files.
        Check that every selected file
        belongs to this homework.
      </Text>
    </View>
  );
}

function ClosedSubmissionPanel() {
  return (
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
        The deadline has passed and late
        submissions are not allowed.
      </Text>
    </View>
  );
}

function SubmittedPanel({
  submission,
  files,
  correctedFiles,
  gradeOutOf,
  canModify,
  uploading,
  deletingFileId,
  openingSubmissionFileId,
  openingCorrectedFileId,
  onAddFiles,
  onDeleteFile,
  onOpenSubmissionFile,
  onOpenLegacySubmission,
  onOpenCorrectedFile,
  onOpenLegacyCorrected,
}) {
  const hasGrade =
    submission.grade != null;

  return (
    <View>
      <NoticeBox
        type="success"
        title="Submission received"
        message={
          submission.submittedAt
            ? `Last updated on ${formatDate(
                submission.submittedAt,
              )}`
            : "Your homework was submitted successfully."
        }
      />

      {submission.wasModifiedAfterDeadline ||
      submission.lastModifiedAfterDeadline ? (
        <NoticeBox
          type="warning"
          title="Modified after deadline"
          message="One or more files were added or removed after the homework deadline."
        />
      ) : null}

      {files.length ? (
        <View
          style={
            styles.submissionFilesList
          }
        >
          <View
            style={
              styles.fileListHeader
            }
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              Uploaded files
            </Text>

            <Text
              style={
                styles.fileCountText
              }
            >
              {files.length}/
              {MAX_HOMEWORK_FILES}
            </Text>
          </View>

          {files.map(
            (file, index) => (
              <View
                key={file.id}
                style={
                  styles.submittedFile
                }
              >
                <View
                  style={
                    styles.submissionFileOrder
                  }
                >
                  <Text
                    style={
                      styles.submissionFileOrderText
                    }
                  >
                    {index + 1}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="link"
                  onPress={() =>
                    onOpenSubmissionFile(
                      file,
                    )
                  }
                  style={
                    styles.fileInfo
                  }
                >
                  <Text
                    numberOfLines={1}
                    style={
                      styles.fileTitle
                    }
                  >
                    {file.originalName ||
                      `Homework file ${
                        index + 1
                      }`}
                  </Text>

                  <Text
                    style={
                      styles.fileSubtitle
                    }
                  >
                    {formatFileSize(
                      file.size,
                    )}

                    {file.uploadedAfterDeadline
                      ? " · Uploaded after deadline"
                      : ""}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="link"
                  disabled={
                    openingSubmissionFileId ===
                    file.id
                  }
                  onPress={() =>
                    onOpenSubmissionFile(
                      file,
                    )
                  }
                  style={
                    styles.fileActionButton
                  }
                >
                  {openingSubmissionFileId ===
                  file.id ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        colors.primary
                      }
                    />
                  ) : (
                    <Ionicons
                      name="open-outline"
                      size={19}
                      color={
                        colors.primary
                      }
                    />
                  )}
                </Pressable>

                {canModify ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${
                      file.originalName ||
                      "homework file"
                    }`}
                    disabled={Boolean(
                      deletingFileId,
                    )}
                    onPress={() =>
                      onDeleteFile(
                        file.id,
                      )
                    }
                    style={[
                      styles.deleteFileButton,

                      Boolean(
                        deletingFileId,
                      ) &&
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
                        size={19}
                        color={
                          colors.danger
                        }
                      />
                    )}
                  </Pressable>
                ) : null}
              </View>
            ),
          )}
        </View>
      ) : submission.fileUrl ? (
        <Pressable
          accessibilityRole="link"
          disabled={
            openingSubmissionFileId ===
            "legacy"
          }
          onPress={
            onOpenLegacySubmission
          }
          style={
            styles.submittedFile
          }
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
              Submitted homework
            </Text>

            <Text
              style={
                styles.fileSubtitle
              }
            >
              Legacy single-file
              submission
            </Text>
          </View>

          {openingSubmissionFileId ===
          "legacy" ? (
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
          style={styles.noFilesPanel}
        >
          <Ionicons
            name="documents-outline"
            size={28}
            color={colors.textMuted}
          />

          <Text
            style={
              styles.noFilesTitle
            }
          >
            No uploaded files found
          </Text>

          <Text
            style={
              styles.noFilesText
            }
          >
            Add files while this
            submission remains editable.
          </Text>
        </View>
      )}

      {canModify ? (
        <View
          style={
            styles.modifySubmissionBox
          }
        >
          <Text
            style={
              styles.modifySubmissionTitle
            }
          >
            Update your submission
          </Text>

          <Text
            style={
              styles.modifySubmissionText
            }
          >
            You may add more files or
            delete uploaded files while
            the homework remains ungraded
            and modifications are allowed.
          </Text>

          <Button
            title={
              uploading
                ? "Uploading..."
                : "Add more files"
            }
            variant="secondary"
            loading={uploading}
            disabled={
              uploading ||
              Boolean(
                deletingFileId,
              ) ||
              files.length >=
                MAX_HOMEWORK_FILES
            }
            onPress={onAddFiles}
            style={
              styles.submitButton
            }
          />

          {files.length >=
          MAX_HOMEWORK_FILES ? (
            <Text
              style={
                styles.maximumFilesText
              }
            >
              The maximum of{" "}
              {MAX_HOMEWORK_FILES} files
              has been reached.
            </Text>
          ) : null}
        </View>
      ) : !hasGrade ? (
        <NoticeBox
          type="warning"
          title="Submission locked"
          message={
            submission.modificationBlockedReason ||
            "This submission can no longer be modified."
          }
        />
      ) : null}

      <View
        style={styles.gradeBox}
      >
        <Text
          style={styles.gradeLabel}
        >
          Grade
        </Text>

        {hasGrade ? (
          <>
            <View
              style={
                styles.gradeValueRow
              }
            >
              <Text
                style={
                  styles.gradeValue
                }
              >
                {submission.grade}
              </Text>

              <Text
                style={
                  styles.gradeMaximum
                }
              >
                / {gradeOutOf}
              </Text>
            </View>

            <Text
              style={
                styles.gradeStatus
              }
            >
              Grading completed
            </Text>

            {submission.gradedBy?.name ? (
              <Text
                style={
                  styles.gradeStatus
                }
              >
                Graded by{" "}
                {submission.gradedBy.name}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <Text
              style={
                styles.pendingGrade
              }
            >
              Not graded yet
            </Text>

            <Text
              style={
                styles.gradeStatus
              }
            >
              Your teacher or assistant
              will review your submission.
            </Text>
          </>
        )}
      </View>

      {submission.comments ? (
        <View
          style={
            styles.feedbackBox
          }
        >
          <Text
            style={
              styles.feedbackLabel
            }
          >
            Grader feedback
          </Text>

          <Text
            style={
              styles.feedbackText
            }
          >
            {submission.comments}
          </Text>
        </View>
      ) : null}

      {correctedFiles.length ? (
        <View
          style={
            styles.submissionFilesList
          }
        >
          <View
            style={
              styles.fileListHeader
            }
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              Corrected files
            </Text>

            <Text
              style={
                styles.fileCountText
              }
            >
              {correctedFiles.length}
            </Text>
          </View>

          {correctedFiles.map(
            (file, index) => (
              <Pressable
                key={file.id}
                accessibilityRole="link"
                disabled={
                  openingCorrectedFileId ===
                  file.id
                }
                onPress={() =>
                  onOpenCorrectedFile(
                    file,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.correctedFile,

                  pressed &&
                    styles.pressedOpacity,
                ]}
              >
                <View
                  style={
                    styles.correctedFileIcon
                  }
                >
                  <Ionicons
                    name="checkmark-done-outline"
                    size={21}
                    color={
                      colors.secondary
                    }
                  />
                </View>

                <View
                  style={styles.fileInfo}
                >
                  <Text
                    numberOfLines={1}
                    style={
                      styles.fileTitle
                    }
                  >
                    {file.originalName ||
                      `Corrected file ${
                        index + 1
                      }`}
                  </Text>

                  <Text
                    style={
                      styles.fileSubtitle
                    }
                  >
                    {formatFileSize(
                      file.size,
                    )}

                    {file.uploadedBy?.name
                      ? ` · Returned by ${file.uploadedBy.name}`
                      : ""}
                  </Text>
                </View>

                {openingCorrectedFileId ===
                file.id ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      colors.primary
                    }
                  />
                ) : (
                  <Ionicons
                    name="open-outline"
                    size={19}
                    color={
                      colors.primary
                    }
                  />
                )}
              </Pressable>
            ),
          )}
        </View>
      ) : submission.correctedFileUrl ? (
        <Pressable
          accessibilityRole="link"
          disabled={
            openingCorrectedFileId ===
            "legacy-corrected"
          }
          onPress={
            onOpenLegacyCorrected
          }
          style={({
            pressed,
          }) => [
            styles.correctedFile,

            pressed &&
              styles.pressedOpacity,
          ]}
        >
          <View
            style={
              styles.correctedFileIcon
            }
          >
            <Ionicons
              name="checkmark-done-outline"
              size={21}
              color={
                colors.secondary
              }
            />
          </View>

          <View
            style={styles.fileInfo}
          >
            <Text
              style={styles.fileTitle}
            >
              Corrected homework
            </Text>

            <Text
              style={
                styles.fileSubtitle
              }
            >
              Open the corrected file
              returned by the grader
            </Text>
          </View>

          {openingCorrectedFileId ===
          "legacy-corrected" ? (
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
    <View
      style={styles.detailItem}
    >
      <View
        style={styles.detailIcon}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <View
        style={styles.detailCopy}
      >
        <Text
          style={styles.detailLabel}
        >
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
          borderColor:
            `${color}50`,

          backgroundColor:
            `${color}10`,
        },
      ]}
    >
      <View
        style={styles.statusIcon}
      >
        <Ionicons
          name={status.icon}
          size={21}
          color={color}
        />
      </View>

      <View
        style={styles.statusCopy}
      >
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

        <Text
          style={
            styles.statusHelper
          }
        >
          {status.helper}
        </Text>
      </View>
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

  const color =
    isSuccess
      ? colors.secondary
      : colors.warning;

  return (
    <View
      style={[
        styles.noticeBox,

        {
          borderColor:
            `${color}50`,

          backgroundColor:
            `${color}10`,
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

      <View
        style={styles.noticeCopy}
      >
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

        <Text
          style={styles.noticeText}
        >
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
  const isError =
    type === "error";

  const color =
    isError
      ? colors.danger
      : colors.secondary;

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.messageBanner,

        {
          borderColor:
            `${color}55`,

          backgroundColor:
            `${color}10`,
        },
      ]}
    >
      <View
        style={[
          styles.messageIndicator,

          {
            backgroundColor:
              color,
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
