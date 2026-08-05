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
    page: {
      width: "100%",
      maxWidth: 1280,
      alignSelf: "center",
      paddingBottom: spacing.xl,
    },

    centeredScreen: {
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    loadingText: {
      ...typography.body,
      color: colors.textMuted,
    },

    backButton: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
    },

    backButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
    },

    heroCard: {
      marginBottom: spacing.lg,
    },

    heroContent: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      gap: spacing.lg,
    },

    heroIcon: {
      width: 58,
      height: 58,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.secondary}25`,
    },

    heroCopy: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 320,
      minWidth: 0,
    },

    eyebrow: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "800",
      letterSpacing: 1.1,
      marginBottom: spacing.xs,
    },

    pageTitle: {
      ...typography.h1,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },

    pageDescription: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 23,
      marginBottom: spacing.md,
    },

    heroBadges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },

    workspace: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      gap: spacing.lg,
    },

    mainColumn: {
      flexGrow: 1.6,
      flexShrink: 1,
      flexBasis: 500,
      minWidth: 300,
    },

    sideColumn: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 360,
      minWidth: 300,
    },

    detailsCard: {
      padding: spacing.lg,
    },

    submissionCard: {
      padding: spacing.lg,
    },

    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },

    cardHeaderIcon: {
      width: 44,
      height: 44,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.secondary}25`,
    },

    cardHeaderCopy: {
      flex: 1,
      minWidth: 0,
    },

    cardTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginBottom: 3,
    },

    cardSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginVertical: spacing.lg,
    },

    detailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    detailItem: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 180,
      minWidth: 160,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    detailIcon: {
      width: 38,
      height: 38,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      backgroundColor:
        colors.white,
    },

    detailCopy: {
      flex: 1,
      minWidth: 0,
    },

    detailLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },

    detailValue: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 2,
    },

    detailValueDanger: {
      color: colors.danger,
    },

    detailValueSuccess: {
      color: colors.secondary,
    },

    sectionLabel: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },

    instructions: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: 23,
    },

    fileCard: {
      minHeight: 74,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.lg,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    fileIcon: {
      width: 44,
      height: 44,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },

    fileInfo: {
      flex: 1,
      minWidth: 0,
    },

    fileTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    fileSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 17,
      marginTop: 2,
    },

    noFileBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.lg,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    noFileText: {
      ...typography.body,
      color: colors.textMuted,
    },

    submissionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },

    submissionIcon: {
      width: 44,
      height: 44,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22,
      backgroundColor:
        `${colors.primary}12`,
    },

    submissionIconDone: {
      backgroundColor:
        colors.secondary,
    },

    submissionHeaderCopy: {
      flex: 1,
      minWidth: 0,
    },

    statusPanel: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderRadius: radius.md,
    },

    statusIcon: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 17,
      backgroundColor:
        colors.white,
    },

    statusCopy: {
      flex: 1,
      minWidth: 0,
    },

    statusLabel: {
      ...typography.bodyBold,
    },

    statusHelper: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 3,
    },

    noticeBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderRadius: radius.md,
    },

    noticeCopy: {
      flex: 1,
      minWidth: 0,
    },

    noticeTitle: {
      ...typography.bodyBold,
    },

    noticeText: {
      ...typography.caption,
      color: colors.textPrimary,
      lineHeight: 18,
      marginTop: 3,
    },

    uploadInfo: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    uploadInfoIcon: {
      width: 38,
      height: 38,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      backgroundColor:
        colors.white,
    },

    uploadInfoCopy: {
      flex: 1,
      minWidth: 0,
    },

    uploadInfoTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    uploadInfoText: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 3,
    },

    submitButton: {
      marginTop: spacing.md,
    },

    uploadNote: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 17,
      marginTop: spacing.sm,
    },

    submissionFilesList: {
      marginBottom: spacing.md,
    },

    fileListHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },

    fileCountText: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.textMuted,
    },

    submittedFile: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    submissionFileOrder: {
      width: 34,
      height: 34,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 17,
      backgroundColor:
        `${colors.primary}12`,
    },

    submissionFileOrderText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
    },

    fileActionButton: {
      width: 38,
      height: 38,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}0D`,
    },

    deleteFileButton: {
      width: 38,
      height: 38,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        `${colors.danger}0D`,
    },

    disabledControl: {
      opacity: 0.5,
    },

    noFilesPanel: {
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    noFilesTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      textAlign: "center",
      marginTop: spacing.sm,
    },

    noFilesText: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: spacing.xs,
    },

    modifySubmissionBox: {
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.primary}30`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}08`,
    },

    modifySubmissionTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    modifySubmissionText: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: spacing.xs,
    },

    maximumFilesText: {
      ...typography.caption,
      color: colors.warning,
      textAlign: "center",
      marginTop: spacing.sm,
    },

    closedPanel: {
      alignItems: "center",
      paddingVertical: spacing.lg,
    },

    closedIcon: {
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 25,
      backgroundColor:
        `${colors.danger}12`,
      marginBottom: spacing.sm,
    },

    closedTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      textAlign: "center",
    },

    closedText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 21,
      marginTop: spacing.xs,
    },

    gradeBox: {
      alignItems: "center",
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    gradeLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },

    gradeValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },

    gradeValue: {
      fontSize: 34,
      fontWeight: "800",
      color: colors.primary,
    },

    gradeMaximum: {
      ...typography.body,
      color: colors.textMuted,
      marginLeft: 4,
    },

    pendingGrade: {
      ...typography.h3,
      color: colors.warning,
    },

    gradeStatus: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 18,
      marginTop: spacing.xs,
    },

    feedbackBox: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.primary}20`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}07`,
    },

    feedbackLabel: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },

    feedbackText: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: 21,
    },

    correctedFile: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor:
        `${colors.secondary}55`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.secondary}10`,
    },

    correctedFileIcon: {
      width: 44,
      height: 44,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },

    refreshingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      marginTop: spacing.md,
    },

    refreshingText: {
      ...typography.caption,
      color: colors.textMuted,
    },

    messageBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      overflow: "hidden",
      marginBottom: spacing.md,
      paddingRight: spacing.xs,
      borderWidth: 1,
      borderRadius: radius.md,
    },

    messageIndicator: {
      alignSelf: "stretch",
      width: 4,
    },

    messageText: {
      ...typography.body,
      flex: 1,
      paddingVertical: spacing.sm,
    },

    messageAction: {
      minHeight: 40,
      justifyContent: "center",
      paddingHorizontal:
        spacing.xs,
    },

    messageActionText: {
      fontSize: 12,
      fontWeight: "800",
    },

    messageClose: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
    },

    notFoundCard: {
      minHeight: 360,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    notFoundIcon: {
      width: 74,
      height: 74,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 37,
      backgroundColor:
        `${colors.danger}12`,
      marginBottom: spacing.md,
    },

    notFoundTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      textAlign: "center",
    },

    notFoundText: {
      ...typography.body,
      maxWidth: 440,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginTop: spacing.sm,
    },

    notFoundActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: spacing.sm,
      marginTop: spacing.lg,
    },

    pressedOpacity: {
      opacity: 0.72,
    },

    ...Platform.select({
      web: {
        detailsCard: {
          padding: spacing.lg,
          boxShadow:
            "0 4px 18px rgba(11, 60, 73, 0.05)",
        },

        submissionCard: {
          padding: spacing.lg,
          boxShadow:
            "0 4px 18px rgba(11, 60, 73, 0.05)",
        },
      },

      default: {},
    }),
  });