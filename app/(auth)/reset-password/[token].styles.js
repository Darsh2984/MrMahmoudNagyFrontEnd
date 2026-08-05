import {
  Platform,
  StyleSheet,
} from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../src/theme";

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
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
      backgroundColor:
        `${colors.primary}12`,
    },

    eyebrow: {
      ...typography.caption,
      fontWeight: "800",
      letterSpacing: 1.1,
      color: colors.primary,
      marginBottom: spacing.sm,
    },

    title: {
      ...typography.h1,
      textAlign: "center",
      color: colors.textPrimary,
    },

    subtitle: {
      ...typography.body,
      maxWidth: 400,
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

    passwordInputContainer: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },

    passwordInputContainerError: {
      borderColor: colors.danger,
    },

    passwordInput: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.textPrimary,
      fontSize: 14,
      ...Platform.select({
        web: {
          outlineStyle: "none",
        },
      }),
    },

    visibilityButton: {
      width: 48,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        web: {
          cursor: "pointer",
        },
      }),
    },

    fieldError: {
      ...typography.caption,
      color: colors.danger,
    },

    requirements: {
      gap: 6,
      marginTop: -spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    requirementRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },

    requirementText: {
      ...typography.caption,
      color: colors.textMuted,
    },

    requirementPassed: {
      color: colors.secondary,
      fontWeight: "700",
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

    successState: {
      gap: spacing.md,
    },

    successAlert: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.secondary}55`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.secondary}10`,
    },

    successText: {
      flex: 1,
      ...typography.body,
      lineHeight: 22,
      color: colors.textPrimary,
    },

    footer: {
      alignItems: "center",
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    loginLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 5,
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

    invalidCard: {
      width: "100%",
      maxWidth: 500,
      alignSelf: "center",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.xl,
    },

    invalidIcon: {
      width: 66,
      height: 66,
      borderRadius: 33,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.danger}10`,
    },

    invalidTitle: {
      ...typography.h2,
      textAlign: "center",
      color: colors.textPrimary,
    },

    invalidDescription: {
      ...typography.body,
      maxWidth: 390,
      textAlign: "center",
      lineHeight: 22,
      color: colors.textMuted,
    },

    pressed: {
      opacity: 0.7,
    },
  });