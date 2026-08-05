import { StyleSheet } from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../../src/theme";

export const styles =
  StyleSheet.create({
    container: {
      width: "100%",
      gap: spacing.lg,
    },

    loadingCard: {
      minHeight: 260,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
    },

    loadingText: {
      ...typography.body,
      color: colors.textMuted,
    },

    errorCard: {
      width: "100%",
      maxWidth: 520,
      alignSelf: "center",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.xl,
    },

    errorIcon: {
      width: 66,
      height: 66,
      borderRadius: 33,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.danger}12`,
    },

    errorTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      textAlign: "center",
    },

    errorDescription: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
    },

    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.danger}45`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.danger}12`,
    },

    errorBannerText: {
      flex: 1,
      color: colors.danger,
    },

    closeError: {
      padding: 4,
    },

    resultHeaderCard: {
      gap: spacing.lg,
    },

    resultHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    resultIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.secondary}18`,
    },

    pendingResultIcon: {
      backgroundColor:
        `${colors.warning}16`,
    },

    resultHeaderCopy: {
      flex: 1,
      minWidth: 220,
    },

    eyebrow: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "800",
      letterSpacing: 1.1,
      marginBottom: spacing.xs,
    },

    resultTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },

    resultDescription: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 22,
    },

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    summaryItem: {
      flexGrow: 1,
      minWidth: 150,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    summaryLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: "700",
      marginBottom: 5,
    },

    summaryValue: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    section: {
      gap: spacing.md,
    },

    sectionHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    sectionTitle: {
      ...typography.h2,
      color: colors.textPrimary,
    },

    sectionDescription: {
      ...typography.body,
      color: colors.textMuted,
      marginTop: 4,
      lineHeight: 21,
    },

    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },

    questionCard: {
      gap: spacing.md,
    },

    questionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    questionNumber: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primary,
    },

    questionNumberText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.white,
    },

    questionCopy: {
      flex: 1,
      minWidth: 0,
    },

    questionTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    questionReference: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 3,
    },

    questionMarks: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "700",
      marginTop: 4,
    },

    answerGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    answerBox: {
      flexGrow: 1,
      minWidth: 150,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    answerBoxSuccess: {
      borderColor:
        `${colors.secondary}75`,
      backgroundColor:
        `${colors.secondary}16`,
    },

    answerBoxDanger: {
      borderColor:
        `${colors.danger}60`,
      backgroundColor:
        `${colors.danger}10`,
    },

    answerLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: "700",
    },

    answerValue: {
      marginTop: 6,
      fontSize: 20,
      fontWeight: "900",
      color: colors.textPrimary,
    },

    pendingCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderColor:
        `${colors.warning}55`,
      backgroundColor:
        `${colors.warning}10`,
    },

    pendingIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.white,
    },

    pendingCopy: {
      flex: 1,
    },

    pendingTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 4,
    },

    pendingDescription: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 21,
    },

    commentsCard: {
      gap: spacing.sm,
    },

    commentsHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    commentsTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    commentsText: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: 23,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    fileSection: {
      gap: spacing.md,
    },

    correctedFileSection: {
      borderColor:
        `${colors.secondary}70`,
      backgroundColor:
        `${colors.secondary}08`,
    },

    fileSectionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    fileSectionIcon: {
      width: 46,
      height: 46,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.primary}10`,
    },

    correctedFileIcon: {
      backgroundColor:
        `${colors.secondary}18`,
    },

    fileSectionCopy: {
      flex: 1,
    },

    fileSectionTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 4,
    },

    fileSectionDescription: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 21,
    },

    fileList: {
      gap: spacing.sm,
    },

    fileRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },

    fileIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.background,
    },

    fileCopy: {
      flex: 1,
      minWidth: 160,
    },

    fileName: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    fileMeta: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 3,
    },

    emptyFiles: {
      minHeight: 110,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    emptyFilesText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
    },

    privateNotice: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.primary}30`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}07`,
    },

    privateNoticeText: {
      flex: 1,
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 21,
    },

    backButton: {
      alignSelf: "stretch",
    },
  });