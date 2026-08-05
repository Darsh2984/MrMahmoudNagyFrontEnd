import {
  Platform,
  StyleSheet,
} from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

export const styles =
  StyleSheet.create({
    screenContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingVertical: spacing.xl,
      backgroundColor:
        colors.background,
    },

    keyboardView: {
      width: "100%",
    },

    page: {
      width: "100%",
      maxWidth: 520,
      alignSelf: "center",
      gap: spacing.lg,
    },

    brand: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    brandIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primary,
    },

    brandName: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    card: {
      gap: spacing.lg,
      padding: spacing.xl,
    },

    header: {
      alignItems: "center",
    },

    headerIcon: {
      width: 62,
      height: 62,
      borderRadius: 31,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
      backgroundColor:
        `${colors.primary}12`,
    },

    eyebrow: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "800",
      letterSpacing: 1.1,
      marginBottom: spacing.sm,
    },

    title: {
      ...typography.h1,
      textAlign: "center",
      color: colors.textPrimary,
    },

    subtitle: {
      ...typography.body,
      maxWidth: 410,
      marginTop: spacing.sm,
      textAlign: "center",
      lineHeight: 22,
      color: colors.textMuted,
    },

    fieldGroup: {
      gap: spacing.xs,
    },

    fieldLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    submitButton: {
      minHeight: 48,
    },

    errorAlert: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.danger}45`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.danger}10`,
    },

    errorText: {
      flex: 1,
      ...typography.body,
      color: colors.danger,
      lineHeight: 20,
    },

    dismissButton: {
      padding: 2,
    },

    successAlert: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.secondary}55`,
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.secondary}10`,
    },

    successIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.white,
    },

    successCopy: {
      flex: 1,
    },

    successTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 5,
    },

    successText: {
      ...typography.body,
      lineHeight: 21,
      color: colors.textPrimary,
    },

    successHint: {
      ...typography.caption,
      marginTop: spacing.sm,
      lineHeight: 18,
      color: colors.textMuted,
    },

    footer: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    footerText: {
      ...typography.body,
      color: colors.textMuted,
    },

    loginLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 4,
      ...Platform.select({
        web: {
          cursor: "pointer",
        },
      }),
    },

    loginLinkText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.primary,
    },

    securityNote: {
      ...typography.caption,
      textAlign: "center",
      lineHeight: 18,
      color: colors.textMuted,
    },

    pressed: {
      opacity: 0.7,
    },
  });