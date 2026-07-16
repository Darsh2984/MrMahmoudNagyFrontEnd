import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import * as DocumentPicker from "expo-document-picker";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import api from "../../src/lib/api";
import { colors, radius, spacing, typography } from "../../src/theme";

const LEVEL_META = {
  units: {
    singular: "Unit",
    plural: "Units",
    icon: "albums-outline",
    description: "Organise the selected academic year into teaching units.",
  },
  chapters: {
    singular: "Chapter",
    plural: "Chapters",
    icon: "book-outline",
    description: "Break this unit into clear chapters.",
  },
  topics: {
    singular: "Topic",
    plural: "Topics",
    icon: "bookmark-outline",
    description: "Create the topics students will browse inside this chapter.",
  },
  resources: {
    singular: "Resource",
    plural: "Resources",
    icon: "folder-open-outline",
    description: "Upload learning materials and videos for this topic.",
  },
};

function getApiError(error, fallback) {
  return error?.response?.data?.msg || error?.response?.data?.message || fallback;
}

export default function Content() {
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  const isCompact = width < 620;

  const [years, setYears] = useState([]);
  const [yearId, setYearId] = useState(null);

  const [level, setLevel] = useState("units");
  const [crumbs, setCrumbs] = useState([]);
  const [items, setItems] = useState([]);

  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadingKind, setUploadingKind] = useState(null);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newName, setNewName] = useState("");

  const [materialTitle, setMaterialTitle] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedYear = useMemo(
    () => years.find((year) => year.id === yearId) || null,
    [years, yearId],
  );

  const meta = LEVEL_META[level];

  const currentParentId = useCallback(() => {
    return crumbs.length ? crumbs[crumbs.length - 1].id : null;
  }, [crumbs]);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const loadYears = useCallback(async () => {
    setLoadingYears(true);
    setError("");

    try {
      const response = await api.get("/years/mine");
      const loadedYears = Array.isArray(response.data) ? response.data : [];

      setYears(loadedYears);
      setYearId((current) => {
        if (current && loadedYears.some((year) => year.id === current)) {
          return current;
        }

        return loadedYears[0]?.id || null;
      });
    } catch (requestError) {
      setError(getApiError(requestError, "Couldn't load academic years."));
    } finally {
      setLoadingYears(false);
    }
  }, []);

  const loadUnits = useCallback(async (selectedYearId) => {
    if (!selectedYearId) {
      setItems([]);
      setLevel("units");
      setCrumbs([]);
      return;
    }

    setLoadingContent(true);
    setError("");

    try {
      const response = await api.get(`/units/year/${selectedYearId}`);
      setItems(Array.isArray(response.data) ? response.data : []);
      setLevel("units");
      setCrumbs([]);
    } catch (requestError) {
      setError(getApiError(requestError, "Couldn't load units."));
    } finally {
      setLoadingContent(false);
    }
  }, []);

  const loadChapters = useCallback(async (unit, nextCrumbs = null) => {
    setLoadingContent(true);
    setError("");

    try {
      const response = await api.get(`/units/${unit.id}`);
      setItems(Array.isArray(response.data?.chapters) ? response.data.chapters : []);
      setLevel("chapters");
      setCrumbs(
        nextCrumbs || [{ label: unit.name, id: unit.id, kind: "unit" }],
      );
    } catch (requestError) {
      setError(getApiError(requestError, "Couldn't load chapters."));
    } finally {
      setLoadingContent(false);
    }
  }, []);

  const loadTopics = useCallback(async (chapter, nextCrumbs) => {
    setLoadingContent(true);
    setError("");

    try {
      const response = await api.get(`/chapters/${chapter.id}`);
      setItems(Array.isArray(response.data?.topics) ? response.data.topics : []);
      setLevel("topics");
      setCrumbs(nextCrumbs);
    } catch (requestError) {
      setError(getApiError(requestError, "Couldn't load topics."));
    } finally {
      setLoadingContent(false);
    }
  }, []);

  const loadResources = useCallback(async (topic, nextCrumbs) => {
    setLoadingContent(true);
    setError("");

    try {
      const response = await api.get(`/topics/${topic.id}`);

      const materials = Array.isArray(response.data?.materials)
        ? response.data.materials.map((item) => ({ ...item, kind: "material" }))
        : [];

      const videos = Array.isArray(response.data?.videos)
        ? response.data.videos.map((item) => ({ ...item, kind: "video" }))
        : [];

      setItems([...materials, ...videos]);
      setLevel("resources");
      setCrumbs(nextCrumbs);
    } catch (requestError) {
      setError(getApiError(requestError, "Couldn't load topic resources."));
    } finally {
      setLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  useEffect(() => {
    if (yearId) {
      loadUnits(yearId);
    }
  }, [yearId, loadUnits]);

  function handleYearChange(nextYearId) {
    if (nextYearId === yearId) return;

    clearMessages();
    setYearId(nextYearId);
  }

  function handleOpenItem(item) {
    clearMessages();

    if (level === "units") {
      loadChapters(item);
      return;
    }

    if (level === "chapters") {
      loadTopics(item, [
        crumbs[0],
        { label: item.name, id: item.id, kind: "chapter" },
      ]);
      return;
    }

    if (level === "topics") {
      loadResources(item, [
        ...crumbs.slice(0, 2),
        { label: item.name, id: item.id, kind: "topic" },
      ]);
    }
  }

  function navigateToRoot() {
    clearMessages();
    loadUnits(yearId);
  }

  function navigateToCrumb(index) {
    clearMessages();

    const target = crumbs[index];

    if (!target) return;

    if (target.kind === "unit") {
      loadChapters(
        { id: target.id, name: target.label },
        [target],
      );
      return;
    }

    if (target.kind === "chapter") {
      loadTopics(
        { id: target.id, name: target.label },
        crumbs.slice(0, index + 1),
      );
      return;
    }

    if (target.kind === "topic") {
      loadResources(
        { id: target.id, name: target.label },
        crumbs.slice(0, index + 1),
      );
    }
  }

  function openCreateModal() {
    clearMessages();
    setNewName("");
    setCreateModalVisible(true);
  }

  function closeCreateModal() {
    if (creating) return;
    setCreateModalVisible(false);
    setNewName("");
  }

  async function handleCreate() {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      setError(`Enter a ${meta.singular.toLowerCase()} name.`);
      return;
    }

    setCreating(true);
    setError("");

    try {
      if (level === "units") {
        await api.post("/units", {
          name: trimmedName,
          yearId,
        });

        await loadUnits(yearId);
      } else if (level === "chapters") {
        const unit = crumbs[0];

        await api.post("/chapters", {
          name: trimmedName,
          unitId: currentParentId(),
        });

        await loadChapters(
          { id: unit.id, name: unit.label },
          [unit],
        );
      } else if (level === "topics") {
        const chapter = crumbs[1];

        await api.post("/topics", {
          name: trimmedName,
          chapterId: currentParentId(),
        });

        await loadTopics(
          { id: chapter.id, name: chapter.label },
          crumbs.slice(0, 2),
        );
      }

      setCreateModalVisible(false);
      setNewName("");
      setSuccess(`${meta.singular} created successfully.`);
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          `Couldn't create the ${meta.singular.toLowerCase()}.`,
        ),
      );
    } finally {
      setCreating(false);
    }
  }

  async function appendPickedFile(formData, file) {
    if (Platform.OS === "web") {
      const response = await fetch(file.uri);
      const blob = await response.blob();
      formData.append("file", blob, file.name);
      return;
    }

    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream",
    });
  }

  async function uploadFile(kind) {
    const title = kind === "material" ? materialTitle : videoTitle;
    const trimmedTitle = title.trim();

    clearMessages();

    if (!trimmedTitle) {
      setError(`Enter a title for the ${kind} first.`);
      return;
    }

    try {
      const pickerType =
        kind === "material"
          ? ["application/pdf", "image/*"]
          : ["video/*"];

      const result = await DocumentPicker.getDocumentAsync({
        type: pickerType,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      const formData = new FormData();

      formData.append("title", trimmedTitle);
      formData.append("topicId", currentParentId());
      await appendPickedFile(formData, file);

      setUploadingKind(kind);

      await api.post(`/resources/${kind}`, formData);

      if (kind === "material") {
        setMaterialTitle("");
      } else {
        setVideoTitle("");
      }

      const topic = crumbs[crumbs.length - 1];

      await loadResources(
        { id: topic.id, name: topic.label },
        crumbs,
      );

      setSuccess(
        `${kind === "material" ? "Material" : "Video"} uploaded successfully.`,
      );
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          `Couldn't upload the ${kind}. Confirm that Google Cloud Storage is configured.`,
        ),
      );
    } finally {
      setUploadingKind(null);
    }
  }

  function renderYearSelector() {
    if (!years.length) {
      return (
        <Card style={styles.emptyYearsCard}>
          <Ionicons
            name="calendar-clear-outline"
            size={24}
            color={colors.textMuted}
          />
          <View style={styles.emptyYearsText}>
            <Text style={styles.emptyYearsTitle}>No academic years found</Text>
            <Text style={styles.mutedText}>
              Create an academic year before organising content.
            </Text>
          </View>
        </Card>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.yearList}
      >
        {years.map((year) => {
          const active = year.id === yearId;

          return (
            <Pressable
              key={year.id}
              onPress={() => handleYearChange(year.id)}
              style={({ pressed }) => [
                styles.yearChip,
                active && styles.yearChipActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={active ? "school" : "school-outline"}
                size={16}
                color={active ? colors.white : colors.primary}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.yearChipText,
                  active && styles.yearChipTextActive,
                ]}
              >
                {year.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
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
          onPress={navigateToRoot}
          style={({ pressed }) => [
            styles.breadcrumbButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="home-outline" size={15} color={colors.primary} />
          <Text style={styles.breadcrumbLink}>Units</Text>
        </Pressable>

        {crumbs.map((crumb, index) => (
          <React.Fragment key={`${crumb.kind}-${crumb.id}`}>
            <Ionicons
              name="chevron-forward"
              size={15}
              color={colors.textMuted}
            />

            <Pressable
              onPress={() => navigateToCrumb(index)}
              style={({ pressed }) => [
                styles.breadcrumbButton,
                pressed && styles.pressed,
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.breadcrumbLink,
                  index === crumbs.length - 1 && styles.breadcrumbCurrent,
                ]}
              >
                {crumb.label}
              </Text>
            </Pressable>
          </React.Fragment>
        ))}
      </ScrollView>
    );
  }

  function renderCreatePanel() {
    if (level === "resources") return null;

    return (
      <Card style={styles.actionCard}>
        <View style={styles.actionCardHeader}>
          <View style={styles.actionIcon}>
            <Ionicons
              name="add-circle-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.actionTextBlock}>
            <Text style={styles.actionTitle}>
              Add a new {meta.singular.toLowerCase()}
            </Text>
            <Text style={styles.mutedText}>
              Keep the learning structure clear and easy for students to browse.
            </Text>
          </View>
        </View>

        <Button
          title={`Add ${meta.singular}`}
          variant="warning"
          onPress={openCreateModal}
        />
      </Card>
    );
  }

  function renderUploadPanel() {
    if (level !== "resources") return null;

    return (
      <Card style={styles.uploadCard}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionHeadingIcon}>
            <Ionicons
              name="cloud-upload-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.sectionHeadingText}>
            <Text style={styles.sectionTitle}>Upload to this topic</Text>
            <Text style={styles.mutedText}>
              Add study material or a teaching video for students.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.uploadForms,
            isWide && styles.uploadFormsWide,
          ]}
        >
          <View style={styles.uploadBox}>
            <View style={styles.uploadBoxHeading}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.uploadBoxTitle}>Material</Text>
            </View>

            <Text style={styles.uploadHint}>PDF or image file</Text>

            <TextInput
              value={materialTitle}
              onChangeText={setMaterialTitle}
              placeholder="Material title"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <Button
              title="Choose and upload"
              variant="secondary"
              onPress={() => uploadFile("material")}
              loading={uploadingKind === "material"}
              disabled={Boolean(uploadingKind)}
            />
          </View>

          <View style={styles.uploadBox}>
            <View style={styles.uploadBoxHeading}>
              <Ionicons
                name="videocam-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.uploadBoxTitle}>Video</Text>
            </View>

            <Text style={styles.uploadHint}>Video file</Text>

            <TextInput
              value={videoTitle}
              onChangeText={setVideoTitle}
              placeholder="Video title"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <Button
              title="Choose and upload"
              variant="secondary"
              onPress={() => uploadFile("video")}
              loading={uploadingKind === "video"}
              disabled={Boolean(uploadingKind)}
            />
          </View>
        </View>
      </Card>
    );
  }

  function renderItem(item) {
    const isResource = level === "resources";
    const isVideo = item.kind === "video";

    const iconName = isResource
      ? isVideo
        ? "play-circle-outline"
        : "document-text-outline"
      : level === "units"
        ? "albums-outline"
        : level === "chapters"
          ? "book-outline"
          : "bookmark-outline";

    const itemType = isResource
      ? isVideo
        ? "Video"
        : "Material"
      : meta.singular;

    return (
      <Pressable
        key={item.id}
        onPress={() => {
          if (!isResource) handleOpenItem(item);
        }}
        disabled={isResource}
        style={({ pressed }) => [
          styles.itemPressable,
          isWide && styles.itemPressableWide,
          pressed && !isResource && styles.itemPressed,
        ]}
      >
        <Card style={styles.itemCard}>
          <View style={styles.itemTopRow}>
            <View
              style={[
                styles.itemIcon,
                isVideo && styles.videoIcon,
              ]}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isVideo ? colors.warning : colors.primary}
              />
            </View>

            {!isResource ? (
              <View style={styles.openIcon}>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={colors.primary}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.itemTextBlock}>
            <Text numberOfLines={2} style={styles.itemTitle}>
              {item.name || item.title}
            </Text>

            <View style={styles.itemTypeRow}>
              <Text style={styles.itemType}>{itemType}</Text>

              {!isResource ? (
                <Text style={styles.itemInstruction}>Open</Text>
              ) : null}
            </View>
          </View>
        </Card>
      </Pressable>
    );
  }

  function renderContent() {
    if (loadingContent) {
      return (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading {meta.plural.toLowerCase()}…</Text>
        </Card>
      );
    }

    if (!items.length) {
      return (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name={meta.icon}
              size={34}
              color={colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No {meta.plural.toLowerCase()} yet
          </Text>

          <Text style={styles.emptyDescription}>
            {level === "resources"
              ? "Upload the first material or video for this topic."
              : `Add the first ${meta.singular.toLowerCase()} to continue building the content hierarchy.`}
          </Text>

          {level !== "resources" ? (
            <Button
              title={`Add ${meta.singular}`}
              variant="warning"
              onPress={openCreateModal}
            />
          ) : null}
        </Card>
      );
    }

    return (
      <View style={styles.itemGrid}>
        {items.map(renderItem)}
      </View>
    );
  }

  if (loadingYears) {
    return (
      <Screen
        scroll={false}
        style={styles.fullPageLoading}
      >
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading content library…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowIcon}>
                <Ionicons
                  name="library-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.eyebrow}>LEARNING CONTENT</Text>
            </View>

            <Text style={styles.pageTitle}>Content library</Text>

            <Text style={styles.pageSubtitle}>
              Build a clear Unit → Chapter → Topic structure and publish
              learning resources from one place.
            </Text>
          </View>

          <View style={styles.headerStatus}>
            <Text style={styles.headerStatusLabel}>Current level</Text>
            <View style={styles.headerStatusValue}>
              <Ionicons
                name={meta.icon}
                size={16}
                color={colors.primary}
              />
              <Text style={styles.headerStatusText}>{meta.plural}</Text>
            </View>
          </View>
        </View>

        {error ? (
          <View style={[styles.alert, styles.errorAlert]}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />
            <Text style={[styles.alertText, styles.errorText]}>{error}</Text>
            <Pressable
              accessibilityLabel="Dismiss error"
              onPress={() => setError("")}
              style={styles.alertClose}
            >
              <Ionicons name="close" size={18} color={colors.danger} />
            </Pressable>
          </View>
        ) : null}

        {success ? (
          <View style={[styles.alert, styles.successAlert]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.alertText}>{success}</Text>
            <Pressable
              accessibilityLabel="Dismiss success message"
              onPress={() => setSuccess("")}
              style={styles.alertClose}
            >
              <Ionicons name="close" size={18} color={colors.primary} />
            </Pressable>
          </View>
        ) : null}

        <Card style={styles.yearCard}>
          <View style={styles.yearCardHeader}>
            <View>
              <Text style={styles.sectionLabel}>ACADEMIC YEAR</Text>
              <Text style={styles.yearCardTitle}>
                {selectedYear?.name || "Select a year"}
              </Text>
            </View>

            <Ionicons
              name="calendar-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          {renderYearSelector()}
        </Card>

        <Card style={styles.browserCard}>
          {renderBreadcrumbs()}

          <View
            style={[
              styles.browserHeading,
              isCompact && styles.browserHeadingCompact,
            ]}
          >
            <View style={styles.browserHeadingCopy}>
              <Text style={styles.sectionLabel}>
                {selectedYear?.name?.toUpperCase() || "CONTENT"}
              </Text>
              <Text style={styles.browserTitle}>
                {crumbs.length
                  ? crumbs[crumbs.length - 1].label
                  : "Units"}
              </Text>
              <Text style={styles.browserDescription}>{meta.description}</Text>
            </View>

            {level !== "resources" ? (
              <Button
                title={`Add ${meta.singular}`}
                variant="warning"
                onPress={openCreateModal}
              />
            ) : null}
          </View>
        </Card>

        <View
          style={[
            styles.mainLayout,
            isWide && styles.mainLayoutWide,
          ]}
        >
          <View style={styles.contentColumn}>
            <View style={styles.listHeader}>
              <View>
                <Text style={styles.listTitle}>{meta.plural}</Text>
                <Text style={styles.listCount}>
                  {items.length} {items.length === 1 ? "item" : "items"}
                </Text>
              </View>

              {loadingContent ? (
                <ActivityIndicator color={colors.primary} />
              ) : null}
            </View>

            {renderContent()}
          </View>

          <View
            style={[
              styles.actionColumn,
              isWide && styles.actionColumnWide,
            ]}
          >
            {renderCreatePanel()}
            {renderUploadPanel()}

            <Card style={styles.helpCard}>
              <View style={styles.helpIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.helpTitle}>Content structure</Text>
              <Text style={styles.helpText}>
                Students browse resources through Units, Chapters, and Topics.
                Keep names concise so the hierarchy remains easy to scan on
                phones as well as desktop screens.
              </Text>
            </Card>
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
            style={StyleSheet.absoluteFill}
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
                  Add {meta.singular.toLowerCase()}
                </Text>
                <Text style={styles.mutedText}>
                  Enter a clear name that students and assistants can recognise.
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Close"
                onPress={closeCreateModal}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>{meta.singular} name</Text>
            <TextInput
              autoFocus
              value={newName}
              onChangeText={setNewName}
              placeholder={`Enter ${meta.singular.toLowerCase()} name`}
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
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
                title={`Create ${meta.singular}`}
                variant="warning"
                onPress={handleCreate}
                loading={creating}
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

  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },

  headerCopy: {
    flex: 1,
    minWidth: 260,
    maxWidth: 760,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },

  eyebrowIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary + "35",
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.primary,
  },

  pageTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  pageSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 23,
    maxWidth: 700,
  },

  headerStatus: {
    minWidth: 170,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  headerStatusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 5,
  },

  headerStatusValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  headerStatusText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  alert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  errorAlert: {
    borderColor: colors.danger + "55",
    backgroundColor: colors.danger + "12",
  },

  successAlert: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary + "20",
  },

  alertText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },

  errorText: {
    color: colors.danger,
  },

  alertClose: {
    padding: 4,
  },

  yearCard: {
    marginBottom: spacing.md,
  },

  yearCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 4,
  },

  yearCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  yearList: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },

  yearChip: {
    minHeight: 42,
    maxWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  yearChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  yearChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  yearChipTextActive: {
    color: colors.white,
  },

  emptyYearsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
  },

  emptyYearsText: {
    flex: 1,
  },

  emptyYearsTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  browserCard: {
    marginBottom: spacing.lg,
    padding: 0,
    overflow: "hidden",
  },

  breadcrumbs: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  breadcrumbButton: {
    maxWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: spacing.sm,
    paddingHorizontal: 3,
  },

  breadcrumbLink: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  breadcrumbCurrent: {
    color: colors.textPrimary,
    fontWeight: "800",
  },

  browserHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    padding: spacing.lg,
  },

  browserHeadingCompact: {
    alignItems: "stretch",
    flexDirection: "column",
  },

  browserHeadingCopy: {
    flex: 1,
  },

  browserTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 5,
  },

  browserDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 21,
  },

  mainLayout: {
    gap: spacing.lg,
  },

  mainLayoutWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  contentColumn: {
    flex: 1,
    minWidth: 0,
  },

  actionColumn: {
    width: "100%",
    gap: spacing.md,
  },

  actionColumnWide: {
    width: 340,
  },

  listHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  listCount: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  itemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },

  itemPressable: {
    width: "100%",
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },

  itemPressableWide: {
    width: "50%",
  },

  itemPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.992 }],
  },

  itemCard: {
    minHeight: 142,
    justifyContent: "space-between",
  },

  itemTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary + "25",
  },

  videoIcon: {
    backgroundColor: colors.warning + "18",
  },

  openIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  itemTextBlock: {
    gap: spacing.sm,
  },

  itemTitle: {
    minHeight: 44,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  itemTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  itemType: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.textMuted,
  },

  itemInstruction: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  actionCard: {
    gap: spacing.md,
  },

  actionCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary + "25",
  },

  actionTextBlock: {
    flex: 1,
  },

  actionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  mutedText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  uploadCard: {
    gap: spacing.lg,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  sectionHeadingIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary + "25",
  },

  sectionHeadingText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },

  uploadForms: {
    gap: spacing.md,
  },

  uploadFormsWide: {
    flexDirection: "column",
  },

  uploadBox: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  uploadBoxHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  uploadBoxTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  uploadHint: {
    fontSize: 12,
    color: colors.textMuted,
  },

  inputLabel: {
    marginBottom: spacing.xs,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  input: {
    minHeight: 48,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 14,
  },

  helpCard: {
    backgroundColor: colors.secondary + "16",
  },

  helpIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },

  helpTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  helpText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
  },

  loadingCard: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },

  emptyCard: {
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: colors.secondary + "22",
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
    maxWidth: 420,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: spacing.md,
  },

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(20, 28, 30, 0.54)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 520,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    ...Platform.select({
      web: {
        boxShadow: "0 18px 50px rgba(0, 0, 0, 0.18)",
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
    backgroundColor: colors.secondary + "25",
  },

  modalHeadingCopy: {
    flex: 1,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },

  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  pressed: {
    opacity: 0.76,
  },
});