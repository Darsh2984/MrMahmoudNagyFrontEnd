import {
  Platform,
  StyleSheet,
} from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../theme";

export const styles =
  StyleSheet.create({
    previewContainer: {
      width: "100%",
      overflow: "hidden",
      position: "relative",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor:
        colors.background,
    },

    image: {
      width: "100%",
      backgroundColor:
        colors.background,
    },

    webView: {
      flex: 1,
      width: "100%",
      backgroundColor:
        colors.background,
    },

    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor:
        colors.background,
    },

    nativeLoading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor:
        colors.background,
    },

    loadingText: {
      ...typography.body,
      color: colors.textMuted,
    },

    emptyPreview: {
      minHeight: 220,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      padding: spacing.lg,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor:
        colors.background,
    },

    emptyPreviewCompact: {
      minHeight: 150,
    },

    emptyTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.textPrimary,
      textAlign: "center",
    },

    emptyText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 360,
    },

    openButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: spacing.xs,
      paddingVertical: 9,
      paddingHorizontal:
        spacing.md,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
      ...Platform.select({
        web: {
          cursor: "pointer",
        },
      }),
    },

    openButtonText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.primary,
    },

    pressed: {
      opacity: 0.7,
    },
  });