import { Platform } from "react-native";

export const MAX_CORRECTED_FILES = 20;

export const ACCEPTED_CORRECTED_FILE_TYPES = [
  "application/pdf",
  "image/*",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "text/plain",
];

export function getErrorMessage(
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

export function formatFileSize(bytes) {
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

  if (size < 1024 * 1024 * 1024) {
    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    size /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}

export function getInitial(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "?";
  }

  return text.charAt(0).toUpperCase();
}

export function getInitials(value) {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

export function normalizeTaskGroups(task) {
  const possibleGroups = [
    task?.groups,
    task?.taskGroups,
    task?.assignedGroups,
    task?.groupAssignments,
  ];

  for (const collection of possibleGroups) {
    if (!Array.isArray(collection)) {
      continue;
    }

    const groups = collection
      .map((item) => {
        if (item?.group) {
          return item.group;
        }

        return item;
      })
      .filter((group) => group?.id);

    if (groups.length) {
      return groups;
    }
  }

  if (task?.group?.id) {
    return [task.group];
  }

  return [];
}

function normalizeAssistantAssignments(task) {
  const taskGroups = normalizeTaskGroups(task);
  const assignments = [];

  for (const group of taskGroups) {
    const possibleAssignments = [
      group?.assistantAssignments,
      group?.assignments,
      group?.assistants,
      group?.assignedAssistants,
    ];

    for (const collection of possibleAssignments) {
      if (!Array.isArray(collection)) {
        continue;
      }

      for (const item of collection) {
        const assistant =
          item?.assistant ||
          item?.user ||
          item;

        if (!assistant?.id) {
          continue;
        }

        assignments.push({
          assistant,
          group,
        });
      }
    }
  }

  if (Array.isArray(task?.eligibleAssistants)) {
    for (const assistant of task.eligibleAssistants) {
      if (!assistant?.id) {
        continue;
      }

      assignments.push({
        assistant,
        group: null,
      });
    }
  }

  if (Array.isArray(task?.assistants)) {
    for (const item of task.assistants) {
      const assistant =
        item?.assistant ||
        item?.user ||
        item;

      if (!assistant?.id) {
        continue;
      }

      assignments.push({
        assistant,
        group: item?.group || null,
      });
    }
  }

  return assignments;
}

export function getEligibleAssistants(task) {
  const assignments =
    normalizeAssistantAssignments(task);

  const assistantsById = new Map();

  for (const assignment of assignments) {
    const assistant = assignment.assistant;

    if (!assistant?.id) {
      continue;
    }

    const current =
      assistantsById.get(
        String(assistant.id),
      ) || {
        ...assistant,
        groups: [],
      };

    if (
      assignment.group?.id &&
      !current.groups.some(
        (group) =>
          String(group.id) ===
          String(assignment.group.id),
      )
    ) {
      current.groups.push(
        assignment.group,
      );
    }

    assistantsById.set(
      String(assistant.id),
      current,
    );
  }

  return Array.from(
    assistantsById.values(),
  ).filter((assistant) => {
    if (
      assistant.role &&
      assistant.role !== "ASSISTANT"
    ) {
      return false;
    }

    if (assistant.isHeadAssistant) {
      return false;
    }

    if (
      assistant.permissions &&
      assistant.permissions
        .canGradeHomework === false
    ) {
      return false;
    }

    if (
      assistant.canGradeHomework ===
      false
    ) {
      return false;
    }

    return true;
  });
}

export function filterAssistants(
  assistants,
  search,
) {
  const list = Array.isArray(assistants)
    ? assistants
    : [];

  const query = String(search || "")
    .trim()
    .toLowerCase();

  if (!query) {
    return list;
  }

  return list.filter((assistant) => {
    const groupNames = Array.isArray(
      assistant?.groups,
    )
      ? assistant.groups
          .map((group) => group?.name)
          .filter(Boolean)
          .join(" ")
      : "";

    const searchableText = [
      assistant?.name,
      assistant?.email,
      assistant?.phone,
      groupNames,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });
}

export function getAssistantGroupNames(
  task,
  assistantId,
) {
  if (!assistantId) {
    return [];
  }

  const targetId =
    String(assistantId);

  const groups = [];

  for (const assignment of normalizeAssistantAssignments(
    task,
  )) {
    if (
      String(
        assignment.assistant?.id,
      ) !== targetId
    ) {
      continue;
    }

    const group =
      assignment.group;

    if (
      group?.id &&
      !groups.some(
        (existingGroup) =>
          String(existingGroup.id) ===
          String(group.id),
      )
    ) {
      groups.push(group);
    }
  }

  return groups
    .map((group) => group?.name)
    .filter(Boolean);
}

export function isSubmissionDelegatedToUser(
  submission,
  user,
) {
  if (!submission || !user?.id) {
    return false;
  }

  const delegatedAssistantId =
    submission?.delegation
      ?.assistantId ||
    submission?.delegation
      ?.assistant?.id ||
    submission?.delegatedAssistantId;

  return (
    delegatedAssistantId != null &&
    String(delegatedAssistantId) ===
      String(user.id)
  );
}

export function filterVisibleSubmissions({
  submissions,
  user,
}) {
  const list = Array.isArray(submissions)
    ? submissions
    : [];

  if (!user) {
    return [];
  }

  const isAdminLevel =
    user.role === "TEACHER" ||
    Boolean(user.isHeadAssistant);

  if (isAdminLevel) {
    return list;
  }

  const isRegularAssistant =
    user.role === "ASSISTANT" &&
    !user.isHeadAssistant;

  if (!isRegularAssistant) {
    return list;
  }

  return list.filter((submission) =>
    isSubmissionDelegatedToUser(
      submission,
      user,
    ),
  );
}

export function getSubmissionStatus(
  submission,
) {
  const hasGrade =
    submission?.grade !== null &&
    submission?.grade !== undefined;

  if (hasGrade) {
    return {
      label: "Graded",
      tone: "success",
      icon: "checkmark-done-outline",
    };
  }

  if (submission?.delegation) {
    return {
      label: "Delegated",
      tone: "warning",
      icon: "person-outline",
    };
  }

  return {
    label: "Pending",
    tone: "neutral",
    icon: "time-outline",
  };
}

export function getSubmissionSummary(
  submissions,
) {
  const list = Array.isArray(submissions)
    ? submissions
    : [];

  let graded = 0;
  let delegated = 0;
  let pending = 0;

  for (const submission of list) {
    const hasGrade =
      submission?.grade !== null &&
      submission?.grade !== undefined;

    if (hasGrade) {
      graded += 1;
    }

    if (
      !hasGrade &&
      submission?.delegation
    ) {
      delegated += 1;
    }

    if (
      !hasGrade &&
      !submission?.delegation
    ) {
      pending += 1;
    }
  }

  return {
    total: list.length,
    graded,
    delegated,
    pending,
  };
}

export function getProgressPercentage(
  summary,
) {
  const total =
    Number(summary?.total) || 0;

  const graded =
    Number(summary?.graded) || 0;

  if (total <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (graded / total) * 100,
      ),
    ),
  );
}

export function createEmptyGradeForm() {
  return {
    grade: "",
    comments: "",
    correctedFiles: [],
  };
}

export function createGradeFormFromSubmission(
  submission,
) {
  return {
    grade:
      submission?.grade === null ||
      submission?.grade === undefined
        ? ""
        : String(submission.grade),

    comments:
      submission?.comments ||
      submission?.feedback ||
      "",

    correctedFiles: [],
  };
}

export function validateGrade({
  form,
  gradeOutOf,
}) {
  const normalizedForm = {
    ...createEmptyGradeForm(),
    ...(form || {}),
    comments: String(
      form?.comments || "",
    ).trim(),
    correctedFiles: Array.isArray(
      form?.correctedFiles,
    )
      ? form.correctedFiles
      : [],
  };

  const gradeText = String(
    normalizedForm.grade ?? "",
  ).trim();

  if (!gradeText) {
    return {
      valid: false,
      message:
        "Enter a grade before saving.",
    };
  }

  const grade = Number(gradeText);

  if (!Number.isFinite(grade)) {
    return {
      valid: false,
      message:
        "The grade must be a valid number.",
    };
  }

  if (grade < 0) {
    return {
      valid: false,
      message:
        "The grade cannot be negative.",
    };
  }

  const maximumGrade =
    Number(gradeOutOf);

  if (
    Number.isFinite(maximumGrade) &&
    maximumGrade >= 0 &&
    grade > maximumGrade
  ) {
    return {
      valid: false,
      message: `The grade cannot exceed ${maximumGrade}.`,
    };
  }

  return {
    valid: true,
    grade,
    form: normalizedForm,
  };
}

function createLocalFile(asset) {
  return {
    ...asset,

    localId:
      asset?.localId ||
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,

    name:
      asset?.name ||
      asset?.fileName ||
      `corrected-file-${Date.now()}`,

    mimeType:
      asset?.mimeType ||
      asset?.type ||
      "application/octet-stream",

    size:
      asset?.size ||
      asset?.fileSize ||
      0,
  };
}

export function appendSelectedFiles({
  existingFiles,
  selectedAssets,
}) {
  const currentFiles = Array.isArray(
    existingFiles,
  )
    ? existingFiles
    : [];

  const newAssets = Array.isArray(
    selectedAssets,
  )
    ? selectedAssets
    : [];

  const remainingSlots =
    MAX_CORRECTED_FILES -
    currentFiles.length;

  if (remainingSlots <= 0) {
    return {
      valid: false,
      files: currentFiles,
      message: `You may upload a maximum of ${MAX_CORRECTED_FILES} corrected files.`,
    };
  }

  if (
    newAssets.length >
    remainingSlots
  ) {
    return {
      valid: false,
      files: currentFiles,
      message: `You may select only ${remainingSlots} more ${
        remainingSlots === 1
          ? "file"
          : "files"
      }.`,
    };
  }

  return {
    valid: true,
    files: [
      ...currentFiles,
      ...newAssets.map(
        createLocalFile,
      ),
    ],
    message: "",
  };
}

export function removeLocalFile(
  files,
  localId,
) {
  const list = Array.isArray(files)
    ? files
    : [];

  return list.filter(
    (file) =>
      String(file?.localId) !==
      String(localId),
  );
}

async function appendFileToFormData(
  formData,
  file,
) {
  const filename =
    file?.name ||
    file?.fileName ||
    `corrected-file-${Date.now()}`;

  const contentType =
    file?.mimeType ||
    file?.type ||
    "application/octet-stream";

  if (
    Platform.OS === "web" &&
    file?.file
  ) {
    formData.append(
      "correctedFiles",
      file.file,
      filename,
    );

    return;
  }

  if (
    Platform.OS === "web" &&
    file?.uri
  ) {
    const response =
      await fetch(file.uri);

    if (!response.ok) {
      throw new Error(
        `The file "${filename}" could not be prepared for upload.`,
      );
    }

    const blob =
      await response.blob();

    formData.append(
      "correctedFiles",
      blob,
      filename,
    );

    return;
  }

  if (!file?.uri) {
    throw new Error(
      `The file "${filename}" does not have a valid URI.`,
    );
  }

  formData.append(
    "correctedFiles",
    {
      uri: file.uri,
      name: filename,
      type: contentType,
    },
  );
}

export async function buildGradeFormData({
  grade,
  comments,
  correctedFiles,
}) {
  const formData =
    new FormData();

  formData.append(
    "grade",
    String(grade),
  );

  formData.append(
    "comments",
    String(comments || ""),
  );

  const files = Array.isArray(
    correctedFiles,
  )
    ? correctedFiles
    : [];

  for (const file of files) {
    await appendFileToFormData(
      formData,
      file,
    );
  }

  return formData;
}

export function formatGradeValue(
  grade,
  gradeOutOf,
) {
  if (
    grade === null ||
    grade === undefined ||
    grade === ""
  ) {
    return "Not graded";
  }

  const maximum =
    Number(gradeOutOf);

  if (Number.isFinite(maximum)) {
    return `${grade} / ${maximum}`;
  }

  return String(grade);
}

export function getDelegationActionConfig(
  action,
) {
  switch (
    String(action || "").toUpperCase()
  ) {
    case "ASSIGNED":
      return {
        label: "Assigned",
        icon: "person-add-outline",
        tone: "info",
      };

    case "REASSIGNED":
      return {
        label: "Reassigned",
        icon: "swap-horizontal-outline",
        tone: "warning",
      };

    case "REMOVED":
      return {
        label: "Removed",
        icon: "person-remove-outline",
        tone: "danger",
      };

    case "COMPLETED":
      return {
        label: "Completed",
        icon: "checkmark-done-outline",
        tone: "success",
      };

    case "REOPENED":
      return {
        label: "Reopened",
        icon: "refresh-outline",
        tone: "warning",
      };

    default:
      return {
        label:
          String(action || "Updated")
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(
              /\b\w/g,
              (character) =>
                character.toUpperCase(),
            ),
        icon: "time-outline",
        tone: "neutral",
      };
  }
}

export function getGradingActionConfig(
  action,
) {
  switch (
    String(action || "").toUpperCase()
  ) {
    case "GRADED":
      return {
        label: "Initially graded",
        icon:
          "checkmark-done-outline",
        tone: "success",
      };

    case "EDITED":
      return {
        label: "Grade edited",
        icon: "create-outline",
        tone: "info",
      };

    case "REOPENED":
      return {
        label: "Submission reopened",
        icon: "refresh-outline",
        tone: "warning",
      };

    default:
      return {
        label:
          String(action || "Updated")
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(
              /\b\w/g,
              (character) =>
                character.toUpperCase(),
            ),
        icon: "time-outline",
        tone: "neutral",
      };
  }
}