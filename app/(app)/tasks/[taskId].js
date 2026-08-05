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
  const [loading, setLoading] = useState(true);

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
    selectedSubmission,
    setSelectedSubmission,
  ] = useState(null);

  const [
    delegateModalVisible,
    setDelegateModalVisible,
  ] = useState(false);

  const [
    delegatingSubmissionId,
    setDelegatingSubmissionId,
  ] = useState(null);

  const [
    assistantSearch,
    setAssistantSearch,
  ] = useState("");

  const [
    delegateError,
    setDelegateError,
  ] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

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
        } else if (
          submission.delegation
        ) {
          result.delegated += 1;
        } else {
          result.pending += 1;
        }

        if (
          submission
            .lastModifiedAfterDeadline ||
          submission
            .wasModifiedAfterDeadline
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

  const progressPercentage =
    useMemo(() => {
      if (!summary.total) {
        return 0;
      }

      return Math.round(
        (summary.graded /
          summary.total) *
          100,
      );
    }, [summary]);

  const loadTask = useCallback(
    async ({
      silent = false,
    } = {}) => {
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

  function getGradeForm(
    submissionId,
  ) {
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
        ...getGradeForm(
          submissionId,
        ),
        ...changes,
      },
    }));
  }

  function clearGradeForm(
    submissionId,
  ) {
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

      const existingCount =
        currentForm.correctedFiles
          .length;

      if (
        existingCount +
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
            ...currentForm
              .correctedFiles,

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

  function validateGrade(
    submissionId,
  ) {
    const form =
      getGradeForm(submissionId);

    const grade = Number(
      form.grade,
    );

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
      validateGrade(
        submission.id,
      );

    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setGradingSubmissionId(
      submission.id,
    );

    try {
      const formData =
        new FormData();

      formData.append(
        "grade",
        String(validation.grade),
      );

      formData.append(
        "comments",
        validation.form.comments ||
          "",
      );

      for (const asset of validation
        .form.correctedFiles) {
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

      clearGradeForm(
        submission.id,
      );

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
      setGradingSubmissionId(
        null,
      );
    }
  }

  function openDelegateModal(
    submission,
  ) {
    clearMessages();
    setDelegateError("");
    setSelectedSubmission(
      submission,
    );
    setAssistantSearch("");
    setDelegateModalVisible(
      true,
    );
  }

  function closeDelegateModal() {
    if (delegatingSubmissionId) {
      return;
    }

    setDelegateModalVisible(
      false,
    );
    setSelectedSubmission(
      null,
    );
    setAssistantSearch("");
    setDelegateError("");
  }

  async function delegate(
    assistantId,
  ) {
    if (!selectedSubmission) {
      return;
    }

    setDelegateError("");

    setDelegatingSubmissionId(
      selectedSubmission.id,
    );

    try {
      await api.post(
        "/delegations",
        {
          submissionId:
            selectedSubmission.id,

          assistantId,
        },
      );

      setSuccess(
        "Submission delegated successfully.",
      );

      closeDelegateModal();

      await loadTask({
        silent: true,
      });
    } catch (requestError) {
      setDelegateError(
        getErrorMessage(
          requestError,
          "Couldn't delegate the submission.",
        ),
      );
    } finally {
      setDelegatingSubmissionId(
        null,
      );
    }
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

    if (files.length) {
      return (
        <View
          style={
            styles.filesSection
          }
        >
          <View
            style={
              styles.filesSectionHeader
            }
          >
            <Text
              style={
                styles.filesSectionTitle
              }
            >
              Student files
            </Text>

            <Text
              style={
                styles.filesCount
              }
            >
              {files.length}{" "}
              {files.length === 1
                ? "file"
                : "files"}
            </Text>
          </View>

          {files.map(
            (file, index) => {
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
                  style={({
                    pressed,
                  }) => [
                    styles.fileRow,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <View
                    style={
                      styles.fileOrder
                    }
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
                    style={
                      styles.fileDetails
                    }
                  >
                    <Text
                      numberOfLines={1}
                      style={
                        styles.fileName
                      }
                    >
                      {file.originalName ||
                        `Submission file ${
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

                      {file.uploadedAfterDeadline
                        ? " · Uploaded after deadline"
                        : ""}
                    </Text>
                  </View>

                  {openingFileKey ===
                  key ? (
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
              );
            },
          )}
        </View>
      );
    }

    if (submission.fileUrl) {
      const key =
        `legacy-${submission.id}`;

      return (
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            openExternalFile(
              submission.fileUrl,
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
    }

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
          style={
            styles.filesSectionHeader
          }
        >
          <Text
            style={
              styles.filesSectionTitle
            }
          >
            Returned corrected files
          </Text>

          <Text
            style={styles.filesCount}
          >
            {files.length}
          </Text>
        </View>

        {files.map(
          (file, index) => {
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
                style={({
                  pressed,
                }) => [
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
                    color={
                      colors.secondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.fileDetails
                  }
                >
                  <Text
                    numberOfLines={1}
                    style={
                      styles.fileName
                    }
                  >
                    {file.originalName ||
                      `Corrected file ${
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

                {openingFileKey ===
                key ? (
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
            );
          },
        )}
      </View>
    );
  }

  function renderGradeForm(
    submission,
  ) {
    const form =
      getGradeForm(
        submission.id,
      );

    const isGrading =
      gradingSubmissionId ===
      submission.id;

    return (
      <View
        style={styles.gradingPanel}
      >
        <View
          style={
            styles.gradingHeading
          }
        >
          <Text
            style={
              styles.gradingTitle
            }
          >
            Grade submission
          </Text>

          <Text
            style={
              styles.gradingSubtitle
            }
          >
            Enter the final grade, add
            feedback, and optionally return
            corrected files to the student.
          </Text>
        </View>

        <View
          style={
            styles.formField
          }
        >
          <Text
            style={
              styles.formLabel
            }
          >
            Grade
          </Text>

          <View
            style={
              styles.gradeInputWrapper
            }
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
              keyboardType="decimal-pad"
              placeholderTextColor={
                colors.textMuted
              }
              style={
                styles.gradeInput
              }
            />

            <View
              style={
                styles.gradeSuffix
              }
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

        <View
          style={
            styles.formField
          }
        >
          <Text
            style={
              styles.formLabel
            }
          >
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
            style={
              styles.commentsInput
            }
          />
        </View>

        <View
          style={
            styles.formField
          }
        >
          <View
            style={
              styles.correctedPickerHeader
            }
          >
            <View>
              <Text
                style={
                  styles.formLabel
                }
              >
                Corrected files
              </Text>

              <Text
                style={
                  styles.formHelper
                }
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

          {form.correctedFiles
            .length ? (
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
                        color={
                          colors.primary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.fileDetails
                      }
                    >
                      <Text
                        numberOfLines={1}
                        style={
                          styles.fileName
                        }
                      >
                        {file.name ||
                          `Corrected file ${
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

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remove selected corrected file"
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
                        color={
                          colors.danger
                        }
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
                color={
                  colors.textMuted
                }
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
            gradeSubmission(
              submission,
            )
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
      String(
        delegatedAssistantId,
      ) === String(user?.id);

    const canGrade =
      !graded &&
      (isAdminLevel ||
        delegatedToCurrentUser);

    const canDelegate =
      !graded &&
      isAdminLevel &&
      !delegated;

    return (
      <Card
        key={submission.id}
        style={
          styles.submissionCard
        }
      >
        <View
          style={[
            styles.submissionHeader,

            isSmallScreen &&
              styles.submissionHeaderSmall,
          ]}
        >
          <View
            style={
              styles.studentIdentity
            }
          >
            <View
              style={
                styles.studentAvatar
              }
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
              style={
                styles.studentInfo
              }
            >
              <Text
                numberOfLines={1}
                style={
                  styles.studentName
                }
              >
                {submission.student
                  ?.name ||
                  "Unknown student"}
              </Text>

              <Text
                style={
                  styles.studentMeta
                }
              >
                Last updated{" "}
                {formatDate(
                  submission.submittedAt ||
                    submission
                      .lastModifiedAt ||
                    submission
                      .createdAt,
                ) ||
                  "date unavailable"}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.statusBadges
            }
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

            {submission
              .lastModifiedAfterDeadline ||
            submission
              .wasModifiedAfterDeadline ? (
              <Badge
                label="Modified late"
                tone="danger"
              />
            ) : null}
          </View>
        </View>

        {(submission
          .lastModifiedAfterDeadline ||
          submission
            .wasModifiedAfterDeadline) ? (
          <View
            style={
              styles.lateWarning
            }
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
                homework deadline.
              </Text>
            </View>
          </View>
        ) : null}

        {renderStudentFiles(
          submission,
        )}

        {graded ? (
          <View
            style={
              styles.gradedPanel
            }
          >
            <View
              style={
                styles.gradedHeader
              }
            >
              <View
                style={
                  styles.gradedIcon
                }
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={22}
                  color={
                    colors.secondary
                  }
                />
              </View>

              <View
                style={
                  styles.gradedText
                }
              >
                <Text
                  style={
                    styles.gradedTitle
                  }
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

                {submission
                  .gradedBy?.name ? (
                  <Text
                    style={
                      styles.gradedByText
                    }
                  >
                    Graded by{" "}
                    {
                      submission
                        .gradedBy.name
                    }
                  </Text>
                ) : null}
              </View>
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
          ? renderGradeForm(
              submission,
            )
          : null}

        {canDelegate ? (
          <>
            <View
              style={
                styles.dividerRow
              }
            >
              <View
                style={
                  styles.divider
                }
              />

              <Text
                style={
                  styles.dividerText
                }
              >
                OR
              </Text>

              <View
                style={
                  styles.divider
                }
              />
            </View>

            <Button
              title="Delegate to assistant"
              variant="outline"
              onPress={() =>
                openDelegateModal(
                  submission,
                )
              }
            />
          </>
        ) : null}

        {delegated &&
        !graded &&
        !delegatedToCurrentUser ? (
          <View
            style={
              styles.delegationPanel
            }
          >
            <Ionicons
              name="person-outline"
              size={21}
              color={colors.warning}
            />

            <View
              style={
                styles.delegationText
              }
            >
              <Text
                style={
                  styles.delegationTitle
                }
              >
                Waiting for delegated grading
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
        style={
          styles.fullPageLoading
        }
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
            style={
              styles.notFoundIcon
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color={colors.danger}
            />
          </View>

          <Text
            style={
              styles.notFoundTitle
            }
          >
            Task unavailable
          </Text>

          <Text
            style={
              styles.notFoundText
            }
          >
            {error ||
              "The task could not be loaded."}
          </Text>

          <Button
            title="Go back"
            variant="outline"
            onPress={() =>
              router.back()
            }
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <Pressable
          onPress={() =>
            router.back()
          }
          style={({ pressed }) => [
            styles.backButton,

            pressed &&
              styles.pressed,
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

        <Card
          style={styles.heroCard}
        >
          <View
            style={[
              styles.heroContent,

              isSmallScreen &&
                styles.heroContentSmall,
            ]}
          >
            <View
              style={styles.heroIcon}
            >
              <Ionicons
                name="clipboard-outline"
                size={29}
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
                style={
                  styles.pageTitle
                }
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
                style={
                  styles.heroBadges
                }
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
                          color={
                            colors.primary
                          }
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

        <View
          style={styles.statsGrid}
        >
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
            value={
              summary.lateModified
            }
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
          <View
            style={styles.mainColumn}
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
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
                style={
                  styles.sectionCount
                }
              >
                {submissions.length}{" "}
                {submissions.length === 1
                  ? "submission"
                  : "submissions"}
              </Text>
            </View>

            {!submissions.length ? (
              <Card
                style={styles.emptyCard}
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <Ionicons
                    name="document-outline"
                    size={35}
                    color={
                      colors.primary
                    }
                  />
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
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
                style={
                  styles.submissionList
                }
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
              style={
                styles.progressCard
              }
            >
              <View
                style={
                  styles.sideCardIcon
                }
              >
                <Ionicons
                  name="analytics-outline"
                  size={22}
                  color={
                    colors.primary
                  }
                />
              </View>

              <Text
                style={
                  styles.sideCardTitle
                }
              >
                Grading progress
              </Text>

              <Text
                style={
                  styles.progressValue
                }
              >
                {progressPercentage}%
              </Text>

              <View
                style={
                  styles.progressTrack
                }
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
                style={
                  styles.progressText
                }
              >
                {summary.graded} of{" "}
                {summary.total} graded
              </Text>
            </Card>

            <Card
              style={styles.infoCard}
            >
              <View
                style={
                  styles.sideCardIcon
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={
                    colors.primary
                  }
                />
              </View>

              <Text
                style={
                  styles.sideCardTitle
                }
              >
                Grading workflow
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                Enter a grade, write feedback,
                and optionally upload corrected
                PDFs, images, or documents.
              </Text>
            </Card>
          </View>
        </View>
      </View>

      <Modal
        visible={
          delegateModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          closeDelegateModal
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={
              closeDelegateModal
            }
          />

          <View
            style={styles.modalCard}
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalIcon
                }
              >
                <Ionicons
                  name="person-add-outline"
                  size={24}
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.modalHeadingCopy
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Delegate submission
                </Text>

                <Text
                  style={
                    styles.mutedText
                  }
                >
                  Choose an assistant to grade{" "}
                  {selectedSubmission
                    ?.student?.name ||
                    "this submission"}.
                </Text>
              </View>

              <Pressable
                onPress={
                  closeDelegateModal
                }
                disabled={Boolean(
                  delegatingSubmissionId,
                )}
                style={
                  styles.modalClose
                }
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
                message={
                  delegateError
                }
                onDismiss={() =>
                  setDelegateError("")
                }
              />
            ) : null}

            <View
              style={styles.searchBox}
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={
                  colors.textMuted
                }
              />

              <TextInput
                value={
                  assistantSearch
                }
                onChangeText={
                  setAssistantSearch
                }
                placeholder="Search assistants"
                placeholderTextColor={
                  colors.textMuted
                }
                style={
                  styles.searchInput
                }
              />
            </View>

            <ScrollView
              style={
                styles.assistantList
              }
              contentContainerStyle={
                styles.assistantListContent
              }
              nestedScrollEnabled
            >
              {!filteredAssistants
                .length ? (
                <View
                  style={
                    styles.modalState
                  }
                >
                  <Ionicons
                    name="people-outline"
                    size={38}
                    color={
                      colors.primary
                    }
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
                            {groups.join(
                              ", ",
                            ) ||
                              "Assigned group"}
                          </Text>
                        </View>

                        <Button
                          title="Delegate"
                          variant="secondary"
                          loading={Boolean(
                            delegatingSubmissionId,
                          )}
                          disabled={Boolean(
                            delegatingSubmissionId,
                          )}
                          onPress={() =>
                            delegate(
                              assistant.id,
                            )
                          }
                        />
                      </View>
                    );
                  },
                )
              )}
            </ScrollView>

            <View
              style={
                styles.modalActions
              }
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

      <Text
        style={styles.statValue}
      >
        {value}
      </Text>

      <Text
        style={styles.statLabel}
      >
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