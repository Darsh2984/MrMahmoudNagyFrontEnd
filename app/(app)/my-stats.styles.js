import {
  Platform,
  StyleSheet,
} from "react-native";

import {
  colors,
  spacing,
  radius,
  typography,
} from "../../src/theme";

export const styles =
  StyleSheet.create({
    page: {
      width: "100%",
      maxWidth: 1380,
      alignSelf: "center",
      paddingBottom: spacing.xl,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    loadingIcon: {
      width: 62,
      height: 62,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 31,
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

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.lg,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor:
        `${colors.primary}0B`,
    },

    headerCompact: {
      alignItems: "flex-start",
    },

    headerContent: {
      flex: 1,
      minWidth: 0,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.1,
      color: colors.primary,
      marginBottom: spacing.xs,
    },

    title: {
      ...typography.h1,
      color: colors.textPrimary,
    },

    subtitle: {
      ...typography.body,
      maxWidth: 720,
      color: colors.textMuted,
      lineHeight: 23,
      marginTop: spacing.sm,
    },

    avatar: {
      width: 68,
      height: 68,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 34,
      backgroundColor: colors.primary,
    },

    avatarText: {
      fontSize: 21,
      fontWeight: "800",
      color: colors.white,
    },

    errorCard: {
      gap: spacing.md,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor:
        `${colors.danger}45`,
      backgroundColor:
        `${colors.danger}08`,
    },

    errorRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },

    errorIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 21,
      backgroundColor:
        `${colors.danger}12`,
    },

    errorContent: {
      flex: 1,
      minWidth: 0,
    },

    errorTitle: {
      ...typography.bodyBold,
      color: colors.danger,
    },

    errorText: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: 21,
      marginTop: 3,
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

    sideColumn: {
      width: "100%",
      gap: spacing.md,
    },

    sideColumnDesktop: {
      width: 320,
    },

    sectionSpacing: {
      marginTop: spacing.xl,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
      marginBottom: spacing.md,
    },

    sectionCopy: {
      flex: 1,
      minWidth: 0,
    },

    sectionEyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      color: colors.primary,
      marginBottom: 3,
    },

    sectionTitle: {
      ...typography.h2,
      color: colors.textPrimary,
    },

    sectionDescription: {
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

    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },

    metricCard: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 170,
      minWidth: 150,
    },

    metricIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      marginBottom: spacing.md,
    },

    metricValue: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    metricLabel: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "700",
      color: colors.textMuted,
    },

    performanceGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      marginTop: spacing.md,
    },

    performanceCard: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 280,
      minWidth: 250,
    },

    performanceHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    performanceIcon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.primary}12`,
    },

    performanceTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    performanceValue: {
      fontSize: 34,
      fontWeight: "800",
      color: colors.primary,
      marginTop: spacing.lg,
    },

    turnaroundValue: {
      fontSize: 27,
      fontWeight: "800",
      color: colors.primary,
      marginTop: spacing.lg,
    },

    performanceDescription: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: spacing.sm,
    },

    progressTrack: {
      height: 9,
      overflow: "hidden",
      borderRadius: 5,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
    },

    progressFill: {
      height: "100%",
      borderRadius: 5,
      backgroundColor:
        colors.secondary,
    },

    delegationList: {
      gap: spacing.md,
    },

    delegationCard: {
      padding: spacing.lg,
    },

    delegationHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
    },

    delegationHeaderCompact: {
      flexDirection: "column",
    },

    delegationIdentity: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    studentAvatar: {
      width: 46,
      height: 46,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 23,
      backgroundColor:
        `${colors.primary}14`,
    },

    studentAvatarText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.primary,
    },

    delegationInfo: {
      flex: 1,
      minWidth: 0,
    },

    delegationStudent: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    delegationTask: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 3,
    },

    delegationMetaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      padding: spacing.md,
      marginTop: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    metaItem: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 150,
      minWidth: 130,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    metaCopy: {
      flex: 1,
      minWidth: 0,
    },

    metaLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.textMuted,
      textTransform: "uppercase",
    },

    metaValue: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 2,
    },

    delegationGroups: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.md,
    },

    delegationGroupBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 5,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor:
        `${colors.primary}30`,
      borderRadius: radius.pill,
      backgroundColor:
        `${colors.primary}08`,
    },

    delegationGroupText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
    },

    lateWarning: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.warning}45`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.warning}10`,
    },

    lateWarningText: {
      flex: 1,
      ...typography.caption,
      color: colors.textPrimary,
      lineHeight: 18,
    },

    delegationFooter: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      paddingTop: spacing.md,
      marginTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    delegatedByText: {
      flex: 1,
      minWidth: 180,
      ...typography.caption,
      color: colors.textMuted,
    },

    emptyCard: {
      minHeight: 230,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    emptyIcon: {
      width: 66,
      height: 66,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 33,
      backgroundColor:
        `${colors.primary}12`,
      marginBottom: spacing.md,
    },

    emptyTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      textAlign: "center",
    },

    emptyDescription: {
      ...typography.body,
      maxWidth: 420,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 21,
      marginTop: spacing.xs,
    },

    ticketGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },

    ticketCard: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 220,
      minWidth: 190,
    },

    ticketIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      marginBottom: spacing.md,
    },

    ticketValue: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    ticketLabel: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginTop: 3,
    },

    ticketDescription: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: spacing.xs,
    },

    ticketProgressCard: {
      marginTop: spacing.md,
    },

    ticketProgressHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
    },

    ticketProgressTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    ticketProgressSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 3,
    },

    ticketProgressValue: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.primary,
    },

    profileCard: {
      alignItems: "center",
      padding: spacing.lg,
    },

    profileAvatar: {
      width: 72,
      height: 72,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 36,
      backgroundColor:
        colors.primary,
      marginBottom: spacing.md,
    },

    profileAvatarText: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.white,
    },

    profileName: {
      ...typography.h3,
      color: colors.textPrimary,
      textAlign: "center",
    },

    profileEmail: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 3,
      marginBottom: spacing.md,
    },

    groupsCard: {
      padding: spacing.lg,
    },

    sideCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    sideCardIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.primary}12`,
    },

    sideCardTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    sideCardSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },

    noGroupsText: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 21,
    },

    groupList: {
      gap: spacing.sm,
    },

    groupRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    groupIcon: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 17,
      backgroundColor:
        `${colors.primary}12`,
    },

    groupInfo: {
      flex: 1,
      minWidth: 0,
    },

    groupName: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    groupMeta: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },

    tipCard: {
      padding: spacing.lg,
    },

    tipIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.primary}12`,
      marginBottom: spacing.md,
    },

    tipTitle: {
      ...typography.h3,
      color: colors.textPrimary,
    },

    tipText: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 22,
      marginTop: spacing.sm,
    },

    ...Platform.select({
      web: {
        delegationCard: {
          padding: spacing.lg,
          boxShadow:
            "0 4px 18px rgba(11, 60, 73, 0.05)",
        },

        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: spacing.lg,
          padding: spacing.xl,
          marginBottom: spacing.lg,
          borderRadius: radius.xl,
          backgroundColor:
            `${colors.primary}0B`,
          boxShadow:
            "0 6px 24px rgba(11, 60, 73, 0.05)",
        },
      },

      default: {},
    }),
  });