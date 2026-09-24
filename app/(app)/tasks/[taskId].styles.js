import {
  Platform,
  StyleSheet,
} from "react-native";

import {
  colors,
  spacing,
  radius,
  typography,
} from "../../../src/theme";

export const styles =
  StyleSheet.create({
    page: {
      width: "100%",
      maxWidth: 1380,
      alignSelf: "center",
      paddingBottom: spacing.xl,
    },

    fullPageLoading: {
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    loadingIcon: {
      width: 64,
      height: 64,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 32,
      marginBottom: spacing.md,
      backgroundColor:
        `${colors.primary}12`,
    },

    loadingTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      textAlign: "center",
      marginTop: spacing.md,
    },

    loadingText: {
      ...typography.body,
      maxWidth: 460,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginTop: spacing.xs,
    },

    pressed: {
      opacity: 0.72,
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

    alert: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderRadius: radius.lg,
    },

    errorAlert: {
      borderColor:
        `${colors.danger}55`,
      backgroundColor:
        `${colors.danger}12`,
    },

    successAlert: {
      borderColor:
        `${colors.secondary}55`,
      backgroundColor:
        `${colors.secondary}12`,
    },

    errorText: {
      flex: 1,
      ...typography.body,
      color: colors.danger,
    },

    successText: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
    },

    alertClose: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },

    heroCard: {
      marginBottom: spacing.lg,
    },

    heroContent: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.lg,
    },

    heroContentSmall: {
      flexDirection: "column",
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
      flex: 1,
      minWidth: 0,
    },

    heroTopRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
    },

    heroTitleCopy: {
      flex: 1,
      minWidth: 230,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.1,
      color: colors.primary,
      marginBottom: spacing.xs,
    },

    pageTitle: {
      ...typography.h1,
      color: colors.textPrimary,
    },

    pageDescription: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 23,
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },

    heroBadges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.md,
    },

    taskGroupsSection: {
      marginTop: spacing.md,
    },

    taskGroupsLabel: {
      marginBottom: spacing.xs,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.7,
      color: colors.textMuted,
      textTransform: "uppercase",
    },

    taskGroupsList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },

    taskGroupBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 5,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor:
        `${colors.secondary}45`,
      borderRadius: radius.pill,
      backgroundColor:
        `${colors.secondary}18`,
    },

    taskGroupBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
    },

    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },

    statCard: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 170,
      minWidth: 150,
    },

    statIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      marginBottom: spacing.md,
    },

    statValue: {
      fontSize: 27,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    statLabel: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "700",
      color: colors.textMuted,
    },

    contentLayout: {
      gap: spacing.lg,
    },

    contentLayoutDesktop: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    mainColumn: {
      flex: 1,
      minWidth: 0,
    },

    submissionTabs: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.lg,
      padding: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor: colors.white,
    },

    submissionTab: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 190,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}08`,
    },

    submissionTabActive: {
      backgroundColor: colors.primary,
    },

    flaggedSubmissionTab: {
      backgroundColor:
        `${colors.danger}0D`,
    },

    flaggedSubmissionTabActive: {
      backgroundColor: colors.danger,
    },

    submissionTabText: {
      flexShrink: 1,
      fontSize: 13,
      fontWeight: "800",
      color: colors.textMuted,
    },

    flaggedSubmissionTabText: {
      color: colors.danger,
    },

    submissionTabTextActive: {
      color: colors.white,
    },

    submissionTabCount: {
      minWidth: 26,
      height: 26,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 7,
      borderRadius: 13,
      backgroundColor:
        `${colors.primary}15`,
    },

    flaggedSubmissionTabCount: {
      backgroundColor:
        `${colors.danger}16`,
    },

    submissionTabCountActive: {
      backgroundColor:
        "rgba(255, 255, 255, 0.2)",
    },

    submissionTabCountText: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.primary,
    },

    flaggedSubmissionTabCountText: {
      color: colors.danger,
    },

    submissionTabCountTextActive: {
      color: colors.white,
    },

    sideColumn: {
      width: "100%",
      gap: spacing.md,
    },

    sideColumnDesktop: {
      width: 320,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
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

    sectionCount: {
      minWidth: 34,
      height: 34,
      textAlign: "center",
      textAlignVertical: "center",
      borderRadius: 17,
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
      backgroundColor:
        `${colors.primary}12`,
    },

    bulkToolbar: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.primary}35`,
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.primary}08`,
    },

    selectionControl: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    checkbox: {
      width: 22,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 6,
      backgroundColor: colors.white,
    },

    checkboxSelected: {
      borderColor: colors.primary,
      backgroundColor:
        colors.primary,
    },

    selectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    bulkToolbarActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.sm,
    },

    selectedCount: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
    },

    submissionList: {
      gap: spacing.md,
    },

    progressCard: {
      padding: spacing.lg,
    },

    infoCard: {
      padding: spacing.lg,
    },

    sideCardIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.secondary}25`,
      marginBottom: spacing.md,
    },

    sideCardTitle: {
      ...typography.h3,
      color: colors.textPrimary,
    },

    progressValue: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.primary,
      marginTop: spacing.md,
    },

    progressTrack: {
      height: 9,
      overflow: "hidden",
      borderRadius: 5,
      backgroundColor:
        colors.border,
      marginTop: spacing.sm,
    },

    progressFill: {
      height: "100%",
      borderRadius: 5,
      backgroundColor:
        colors.secondary,
    },

    progressText: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.sm,
    },

    infoRow: {
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    infoLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.textMuted,
      textTransform: "uppercase",
    },

    infoValue: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginTop: 3,
    },

    infoText: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 22,
      marginTop: spacing.sm,
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
      maxWidth: 440,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginTop: spacing.xs,
    },

    notFoundCard: {
      minHeight: 360,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    notFoundIcon: {
      width: 72,
      height: 72,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 36,
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
      maxWidth: 480,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginVertical: spacing.md,
    },

    ...Platform.select({
      web: {
        heroCard: {
          marginBottom: spacing.lg,
          boxShadow:
            "0 6px 24px rgba(11, 60, 73, 0.05)",
        },

        progressCard: {
          padding: spacing.lg,
          boxShadow:
            "0 4px 18px rgba(11, 60, 73, 0.05)",
        },

        infoCard: {
          padding: spacing.lg,
          boxShadow:
            "0 4px 18px rgba(11, 60, 73, 0.05)",
        },
      },

      default: {},
    }),
  });
