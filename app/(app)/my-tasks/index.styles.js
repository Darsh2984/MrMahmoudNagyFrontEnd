import { StyleSheet } from "react-native";

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

    pageHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },

    pageHeaderText: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 320,
      maxWidth: 760,
    },

    eyebrow: {
      ...typography.caption,
      color: colors.secondary,
      fontWeight: "800",
      letterSpacing: 1.2,
      marginBottom: spacing.xs,
    },

    pageTitle: {
      ...typography.h1,
      color: colors.primary,
      marginBottom: spacing.xs,
    },

    pageSubtitle: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 22,
    },

    groupCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.lg,
      padding: spacing.md,
    },

    groupIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.secondary}25`,
    },

    groupInfo: {
      flex: 1,
      minWidth: 0,
    },

    groupLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },

    groupName: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginTop: 2,
    },

    groupYear: {
      ...typography.caption,
      color: colors.primary,
      marginTop: 2,
    },

    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },

    summaryCard: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 180,
      minWidth: 160,
    },

    summaryIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      marginBottom: spacing.md,
    },

    summaryValue: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    summaryLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 3,
    },

    sectionHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    sectionTitle: {
      ...typography.h2,
      color: colors.textPrimary,
    },

    sectionSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 3,
    },

    taskCount: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
    },

    taskList: {
      gap: spacing.md,
    },

    taskCard: {
      padding: spacing.lg,
    },

    taskCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },

    taskIcon: {
      width: 46,
      height: 46,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.primary}12`,
    },

    taskIconDanger: {
      backgroundColor:
        `${colors.danger}12`,
    },

    taskIconWarning: {
      backgroundColor:
        `${colors.warning}12`,
    },

    taskIconSuccess: {
      backgroundColor:
        `${colors.secondary}18`,
    },

    taskIconInfo: {
      backgroundColor:
        `${colors.primary}12`,
    },

    taskMainInfo: {
      flex: 1,
      minWidth: 0,
    },

    taskTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    taskDescription: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 4,
    },

    submissionStatusBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderRadius: radius.md,
    },

    submissionStatusBoxSubmitted: {
      borderColor:
        `${colors.secondary}50`,
      backgroundColor:
        `${colors.secondary}10`,
    },

    submissionStatusBoxPending: {
      borderColor:
        `${colors.warning}50`,
      backgroundColor:
        `${colors.warning}0D`,
    },

    submissionStatusIcon: {
      width: 40,
      height: 40,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
    },

    submissionStatusIconSubmitted: {
      backgroundColor:
        `${colors.secondary}18`,
    },

    submissionStatusIconPending: {
      backgroundColor:
        `${colors.warning}18`,
    },

    submissionStatusCopy: {
      flex: 1,
      minWidth: 0,
    },

    submissionStatusTitle: {
      fontSize: 13,
      fontWeight: "800",
    },

    submissionStatusTitleSubmitted: {
      color: colors.secondary,
    },

    submissionStatusTitlePending: {
      color: colors.warning,
    },

    submissionStatusText: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 3,
    },

    taskDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },

    taskMetaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    taskMetaItem: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 190,
      minWidth: 170,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    taskMetaIcon: {
      width: 36,
      height: 36,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 18,
      backgroundColor: colors.white,
    },

    taskMetaText: {
      flex: 1,
      minWidth: 0,
    },

    taskMetaLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },

    taskMetaValue: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 2,
    },

    taskMetaValueDanger: {
      color: colors.danger,
    },

    submissionDetails: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginTop: spacing.md,
    },

    submissionDetailItem: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 220,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    submissionDetailLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },

    submissionDetailValue: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 2,
    },

    gradePreview: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.secondary}16`,
    },

    gradePreviewLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },

    gradePreviewText: {
      ...typography.h3,
      color: colors.secondary,
      marginTop: 2,
    },

    taskFooter: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    taskFooterText: {
      ...typography.caption,
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 240,
      color: colors.textMuted,
      lineHeight: 18,
    },

    openTaskAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },

    openTaskActionText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
    },

    emptyCard: {
      minHeight: 260,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    emptyIcon: {
      width: 68,
      height: 68,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 34,
      backgroundColor:
        `${colors.secondary}22`,
      marginBottom: spacing.md,
    },

    emptyTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      textAlign: "center",
    },

    emptyDescription: {
      ...typography.body,
      maxWidth: 460,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginTop: spacing.xs,
    },

    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor:
        `${colors.danger}55`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.danger}0D`,
    },

    errorIndicator: {
      alignSelf: "stretch",
      width: 4,
      backgroundColor:
        colors.danger,
    },

    errorContent: {
      flex: 1,
      padding: spacing.sm,
    },

    errorTitle: {
      ...typography.bodyBold,
      color: colors.danger,
      marginBottom: 2,
    },

    errorMessage: {
      ...typography.caption,
      color: colors.danger,
      lineHeight: 18,
    },

    errorAction: {
      minHeight: 40,
      justifyContent: "center",
      paddingHorizontal:
        spacing.sm,
    },

    errorActionText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.danger,
    },

    errorDismiss: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },

    pressedOpacity: {
      opacity: 0.72,
    },
  });