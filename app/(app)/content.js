import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import api from "../../src/lib/api";
import { colors } from "../../src/theme";
import { styles } from "./content.styles";

const SOURCE_UPLOAD = "UPLOAD";
const SOURCE_R2_EXISTING = "R2_EXISTING";

const EDIT_SOURCE_KEEP = "KEEP";
const EDIT_SOURCE_UPLOAD = "UPLOAD";
const EDIT_SOURCE_R2 = "R2_EXISTING";

const LEVELS = {
  years: {
    singular: "Academic Year",
    plural: "Academic Years",
    icon: "calendar-outline",
    description:
      "Choose an academic year before managing its units, chapters and resources.",
  },

  units: {
    singular: "Unit",
    plural: "Units",
    icon: "albums-outline",
    description:
      "Units created inside the selected academic year.",
  },

  chapters: {
    singular: "Chapter",
    plural: "Chapters",
    icon: "book-outline",
    description:
      "Chapters contained within the selected unit. Upload materials and videos directly inside chapters.",
  },

  resources: {
    singular: "Resource",
    plural: "Resources",
    icon: "folder-open-outline",
    description:
      "Materials and videos uploaded or linked from R2 for the selected chapter.",
  },
};

function getApiError(
  error,
  fallback = "Something went wrong."
) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getResourceType(item) {
  if (item?.kind) {
    return item.kind;
  }

  if (
    item?.videoUrl ||
    item?.mimeType?.startsWith("video/")
  ) {
    return "video";
  }

  return "material";
}

function getSourceType(item) {
  return item?.sourceType === SOURCE_R2_EXISTING
    ? SOURCE_R2_EXISTING
    : SOURCE_UPLOAD;
}

function ResourceSourceSelector({
  value,
  onChange,
  disabled = false,
}) {
  return (
    <View style={styles.sourceSelector}>
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{
          selected: value === SOURCE_UPLOAD,
          disabled,
        }}
        onPress={() => onChange(SOURCE_UPLOAD)}
        style={({ pressed }) => [
          styles.sourceOption,
          value === SOURCE_UPLOAD &&
            styles.sourceOptionActive,
          pressed &&
            !disabled &&
            styles.pressed,
          disabled &&
            styles.disabledAction,
        ]}
      >
        <Ionicons
          name="cloud-upload-outline"
          size={18}
          color={
            value === SOURCE_UPLOAD
              ? colors.white
              : colors.primary
          }
        />

        <View style={styles.sourceOptionCopy}>
          <Text
            style={[
              styles.sourceOptionTitle,
              value === SOURCE_UPLOAD &&
                styles.sourceOptionTitleActive,
            ]}
          >
            Upload from device
          </Text>

          <Text
            style={[
              styles.sourceOptionDescription,
              value === SOURCE_UPLOAD &&
                styles.sourceOptionDescriptionActive,
            ]}
          >
            Select and upload a file normally.
          </Text>
        </View>
      </Pressable>

      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{
          selected: value === SOURCE_R2_EXISTING,
          disabled,
        }}
        onPress={() => onChange(SOURCE_R2_EXISTING)}
        style={({ pressed }) => [
          styles.sourceOption,
          value === SOURCE_R2_EXISTING &&
            styles.sourceOptionActive,
          pressed &&
            !disabled &&
            styles.pressed,
          disabled &&
            styles.disabledAction,
        ]}
      >
        <Ionicons
          name="server-outline"
          size={18}
          color={
            value === SOURCE_R2_EXISTING
              ? colors.white
              : colors.primary
          }
        />

        <View style={styles.sourceOptionCopy}>
          <Text
            style={[
              styles.sourceOptionTitle,
              value === SOURCE_R2_EXISTING &&
                styles.sourceOptionTitleActive,
            ]}
          >
            Existing R2 file
          </Text>

          <Text
            style={[
              styles.sourceOptionDescription,
              value === SOURCE_R2_EXISTING &&
                styles.sourceOptionDescriptionActive,
            ]}
          >
            Reference an object already uploaded to
            Cloudflare R2.
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function ExistingR2Field({
  value,
  onChangeText,
  disabled = false,
}) {
  return (
    <View style={styles.r2FieldSection}>
      <View style={styles.r2FieldHeader}>
        <Ionicons
          name="key-outline"
          size={18}
          color={colors.primary}
        />

        <View style={styles.r2FieldHeaderCopy}>
          <Text style={styles.r2FieldLabel}>
            R2 object key
          </Text>

          <Text style={styles.r2FieldHelp}>
            Enter the exact object key from your R2
            bucket. Do not enter a temporary signed URL.
          </Text>
        </View>
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Example: physics/unit-2/lesson.pdf"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <View style={styles.r2ExampleBox}>
        <Ionicons
          name="information-circle-outline"
          size={17}
          color={colors.textMuted}
        />

        <Text style={styles.r2ExampleText}>
          Example object key:
          {"\n"}
          teacher-content/physics/unit-2/revision.pdf
        </Text>
      </View>
    </View>
  );
}

export default function ContentPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1000;
  const isCompact = width < 650;

  const [level, setLevel] =
    useState("years");

  const [breadcrumbs, setBreadcrumbs] =
    useState([]);

  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    createModalVisible,
    setCreateModalVisible,
  ] = useState(false);

  const [newItemName, setNewItemName] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [
    hierarchyEditVisible,
    setHierarchyEditVisible,
  ] = useState(false);

  const [
    editingHierarchyItem,
    setEditingHierarchyItem,
  ] = useState(null);

  const [
    hierarchyEditName,
    setHierarchyEditName,
  ] = useState("");

  const [
    savingHierarchyEdit,
    setSavingHierarchyEdit,
  ] = useState(false);

  const [
    deletingHierarchyItemId,
    setDeletingHierarchyItemId,
  ] = useState(null);

  const [
    materialTitle,
    setMaterialTitle,
  ] = useState("");

  const [
    materialSourceType,
    setMaterialSourceType,
  ] = useState(SOURCE_UPLOAD);

  const [
    materialObjectKey,
    setMaterialObjectKey,
  ] = useState("");

  const [
    materialFile,
    setMaterialFile,
  ] = useState(null);

  const [
    videoTitle,
    setVideoTitle,
  ] = useState("");

  const [
    videoSourceType,
    setVideoSourceType,
  ] = useState(SOURCE_UPLOAD);

  const [
    videoObjectKey,
    setVideoObjectKey,
  ] = useState("");

  const [
    videoFile,
    setVideoFile,
  ] = useState(null);

  const [
    uploadingType,
    setUploadingType,
  ] = useState(null);

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(null);

  const [
    editModalVisible,
    setEditModalVisible,
  ] = useState(false);

  const [
    editingResource,
    setEditingResource,
  ] = useState(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [
    editSourceMode,
    setEditSourceMode,
  ] = useState(EDIT_SOURCE_KEEP);

  const [
    replacementFile,
    setReplacementFile,
  ] = useState(null);

  const [
    editObjectKey,
    setEditObjectKey,
  ] = useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [
    deletingResourceId,
    setDeletingResourceId,
  ] = useState(null);

  const currentLevel = LEVELS[level];

  const currentParent =
    breadcrumbs[breadcrumbs.length - 1] || null;

  const clearMessages =
    useCallback(() => {
      setError("");
      setSuccess("");
    }, []);

  const loadYears =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await api.get("/years/mine");

        setItems(
          Array.isArray(response.data)
            ? response.data
            : []
        );

        setLevel("years");
        setBreadcrumbs([]);
      } catch (requestError) {
        setItems([]);

        setError(
          getApiError(
            requestError,
            "Couldn't load academic years."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  const loadUnits =
    useCallback(
      async (
        year,
        nextBreadcrumbs = null
      ) => {
        if (!year?.id) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const response =
            await api.get(
              `/units/year/${year.id}`
            );

          setItems(
            Array.isArray(response.data)
              ? response.data
              : []
          );

          setLevel("units");

          setBreadcrumbs(
            nextBreadcrumbs || [
              {
                id: year.id,
                name: year.name,
                type: "year",
              },
            ]
          );
        } catch (requestError) {
          setItems([]);

          setError(
            getApiError(
              requestError,
              "Couldn't load units for this academic year."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  const loadChapters =
    useCallback(
      async (
        unit,
        nextBreadcrumbs = null
      ) => {
        if (!unit?.id) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const response =
            await api.get(
              `/units/${unit.id}`
            );

          setItems(
            Array.isArray(response.data?.chapters)
              ? response.data.chapters
              : []
          );

          setLevel("chapters");

          setBreadcrumbs(
            nextBreadcrumbs || [
              breadcrumbs[0],
              {
                id: unit.id,
                name: unit.name,
                type: "unit",
              },
            ].filter(Boolean)
          );
        } catch (requestError) {
          setItems([]);

          setError(
            getApiError(
              requestError,
              "Couldn't load chapters."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      [breadcrumbs]
    );

  const loadResources =
    useCallback(
      async (
        chapter,
        nextBreadcrumbs
      ) => {
        if (!chapter?.id) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const response =
            await api.get(
              `/chapters/${chapter.id}`
            );

          const materials =
            Array.isArray(response.data?.materials)
              ? response.data.materials.map(
                  (item) => ({
                    ...item,
                    kind: "material",
                  })
                )
              : [];

          const videos =
            Array.isArray(response.data?.videos)
              ? response.data.videos.map(
                  (item) => ({
                    ...item,
                    kind: "video",
                  })
                )
              : [];

          setItems([
            ...materials,
            ...videos,
          ]);

          setLevel("resources");

          setBreadcrumbs(nextBreadcrumbs);
        } catch (requestError) {
          setItems([]);

          setError(
            getApiError(
              requestError,
              "Couldn't load chapter resources."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  function getHierarchyEndpoint() {
    if (level === "units") {
      return "units";
    }

    if (level === "chapters") {
      return "chapters";
    }

    return null;
  }

  async function refreshCurrentLevel() {
    if (level === "years") {
      await loadYears();
      return;
    }

    if (level === "units") {
      await loadUnits(
        breadcrumbs[0],
        breadcrumbs.slice(0, 1)
      );

      return;
    }

    if (level === "chapters") {
      await loadChapters(
        breadcrumbs[1],
        breadcrumbs.slice(0, 2)
      );

      return;
    }

    if (level === "resources") {
      await loadResources(
        breadcrumbs[2],
        breadcrumbs
      );
    }
  }

  function openItem(item) {
    clearMessages();

    if (level === "years") {
      loadUnits(item);
      return;
    }

    if (level === "units") {
      loadChapters(item, [
        breadcrumbs[0],
        {
          id: item.id,
          name: item.name,
          type: "unit",
        },
      ]);

      return;
    }

    if (level === "chapters") {
      loadResources(item, [
        ...breadcrumbs.slice(0, 2),
        {
          id: item.id,
          name: item.name,
          type: "chapter",
        },
      ]);
    }
  }

  function openRoot() {
    clearMessages();
    loadYears();
  }

  function openBreadcrumb(
    breadcrumb,
    index
  ) {
    clearMessages();

    const nextBreadcrumbs =
      breadcrumbs.slice(
        0,
        index + 1
      );

    if (breadcrumb.type === "year") {
      loadUnits(
        breadcrumb,
        nextBreadcrumbs
      );

      return;
    }

    if (breadcrumb.type === "unit") {
      loadChapters(
        breadcrumb,
        nextBreadcrumbs
      );

      return;
    }

    if (breadcrumb.type === "chapter") {
      loadResources(
        breadcrumb,
        nextBreadcrumbs
      );
    }
  }

  function openCreateModal() {
    clearMessages();
    setNewItemName("");
    setCreateModalVisible(true);
  }

  function closeCreateModal() {
    if (creating) {
      return;
    }

    setCreateModalVisible(false);
    setNewItemName("");
  }

  async function createItem() {
    const name =
      newItemName.trim();

    if (!name) {
      setError(
        `Enter a ${currentLevel.singular.toLowerCase()} name.`
      );

      return;
    }

    setCreating(true);
    setError("");

    try {
      if (level === "units") {
        const year =
          breadcrumbs[0];

        if (!year?.id) {
          setError(
            "Select an academic year before creating a unit."
          );

          setCreating(false);
          return;
        }

        await api.post(
          "/units",
          {
            name,
            yearId: year.id,
          }
        );
      }

      if (level === "chapters") {
        const unit =
          breadcrumbs[1];

        if (!unit?.id) {
          setError(
            "Select a unit before creating a chapter."
          );

          setCreating(false);
          return;
        }

        await api.post(
          "/chapters",
          {
            name,
            unitId: unit.id,
          }
        );
      }

      setCreateModalVisible(false);
      setNewItemName("");

      await refreshCurrentLevel();

      setSuccess(
        `${currentLevel.singular} created successfully.`
      );
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          `Couldn't create the ${currentLevel.singular.toLowerCase()}.`
        )
      );
    } finally {
      setCreating(false);
    }
  }

  function openHierarchyEdit(item) {
    clearMessages();

    setEditingHierarchyItem(item);
    setHierarchyEditName(item?.name || "");
    setHierarchyEditVisible(true);
  }

  function closeHierarchyEdit() {
    if (savingHierarchyEdit) {
      return;
    }

    setHierarchyEditVisible(false);
    setEditingHierarchyItem(null);
    setHierarchyEditName("");
  }

  async function saveHierarchyEdit() {
    if (!editingHierarchyItem?.id) {
      return;
    }

    const name =
      hierarchyEditName.trim();

    if (!name) {
      setError(
        `Enter a ${currentLevel.singular.toLowerCase()} name.`
      );

      return;
    }

    const endpoint =
      getHierarchyEndpoint();

    if (!endpoint) {
      return;
    }

    setSavingHierarchyEdit(true);
    setError("");

    try {
      await api.patch(
        `/${endpoint}/${editingHierarchyItem.id}`,
        {
          name,
        }
      );

      setHierarchyEditVisible(false);
      setEditingHierarchyItem(null);
      setHierarchyEditName("");

      await refreshCurrentLevel();

      setSuccess(
        `${currentLevel.singular} updated successfully.`
      );
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          `Couldn't update the ${currentLevel.singular.toLowerCase()}.`
        )
      );
    } finally {
      setSavingHierarchyEdit(false);
    }
  }

  async function deleteHierarchyItem(item) {
    if (!item?.id) {
      return;
    }

    const endpoint =
      getHierarchyEndpoint();

    if (!endpoint) {
      return;
    }

    setDeletingHierarchyItemId(item.id);
    setError("");

    try {
      await api.delete(
        `/${endpoint}/${item.id}`
      );

      await refreshCurrentLevel();

      setSuccess(
        `${currentLevel.singular} deleted successfully.`
      );
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          `Couldn't delete the ${currentLevel.singular.toLowerCase()}.`
        )
      );
    } finally {
      setDeletingHierarchyItemId(null);
    }
  }

  function confirmDeleteHierarchyItem(item) {
    const type =
      currentLevel.singular.toLowerCase();

    const itemName =
      item?.name ||
      `this ${type}`;

    let message =
      `Delete "${itemName}"? This action cannot be undone.`;

    if (level === "units") {
      message +=
        " All chapters and connected resources inside this unit may also be deleted.";
    }

    if (level === "chapters") {
      message +=
        " All materials and videos connected to this chapter may be affected.";
    }

    if (Platform.OS === "web") {
      const confirmed =
        window.confirm(message);

      if (confirmed) {
        deleteHierarchyItem(item);
      }

      return;
    }

    Alert.alert(
      `Delete ${type}`,
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteHierarchyItem(item),
        },
      ]
    );
  }

  async function addFileToFormData(
    formData,
    file
  ) {
    const fileName =
      file?.name ||
      `upload-${Date.now()}`;

    const mimeType =
      file?.mimeType ||
      "application/octet-stream";

    if (Platform.OS === "web") {
      if (file?.file) {
        formData.append(
          "file",
          file.file,
          fileName
        );

        return;
      }

      const response =
        await fetch(file.uri);

      if (!response.ok) {
        throw new Error(
          "The selected file could not be prepared."
        );
      }

      const blob =
        await response.blob();

      formData.append(
        "file",
        blob,
        fileName
      );

      return;
    }

    formData.append(
      "file",
      {
        uri: file.uri,
        name: fileName,
        type: mimeType,
      }
    );
  }

  async function chooseResourceFile(type) {
    const pickerType =
      type === "video"
        ? "video/*"
        : Platform.OS === "web"
          ? "application/pdf,image/*"
          : [
              "application/pdf",
              "image/*",
            ];

    return DocumentPicker.getDocumentAsync({
      type: pickerType,
      copyToCacheDirectory:
        Platform.OS !== "web",
      multiple: false,
    });
  }

  async function selectCreateResourceFile(type) {
    const isMaterial =
      type === "material";

    if (uploadingType) {
      return;
    }

    clearMessages();

    try {
      const result =
        await chooseResourceFile(type);

      if (
        result.canceled ||
        !result.assets?.length
      ) {
        return;
      }

      const selectedFile =
        result.assets[0];

      if (isMaterial) {
        setMaterialFile(selectedFile);
        setMaterialSourceType(SOURCE_UPLOAD);
        setMaterialObjectKey("");
      } else {
        setVideoFile(selectedFile);
        setVideoSourceType(SOURCE_UPLOAD);
        setVideoObjectKey("");
      }
    } catch (pickerError) {
      setError(
        pickerError?.message ||
          `Couldn't open the ${type} file picker.`
      );
    }
  }

  function clearCreateResourceFile(type) {
    if (type === "material") {
      setMaterialFile(null);
    } else {
      setVideoFile(null);
    }
  }

  function getSelectedUploadFile(file) {
    if (!file) {
      return null;
    }

    if (Platform.OS === "web" && file.file) {
      return file.file;
    }

    return file;
  }

  function getSelectedUploadFileName(file) {
    return (
      file?.name ||
      file?.file?.name ||
      `upload-${Date.now()}`
    );
  }

  function getSelectedUploadContentType(file, type) {
    return (
      file?.mimeType ||
      file?.file?.type ||
      (type === "video"
        ? "video/mp4"
        : "application/octet-stream")
    );
  }

  function getSelectedUploadSize(file) {
    return (
      file?.size ||
      file?.file?.size ||
      null
    );
  }

  function uploadFileToSignedUrl({
    uploadUrl,
    file,
    contentType,
    onProgress,
  }) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("PUT", uploadUrl);

      xhr.setRequestHeader(
        "Content-Type",
        contentType ||
          "application/octet-stream"
      );

      xhr.upload.onprogress = (event) => {
        if (
          event.lengthComputable &&
          typeof onProgress === "function"
        ) {
          const percent =
            Math.round(
              (event.loaded / event.total) * 100
            );

          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (
          xhr.status >= 200 &&
          xhr.status < 300
        ) {
          resolve();
          return;
        }

        reject(
          new Error(
            `Direct upload failed with status ${xhr.status}.`
          )
        );
      };

      xhr.onerror = () => {
        reject(
          new Error(
            "Direct upload failed. Check the network connection and R2 CORS settings."
          )
        );
      };

      xhr.ontimeout = () => {
        reject(
          new Error(
            "Direct upload timed out. Try again with a stable connection."
          )
        );
      };

      /*
      * 0 means no browser-side timeout.
      * This is important for 2GB / 3GB videos.
      */
      xhr.timeout = 0;

      xhr.send(file);
    });
  }

  async function directUploadResource({
    type,
    title,
    chapterId,
    selectedFile,
  }) {
    const uploadFile =
      getSelectedUploadFile(selectedFile);

    if (!uploadFile) {
      throw new Error(
        "Selected file could not be prepared for upload."
      );
    }

    const originalFilename =
      getSelectedUploadFileName(selectedFile);

    const contentType =
      getSelectedUploadContentType(
        selectedFile,
        type
      );

    const size =
      getSelectedUploadSize(selectedFile);

    setUploadProgress(0);

    const startResponse =
      await api.post(
        "/resources/direct-upload/start",
        {
          kind: type,
          title,
          chapterId,
          originalFilename,
          contentType,
          size,
        }
      );

    const upload =
      startResponse.data?.upload;

    if (
      !upload?.uploadUrl ||
      !upload?.objectKey
    ) {
      throw new Error(
        "The backend did not return a valid direct upload URL."
      );
    }

    await uploadFileToSignedUrl({
      uploadUrl: upload.uploadUrl,
      file: uploadFile,
      contentType:
        upload.contentType || contentType,
      onProgress: setUploadProgress,
    });

    setUploadProgress(100);

    const completeResponse =
      await api.post(
        "/resources/direct-upload/complete",
        {
          kind: type,
          title,
          chapterId,
          objectKey: upload.objectKey,
        }
      );

    return completeResponse.data?.resource;
  }

  async function uploadResource(type) {
    const isMaterial =
      type === "material";

    const rawTitle =
      isMaterial
        ? materialTitle
        : videoTitle;

    const sourceType =
      isMaterial
        ? materialSourceType
        : videoSourceType;

    const objectKey =
      isMaterial
        ? materialObjectKey
        : videoObjectKey;

    const selectedFile =
      isMaterial
        ? materialFile
        : videoFile;

    const title =
      rawTitle.trim();

    clearMessages();

    if (!title) {
      setError(
        `Enter a title for the ${type}.`
      );

      return;
    }

    if (!currentParent?.id) {
      setError(
        "Select a chapter before adding a resource."
      );

      return;
    }

    if (
      sourceType === SOURCE_R2_EXISTING &&
      !objectKey.trim()
    ) {
      setError(
        "Enter the existing R2 object key."
      );

      return;
    }

    if (
      sourceType === SOURCE_UPLOAD &&
      !selectedFile
    ) {
      setError(
        `Choose a ${type} file from your device first.`
      );

      return;
    }

    setUploadingType(type);

    try {
      if (
        sourceType === SOURCE_R2_EXISTING
      ) {
        await api.post(
          `/resources/${type}`,
          {
            title,
            chapterId:
              currentParent.id,
            sourceType:
              SOURCE_R2_EXISTING,
            objectKey:
              objectKey.trim(),
          }
        );
      } else {
          if (Platform.OS === "web") {
            await directUploadResource({
              type,
              title,
              chapterId: currentParent.id,
              selectedFile,
            });
          } else {
            const formData =
              new FormData();

            formData.append(
              "title",
              title
            );

            formData.append(
              "chapterId",
              currentParent.id
            );

            formData.append(
              "sourceType",
              SOURCE_UPLOAD
            );

            await addFileToFormData(
              formData,
              selectedFile
            );

            await api.post(
              `/resources/${type}`,
              formData
            );
          }
        }

      if (isMaterial) {
        setMaterialTitle("");
        setMaterialObjectKey("");
        setMaterialFile(null);
        setMaterialSourceType(SOURCE_UPLOAD);
      } else {
        setVideoTitle("");
        setVideoObjectKey("");
        setVideoFile(null);
        setVideoSourceType(SOURCE_UPLOAD);
      }

      await loadResources(
        currentParent,
        breadcrumbs
      );

      setSuccess(
        sourceType === SOURCE_R2_EXISTING
          ? `${
              type === "video"
                ? "Video"
                : "Material"
            } added from R2 successfully.`
          : `${
              type === "video"
                ? "Video"
                : "Material"
            } uploaded successfully.`
      );
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          sourceType === SOURCE_R2_EXISTING
            ? `Couldn't add the ${type} from R2. Check that the object key exists in the configured bucket.`
            : `Couldn't upload the ${type}. Confirm that Cloudflare R2 is configured correctly.`
        )
      );
    } finally {
      setUploadingType(null);
      setUploadProgress(null);
    }
  }

  function viewResource(item) {
    const resourceType =
      getResourceType(item);

    router.push(
      `/resource-viewer/${resourceType}/${item.id}`
    );
  }

  function openEditResource(item) {
    clearMessages();

    setEditingResource(item);
    setEditTitle(item?.title || "");
    setEditSourceMode(EDIT_SOURCE_KEEP);
    setReplacementFile(null);
    setEditObjectKey("");
    setEditModalVisible(true);
  }

  function closeEditResource() {
    if (savingEdit) {
      return;
    }

    setEditModalVisible(false);
    setEditingResource(null);
    setEditTitle("");
    setEditSourceMode(EDIT_SOURCE_KEEP);
    setReplacementFile(null);
    setEditObjectKey("");
  }

  function selectEditSourceMode(mode) {
    if (savingEdit) {
      return;
    }

    setEditSourceMode(mode);

    if (mode !== EDIT_SOURCE_UPLOAD) {
      setReplacementFile(null);
    }

    if (mode !== EDIT_SOURCE_R2) {
      setEditObjectKey("");
    }
  }

  async function selectReplacementFile() {
    if (!editingResource) {
      return;
    }

    try {
      const result =
        await chooseResourceFile(
          getResourceType(editingResource)
        );

      if (
        result.canceled ||
        !result.assets?.length
      ) {
        return;
      }

      setReplacementFile(result.assets[0]);
      setEditSourceMode(EDIT_SOURCE_UPLOAD);
      setEditObjectKey("");
    } catch (pickerError) {
      setError(
        pickerError?.message ||
          "Couldn't select the replacement file."
      );
    }
  }

  async function saveResource() {
    if (!editingResource) {
      return;
    }

    const title =
      editTitle.trim();

    if (!title) {
      setError(
        "Enter a resource title."
      );

      return;
    }

    if (
      editSourceMode === EDIT_SOURCE_UPLOAD &&
      !replacementFile
    ) {
      setError(
        "Choose a replacement file first."
      );

      return;
    }

    if (
      editSourceMode === EDIT_SOURCE_R2 &&
      !editObjectKey.trim()
    ) {
      setError(
        "Enter the existing R2 object key."
      );

      return;
    }

    setSavingEdit(true);
    setError("");

    try {
      const resourceType =
        getResourceType(editingResource);

      if (editSourceMode === EDIT_SOURCE_KEEP) {
        await api.patch(
          `/resources/${resourceType}/${editingResource.id}`,
          {
            title,
          }
        );
      }

      if (editSourceMode === EDIT_SOURCE_R2) {
        await api.patch(
          `/resources/${resourceType}/${editingResource.id}`,
          {
            title,
            sourceType:
              SOURCE_R2_EXISTING,
            objectKey:
              editObjectKey.trim(),
          }
        );
      }

      if (editSourceMode === EDIT_SOURCE_UPLOAD) {
        const formData =
          new FormData();

        formData.append(
          "title",
          title
        );

        formData.append(
          "sourceType",
          SOURCE_UPLOAD
        );

        await addFileToFormData(
          formData,
          replacementFile
        );

        await api.patch(
          `/resources/${resourceType}/${editingResource.id}`,
          formData
        );
      }

      await loadResources(
        currentParent,
        breadcrumbs
      );

      setEditModalVisible(false);
      setEditingResource(null);
      setEditTitle("");
      setEditSourceMode(EDIT_SOURCE_KEEP);
      setReplacementFile(null);
      setEditObjectKey("");

      setSuccess(
        `${
          resourceType === "video"
            ? "Video"
            : "Material"
        } updated successfully.`
      );
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Couldn't update the resource."
        )
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteResource(item) {
    const resourceType =
      getResourceType(item);

    setDeletingResourceId(item.id);
    setError("");

    try {
      await api.delete(
        `/resources/${resourceType}/${item.id}`
      );

      await loadResources(
        currentParent,
        breadcrumbs
      );

      setSuccess(
        `${
          resourceType === "video"
            ? "Video"
            : "Material"
        } deleted successfully.${
          getSourceType(item) === SOURCE_R2_EXISTING
            ? " The manually managed R2 object was kept."
            : ""
        }`
      );
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Couldn't delete the resource."
        )
      );
    } finally {
      setDeletingResourceId(null);
    }
  }

  function confirmDeleteResource(item) {
    const title =
      item?.title ||
      "this resource";

    const manuallyManaged =
      getSourceType(item) === SOURCE_R2_EXISTING;

    const message =
      manuallyManaged
        ? `Delete "${title}" from the platform? The database record will be deleted, but the manually managed R2 object will remain in Cloudflare R2.`
        : `Delete "${title}"? This action cannot be undone and the uploaded R2 file will also be removed.`;

    if (Platform.OS === "web") {
      const confirmed =
        window.confirm(message);

      if (confirmed) {
        deleteResource(item);
      }

      return;
    }

    Alert.alert(
      "Delete resource",
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteResource(item),
        },
      ]
    );
  }

  function renderBreadcrumbs() {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.breadcrumbs}
      >
        <Pressable
          onPress={openRoot}
          style={({ pressed }) => [
            styles.breadcrumbButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="home-outline"
            size={16}
            color={colors.primary}
          />

          <Text style={styles.breadcrumbLink}>
            Academic Years
          </Text>
        </Pressable>

        {breadcrumbs.map(
          (breadcrumb, index) => (
            <React.Fragment
              key={`${breadcrumb.type}-${breadcrumb.id}`}
            >
              <Ionicons
                name="chevron-forward"
                size={15}
                color={colors.textMuted}
              />

              <Pressable
                onPress={() =>
                  openBreadcrumb(
                    breadcrumb,
                    index
                  )
                }
                style={({ pressed }) => [
                  styles.breadcrumbButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.breadcrumbLink,
                    index ===
                      breadcrumbs.length - 1 &&
                      styles.breadcrumbCurrent,
                  ]}
                >
                  {breadcrumb.name}
                </Text>
              </Pressable>
            </React.Fragment>
          )
        )}
      </ScrollView>
    );
  }

  function renderEmptyState() {
    return (
      <Card style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name={currentLevel.icon}
            size={32}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          No{" "}
          {currentLevel.plural.toLowerCase()}{" "}
          yet
        </Text>

        <Text style={styles.emptyText}>
          {level === "resources"
            ? "Add the first material or video for this chapter using a device upload or an existing R2 object."
            : level === "years"
              ? "Create academic years first from the Years / Groups area, then manage content here."
              : `Create the first ${currentLevel.singular.toLowerCase()} here.`}
        </Text>

        {level !== "resources" &&
        level !== "years" ? (
          <Button
            title={`Add ${currentLevel.singular}`}
            variant="warning"
            onPress={openCreateModal}
          />
        ) : null}
      </Card>
    );
  }

  function renderHierarchyItem(item) {
    const deleting =
      deletingHierarchyItemId === item.id;

    return (
      <View
        key={item.id}
        style={styles.itemCard}
      >
        <Pressable
          onPress={() => openItem(item)}
          style={({ pressed }) => [
            styles.itemOpenArea,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.itemIcon}>
            <Ionicons
              name={currentLevel.icon}
              size={25}
              color={colors.primary}
            />
          </View>

          <View style={styles.itemCopy}>
            <Text
              numberOfLines={2}
              style={styles.itemTitle}
            >
              {item.name}
            </Text>

            <Text style={styles.itemSubtitle}>
              Open{" "}
              {currentLevel.singular.toLowerCase()}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={colors.textMuted}
          />
        </Pressable>

        {level !== "years" ? (
          <View style={styles.itemActions}>
            <Pressable
              onPress={() =>
                openHierarchyEdit(item)
              }
              style={({ pressed }) => [
                styles.itemActionButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.primary}
              />

              <Text
                style={styles.itemEditActionText}
              >
                Edit
              </Text>
            </Pressable>

            <View
              style={styles.itemActionDivider}
            />

            <Pressable
              disabled={deleting}
              onPress={() =>
                confirmDeleteHierarchyItem(item)
              }
              style={({ pressed }) => [
                styles.itemActionButton,
                pressed && styles.pressed,
                deleting &&
                  styles.disabledAction,
              ]}
            >
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color={colors.danger}
                />
              ) : (
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.danger}
                />
              )}

              <Text
                style={
                  styles.itemDeleteActionText
                }
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  function renderResourceItem(item) {
    const resourceType =
      getResourceType(item);

    const sourceType =
      getSourceType(item);

    const deleting =
      deletingResourceId === item.id;

    return (
      <Card
        key={`${resourceType}-${item.id}`}
        style={styles.resourceCard}
      >
        <View style={styles.resourceMain}>
          <View
            style={[
              styles.resourceIcon,
              resourceType === "video" &&
                styles.videoIcon,
            ]}
          >
            <Ionicons
              name={
                resourceType === "video"
                  ? "play-circle-outline"
                  : "document-text-outline"
              }
              size={27}
              color={
                resourceType === "video"
                  ? colors.warning
                  : colors.primary
              }
            />
          </View>

          <View style={styles.resourceCopy}>
            <Text
              numberOfLines={2}
              style={styles.resourceTitle}
            >
              {item.title ||
                item.name ||
                "Untitled resource"}
            </Text>

            <View style={styles.resourceMetaRow}>
              <View style={styles.resourceTypeRow}>
                <Text style={styles.resourceTypeText}>
                  {resourceType === "video"
                    ? "Video"
                    : "Material"}
                </Text>
              </View>

              <View
                style={[
                  styles.resourceSourceBadge,
                  sourceType ===
                    SOURCE_R2_EXISTING &&
                    styles.resourceSourceBadgeR2,
                ]}
              >
                <Ionicons
                  name={
                    sourceType ===
                    SOURCE_R2_EXISTING
                      ? "server-outline"
                      : "cloud-upload-outline"
                  }
                  size={13}
                  color={
                    sourceType ===
                    SOURCE_R2_EXISTING
                      ? colors.primary
                      : colors.textMuted
                  }
                />

                <Text
                  style={[
                    styles.resourceSourceText,
                    sourceType ===
                      SOURCE_R2_EXISTING &&
                      styles.resourceSourceTextR2,
                  ]}
                >
                  {sourceType === SOURCE_R2_EXISTING
                    ? "Existing R2"
                    : "Platform upload"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.resourceActions}>
          <Button
            title="View"
            variant="primary"
            onPress={() => viewResource(item)}
          />

          <Button
            title="Edit"
            variant="outline"
            onPress={() => openEditResource(item)}
          />

          <Button
            title={
              deleting
                ? "Deleting..."
                : "Delete"
            }
            variant="danger"
            disabled={deleting}
            onPress={() =>
              confirmDeleteResource(item)
            }
          />
        </View>
      </Card>
    );
  }

  function renderItems() {
    if (loading) {
      return (
        <Card style={styles.loadingCard}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Loading{" "}
            {currentLevel.plural.toLowerCase()}
            …
          </Text>
        </Card>
      );
    }

    if (!items.length) {
      return renderEmptyState();
    }

    return (
      <View style={styles.itemList}>
        {level === "resources"
          ? items.map(renderResourceItem)
          : items.map(renderHierarchyItem)}
      </View>
    );
  }

  function renderResourceCreateCard(type) {
    const isMaterial =
      type === "material";

    const title =
      isMaterial
        ? materialTitle
        : videoTitle;

    const setTitle =
      isMaterial
        ? setMaterialTitle
        : setVideoTitle;

    const sourceType =
      isMaterial
        ? materialSourceType
        : videoSourceType;

    const setSourceType =
      isMaterial
        ? setMaterialSourceType
        : setVideoSourceType;

    const objectKey =
      isMaterial
        ? materialObjectKey
        : videoObjectKey;

    const setObjectKey =
      isMaterial
        ? setMaterialObjectKey
        : setVideoObjectKey;

    const selectedFile =
      isMaterial
        ? materialFile
        : videoFile;

    const setSelectedFile =
      isMaterial
        ? setMaterialFile
        : setVideoFile;

    const busy =
      uploadingType === type;

    const anyBusy =
      Boolean(uploadingType);

    return (
      <Card style={styles.actionCard}>
        <View style={styles.actionHeader}>
          <View
            style={[
              styles.actionIcon,
              !isMaterial &&
                styles.videoActionIcon,
            ]}
          >
            <Ionicons
              name={
                isMaterial
                  ? "document-attach-outline"
                  : "videocam-outline"
              }
              size={22}
              color={
                isMaterial
                  ? colors.primary
                  : colors.warning
              }
            />
          </View>

          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>
              {isMaterial
                ? "Add material"
                : "Add video"}
            </Text>

            <Text style={styles.actionDescription}>
              {isMaterial
                ? "Upload a PDF/image or reference an existing R2 object."
                : "Upload a lesson video or reference an existing R2 object."}
            </Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>
          {isMaterial
            ? "Material title"
            : "Video title"}
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          editable={!anyBusy}
          placeholder={
            isMaterial
              ? "Material title"
              : "Video title"
          }
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <View style={styles.sourceSection}>
          <Text style={styles.sourceSectionLabel}>
            FILE SOURCE
          </Text>

          <ResourceSourceSelector
            value={sourceType}
            onChange={(nextType) => {
              setSourceType(nextType);

              if (nextType === SOURCE_UPLOAD) {
                setObjectKey("");
              }

              if (nextType === SOURCE_R2_EXISTING) {
                setSelectedFile(null);
              }
            }}
            disabled={anyBusy}
          />
        </View>

        {sourceType === SOURCE_R2_EXISTING ? (
          <ExistingR2Field
            value={objectKey}
            onChangeText={setObjectKey}
            disabled={anyBusy}
          />
        ) : (
          <View style={styles.replacementBox}>
            <View style={styles.replacementInfo}>
              <Ionicons
                name={
                  selectedFile
                    ? "checkmark-circle-outline"
                    : "cloud-upload-outline"
                }
                size={22}
                color={colors.primary}
              />

              <View style={styles.replacementCopy}>
                <Text style={styles.replacementTitle}>
                  {selectedFile
                    ? selectedFile.name
                    : isMaterial
                      ? "No material file selected"
                      : "No video file selected"}
                </Text>

                <Text style={styles.replacementDescription}>
                  {selectedFile
                    ? "This file is ready to upload."
                    : isMaterial
                      ? "Choose a PDF or image file from your laptop."
                      : "Choose a video file from your laptop."}
                </Text>
              </View>
            </View>

            <Button
              title={
                selectedFile
                  ? "Choose another file"
                  : isMaterial
                    ? "Choose material from device"
                    : "Choose video from device"
              }
              variant="outline"
              onPress={() =>
                selectCreateResourceFile(type)
              }
              disabled={anyBusy}
            />

            {selectedFile ? (
              <Pressable
                onPress={() =>
                  clearCreateResourceFile(type)
                }
                disabled={anyBusy}
                style={({ pressed }) => [
                  styles.keepCurrentButton,
                  pressed &&
                    !anyBusy &&
                    styles.pressed,
                  anyBusy &&
                    styles.disabledAction,
                ]}
              >
                <Text style={styles.keepCurrentText}>
                  Clear selected file
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}
        {busy &&
          sourceType === SOURCE_UPLOAD &&
          typeof uploadProgress === "number" ? (
            <View style={styles.deviceUploadInfo}>
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color={colors.primary}
              />

              <Text style={styles.deviceUploadInfoText}>
                Uploading directly to R2: {uploadProgress}%
              </Text>
            </View>
          ) : null}
        <Button
          title={
            sourceType === SOURCE_R2_EXISTING
              ? busy
                ? "Checking R2..."
                : "Add existing R2 file"
              : busy
                ? typeof uploadProgress === "number"
                  ? `Uploading ${uploadProgress}%`
                  : "Preparing upload..."
                : isMaterial
                  ? "Upload material"
                  : "Upload video"
          }
          variant="warning"
          loading={busy}
          disabled={
            anyBusy ||
            !title.trim() ||
            (sourceType ===
              SOURCE_R2_EXISTING &&
              !objectKey.trim()) ||
            (sourceType === SOURCE_UPLOAD &&
              !selectedFile)
          }
          onPress={() =>
            uploadResource(type)
          }
        />
      </Card>
    );
  }

  function renderUploadPanel() {
    if (level !== "resources") {
      return null;
    }

    return (
      <>
        {renderResourceCreateCard("material")}
        {renderResourceCreateCard("video")}
      </>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View
          style={[
            styles.header,
            isCompact &&
              styles.headerCompact,
          ]}
        >
          <View style={styles.headerCopy}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowIcon}>
                <Ionicons
                  name="library-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.eyebrow}>
                CONTENT MANAGEMENT
              </Text>
            </View>

            <Text style={styles.pageTitle}>
              Learning content
            </Text>

            <Text style={styles.pageDescription}>
              Choose an academic year, create
              units and chapters for that year,
              then upload or reference materials
              and videos directly inside chapters.
            </Text>
          </View>

          <View style={styles.globalBadge}>
            <Ionicons
              name="globe-outline"
              size={19}
              color={colors.primary}
            />

            <View>
              <Text style={styles.globalBadgeLabel}>
                STRUCTURE
              </Text>

              <Text style={styles.globalBadgeValue}>
                Year-based
              </Text>
            </View>
          </View>
        </View>

        {error ? (
          <View
            style={[
              styles.message,
              styles.errorMessage,
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color={colors.danger}
            />

            <Text
              style={[
                styles.messageText,
                styles.errorText,
              ]}
            >
              {error}
            </Text>

            <Pressable
              onPress={() => setError("")}
              style={styles.closeMessage}
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
            style={[
              styles.message,
              styles.successMessage,
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={21}
              color={colors.primary}
            />

            <Text style={styles.messageText}>
              {success}
            </Text>

            <Pressable
              onPress={() => setSuccess("")}
              style={styles.closeMessage}
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.primary}
              />
            </Pressable>
          </View>
        ) : null}

        <Card style={styles.browserCard}>
          {renderBreadcrumbs()}

          <View
            style={[
              styles.browserHeader,
              isCompact &&
                styles.browserHeaderCompact,
            ]}
          >
            <View style={styles.browserHeaderCopy}>
              <Text style={styles.sectionLabel}>
                YEAR CONTENT STRUCTURE
              </Text>

              <Text style={styles.browserTitle}>
                {currentParent?.name ||
                  "Academic Years"}
              </Text>

              <Text style={styles.browserDescription}>
                {currentLevel.description}
              </Text>
            </View>

            {level !== "resources" &&
            level !== "years" ? (
              <Button
                title={`Add ${currentLevel.singular}`}
                variant="warning"
                onPress={openCreateModal}
              />
            ) : null}
          </View>
        </Card>

        <View
          style={[
            styles.mainLayout,
            isDesktop &&
              styles.mainLayoutDesktop,
          ]}
        >
          <View style={styles.contentColumn}>
            <View style={styles.listHeader}>
              <View>
                <Text style={styles.listTitle}>
                  {currentLevel.plural}
                </Text>

                <Text style={styles.listCount}>
                  {items.length}{" "}
                  {items.length === 1
                    ? "item"
                    : "items"}
                </Text>
              </View>

              {!loading ? (
                <Pressable
                  onPress={refreshCurrentLevel}
                  style={({ pressed }) => [
                    styles.refreshButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={19}
                    color={colors.primary}
                  />
                </Pressable>
              ) : null}
            </View>

            {renderItems()}
          </View>

          <View
            style={[
              styles.sideColumn,
              isDesktop &&
                styles.sideColumnDesktop,
            ]}
          >
            {level !== "resources" &&
            level !== "years" ? (
              <Card style={styles.actionCard}>
                <View style={styles.actionHeader}>
                  <View style={styles.actionIcon}>
                    <Ionicons
                      name="add-circle-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.actionCopy}>
                    <Text style={styles.actionTitle}>
                      Add{" "}
                      {currentLevel.singular.toLowerCase()}
                    </Text>

                    <Text style={styles.actionDescription}>
                      Extend the current
                      year-based curriculum
                      hierarchy.
                    </Text>
                  </View>
                </View>

                <Button
                  title={`Add ${currentLevel.singular}`}
                  variant="warning"
                  onPress={openCreateModal}
                />
              </Card>
            ) : null}

            {renderUploadPanel()}

            <Card style={styles.helpCard}>
              <View style={styles.helpIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.helpTitle}>
                Year-based hierarchy
              </Text>

              <Text style={styles.helpText}>
                Units and Chapters belong to the
                selected academic year. All groups
                inside that year can see the same
                resources. Topics are no longer used
                for teacher content uploads.
              </Text>
            </Card>

            {level === "resources" ? (
              <Card style={styles.r2HelpCard}>
                <View style={styles.r2HelpHeader}>
                  <View style={styles.r2HelpIcon}>
                    <Ionicons
                      name="server-outline"
                      size={21}
                      color={colors.primary}
                    />
                  </View>

                  <Text style={styles.r2HelpTitle}>
                    Existing R2 files
                  </Text>
                </View>

                <Text style={styles.r2HelpText}>
                  Upload very large files directly
                  through Cloudflare R2 or direct
                  multipart upload, then copy the
                  object's key here. The platform
                  verifies the object exists and
                  generates temporary signed URLs
                  when students open it.
                </Text>

                <Text style={styles.r2HelpImportant}>
                  Do not paste an expiring signed
                  URL. Paste only the R2 object key.
                </Text>
              </Card>
            ) : null}
          </View>
        </View>
      </View>

      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCreateModal}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalFill}
            onPress={closeCreateModal}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons
                  name="add-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View style={styles.modalHeadingCopy}>
                <Text style={styles.modalTitle}>
                  Add{" "}
                  {currentLevel.singular.toLowerCase()}
                </Text>

                <Text style={styles.modalDescription}>
                  Enter a clear name for the new{" "}
                  {currentLevel.singular.toLowerCase()}.
                </Text>
              </View>

              <Pressable
                onPress={closeCreateModal}
                style={styles.modalClose}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.textPrimary}
                />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>
              {currentLevel.singular} name
            </Text>

            <TextInput
              autoFocus
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder={`Enter ${currentLevel.singular.toLowerCase()} name`}
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={createItem}
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={closeCreateModal}
                disabled={creating}
              />

              <Button
                title={`Create ${currentLevel.singular}`}
                variant="warning"
                onPress={createItem}
                loading={creating}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={hierarchyEditVisible}
        transparent
        animationType="fade"
        onRequestClose={closeHierarchyEdit}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalFill}
            onPress={closeHierarchyEdit}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons
                  name="create-outline"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <View style={styles.modalHeadingCopy}>
                <Text style={styles.modalTitle}>
                  Edit{" "}
                  {currentLevel.singular.toLowerCase()}
                </Text>

                <Text style={styles.modalDescription}>
                  Change the name of this{" "}
                  {currentLevel.singular.toLowerCase()}.
                </Text>
              </View>

              <Pressable
                onPress={closeHierarchyEdit}
                style={styles.modalClose}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.textPrimary}
                />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>
              {currentLevel.singular} name
            </Text>

            <TextInput
              autoFocus
              value={hierarchyEditName}
              onChangeText={setHierarchyEditName}
              placeholder={`Enter ${currentLevel.singular.toLowerCase()} name`}
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={saveHierarchyEdit}
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={closeHierarchyEdit}
                disabled={savingHierarchyEdit}
              />

              <Button
                title="Save changes"
                variant="warning"
                onPress={saveHierarchyEdit}
                loading={savingHierarchyEdit}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeEditResource}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalFill}
            onPress={closeEditResource}
          />

          <View
            style={[
              styles.modalCard,
              styles.resourceEditModalCard,
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.resourceEditScroll
              }
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Ionicons
                    name="create-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.modalHeadingCopy}>
                  <Text style={styles.modalTitle}>
                    Edit resource
                  </Text>

                  <Text style={styles.modalDescription}>
                    Change the title, keep the current
                    file, upload a replacement, or
                    switch to an existing R2 object.
                  </Text>
                </View>

                <Pressable
                  onPress={closeEditResource}
                  style={styles.modalClose}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={colors.textPrimary}
                  />
                </Pressable>
              </View>

              {editingResource ? (
                <View
                  style={styles.currentResourceSummary}
                >
                  <View
                    style={
                      styles.currentResourceSummaryIcon
                    }
                  >
                    <Ionicons
                      name={
                        getResourceType(editingResource) ===
                        "video"
                          ? "videocam-outline"
                          : "document-text-outline"
                      }
                      size={20}
                      color={colors.primary}
                    />
                  </View>

                  <View
                    style={
                      styles.currentResourceSummaryCopy
                    }
                  >
                    <Text
                      style={
                        styles.currentResourceSummaryLabel
                      }
                    >
                      CURRENT SOURCE
                    </Text>

                    <Text
                      style={
                        styles.currentResourceSummaryValue
                      }
                    >
                      {getSourceType(editingResource) ===
                      SOURCE_R2_EXISTING
                        ? "Existing R2 file"
                        : "Platform upload"}
                    </Text>
                  </View>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>
                Resource title
              </Text>

              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                editable={!savingEdit}
                placeholder="Resource title"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <View style={styles.editSourceSection}>
                <Text style={styles.sourceSectionLabel}>
                  FILE ACTION
                </Text>

                <Pressable
                  disabled={savingEdit}
                  onPress={() =>
                    selectEditSourceMode(
                      EDIT_SOURCE_KEEP
                    )
                  }
                  style={({ pressed }) => [
                    styles.editSourceOption,
                    editSourceMode ===
                      EDIT_SOURCE_KEEP &&
                      styles.editSourceOptionActive,
                    pressed &&
                      !savingEdit &&
                      styles.pressed,
                  ]}
                >
                  <View style={styles.editSourceRadio}>
                    {editSourceMode ===
                    EDIT_SOURCE_KEEP ? (
                      <View
                        style={
                          styles.editSourceRadioDot
                        }
                      />
                    ) : null}
                  </View>

                  <View style={styles.editSourceCopy}>
                    <Text style={styles.editSourceTitle}>
                      Keep current file
                    </Text>

                    <Text
                      style={
                        styles.editSourceDescription
                      }
                    >
                      Update the title only.
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  disabled={savingEdit}
                  onPress={() =>
                    selectEditSourceMode(
                      EDIT_SOURCE_UPLOAD
                    )
                  }
                  style={({ pressed }) => [
                    styles.editSourceOption,
                    editSourceMode ===
                      EDIT_SOURCE_UPLOAD &&
                      styles.editSourceOptionActive,
                    pressed &&
                      !savingEdit &&
                      styles.pressed,
                  ]}
                >
                  <View style={styles.editSourceRadio}>
                    {editSourceMode ===
                    EDIT_SOURCE_UPLOAD ? (
                      <View
                        style={
                          styles.editSourceRadioDot
                        }
                      />
                    ) : null}
                  </View>

                  <View style={styles.editSourceCopy}>
                    <Text style={styles.editSourceTitle}>
                      Replace from device
                    </Text>

                    <Text
                      style={
                        styles.editSourceDescription
                      }
                    >
                      Upload a new platform-managed file.
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  disabled={savingEdit}
                  onPress={() =>
                    selectEditSourceMode(
                      EDIT_SOURCE_R2
                    )
                  }
                  style={({ pressed }) => [
                    styles.editSourceOption,
                    editSourceMode ===
                      EDIT_SOURCE_R2 &&
                      styles.editSourceOptionActive,
                    pressed &&
                      !savingEdit &&
                      styles.pressed,
                  ]}
                >
                  <View style={styles.editSourceRadio}>
                    {editSourceMode ===
                    EDIT_SOURCE_R2 ? (
                      <View
                        style={
                          styles.editSourceRadioDot
                        }
                      />
                    ) : null}
                  </View>

                  <View style={styles.editSourceCopy}>
                    <Text style={styles.editSourceTitle}>
                      Existing R2 file
                    </Text>

                    <Text
                      style={
                        styles.editSourceDescription
                      }
                    >
                      Replace the reference with an
                      object already stored in R2.
                    </Text>
                  </View>
                </Pressable>
              </View>

              {editSourceMode === EDIT_SOURCE_UPLOAD ? (
                <View style={styles.replacementBox}>
                  <View style={styles.replacementInfo}>
                    <Ionicons
                      name={
                        replacementFile
                          ? "checkmark-circle-outline"
                          : "attach-outline"
                      }
                      size={22}
                      color={colors.primary}
                    />

                    <View style={styles.replacementCopy}>
                      <Text
                        style={styles.replacementTitle}
                      >
                        {replacementFile
                          ? replacementFile.name
                          : "No replacement selected"}
                      </Text>

                      <Text
                        style={
                          styles.replacementDescription
                        }
                      >
                        {replacementFile
                          ? "This file will replace the existing resource."
                          : "Choose the replacement file before saving."}
                      </Text>
                    </View>
                  </View>

                  <Button
                    title={
                      replacementFile
                        ? "Choose another"
                        : "Choose file"
                    }
                    variant="outline"
                    onPress={selectReplacementFile}
                    disabled={savingEdit}
                  />

                  {replacementFile ? (
                    <Pressable
                      onPress={() =>
                        setReplacementFile(null)
                      }
                      style={styles.keepCurrentButton}
                    >
                      <Text style={styles.keepCurrentText}>
                        Clear selected file
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {editSourceMode === EDIT_SOURCE_R2 ? (
                <ExistingR2Field
                  value={editObjectKey}
                  onChangeText={setEditObjectKey}
                  disabled={savingEdit}
                />
              ) : null}

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={closeEditResource}
                  disabled={savingEdit}
                />

                <Button
                  title="Save changes"
                  variant="warning"
                  onPress={saveResource}
                  loading={savingEdit}
                  disabled={
                    savingEdit ||
                    !editTitle.trim() ||
                    (editSourceMode ===
                      EDIT_SOURCE_UPLOAD &&
                      !replacementFile) ||
                    (editSourceMode === EDIT_SOURCE_R2 &&
                      !editObjectKey.trim())
                  }
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}