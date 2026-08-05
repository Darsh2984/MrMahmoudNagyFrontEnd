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

import * as DocumentPicker from "expo-document-picker";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";
import { useAuth } from "../../../src/contexts/AuthContext";

import api from "../../../src/lib/api";
import { formatDate } from "../../../src/utils/formatDate";
import { colors } from "../../../src/theme";

import { styles } from "./[taskId].styles";

const MAX_CORRECTED_FILES = 20;

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getInitial(name) {
  return (
    name?.trim()?.charAt(0)?.toUpperCase() ||
    "S"
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

function normalizeTaskGroups(task) {
  if (!Array.isArray(task?.groups)) {
    return [];
  }

  return task.groups
    .map((taskGroup) => taskGroup?.group)
    .filter(Boolean);
}

function formatDelegationAction(entry) {
  switch (entry.action) {
    case "ASSIGNED":
      return `Assigned to ${
        entry.toAssistant?.name ||
        "assistant"
      }`;

    case "REASSIGNED":
      return `Reassigned from ${
        entry.fromAssistant?.name ||
        "previous assistant"
      } to ${
        entry.toAssistant?.name ||
        "new assistant"
      }`;

    case "REMOVED":
      return `Removed from ${
        entry.fromAssistant?.name ||
        "assistant"
      }`;

    case "COMPLETED":
      return `Completed by ${
        entry.toAssistant?.name ||
        entry.fromAssistant?.name ||
        "assistant"
      }`;

    default:
      return (
        entry.action ||
        "Delegation updated"
      );
  }
}

async function appendAssetToFormData(
  formData,
  fieldName,
  asset,
) {
  const filename =
    asset.name ||
    `corrected-${Date.now()}`;

  const mimeType =
    asset.mimeType ||
    asset.type ||
    "application/octet-stream";

  if (
    Platform.OS === "web" &&
    asset.file
  ) {
    formData.append(
      fieldName,
      asset.file,
      filename,
    );

    return;
  }

  if (Platform.OS === "web") {
    const response = await fetch(asset.uri);

    if (!response.ok) {
      throw new Error(
        `The file "${filename}" could not be prepared.`,
      );
    }

    const blob = await response.blob();

    formData.append(
      fieldName,
      blob,
      filename,
    );

    return;
  }

  formData.append(fieldName, {
    uri: asset.uri,
    name: filename,
    type: mimeType,
  });
}

export default function TeacherTaskDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const rawTaskId = params.taskId;

  const taskId = Array.isArray(rawTaskId)
    ? rawTaskId[0]
    : rawTaskId;

  const isDesktop = width >= 980;
  const isSmallScreen = width < 640;

  const isAdminLevel =
    user?.role === "TEACHER" ||
    Boolean(user?.isHeadAssistant);

  const isRegularAssistant =
    user?.role === "ASSISTANT" &&
    !user?.isHeadAssistant;

  const [task, setTask] = useState(null);
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [gradeForms, setGradeForms] =
    useState({});

  const [
    gradingSubmissionId,
    setGradingSubmissionId,
  ] = useState(null);

  const [
    openingFileKey,
    setOpeningFileKey,
  ] = useState(null);

  const [
    selectedSubmissionIds,
    setSelectedSubmissionIds,
  ] = useState([]);

  const [
    delegateModalVisible,
    setDelegateModalVisible,
  ] = useState(false);

  const [
    delegationMode,
    setDelegationMode,
  ] = useState("single");

  const [
    selectedSubmission,
    setSelectedSubmission,
  ] = useState(null);

  const [
    selectedAssistantId,
    setSelectedAssistantId,
  ] = useState(null);

  const [
    delegationReason,
    setDelegationReason,
  ] = useState("");

  const [
    assistantSearch,
    setAssistantSearch,
  ] = useState("");

  const [
    delegateError,
    setDelegateError,
  ] = useState("");

  const [
    delegatingSubmissionId,
    setDelegatingSubmissionId,
  ] = useState(null);

  const [
    removingDelegationId,
    setRemovingDelegationId,
  ] = useState(null);

  const [
    historyModalVisible,
    setHistoryModalVisible,
  ] = useState(false);

  const [
    historySubmission,
    setHistorySubmission,
  ] = useState(null);

  const [
    delegationHistory,
    setDelegationHistory,
  ] = useState([]);

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(false);

  const [
    historyError,
    setHistoryError,
  ] = useState("");

  const submissions = useMemo(() => {
    const all = Array.isArray(
      task?.submissions,
    )
      ? task.submissions
      : [];

    if (!isRegularAssistant) {
      return all;
    }

    return all.filter((submission) => {
      const assistantId =
        submission.delegation
          ?.assistantId ||
        submission.delegation
          ?.assistant?.id;

      return (
        String(assistantId) ===
        String(user?.id)
      );
    });
  }, [
    isRegularAssistant,
    task?.submissions,
    user?.id,
  ]);

  const selectableSubmissions =
    useMemo(
      () =>
        submissions.filter(
          (submission) =>
            submission.grade == null &&
            !submission.delegation,
        ),
      [submissions],
    );

  const selectedBulkSubmissions =
    useMemo(
      () =>
        selectableSubmissions.filter(
          (submission) =>
            selectedSubmissionIds.includes(
              submission.id,
            ),
        ),
      [
        selectableSubmissions,
        selectedSubmissionIds,
      ],
    );

  const allSelectableSelected =
    selectableSubmissions.length > 0 &&
    selectableSubmissions.every(
      (submission) =>
        selectedSubmissionIds.includes(
          submission.id,
        ),
    );

  const taskGroups = useMemo(
    () => normalizeTaskGroups(task),
    [task],
  );

  const eligibleAssistants = useMemo(() => {
    const assistants = new Map();

    for (const taskGroup of task?.groups || []) {
      const assignments =
        taskGroup?.group
          ?.assistantAssignments || [];

      for (const assignment of assignments) {
        const assistant =
          assignment?.assistant;

        if (!assistant?.id) {
          continue;
        }

        const canGrade =
          assistant.isHeadAssistant === true ||
          assistant.permissions
            ?.canGradeHomework === true;

        if (canGrade) {
          assistants.set(
            String(assistant.id),
            assistant,
          );
        }
      }
    }

    return Array.from(
      assistants.values(),
    );
  }, [task?.groups]);

  const filteredAssistants = useMemo(() => {
    const query = assistantSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return eligibleAssistants;
    }

    return eligibleAssistants.filter(
      (assistant) =>
        assistant.name
          ?.toLowerCase()
          .includes(query) ||
        assistant.email
          ?.toLowerCase()
          .includes(query),
    );
  }, [
    assistantSearch,
    eligibleAssistants,
  ]);

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

        if (
          submission.lastModifiedAfterDeadline ||
          submission.wasModifiedAfterDeadline
        ) {
          result.lateModified += 1;
        }

        return result;
      },
      {
        total: submissions.length,
        graded: 0,
        delegated: 0,
        pending: 0,
        lateModified: 0,
      },
    );
  }, [submissions]);

  const progressPercentage = useMemo(() => {
    if (!summary.total) {
      return 0;
    }

    return Math.round(
      (summary.graded / summary.total) *
        100,
    );
  }, [summary]);

  const loadTask = useCallback(
    async ({ silent = false } = {}) => {
      if (!taskId) {
        setError(
          "Task ID is missing.",
        );

        setLoading(false);
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      setError("");

      try {
        const response = await api.get(
          `/tasks/${taskId}`,
        );

        setTask(response.data);

        const refreshedSubmissions =
          Array.isArray(
            response.data?.submissions,
          )
            ? response.data.submissions
            : [];

        setSelectedSubmissionIds(
          (current) =>
            current.filter((submissionId) =>
              refreshedSubmissions.some(
                (submission) =>
                  submission.id ===
                    submissionId &&
                  submission.grade == null &&
                  !submission.delegation,
              ),
            ),
        );
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
    },
    [taskId],
  );

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function getGradeForm(submissionId) {
    return (
      gradeForms[submissionId] || {
        grade: "",
        comments: "",
        correctedFiles: [],
      }
    );
  }

  function updateGradeForm(
    submissionId,
    changes,
  ) {
    setGradeForms((current) => ({
      ...current,

      [submissionId]: {
        ...(current[submissionId] || {
          grade: "",
          comments: "",
          correctedFiles: [],
        }),

        ...changes,
      },
    }));
  }

  function clearGradeForm(submissionId) {
    setGradeForms((current) => {
      const updated = {
        ...current,
      };

      delete updated[submissionId];

      return updated;
    });
  }

  async function openExternalFile(
    url,
    key,
  ) {
    if (!url) {
      setError(
        "This file does not have a valid link.",
      );

      return;
    }

    clearMessages();
    setOpeningFileKey(key);

    try {
      const supported =
        await Linking.canOpenURL(url);

      if (!supported) {
        throw new Error(
          "This file cannot be opened on this device.",
        );
      }

      await Linking.openURL(url);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Couldn't open the file.",
      );
    } finally {
      setOpeningFileKey(null);
    }
  }

  async function selectCorrectedFiles(
    submissionId,
  ) {
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

      const currentForm =
        getGradeForm(submissionId);

      if (
        currentForm.correctedFiles.length +
          result.assets.length >
        MAX_CORRECTED_FILES
      ) {
        setError(
          `You can select a maximum of ${MAX_CORRECTED_FILES} corrected files.`,
        );

        return;
      }

      updateGradeForm(
        submissionId,
        {
          correctedFiles: [
            ...currentForm.correctedFiles,

            ...result.assets.map(
              (asset) => ({
                ...asset,

                localId:
                  `${Date.now()}-${Math.random()}`,
              }),
            ),
          ],
        },
      );
    } catch (pickerError) {
      setError(
        pickerError?.message ||
          "Couldn't select corrected files.",
      );
    }
  }

  function removeSelectedCorrectedFile(
    submissionId,
    localId,
  ) {
    const currentForm =
      getGradeForm(submissionId);

    updateGradeForm(
      submissionId,
      {
        correctedFiles:
          currentForm.correctedFiles.filter(
            (file) =>
              file.localId !== localId,
          ),
      },
    );
  }

  function validateGrade(submissionId) {
    const form =
      getGradeForm(submissionId);

    const grade = Number(form.grade);

    if (
      form.grade === "" ||
      !Number.isFinite(grade)
    ) {
      return {
        valid: false,
        message:
          "Enter a valid numeric grade.",
      };
    }

    if (grade < 0) {
      return {
        valid: false,
        message:
          "Grade cannot be negative.",
      };
    }

    if (
      task?.gradeOutOf != null &&
      grade >
        Number(task.gradeOutOf)
    ) {
      return {
        valid: false,

        message:
          `Grade cannot exceed ${task.gradeOutOf}.`,
      };
    }

    return {
      valid: true,
      grade,
      form,
    };
  }

  async function gradeSubmission(
    submission,
  ) {
    clearMessages();

    const validation =
      validateGrade(submission.id);

    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setGradingSubmissionId(
      submission.id,
    );

    try {
      const formData = new FormData();

      formData.append(
        "grade",
        String(validation.grade),
      );

      formData.append(
        "comments",
        validation.form.comments || "",
      );

      for (const asset of validation.form
        .correctedFiles) {
        await appendAssetToFormData(
          formData,
          "correctedFiles",
          asset,
        );
      }

      await api.patch(
        `/submissions/${submission.id}/grade`,
        formData,
      );

      clearGradeForm(submission.id);

      setSuccess(
        `The submission for ${
          submission.student?.name ||
          "the student"
        } was graded successfully.`,
      );

      await loadTask({
        silent: true,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't grade the submission.",
        ),
      );
    } finally {
      setGradingSubmissionId(null);
    }
  }

  function toggleSubmissionSelection(
    submissionId,
  ) {
    setSelectedSubmissionIds(
      (current) =>
        current.includes(submissionId)
          ? current.filter(
              (id) =>
                id !== submissionId,
            )
          : [
              ...current,
              submissionId,
            ],
    );
  }

  function toggleSelectAll() {
    if (allSelectableSelected) {
      setSelectedSubmissionIds([]);
      return;
    }

    setSelectedSubmissionIds(
      selectableSubmissions.map(
        (submission) =>
          submission.id,
      ),
    );
  }

  function resetDelegationModal() {
    setDelegateModalVisible(false);
    setDelegationMode("single");
    setSelectedSubmission(null);
    setSelectedAssistantId(null);
    setDelegationReason("");
    setAssistantSearch("");
    setDelegateError("");
  }

  function closeDelegateModal() {
    if (delegatingSubmissionId) {
      return;
    }

    resetDelegationModal();
  }

  function openSingleDelegateModal(
    submission,
  ) {
    clearMessages();

    setDelegationMode("single");
    setSelectedSubmission(submission);
    setSelectedAssistantId(null);
    setDelegationReason("");
    setAssistantSearch("");
    setDelegateError("");
    setDelegateModalVisible(true);
  }

  function openBulkDelegateModal() {
    clearMessages();

    if (
      !selectedBulkSubmissions.length
    ) {
      setError(
        "Select at least one ungraded and undelegated submission.",
      );

      return;
    }

    setDelegationMode("bulk");
    setSelectedSubmission(null);
    setSelectedAssistantId(null);
    setDelegationReason("");
    setAssistantSearch("");
    setDelegateError("");
    setDelegateModalVisible(true);
  }

  function openReassignModal(
    submission,
  ) {
    if (!submission.delegation) {
      return;
    }

    clearMessages();

    setDelegationMode("reassign");
    setSelectedSubmission(submission);
    setSelectedAssistantId(null);
    setDelegationReason("");
    setAssistantSearch("");
    setDelegateError("");
    setDelegateModalVisible(true);
  }

  async function submitDelegation() {
    if (!selectedAssistantId) {
      setDelegateError(
        "Choose an assistant.",
      );

      return;
    }

    setDelegateError("");

    const operationKey =
      delegationMode === "bulk"
        ? "bulk"
        : selectedSubmission?.id;

    setDelegatingSubmissionId(
      operationKey,
    );

    try {
      if (delegationMode === "bulk") {
        const response =
          await api.post(
            "/delegations/bulk",
            {
              submissionIds:
                selectedBulkSubmissions.map(
                  (submission) =>
                    submission.id,
                ),

              assistantId:
                selectedAssistantId,

              reason:
                delegationReason.trim() ||
                undefined,
            },
          );

        const result =
          response.data?.result;

        if (result?.failed > 0) {
          setSuccess(
            `${result.delegated} submissions delegated. ${result.failed} could not be delegated.`,
          );
        } else {
          setSuccess(
            `${result?.delegated || selectedBulkSubmissions.length} submissions delegated successfully.`,
          );
        }

        setSelectedSubmissionIds([]);
      } else if (
        delegationMode === "reassign"
      ) {
        await api.patch(
          `/delegations/${selectedSubmission.delegation.id}/reassign`,
          {
            assistantId:
              selectedAssistantId,

            reason:
              delegationReason.trim() ||
              undefined,
          },
        );

        setSuccess(
          "Submission reassigned successfully.",
        );
      } else {
        await api.post(
          "/delegations",
          {
            submissionId:
              selectedSubmission.id,

            assistantId:
              selectedAssistantId,

            reason:
              delegationReason.trim() ||
              undefined,
          },
        );

        setSuccess(
          "Submission delegated successfully.",
        );
      }

      setDelegatingSubmissionId(null);
      resetDelegationModal();

      await loadTask({
        silent: true,
      });
    } catch (requestError) {
      setDelegateError(
        getErrorMessage(
          requestError,
          delegationMode === "bulk"
            ? "Couldn't perform bulk delegation."
            : delegationMode ===
                "reassign"
              ? "Couldn't reassign the submission."
              : "Couldn't delegate the submission.",
        ),
      );

      setDelegatingSubmissionId(null);
    }
  }

  async function removeDelegation(
    submission,
  ) {
    const delegationId =
      submission.delegation?.id;

    if (!delegationId) {
      return;
    }

    clearMessages();

    setRemovingDelegationId(
      delegationId,
    );

    try {
      await api.delete(
        `/delegations/${delegationId}`,
        {
          data: {
            reason:
              "Returned to the unassigned grading queue.",
          },
        },
      );

      setSuccess(
        "Delegation removed successfully.",
      );

      await loadTask({
        silent: true,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't remove the delegation.",
        ),
      );
    } finally {
      setRemovingDelegationId(null);
    }
  }

  async function openDelegationHistory(
    submission,
  ) {
    setHistorySubmission(submission);
    setDelegationHistory([]);
    setHistoryError("");
    setHistoryModalVisible(true);
    setLoadingHistory(true);

    try {
      const response = await api.get(
        `/delegations/submission/${submission.id}/history`,
      );

      setDelegationHistory(
        response.data?.history || [],
      );
    } catch (requestError) {
      setHistoryError(
        getErrorMessage(
          requestError,
          "Couldn't load delegation history.",
        ),
      );
    } finally {
      setLoadingHistory(false);
    }
  }

  function closeHistoryModal() {
    if (loadingHistory) {
      return;
    }

    setHistoryModalVisible(false);
    setHistorySubmission(null);
    setDelegationHistory([]);
    setHistoryError("");
  }

  function getAssistantGroupNames(
    assistantId,
  ) {
    return (task?.groups || [])
      .filter((taskGroup) =>
        taskGroup?.group
          ?.assistantAssignments
          ?.some(
            (assignment) =>
              String(
                assignment?.assistant
                  ?.id,
              ) ===
              String(assistantId),
          ),
      )
      .map(
        (taskGroup) =>
          taskGroup?.group?.name,
      )
      .filter(Boolean);
  }

  function renderStudentFiles(
    submission,
  ) {
    const files = Array.isArray(
      submission.files,
    )
      ? submission.files
      : [];

    if (!files.length) {
      if (!submission.fileUrl) {
        return (
          <View style={styles.noFileBox}>
            <Ionicons
              name="document-outline"
              size={19}
              color={colors.textMuted}
            />

            <Text
              style={styles.noFileText}
            >
              No student files are available.
            </Text>
          </View>
        );
      }

      return (
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            openExternalFile(
              submission.fileUrl,
              `legacy-${submission.id}`,
            )
          }
          style={({ pressed }) => [
            styles.fileRow,

            pressed && styles.pressed,
          ]}
        >
          <View
            style={styles.fileOrder}
          >
            <Ionicons
              name="document-outline"
              size={18}
              color={colors.primary}
            />
          </View>

          <View
            style={styles.fileDetails}
          >
            <Text
              style={styles.fileName}
            >
              Legacy submission file
            </Text>

            <Text
              style={styles.fileMeta}
            >
              Open the student's uploaded
              homework
            </Text>
          </View>

          <Ionicons
            name="open-outline"
            size={19}
            color={colors.primary}
          />
        </Pressable>
      );
    }

    return (
      <View style={styles.filesSection}>
        <View
          style={styles.filesSectionHeader}
        >
          <Text
            style={styles.filesSectionTitle}
          >
            Student files
          </Text>

          <Text
            style={styles.filesCount}
          >
            {files.length}{" "}
            {files.length === 1
              ? "file"
              : "files"}
          </Text>
        </View>

        {files.map((file, index) => {
          const key =
            `student-${file.id}`;

          return (
            <Pressable
              key={file.id}
              accessibilityRole="link"
              onPress={() =>
                openExternalFile(
                  file.fileUrl,
                  key,
                )
              }
              style={({ pressed }) => [
                styles.fileRow,

                pressed &&
                  styles.pressed,
              ]}
            >
              <View
                style={styles.fileOrder}
              >
                <Text
                  style={
                    styles.fileOrderText
                  }
                >
                  {index + 1}
                </Text>
              </View>

              <View
                style={styles.fileDetails}
              >
                <Text
                  numberOfLines={1}
                  style={styles.fileName}
                >
                  {file.originalName ||
                    `Submission file ${
                      index + 1
                    }`}
                </Text>

                <Text
                  style={styles.fileMeta}
                >
                  {formatFileSize(
                    file.size,
                  )}

                  {file.uploadedAfterDeadline
                    ? " · Uploaded after deadline"
                    : ""}
                </Text>
              </View>

              {openingFileKey === key ? (
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
          );
        })}
      </View>
    );
  }

  function renderCorrectedFiles(
    submission,
  ) {
    const files = Array.isArray(
      submission.correctedFiles,
    )
      ? submission.correctedFiles
      : [];

    if (!files.length) {
      if (!submission.correctedFileUrl) {
        return null;
      }

      return (
        <View
          style={
            styles.returnedFilesSection
          }
        >
          <Text
            style={
              styles.filesSectionTitle
            }
          >
            Returned correction
          </Text>

          <Pressable
            accessibilityRole="link"
            onPress={() =>
              openExternalFile(
                submission.correctedFileUrl,
                `legacy-corrected-${submission.id}`,
              )
            }
            style={({ pressed }) => [
              styles.correctedFileRow,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color={colors.secondary}
            />

            <View
              style={styles.fileDetails}
            >
              <Text
                style={styles.fileName}
              >
                Corrected homework
              </Text>

              <Text
                style={styles.fileMeta}
              >
                Legacy corrected file
              </Text>
            </View>

            <Ionicons
              name="open-outline"
              size={19}
              color={colors.primary}
            />
          </Pressable>
        </View>
      );
    }

    return (
      <View
        style={
          styles.returnedFilesSection
        }
      >
        <View
          style={styles.filesSectionHeader}
        >
          <Text
            style={styles.filesSectionTitle}
          >
            Returned corrected files
          </Text>

          <Text
            style={styles.filesCount}
          >
            {files.length}
          </Text>
        </View>

        {files.map((file, index) => {
          const key =
            `corrected-${file.id}`;

          return (
            <Pressable
              key={file.id}
              accessibilityRole="link"
              onPress={() =>
                openExternalFile(
                  file.fileUrl,
                  key,
                )
              }
              style={({ pressed }) => [
                styles.correctedFileRow,

                pressed &&
                  styles.pressed,
              ]}
            >
              <View
                style={
                  styles.correctedFileIcon
                }
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={18}
                  color={colors.secondary}
                />
              </View>

              <View
                style={styles.fileDetails}
              >
                <Text
                  numberOfLines={1}
                  style={styles.fileName}
                >
                  {file.originalName ||
                    `Corrected file ${
                      index + 1
                    }`}
                </Text>

                <Text
                  style={styles.fileMeta}
                >
                  {formatFileSize(
                    file.size,
                  )}
                </Text>
              </View>

              {openingFileKey === key ? (
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
          );
        })}
      </View>
    );
  }

  function renderGradeForm(
    submission,
  ) {
    const form =
      getGradeForm(submission.id);

    const isGrading =
      gradingSubmissionId ===
      submission.id;

    return (
      <View style={styles.gradingPanel}>
        <View
          style={styles.gradingHeading}
        >
          <Text
            style={styles.gradingTitle}
          >
            Grade submission
          </Text>

          <Text
            style={styles.gradingSubtitle}
          >
            Enter the final grade, add
            feedback, and optionally return
            corrected files.
          </Text>
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>
            Grade
          </Text>

          <View
            style={styles.gradeInputWrapper}
          >
            <TextInput
              value={form.grade}
              onChangeText={(value) =>
                updateGradeForm(
                  submission.id,
                  {
                    grade: value,
                  },
                )
              }
              placeholder="Enter grade"
              placeholderTextColor={
                colors.textMuted
              }
              keyboardType="decimal-pad"
              style={styles.gradeInput}
            />

            <View
              style={styles.gradeSuffix}
            >
              <Text
                style={
                  styles.gradeSuffixText
                }
              >
                / {task?.gradeOutOf ?? "-"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>
            Feedback for student
          </Text>

          <TextInput
            value={form.comments}
            onChangeText={(value) =>
              updateGradeForm(
                submission.id,
                {
                  comments: value,
                },
              )
            }
            placeholder="Write comments, corrections, or advice..."
            placeholderTextColor={
              colors.textMuted
            }
            multiline
            textAlignVertical="top"
            style={styles.commentsInput}
          />
        </View>

        <View style={styles.formField}>
          <View
            style={
              styles.correctedPickerHeader
            }
          >
            <View>
              <Text
                style={styles.formLabel}
              >
                Corrected files
              </Text>

              <Text
                style={styles.formHelper}
              >
                Optional — select up to{" "}
                {MAX_CORRECTED_FILES} files.
              </Text>
            </View>

            <Button
              title="Choose files"
              variant="outline"
              disabled={isGrading}
              onPress={() =>
                selectCorrectedFiles(
                  submission.id,
                )
              }
            />
          </View>

          {form.correctedFiles.length ? (
            <View
              style={
                styles.selectedFilesList
              }
            >
              {form.correctedFiles.map(
                (file, index) => (
                  <View
                    key={file.localId}
                    style={
                      styles.selectedFileRow
                    }
                  >
                    <View
                      style={
                        styles.selectedFileIcon
                      }
                    >
                      <Ionicons
                        name="document-attach-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </View>

                    <View
                      style={
                        styles.fileDetails
                      }
                    >
                      <Text
                        numberOfLines={1}
                        style={styles.fileName}
                      >
                        {file.name ||
                          `Corrected file ${
                            index + 1
                          }`}
                      </Text>

                      <Text
                        style={styles.fileMeta}
                      >
                        {formatFileSize(
                          file.size,
                        )}
                      </Text>
                    </View>

                    <Pressable
                      disabled={isGrading}
                      onPress={() =>
                        removeSelectedCorrectedFile(
                          submission.id,
                          file.localId,
                        )
                      }
                      style={
                        styles.removeSelectedFile
                      }
                    >
                      <Ionicons
                        name="close"
                        size={18}
                        color={colors.danger}
                      />
                    </Pressable>
                  </View>
                ),
              )}
            </View>
          ) : (
            <View
              style={
                styles.noSelectedFiles
              }
            >
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color={colors.textMuted}
              />

              <Text
                style={
                  styles.noSelectedFilesText
                }
              >
                No corrected files selected.
              </Text>
            </View>
          )}
        </View>

        <Button
          title={
            isGrading
              ? "Saving grade..."
              : "Save grade and return"
          }
          variant="secondary"
          loading={isGrading}
          disabled={Boolean(
            gradingSubmissionId,
          )}
          onPress={() =>
            gradeSubmission(submission)
          }
        />
      </View>
    );
  }

  function renderSubmissionCard(
    submission,
  ) {
    const graded =
      submission.grade != null;

    const delegated = Boolean(
      submission.delegation,
    );

    const delegatedAssistantId =
      submission.delegation
        ?.assistantId ||
      submission.delegation
        ?.assistant?.id;

    const delegatedToCurrentUser =
      delegated &&
      String(delegatedAssistantId) ===
        String(user?.id);

    const canGrade =
      !graded &&
      (isAdminLevel ||
        delegatedToCurrentUser);

    const canDelegate =
      !graded &&
      isAdminLevel &&
      !delegated;

    const canSelectForBulk =
      canDelegate;

    const selectedForBulk =
      selectedSubmissionIds.includes(
        submission.id,
      );

    return (
      <Card
        key={submission.id}
        style={styles.submissionCard}
      >
        {canSelectForBulk ? (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{
              checked: selectedForBulk,
            }}
            onPress={() =>
              toggleSubmissionSelection(
                submission.id,
              )
            }
            style={
              styles.cardSelectionRow
            }
          >
            <View
              style={[
                styles.checkbox,

                selectedForBulk &&
                  styles.checkboxSelected,
              ]}
            >
              {selectedForBulk ? (
                <Ionicons
                  name="checkmark"
                  size={15}
                  color={colors.white}
                />
              ) : null}
            </View>

            <Text
              style={
                styles.cardSelectionText
              }
            >
              Select for bulk delegation
            </Text>
          </Pressable>
        ) : null}

        <View
          style={[
            styles.submissionHeader,

            isSmallScreen &&
              styles.submissionHeaderSmall,
          ]}
        >
          <View
            style={styles.studentIdentity}
          >
            <View
              style={styles.studentAvatar}
            >
              <Text
                style={
                  styles.studentAvatarText
                }
              >
                {getInitial(
                  submission.student?.name,
                )}
              </Text>
            </View>

            <View
              style={styles.studentInfo}
            >
              <Text
                numberOfLines={1}
                style={styles.studentName}
              >
                {submission.student?.name ||
                  "Unknown student"}
              </Text>

              <Text
                style={styles.studentMeta}
              >
                Last updated{" "}
                {formatDate(
                  submission.submittedAt ||
                    submission.lastModifiedAt ||
                    submission.createdAt,
                ) || "date unavailable"}
              </Text>
            </View>
          </View>

          <View
            style={styles.statusBadges}
          >
            {graded ? (
              <Badge
                label={`Graded ${submission.grade}/${task?.gradeOutOf}`}
                tone="success"
              />
            ) : delegatedToCurrentUser ? (
              <Badge
                label="Assigned to you"
                tone="warning"
              />
            ) : delegated ? (
              <Badge
                label={`Delegated to ${
                  submission.delegation
                    ?.assistant?.name ||
                  "assistant"
                }`}
                tone="warning"
              />
            ) : (
              <Badge
                label="Ungraded"
                tone="neutral"
              />
            )}

            {submission.lastModifiedAfterDeadline ||
            submission.wasModifiedAfterDeadline ? (
              <Badge
                label="Modified late"
                tone="danger"
              />
            ) : null}
          </View>
        </View>

        {submission.lastModifiedAfterDeadline ||
        submission.wasModifiedAfterDeadline ? (
          <View
            style={styles.lateWarning}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.warning}
            />

            <View
              style={
                styles.lateWarningText
              }
            >
              <Text
                style={
                  styles.lateWarningTitle
                }
              >
                Modified after deadline
              </Text>

              <Text
                style={
                  styles.lateWarningDescription
                }
              >
                The student added or removed
                one or more files after the
                deadline.
              </Text>
            </View>
          </View>
        ) : null}

        {renderStudentFiles(submission)}

        {graded ? (
          <View
            style={styles.gradedPanel}
          >
            <View
              style={styles.gradedHeader}
            >
              <View
                style={styles.gradedIcon}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={22}
                  color={colors.secondary}
                />
              </View>

              <View
                style={styles.gradedText}
              >
                <Text
                  style={styles.gradedTitle}
                >
                  Grading completed
                </Text>

                <Text
                  style={
                    styles.gradedSubtitle
                  }
                >
                  Final grade:{" "}
                  {submission.grade}/
                  {task?.gradeOutOf}
                </Text>

                {submission.gradedBy?.name ? (
                  <Text
                    style={
                      styles.gradedByText
                    }
                  >
                    Graded by{" "}
                    {
                      submission.gradedBy
                        .name
                    }
                  </Text>
                ) : null}
              </View>
            </View>

            {submission.comments ? (
              <View
                style={styles.feedbackBox}
              >
                <Text
                  style={
                    styles.feedbackLabel
                  }
                >
                  Student feedback
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

            {renderCorrectedFiles(
              submission,
            )}
          </View>
        ) : null}

        {canGrade
          ? renderGradeForm(submission)
          : null}

        {canDelegate ? (
          <>
            <View
              style={styles.dividerRow}
            >
              <View style={styles.divider} />

              <Text
                style={styles.dividerText}
              >
                OR
              </Text>

              <View style={styles.divider} />
            </View>

            <Button
              title="Delegate to assistant"
              variant="outline"
              onPress={() =>
                openSingleDelegateModal(
                  submission,
                )
              }
            />
          </>
        ) : null}

        {delegated && !graded ? (
          <View
            style={styles.delegationPanel}
          >
            <Ionicons
              name="person-outline"
              size={21}
              color={colors.warning}
            />

            <View
              style={styles.delegationText}
            >
              <Text
                style={
                  styles.delegationTitle
                }
              >
                {delegatedToCurrentUser
                  ? "Assigned to you"
                  : "Waiting for delegated grading"}
              </Text>

              <Text
                style={
                  styles.delegationSubtitle
                }
              >
                Assigned to{" "}
                {submission.delegation
                  ?.assistant?.name ||
                  "an assistant"}.
              </Text>

              {isAdminLevel ? (
                <View
                  style={
                    styles.delegationActions
                  }
                >
                  <Button
                    title="Reassign"
                    variant="outline"
                    onPress={() =>
                      openReassignModal(
                        submission,
                      )
                    }
                  />

                  <Button
                    title={
                      removingDelegationId ===
                      submission.delegation?.id
                        ? "Removing..."
                        : "Remove"
                    }
                    variant="outline"
                    loading={
                      removingDelegationId ===
                      submission.delegation?.id
                    }
                    disabled={Boolean(
                      removingDelegationId,
                    )}
                    onPress={() =>
                      removeDelegation(
                        submission,
                      )
                    }
                  />

                  <Button
                    title="History"
                    variant="outline"
                    onPress={() =>
                      openDelegationHistory(
                        submission,
                      )
                    }
                  />
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {isAdminLevel && graded ? (
          <View
            style={
              styles.historyActionRow
            }
          >
            <Button
              title="View delegation history"
              variant="outline"
              onPress={() =>
                openDelegationHistory(
                  submission,
                )
              }
            />
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

        <Text
          style={styles.loadingText}
        >
          Loading task details...
        </Text>
      </Screen>
    );
  }

  if (!task) {
    return (
      <Screen>
        <Card
          style={styles.notFoundCard}
        >
          <View
            style={styles.notFoundIcon}
          >
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color={colors.danger}
            />
          </View>

          <Text
            style={styles.notFoundTitle}
          >
            Task unavailable
          </Text>

          <Text
            style={styles.notFoundText}
          >
            {error ||
              "The task could not be loaded."}
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

          <Text
            style={styles.backButtonText}
          >
            Back to tasks
          </Text>
        </Pressable>

        {error ? (
          <MessageBanner
            type="error"
            message={error}
            onDismiss={() =>
              setError("")
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
            style={[
              styles.heroContent,

              isSmallScreen &&
                styles.heroContentSmall,
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
                {task.description ||
                  "No additional instructions were provided."}
              </Text>

              <View
                style={styles.heroBadges}
              >
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

              <View
                style={
                  styles.taskGroupsSection
                }
              >
                <Text
                  style={
                    styles.taskGroupsLabel
                  }
                >
                  Assigned groups
                </Text>

                <View
                  style={
                    styles.taskGroupsList
                  }
                >
                  {taskGroups.map(
                    (group) => (
                      <View
                        key={group.id}
                        style={
                          styles.taskGroupBadge
                        }
                      >
                        <Ionicons
                          name="people-outline"
                          size={13}
                          color={colors.primary}
                        />

                        <Text
                          style={
                            styles.taskGroupBadgeText
                          }
                        >
                          {group.name}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </View>
            </View>

            {task.taskFileUrl ? (
              <Button
                title="Open task file"
                variant="outline"
                onPress={() =>
                  openExternalFile(
                    task.taskFileUrl,
                    "task-file",
                  )
                }
              />
            ) : null}
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <SummaryCard
            icon="documents-outline"
            value={summary.total}
            label="Submissions"
          />

          <SummaryCard
            icon="checkmark-done-outline"
            value={summary.graded}
            label="Graded"
          />

          <SummaryCard
            icon="person-outline"
            value={summary.delegated}
            label="Delegated"
            tone="warning"
          />

          <SummaryCard
            icon="time-outline"
            value={summary.pending}
            label="Awaiting action"
            tone="danger"
          />

          <SummaryCard
            icon="alert-circle-outline"
            value={summary.lateModified}
            label="Modified late"
            tone="warning"
          />
        </View>

        <View
          style={[
            styles.contentLayout,

            isDesktop &&
              styles.contentLayoutDesktop,
          ]}
        >
          <View style={styles.mainColumn}>
            <View
              style={styles.sectionHeader}
            >
              <View>
                <Text
                  style={styles.sectionTitle}
                >
                  {isRegularAssistant
                    ? "My delegated submissions"
                    : "Student submissions"}
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Review files, provide
                  feedback, return corrections,
                  and save grades.
                </Text>
              </View>

              <Text
                style={styles.sectionCount}
              >
                {submissions.length}{" "}
                {submissions.length === 1
                  ? "submission"
                  : "submissions"}
              </Text>
            </View>

            {isAdminLevel &&
            selectableSubmissions.length ? (
              <View
                style={styles.bulkToolbar}
              >
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked:
                      allSelectableSelected,
                  }}
                  onPress={toggleSelectAll}
                  style={
                    styles.selectionControl
                  }
                >
                  <View
                    style={[
                      styles.checkbox,

                      allSelectableSelected &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {allSelectableSelected ? (
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color={colors.white}
                      />
                    ) : null}
                  </View>

                  <Text
                    style={
                      styles.selectionLabel
                    }
                  >
                    {allSelectableSelected
                      ? "Clear selection"
                      : "Select all undelegated"}
                  </Text>
                </Pressable>

                <View
                  style={
                    styles.bulkToolbarActions
                  }
                >
                  <Text
                    style={
                      styles.selectedCount
                    }
                  >
                    {
                      selectedBulkSubmissions.length
                    }{" "}
                    selected
                  </Text>

                  <Button
                    title="Bulk delegate"
                    variant="secondary"
                    disabled={
                      !selectedBulkSubmissions.length
                    }
                    onPress={
                      openBulkDelegateModal
                    }
                  />
                </View>
              </View>
            ) : null}

            {!submissions.length ? (
              <Card style={styles.emptyCard}>
                <View
                  style={styles.emptyIcon}
                >
                  <Ionicons
                    name="document-outline"
                    size={35}
                    color={colors.primary}
                  />
                </View>

                <Text
                  style={styles.emptyTitle}
                >
                  {isRegularAssistant
                    ? "No delegated submissions"
                    : "No submissions yet"}
                </Text>

                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  {isRegularAssistant
                    ? "Delegated papers will appear here."
                    : "Student work will appear here after submission."}
                </Text>
              </Card>
            ) : (
              <View
                style={styles.submissionList}
              >
                {submissions.map(
                  renderSubmissionCard,
                )}
              </View>
            )}
          </View>

          <View
            style={[
              styles.sideColumn,

              isDesktop &&
                styles.sideColumnDesktop,
            ]}
          >
            <Card
              style={styles.progressCard}
            >
              <View
                style={styles.sideCardIcon}
              >
                <Ionicons
                  name="analytics-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text
                style={styles.sideCardTitle}
              >
                Grading progress
              </Text>

              <Text
                style={styles.progressValue}
              >
                {progressPercentage}%
              </Text>

              <View
                style={styles.progressTrack}
              >
                <View
                  style={[
                    styles.progressFill,

                    {
                      width:
                        `${progressPercentage}%`,
                    },
                  ]}
                />
              </View>

              <Text
                style={styles.progressText}
              >
                {summary.graded} of{" "}
                {summary.total} graded
              </Text>
            </Card>

            <Card style={styles.infoCard}>
              <View
                style={styles.sideCardIcon}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text
                style={styles.sideCardTitle}
              >
                Grading workflow
              </Text>

              <Text
                style={styles.infoText}
              >
                Grade submissions directly,
                delegate individual papers, or
                select several papers for bulk
                delegation.
              </Text>
            </Card>
          </View>
        </View>
      </View>

      <Modal
        visible={delegateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={
          closeDelegateModal
        }
      >
        <View
          style={styles.modalBackdrop}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={
              closeDelegateModal
            }
          />

          <View style={styles.modalCard}>
            <View
              style={styles.modalHeader}
            >
              <View
                style={styles.modalIcon}
              >
                <Ionicons
                  name="person-add-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View
                style={
                  styles.modalHeadingCopy
                }
              >
                <Text
                  style={styles.modalTitle}
                >
                  {delegationMode === "bulk"
                    ? "Bulk delegate submissions"
                    : delegationMode ===
                        "reassign"
                      ? "Reassign submission"
                      : "Delegate submission"}
                </Text>

                <Text
                  style={styles.mutedText}
                >
                  {delegationMode === "bulk"
                    ? `Choose an assistant for ${selectedBulkSubmissions.length} selected submissions.`
                    : delegationMode ===
                        "reassign"
                      ? `Choose a new assistant for ${selectedSubmission?.student?.name || "this submission"}.`
                      : `Choose an assistant to grade ${selectedSubmission?.student?.name || "this submission"}.`}
                </Text>
              </View>

              <Pressable
                onPress={
                  closeDelegateModal
                }
                disabled={Boolean(
                  delegatingSubmissionId,
                )}
                style={styles.modalClose}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={
                    colors.textPrimary
                  }
                />
              </Pressable>
            </View>

            {delegateError ? (
              <MessageBanner
                type="error"
                message={delegateError}
                onDismiss={() =>
                  setDelegateError("")
                }
              />
            ) : null}

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textMuted}
              />

              <TextInput
                value={assistantSearch}
                onChangeText={
                  setAssistantSearch
                }
                placeholder="Search assistants"
                placeholderTextColor={
                  colors.textMuted
                }
                style={styles.searchInput}
              />
            </View>

            <View
              style={styles.reasonField}
            >
              <Text
                style={styles.formLabel}
              >
                Reason or note
              </Text>

              <TextInput
                value={delegationReason}
                onChangeText={
                  setDelegationReason
                }
                placeholder={
                  delegationMode ===
                  "reassign"
                    ? "Why is this submission being reassigned?"
                    : "Optional delegation note"
                }
                placeholderTextColor={
                  colors.textMuted
                }
                multiline
                textAlignVertical="top"
                style={styles.reasonInput}
              />
            </View>

            <ScrollView
              style={styles.assistantList}
              contentContainerStyle={
                styles.assistantListContent
              }
              nestedScrollEnabled
            >
              {!filteredAssistants.length ? (
                <View
                  style={styles.modalState}
                >
                  <Ionicons
                    name="people-outline"
                    size={38}
                    color={colors.primary}
                  />

                  <Text
                    style={
                      styles.modalEmptyTitle
                    }
                  >
                    No eligible assistants
                  </Text>
                </View>
              ) : (
                filteredAssistants.map(
                  (assistant) => {
                    const groups =
                      getAssistantGroupNames(
                        assistant.id,
                      );

                    const selected =
                      String(
                        selectedAssistantId,
                      ) ===
                      String(assistant.id);

                    return (
                      <View
                        key={assistant.id}
                        style={
                          styles.assistantRow
                        }
                      >
                        <View
                          style={
                            styles.assistantAvatar
                          }
                        >
                          <Text
                            style={
                              styles.assistantAvatarText
                            }
                          >
                            {getInitial(
                              assistant.name,
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.assistantInfo
                          }
                        >
                          <Text
                            numberOfLines={1}
                            style={
                              styles.assistantName
                            }
                          >
                            {assistant.name}
                          </Text>

                          <Text
                            style={
                              styles.assistantRole
                            }
                          >
                            {assistant.isHeadAssistant
                              ? "Head Assistant"
                              : "Assistant"}
                          </Text>

                          <Text
                            numberOfLines={2}
                            style={
                              styles.assistantGroups
                            }
                          >
                            {groups.join(", ") ||
                              "Assigned group"}
                          </Text>
                        </View>

                        <Pressable
                          accessibilityRole="radio"
                          accessibilityState={{
                            selected,
                          }}
                          disabled={Boolean(
                            delegatingSubmissionId,
                          )}
                          onPress={() =>
                            setSelectedAssistantId(
                              assistant.id,
                            )
                          }
                          style={[
                            styles.assistantSelectButton,

                            selected &&
                              styles.assistantSelectButtonActive,
                          ]}
                        >
                          <Ionicons
                            name={
                              selected
                                ? "checkmark-circle"
                                : "ellipse-outline"
                            }
                            size={20}
                            color={
                              selected
                                ? colors.white
                                : colors.primary
                            }
                          />

                          <Text
                            style={[
                              styles.assistantSelectText,

                              selected &&
                                styles.assistantSelectTextActive,
                            ]}
                          >
                            {selected
                              ? "Selected"
                              : "Select"}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  },
                )
              )}
            </ScrollView>

            <View
              style={styles.modalActions}
            >
              <Button
                title="Cancel"
                variant="outline"
                disabled={Boolean(
                  delegatingSubmissionId,
                )}
                onPress={
                  closeDelegateModal
                }
              />

              <Button
                title={
                  delegatingSubmissionId
                    ? "Saving..."
                    : delegationMode ===
                        "bulk"
                      ? "Delegate selected"
                      : delegationMode ===
                          "reassign"
                        ? "Confirm reassignment"
                        : "Confirm delegation"
                }
                variant="secondary"
                loading={Boolean(
                  delegatingSubmissionId,
                )}
                disabled={
                  Boolean(
                    delegatingSubmissionId,
                  ) ||
                  !selectedAssistantId
                }
                onPress={
                  submitDelegation
                }
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={historyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={
          closeHistoryModal
        }
      >
        <View
          style={styles.modalBackdrop}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={
              closeHistoryModal
            }
          />

          <View
            style={
              styles.historyModalCard
            }
          >
            <View
              style={styles.modalHeader}
            >
              <View
                style={styles.modalIcon}
              >
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View
                style={
                  styles.modalHeadingCopy
                }
              >
                <Text
                  style={styles.modalTitle}
                >
                  Delegation history
                </Text>

                <Text
                  style={styles.mutedText}
                >
                  {historySubmission
                    ?.student?.name ||
                    "Student submission"}
                </Text>
              </View>

              <Pressable
                onPress={
                  closeHistoryModal
                }
                style={styles.modalClose}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={
                    colors.textPrimary
                  }
                />
              </Pressable>
            </View>

            {loadingHistory ? (
              <View
                style={
                  styles.historyLoading
                }
              >
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                />

                <Text
                  style={styles.mutedText}
                >
                  Loading delegation history...
                </Text>
              </View>
            ) : historyError ? (
              <MessageBanner
                type="error"
                message={historyError}
                onDismiss={() =>
                  setHistoryError("")
                }
              />
            ) : !delegationHistory.length ? (
              <View
                style={styles.modalState}
              >
                <Ionicons
                  name="time-outline"
                  size={38}
                  color={colors.textMuted}
                />

                <Text
                  style={
                    styles.modalEmptyTitle
                  }
                >
                  No delegation history
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.historyList}
                contentContainerStyle={
                  styles.historyListContent
                }
              >
                {delegationHistory.map(
                  (entry, index) => (
                    <View
                      key={entry.id}
                      style={
                        styles.historyItem
                      }
                    >
                      <View
                        style={
                          styles.historyRail
                        }
                      >
                        <View
                          style={
                            styles.historyDot
                          }
                        />

                        {index <
                        delegationHistory.length -
                          1 ? (
                          <View
                            style={
                              styles.historyLine
                            }
                          />
                        ) : null}
                      </View>

                      <View
                        style={
                          styles.historyContent
                        }
                      >
                        <Text
                          style={
                            styles.historyAction
                          }
                        >
                          {formatDelegationAction(
                            entry,
                          )}
                        </Text>

                        <Text
                          style={
                            styles.historyMeta
                          }
                        >
                          By{" "}
                          {entry.changedBy
                            ?.name ||
                            "Unknown user"}{" "}
                          ·{" "}
                          {formatDate(
                            entry.createdAt,
                          )}
                        </Text>

                        {entry.reason ? (
                          <Text
                            style={
                              styles.historyReason
                            }
                          >
                            {entry.reason}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ),
                )}
              </ScrollView>
            )}

            <View
              style={styles.modalActions}
            >
              <Button
                title="Close"
                variant="outline"
                onPress={
                  closeHistoryModal
                }
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  tone = "default",
}) {
  const color =
    tone === "danger"
      ? colors.danger
      : tone === "warning"
        ? colors.warning
        : colors.primary;

  return (
    <Card style={styles.statCard}>
      <View
        style={[
          styles.statIcon,

          {
            backgroundColor:
              `${color}15`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={color}
        />
      </View>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </Card>
  );
}

function MessageBanner({
  type,
  message,
  onDismiss,
}) {
  const isError =
    type === "error";

  const color = isError
    ? colors.danger
    : colors.secondary;

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.alert,

        isError
          ? styles.errorAlert
          : styles.successAlert,
      ]}
    >
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
          styles.alertText,

          {
            color: isError
              ? colors.danger
              : colors.textPrimary,
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