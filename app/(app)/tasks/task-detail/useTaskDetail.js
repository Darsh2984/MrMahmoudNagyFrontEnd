import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Linking,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";

import api from "../../../../src/lib/api";

import {
  ACCEPTED_CORRECTED_FILE_TYPES,
  appendSelectedFiles,
  buildGradeFormData,
  createEmptyGradeForm,
  createGradeFormFromSubmission,
  filterAssistants,
  filterVisibleSubmissions,
  getAssistantGroupNames,
  getEligibleAssistants,
  getErrorMessage,
  getProgressPercentage,
  getSubmissionFlagStatus,
  getSubmissionSummary,
  normalizeTaskGroups,
  removeLocalFile,
  validateGrade,
} from "./taskDetail.helpers";

export function useTaskDetail({
  taskId,
  user,
  currentGroupId,
}) {
  const delegationGroupId =
    currentGroupId && String(currentGroupId) !== "ALL"
      ? String(currentGroupId)
      : null;
  const isAdminLevel =
    user?.role === "TEACHER" ||
    Boolean(
      user?.isHeadAssistant,
    );

  const isRegularAssistant =
    user?.role === "ASSISTANT" &&
    !user?.isHeadAssistant;

  const [task, setTask] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    openingFileKey,
    setOpeningFileKey,
  ] = useState(null);

  const [
    gradeForms,
    setGradeForms,
  ] = useState({});

  const [
    gradingSubmissionId,
    setGradingSubmissionId,
  ] = useState(null);

  const [
    editingSubmissionId,
    setEditingSubmissionId,
  ] = useState(null);

  const [
    selectedSubmissionIds,
    setSelectedSubmissionIds,
  ] = useState([]);

  const [
    delegateModalMode,
    setDelegateModalMode,
  ] = useState(null);

  const [
    selectedSubmission,
    setSelectedSubmission,
  ] = useState(null);

  const [
    selectedDelegation,
    setSelectedDelegation,
  ] = useState(null);

  const [
    assistantSearch,
    setAssistantSearch,
  ] = useState("");

  const [
    delegationReason,
    setDelegationReason,
  ] = useState("");

  const [
    delegateError,
    setDelegateError,
  ] = useState("");

  const [
    delegationBusyId,
    setDelegationBusyId,
  ] = useState(null);

  const [
    delegationHistorySubmission,
    setDelegationHistorySubmission,
  ] = useState(null);

  const [
    delegationHistory,
    setDelegationHistory,
  ] = useState([]);

  const [
    delegationHistoryLoading,
    setDelegationHistoryLoading,
  ] = useState(false);

  const [
    delegationHistoryError,
    setDelegationHistoryError,
  ] = useState("");

  const [
    gradingHistorySubmission,
    setGradingHistorySubmission,
  ] = useState(null);

  const [
    gradingHistory,
    setGradingHistory,
  ] = useState([]);

  const [
    gradingHistoryLoading,
    setGradingHistoryLoading,
  ] = useState(false);

  const [
    gradingHistoryError,
    setGradingHistoryError,
  ] = useState("");

  const [
    reopeningSubmission,
    setReopeningSubmission,
  ] = useState(null);

  const [
    reopenReason,
    setReopenReason,
  ] = useState("");

  const [
    reopeningSubmissionId,
    setReopeningSubmissionId,
  ] = useState(null);

  const submissions =
    useMemo(() => {
      return filterVisibleSubmissions({
        submissions:
          task?.submissions,
        user,
      });
    }, [
      task?.submissions,
      user,
    ]);

  const taskGroups =
    useMemo(
      () =>
        normalizeTaskGroups(
          task,
        ),
      [task],
    );

  const eligibleAssistants =
    useMemo(
      () =>
        getEligibleAssistants(
          task,
          delegationGroupId,
        ),
      [task, delegationGroupId],
    );

  const filteredAssistants =
    useMemo(
      () =>
        filterAssistants(
          eligibleAssistants,
          assistantSearch,
        ),
      [
        assistantSearch,
        eligibleAssistants,
      ],
    );

  const summary =
    useMemo(
      () =>
        getSubmissionSummary(
          submissions,
        ),
      [submissions],
    );

  const progressPercentage =
    useMemo(
      () =>
        getProgressPercentage(
          summary,
        ),
      [summary],
    );

  const flaggedSubmissions =
    useMemo(
      () =>
        submissions.filter(
          (submission) =>
            getSubmissionFlagStatus(
              submission,
              task?.gradeOutOf,
            ).isFlagged,
        ),
      [
        submissions,
        task?.gradeOutOf,
      ],
    );

  const selectableSubmissions =
    useMemo(
      () =>
        submissions.filter(
          (submission) =>
            submission.grade ===
              null &&
            !submission.delegation,
        ),
      [submissions],
    );

  const selectedSubmissions =
    useMemo(() => {
      const selectedIds =
        new Set(
          selectedSubmissionIds.map(
            String,
          ),
        );

      return submissions.filter(
        (submission) =>
          selectedIds.has(
            String(
              submission.id,
            ),
          ),
      );
    }, [
      selectedSubmissionIds,
      submissions,
    ]);

  const clearMessages =
    useCallback(() => {
      setError("");
      setSuccess("");
    }, []);

  const loadTask =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!taskId) {
          setTask(null);
          setError(
            "Task ID is missing.",
          );
          setLoading(false);
          setRefreshing(false);
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
              `/tasks/${taskId}`,
              {
                params: delegationGroupId
                  ? { groupId: delegationGroupId }
                  : undefined,
              },
            );

          setTask(
            response.data || null,
          );
        } catch (
          requestError
        ) {
          setTask(null);

          setError(
            getErrorMessage(
              requestError,
              "Couldn't load task details.",
            ),
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [taskId, delegationGroupId],
    );

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  function getGradeForm(
    submissionId,
  ) {
    return (
      gradeForms[
        submissionId
      ] ||
      createEmptyGradeForm()
    );
  }

  function updateGradeForm(
    submissionId,
    changes,
  ) {
    setGradeForms(
      (current) => {
        const currentForm =
          current[
            submissionId
          ] ||
          createEmptyGradeForm();

        return {
          ...current,

          [submissionId]: {
            ...currentForm,
            ...changes,
          },
        };
      },
    );
  }

  function clearGradeForm(
    submissionId,
  ) {
    setGradeForms(
      (current) => {
        const updated = {
          ...current,
        };

        delete updated[
          submissionId
        ];

        return updated;
      },
    );
  }

  function startEditingGrade(
    submission,
  ) {
    clearMessages();

    setGradeForms(
      (current) => ({
        ...current,

        [submission.id]:
          createGradeFormFromSubmission(
            submission,
          ),
      }),
    );

    setEditingSubmissionId(
      submission.id,
    );
  }

  function cancelEditingGrade(
    submissionId,
  ) {
    clearGradeForm(
      submissionId,
    );

    setEditingSubmissionId(
      null,
    );
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
        await Linking.canOpenURL(
          url,
        );

      if (!supported) {
        throw new Error(
          "This file cannot be opened on this device.",
        );
      }

      await Linking.openURL(
        url,
      );
    } catch (
      requestError
    ) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't open the file.",
        ),
      );
    } finally {
      setOpeningFileKey(
        null,
      );
    }
  }

  async function selectCorrectedFiles(
    submissionId,
  ) {
    clearMessages();

    try {
      const result =
        await DocumentPicker
          .getDocumentAsync({
            type:
              ACCEPTED_CORRECTED_FILE_TYPES,

            multiple: true,

            copyToCacheDirectory:
              true,
          });

      if (
        result.canceled ||
        !result.assets?.length
      ) {
        return;
      }

      const currentForm =
        getGradeForm(
          submissionId,
        );

      const resultToApply =
        appendSelectedFiles({
          existingFiles:
            currentForm
              .correctedFiles,

          selectedAssets:
            result.assets,
        });

      if (
        !resultToApply.valid
      ) {
        setError(
          resultToApply.message,
        );

        return;
      }

      updateGradeForm(
        submissionId,
        {
          correctedFiles:
            resultToApply.files,
        },
      );
    } catch (
      pickerError
    ) {
      setError(
        getErrorMessage(
          pickerError,
          "Couldn't select corrected files.",
        ),
      );
    }
  }

  function removeSelectedCorrectedFile(
    submissionId,
    localId,
  ) {
    const currentForm =
      getGradeForm(
        submissionId,
      );

    updateGradeForm(
      submissionId,
      {
        correctedFiles:
          removeLocalFile(
            currentForm
              .correctedFiles,
            localId,
          ),
      },
    );
  }

  async function gradeSubmission(
    submission,
  ) {
    clearMessages();

    const form =
      getGradeForm(
        submission.id,
      );

    const validation =
      validateGrade({
        form,

        gradeOutOf:
          task?.gradeOutOf,
      });

    if (!validation.valid) {
      setError(
        validation.message,
      );

      return false;
    }

    setGradingSubmissionId(
      submission.id,
    );

    try {
      const formData =
        await buildGradeFormData({
          grade:
            validation.grade,

          comments:
            validation.form
              .comments,

          correctedFiles:
            validation.form
              .correctedFiles,
        });

      const wasGraded =
        submission.grade !==
          null &&
        submission.grade !==
          undefined;

      await api.patch(
        `/submissions/${submission.id}/grade`,
        formData,
      );

      clearGradeForm(
        submission.id,
      );

      setEditingSubmissionId(
        null,
      );

      setSuccess(
        wasGraded
          ? `The grade for ${
              submission.student
                ?.name ||
              "the student"
            } was updated successfully.`
          : `The submission for ${
              submission.student
                ?.name ||
              "the student"
            } was graded successfully.`,
      );

      await loadTask({
        silent: true,
      });

      return true;
    } catch (
      requestError
    ) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't save the grade.",
        ),
      );

      return false;
    } finally {
      setGradingSubmissionId(
        null,
      );
    }
  }

  async function deleteCorrectedFile({
    submission,
    correctedFileId,
  }) {
    if (
      !submission?.id ||
      !correctedFileId
    ) {
      return false;
    }

    clearMessages();

    const busyKey =
      `corrected:${correctedFileId}`;

    setOpeningFileKey(
      busyKey,
    );

    try {
      await api.delete(
        `/submissions/${submission.id}/corrected-files/${correctedFileId}`,
      );

      setSuccess(
        "Corrected file deleted.",
      );

      await loadTask({
        silent: true,
      });

      return true;
    } catch (
      requestError
    ) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't delete the corrected file.",
        ),
      );

      return false;
    } finally {
      setOpeningFileKey(
        null,
      );
    }
  }

  function toggleSubmissionSelection(
    submissionId,
  ) {
    setSelectedSubmissionIds(
      (current) => {
        const id =
          String(
            submissionId,
          );

        const exists =
          current.some(
            (currentId) =>
              String(
                currentId,
              ) === id,
          );

        if (exists) {
          return current.filter(
            (currentId) =>
              String(
                currentId,
              ) !== id,
          );
        }

        return [
          ...current,
          submissionId,
        ];
      },
    );
  }

  function selectAllSubmissions() {
    setSelectedSubmissionIds(
      selectableSubmissions.map(
        (submission) =>
          submission.id,
      ),
    );
  }

  function clearSubmissionSelection() {
    setSelectedSubmissionIds(
      [],
    );
  }

  function openDelegateModal(
    submission,
  ) {
    clearMessages();

    setDelegateError("");
    setSelectedSubmission(
      submission,
    );

    setSelectedDelegation(
      null,
    );

    setAssistantSearch("");
    setDelegationReason("");

    setDelegateModalMode(
      "ASSIGN",
    );
  }

  function openBulkDelegateModal() {
    if (
      !selectedSubmissions.length
    ) {
      setError(
        "Select at least one ungraded submission.",
      );

      return;
    }

    clearMessages();

    setDelegateError("");
    setSelectedSubmission(
      null,
    );

    setSelectedDelegation(
      null,
    );

    setAssistantSearch("");
    setDelegationReason("");

    setDelegateModalMode(
      "BULK_ASSIGN",
    );
  }

  function openReassignModal(
    submission,
  ) {
    if (
      !submission
        ?.delegation?.id
    ) {
      setError(
        "This submission does not have an active delegation.",
      );

      return;
    }

    clearMessages();

    setDelegateError("");

    setSelectedSubmission(
      submission,
    );

    setSelectedDelegation(
      submission.delegation,
    );

    setAssistantSearch("");
    setDelegationReason("");

    setDelegateModalMode(
      "REASSIGN",
    );
  }

  function closeDelegateModal() {
    if (delegationBusyId) {
      return;
    }

    setDelegateModalMode(
      null,
    );

    setSelectedSubmission(
      null,
    );

    setSelectedDelegation(
      null,
    );

    setAssistantSearch("");
    setDelegationReason("");
    setDelegateError("");
  }

  async function assignSubmission(
    assistantId,
  ) {
    if (
      !selectedSubmission?.id
    ) {
      return false;
    }

    setDelegateError("");

    setDelegationBusyId(
      selectedSubmission.id,
    );

    try {
      await api.post(
        "/delegations",
        {
          submissionId:
            selectedSubmission.id,

          assistantId,

          reason:
            delegationReason.trim() ||
            undefined,

          groupId:
            delegationGroupId || undefined,
        },
      );

      setSuccess(
        "Submission delegated successfully.",
      );

      setDelegateModalMode(
        null,
      );

      setSelectedSubmission(
        null,
      );

      setAssistantSearch("");
      setDelegationReason("");

      await loadTask({
        silent: true,
      });

      return true;
    } catch (
      requestError
    ) {
      setDelegateError(
        getErrorMessage(
          requestError,
          "Couldn't delegate the submission.",
        ),
      );

      return false;
    } finally {
      setDelegationBusyId(
        null,
      );
    }
  }

  async function bulkAssignSubmissions(
    assistantId,
  ) {
    if (
      !selectedSubmissions.length
    ) {
      setDelegateError(
        "Select at least one submission.",
      );

      return false;
    }

    setDelegateError("");
    setDelegationBusyId(
      "BULK",
    );

    try {
      const response =
        await api.post(
          "/delegations/bulk",
          {
            submissionIds:
              selectedSubmissions.map(
                (submission) =>
                  submission.id,
              ),

            assistantId,

            reason:
              delegationReason.trim() ||
              undefined,

            groupId:
              delegationGroupId || undefined,
          },
          {
            timeout: 180000,
          },
        );

      const delegated =
        Number(
          response.data
            ?.delegated || 0,
        );

      const failed =
        Number(
          response.data
            ?.failed || 0,
        );

      setSuccess(
        failed
          ? `${delegated} submissions delegated. ${failed} could not be delegated.`
          : `${delegated} submissions delegated successfully.`,
      );

      setDelegateModalMode(
        null,
      );

      setSelectedSubmissionIds(
        [],
      );

      setAssistantSearch("");
      setDelegationReason("");

      await loadTask({
        silent: true,
      });

      return true;
    } catch (
      requestError
    ) {
      setDelegateError(
        getErrorMessage(
          requestError,
          "Couldn't delegate the selected submissions.",
        ),
      );

      return false;
    } finally {
      setDelegationBusyId(
        null,
      );
    }
  }

  async function reassignSubmission(
    assistantId,
  ) {
    const delegationId =
      selectedDelegation?.id ||
      selectedSubmission
        ?.delegation?.id;

    if (!delegationId) {
      setDelegateError(
        "Delegation ID is missing.",
      );

      return false;
    }

    setDelegateError("");
    setDelegationBusyId(
      delegationId,
    );

    try {
      await api.patch(
        `/delegations/${delegationId}/reassign`,
        {
          assistantId,

          reason:
            delegationReason.trim() ||
            undefined,

          groupId:
            delegationGroupId || undefined,
        },
      );

      setSuccess(
        "Submission reassigned successfully.",
      );

      setDelegateModalMode(
        null,
      );

      setSelectedSubmission(
        null,
      );

      setSelectedDelegation(
        null,
      );

      setAssistantSearch("");
      setDelegationReason("");

      await loadTask({
        silent: true,
      });

      return true;
    } catch (
      requestError
    ) {
      setDelegateError(
        getErrorMessage(
          requestError,
          "Couldn't reassign the submission.",
        ),
      );

      return false;
    } finally {
      setDelegationBusyId(
        null,
      );
    }
  }

  async function removeDelegation(
    submission,
    reason = "",
  ) {
    const delegationId =
      submission?.delegation?.id;

    if (!delegationId) {
      setError(
        "Delegation ID is missing.",
      );

      return false;
    }

    clearMessages();

    setDelegationBusyId(
      delegationId,
    );

    try {
      await api.delete(
        `/delegations/${delegationId}`,
        {
          data: {
            reason:
              String(reason)
                .trim() ||
              undefined,
          },
        },
      );

      setSuccess(
        "Delegation removed successfully.",
      );

      await loadTask({
        silent: true,
      });

      return true;
    } catch (
      requestError
    ) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't remove the delegation.",
        ),
      );

      return false;
    } finally {
      setDelegationBusyId(
        null,
      );
    }
  }

  async function openDelegationHistory(
    submission,
  ) {
    if (!submission?.id) {
      return;
    }

    clearMessages();

    setDelegationHistorySubmission(
      submission,
    );

    setDelegationHistory(
      [],
    );

    setDelegationHistoryError(
      "",
    );

    setDelegationHistoryLoading(
      true,
    );

    try {
      const response =
        await api.get(
          `/delegations/submission/${submission.id}/history`,
        );

      setDelegationHistory(
        Array.isArray(
          response.data?.history,
        )
          ? response.data.history
          : [],
      );
    } catch (
      requestError
    ) {
      setDelegationHistoryError(
        getErrorMessage(
          requestError,
          "Couldn't load delegation history.",
        ),
      );
    } finally {
      setDelegationHistoryLoading(
        false,
      );
    }
  }

  function closeDelegationHistory() {
    if (
      delegationHistoryLoading
    ) {
      return;
    }

    setDelegationHistorySubmission(
      null,
    );

    setDelegationHistory(
      [],
    );

    setDelegationHistoryError(
      "",
    );
  }

  async function openGradingHistory(
    submission,
  ) {
    if (!submission?.id) {
      return;
    }

    clearMessages();

    setGradingHistorySubmission(
      submission,
    );

    setGradingHistory([]);
    setGradingHistoryError("");
    setGradingHistoryLoading(
      true,
    );

    try {
      const response =
        await api.get(
          `/submissions/${submission.id}/grading-history`,
        );

      setGradingHistory(
        Array.isArray(
          response.data?.history,
        )
          ? response.data.history
          : [],
      );
    } catch (
      requestError
    ) {
      setGradingHistoryError(
        getErrorMessage(
          requestError,
          "Couldn't load grading history.",
        ),
      );
    } finally {
      setGradingHistoryLoading(
        false,
      );
    }
  }

  function closeGradingHistory() {
    if (
      gradingHistoryLoading
    ) {
      return;
    }

    setGradingHistorySubmission(
      null,
    );

    setGradingHistory([]);
    setGradingHistoryError("");
  }

  function openReopenModal(
    submission,
  ) {
    clearMessages();

    setReopeningSubmission(
      submission,
    );

    setReopenReason("");
  }

  function closeReopenModal() {
    if (
      reopeningSubmissionId
    ) {
      return;
    }

    setReopeningSubmission(
      null,
    );

    setReopenReason("");
  }

  async function confirmReopenSubmission() {
    if (
      !reopeningSubmission?.id
    ) {
      return false;
    }

    const reason =
      reopenReason.trim();

    if (!reason) {
      setError(
        "Enter a reason for reopening this submission.",
      );

      return false;
    }

    clearMessages();

    const submission =
      reopeningSubmission;

    setReopeningSubmissionId(
      submission.id,
    );

    try {
      await api.patch(
        `/submissions/${submission.id}/reopen`,
        {
          reason,
        },
      );

      setSuccess(
        `The submission for ${
          submission.student
            ?.name ||
          "the student"
        } was reopened for grading.`,
      );

      setReopeningSubmissionId(
        null,
      );

      setReopeningSubmission(
        null,
      );

      setReopenReason("");

      setEditingSubmissionId(
        null,
      );

      clearGradeForm(
        submission.id,
      );

      await loadTask({
        silent: true,
      });

      return true;
    } catch (
      requestError
    ) {
      setError(
        getErrorMessage(
          requestError,
          "Couldn't reopen the submission.",
        ),
      );

      return false;
    } finally {
      setReopeningSubmissionId(
        null,
      );
    }
  }

  function assistantGroupNames(
    assistantId,
  ) {
    return getAssistantGroupNames(
      task,
      assistantId,
    );
  }

  function dismissError() {
    setError("");
  }

  function dismissSuccess() {
    setSuccess("");
  }

  return {
    task,
    submissions,
    taskGroups,

    loading,
    refreshing,
    error,
    success,

    isAdminLevel,
    isRegularAssistant,

    summary,
    progressPercentage,
    flaggedSubmissions,

    eligibleAssistants,
    filteredAssistants,

    selectableSubmissions,
    selectedSubmissionIds,
    selectedSubmissions,

    gradeForms,
    gradingSubmissionId,
    editingSubmissionId,

    openingFileKey,

    delegateModalMode,
    selectedSubmission,
    selectedDelegation,
    assistantSearch,
    delegationReason,
    delegateError,
    delegationBusyId,

    delegationHistorySubmission,
    delegationHistory,
    delegationHistoryLoading,
    delegationHistoryError,

    gradingHistorySubmission,
    gradingHistory,
    gradingHistoryLoading,
    gradingHistoryError,

    reopeningSubmission,
    reopenReason,
    reopeningSubmissionId,

    loadTask,
    clearMessages,
    dismissError,
    dismissSuccess,

    getGradeForm,
    updateGradeForm,
    clearGradeForm,
    startEditingGrade,
    cancelEditingGrade,

    openExternalFile,
    selectCorrectedFiles,
    removeSelectedCorrectedFile,
    gradeSubmission,
    deleteCorrectedFile,

    toggleSubmissionSelection,
    selectAllSubmissions,
    clearSubmissionSelection,

    openDelegateModal,
    openBulkDelegateModal,
    openReassignModal,
    closeDelegateModal,

    assignSubmission,
    bulkAssignSubmissions,
    reassignSubmission,
    removeDelegation,

    setAssistantSearch,
    setDelegationReason,

    assistantGroupNames,

    openDelegationHistory,
    closeDelegationHistory,

    openGradingHistory,
    closeGradingHistory,

    openReopenModal,
    closeReopenModal,
    setReopenReason,
    confirmReopenSubmission,
  };
}
