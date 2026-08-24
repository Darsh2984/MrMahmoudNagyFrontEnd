import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import {
  VideoView,
  useVideoPlayer,
} from "expo-video";
import { WebView } from "react-native-webview";

import { Screen } from "../../../../src/components/layout/Screen";
import { Card } from "../../../../src/components/ui/Card";
import { Button } from "../../../../src/components/ui/Button";
import api from "../../../../src/lib/api";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../../src/theme";

function getApiError(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    fallback
  );
}

function getViewerType(contentType, kind) {
  const normalized =
    typeof contentType === "string"
      ? contentType.toLowerCase()
      : "";

  if (normalized.startsWith("image/")) {
    return "image";
  }

  if (normalized === "application/pdf") {
    return "pdf";
  }

  if (
    normalized.startsWith("video/") ||
    kind === "video"
  ) {
    return "video";
  }

  return "unsupported";
}

function getProtectedPdfUrl(url) {
  if (!url) return "";

  const separator = url.includes("#") ? "&" : "#";

  return (
    `${url}${separator}` +
    "toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0"
  );
}

export default function ResourceViewer() {
  const router = useRouter();

  const {
    kind,
    resourceId,
  } = useLocalSearchParams();

  const normalizedKind = Array.isArray(kind)
    ? kind[0]
    : kind;

  const normalizedResourceId =
    Array.isArray(resourceId)
      ? resourceId[0]
      : resourceId;

  const [resource, setResource] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadResource = useCallback(async () => {
    if (
      !normalizedKind ||
      !normalizedResourceId
    ) {
      setError(
        "The requested resource is invalid."
      );

      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/resources/view/${normalizedKind}/${normalizedResourceId}`
      );

      setResource(response.data);
    } catch (requestError) {
      setResource(null);

      setError(
        getApiError(
          requestError,
          "Couldn't open this resource."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [
    normalizedKind,
    normalizedResourceId,
  ]);

  useEffect(() => {
    loadResource();
  }, [loadResource]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return undefined;
    }

    function preventProtectedActions(event) {
      const key = event.key?.toLowerCase();

      const isSave =
        (event.ctrlKey || event.metaKey) &&
        key === "s";

      const isPrint =
        (event.ctrlKey || event.metaKey) &&
        key === "p";

      const isViewSource =
        (event.ctrlKey || event.metaKey) &&
        key === "u";

      if (
        isSave ||
        isPrint ||
        isViewSource
      ) {
        event.preventDefault();
      }
    }

    function preventContextMenu(event) {
      event.preventDefault();
    }

    document.addEventListener(
      "keydown",
      preventProtectedActions
    );

    document.addEventListener(
      "contextmenu",
      preventContextMenu
    );

    return () => {
      document.removeEventListener(
        "keydown",
        preventProtectedActions
      );

      document.removeEventListener(
        "contextmenu",
        preventContextMenu
      );
    };
  }, []);

  const viewerType = getViewerType(
    resource?.contentType,
    normalizedKind
  );

  return (
    <>
      <Stack.Screen
        options={{
          title:
            resource?.title ||
            "Resource viewer",
          headerShown: false,
        }}
      />

      <Screen scroll={false}>
        <View style={styles.page}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color={colors.primary}
              />

              <Text
                style={styles.backButtonText}
              >
                Back
              </Text>
            </Pressable>

            <View style={styles.headerText}>
              <Text
                numberOfLines={2}
                style={styles.title}
              >
                {resource?.title ||
                  "Resource viewer"}
              </Text>

              {resource?.originalName ? (
                <Text
                  numberOfLines={1}
                  style={styles.subtitle}
                >
                  {resource.originalName}
                </Text>
              ) : null}
            </View>

            {resource ? (
              <View style={styles.typeBadge}>
                <Text
                  style={styles.typeBadgeText}
                >
                  {viewerType === "pdf"
                    ? "PDF"
                    : viewerType === "image"
                      ? "IMAGE"
                      : viewerType === "video"
                        ? "VIDEO"
                        : "FILE"}
                </Text>
              </View>
            ) : null}
          </View>

          {loading ? (
            <Card style={styles.stateCard}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

              <Text style={styles.stateText}>
                Preparing secure viewer…
              </Text>
            </Card>
          ) : error ? (
            <Card style={styles.stateCard}>
              <View style={styles.errorIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={34}
                  color={colors.danger}
                />
              </View>

              <Text style={styles.errorTitle}>
                Resource unavailable
              </Text>

              <Text style={styles.errorText}>
                {error}
              </Text>

              <View style={styles.stateActions}>
                <Button
                  title="Go back"
                  variant="outline"
                  onPress={() => router.back()}
                />

                <Button
                  title="Try again"
                  onPress={loadResource}
                />
              </View>
            </Card>
          ) : (
            <View style={styles.viewerContainer}>
              <ResourceContent
                type={viewerType}
                resource={resource}
              />
            </View>
          )}
        </View>
      </Screen>
    </>
  );
}

function ResourceContent({
  type,
  resource,
}) {
  if (!resource?.url) {
    return (
      <UnsupportedViewer
        message="This resource does not have a valid viewing URL."
      />
    );
  }

  if (type === "image") {
    return (
      <View
        style={styles.imageViewer}
        onContextMenu={
          Platform.OS === "web"
            ? (event) =>
                event.preventDefault()
            : undefined
        }
      >
        <Image
          source={{
            uri: resource.url,
          }}
          resizeMode="contain"
          style={styles.image}
          draggable={false}
        />

        <View
          pointerEvents="none"
          style={styles.imageProtectionLayer}
        />
      </View>
    );
  }

  if (type === "video") {
    if (Platform.OS === "web") {
      return (
        <View
          style={styles.videoViewer}
          onContextMenu={(event) =>
            event.preventDefault()
          }
        >
          <video
            src={resource.url}
            controls
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            playsInline
            preload="metadata"
            onContextMenu={(event) =>
              event.preventDefault()
            }
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              backgroundColor: "#000000",
            }}
          >
            Your browser does not support
            video playback.
          </video>
        </View>
      );
    }

    return (
      <NativeVideoViewer
        url={resource.url}
      />
    );
  }

  if (type === "pdf") {
    if (Platform.OS === "web") {
      return (
        <View style={styles.webFrameContainer}>
          <iframe
            src={getProtectedPdfUrl(
              resource.url
            )}
            title={resource.title || "PDF"}
            draggable={false}
            onContextMenu={(event) =>
              event.preventDefault()
            }
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "#ffffff",
              userSelect: "none",
            }}
          />
        </View>
      );
    }

    return (
      <WebView
        source={{
          uri: resource.url,
        }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.webViewLoading}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          </View>
        )}
        style={styles.webView}
      />
    );
  }

  return (
    <UnsupportedViewer
      message="This file type cannot currently be displayed inside the platform."
    />
  );
}

function NativeVideoViewer({ url }) {
  const player = useVideoPlayer(url);

  return (
    <View style={styles.videoViewer}>
      <VideoView
        player={player}
        nativeControls
        contentFit="contain"
        style={styles.video}
      />
    </View>
  );
}

function UnsupportedViewer({
  message,
}) {
  return (
    <Card style={styles.stateCard}>
      <Ionicons
        name="document-outline"
        size={38}
        color={colors.textMuted}
      />

      <Text style={styles.errorTitle}>
        Preview unavailable
      </Text>

      <Text style={styles.errorText}>
        {message}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    maxWidth: 1500,
    alignSelf: "center",
  },

  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  backButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },

  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  typeBadge: {
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor:
      colors.secondary + "22",
  },

  typeBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: colors.primary,
  },

  viewerContainer: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },

  imageViewer: {
    flex: 1,
    minHeight: 500,
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.background,
  },

  image: {
    width: "100%",
    height: "100%",
    minHeight: 500,
  },

  videoViewer: {
    flex: 1,
    width: "100%",
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#000000",
  },

  video: {
    width: "100%",
    height: "100%",
    minHeight: 420,
    alignSelf: "center",
  },

  webFrameContainer: {
    flex: 1,
    minHeight: 650,
  },

  webView: {
    flex: 1,
  },

  webViewLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  stateCard: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },

  stateText: {
    ...typography.body,
    color: colors.textMuted,
  },

  errorIcon: {
    marginBottom: spacing.xs,
  },

  errorTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
  },

  errorText: {
    ...typography.body,
    maxWidth: 520,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },

  stateActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  pressed: {
    opacity: 0.7,
  },

  imageProtectionLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
});