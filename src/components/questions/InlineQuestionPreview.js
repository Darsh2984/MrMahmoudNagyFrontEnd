import React, {
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";
import { styles } from "./InlineQuestionPreview.styles";

function getFileExtension(url) {
  if (!url) {
    return "";
  }

  const cleanUrl = String(url)
    .split("?")[0]
    .split("#")[0];

  const parts = cleanUrl.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts[parts.length - 1]
    .toLowerCase();
}

function isImageFile({
  url,
  contentType,
}) {
  const normalizedType = String(
    contentType || "",
  ).toLowerCase();

  if (
    normalizedType.startsWith(
      "image/",
    )
  ) {
    return true;
  }

  return [
    "png",
    "jpg",
    "jpeg",
    "webp",
    "gif",
  ].includes(getFileExtension(url));
}

function isPdfFile({
  url,
  contentType,
}) {
  const normalizedType = String(
    contentType || "",
  ).toLowerCase();

  if (
    normalizedType.includes("pdf")
  ) {
    return true;
  }

  return (
    getFileExtension(url) === "pdf"
  );
}

function InlineQuestionPreview({
  url,
  contentType,
  title = "Question preview",
  height = 420,
  compact = false,
}) {
  const [loading, setLoading] =
    useState(true);

  const [failed, setFailed] =
    useState(false);

  const previewHeight = compact
    ? Math.min(height, 320)
    : height;

  const imageFile = useMemo(
    () =>
      isImageFile({
        url,
        contentType,
      }),
    [url, contentType],
  );

  const pdfFile = useMemo(
    () =>
      isPdfFile({
        url,
        contentType,
      }),
    [url, contentType],
  );

  async function openExternally() {
    if (!url) {
      return;
    }

    try {
      const supported =
        await Linking.canOpenURL(url);

      if (!supported) {
        throw new Error(
          "This file cannot be opened.",
        );
      }

      await Linking.openURL(url);
    } catch {
      setFailed(true);
    }
  }

  if (!url) {
    return (
      <View
        style={[
          styles.emptyPreview,
          compact &&
            styles.emptyPreviewCompact,
        ]}
      >
        <Ionicons
          name="document-outline"
          size={28}
          color={colors.textMuted}
        />

        <Text
          style={styles.emptyTitle}
        >
          No question file
        </Text>

        <Text
          style={styles.emptyText}
        >
          No preview file is available
          for this question.
        </Text>
      </View>
    );
  }

  if (failed) {
    return (
      <View
        style={[
          styles.emptyPreview,
          compact &&
            styles.emptyPreviewCompact,
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={28}
          color={colors.danger}
        />

        <Text
          style={styles.emptyTitle}
        >
          Preview unavailable
        </Text>

        <Text
          style={styles.emptyText}
        >
          The file could not be shown
          inside the page.
        </Text>

        <Pressable
          onPress={openExternally}
          style={({ pressed }) => [
            styles.openButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="open-outline"
            size={17}
            color={colors.primary}
          />

          <Text
            style={
              styles.openButtonText
            }
          >
            Open file
          </Text>
        </Pressable>
      </View>
    );
  }

  if (imageFile) {
    return (
      <View
        style={[
          styles.previewContainer,
          {
            height: previewHeight,
          },
        ]}
      >
        {loading ? (
          <View
            style={
              styles.loadingOverlay
            }
          >
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading preview…
            </Text>
          </View>
        ) : null}

        <Image
          source={{ uri: url }}
          resizeMode="contain"
          accessibilityLabel={title}
          onLoadStart={() => {
            setLoading(true);
            setFailed(false);
          }}
          onLoadEnd={() =>
            setLoading(false)
          }
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
          style={[
            styles.image,
            {
              height: previewHeight,
            },
          ]}
        />
      </View>
    );
  }

  if (
    pdfFile &&
    Platform.OS === "web"
  ) {
    return (
      <View
        style={[
          styles.previewContainer,
          {
            height: previewHeight,
          },
        ]}
      >
        {loading ? (
          <View
            style={
              styles.loadingOverlay
            }
          >
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading PDF…
            </Text>
          </View>
        ) : null}

        {React.createElement("iframe", {
          title,
          src: `${url}#toolbar=0&navpanes=0&scrollbar=1`,
          onLoad: () =>
            setLoading(false),
          onError: () => {
            setLoading(false);
            setFailed(true);
          },
          style: {
            width: "100%",
            height: "100%",
            border: "none",
            backgroundColor:
              colors.background,
          },
        })}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.emptyPreview,
        compact &&
          styles.emptyPreviewCompact,
      ]}
    >
      <Ionicons
        name={
          pdfFile
            ? "document-text-outline"
            : "document-attach-outline"
        }
        size={30}
        color={colors.primary}
      />

      <Text
        style={styles.emptyTitle}
      >
        {pdfFile
          ? "PDF question"
          : "Question file"}
      </Text>

      <Text
        style={styles.emptyText}
      >
        {Platform.OS === "web"
          ? "This file type cannot be displayed directly."
          : "Tap below to open the question file."}
      </Text>

      <Pressable
        onPress={openExternally}
        style={({ pressed }) => [
          styles.openButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="open-outline"
          size={17}
          color={colors.primary}
        />

        <Text
          style={
            styles.openButtonText
          }
        >
          Open question
        </Text>
      </Pressable>
    </View>
  );
}

export {
  InlineQuestionPreview,
};

export default InlineQuestionPreview;