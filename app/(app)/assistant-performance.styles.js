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

    headerSmall: {
      alignItems: "flex-start",
    },

    headerCopy: {
      flex: 1,
      minWidth: 0,
    },

    headerIcon: {
      width: 70,
      height: 70,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 35,
      backgroundColor:
        `${colors.secondary}25`,
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

    pageSubtitle: {
      ...typography.body,
      maxWidth: 760,
      color: colors.textMuted,
      lineHeight: 23,
      marginTop: spacing.sm,
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

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      marginBottom: spacing.md,
    },

    summaryCard: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 170,
      minWidth: 150,
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
      fontSize: 28,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    summaryLabel: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "700",
      color: colors.textMuted,
    },

    performanceGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },

    performanceCard: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 320,
      minWidth: 270,
    },

    performanceHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    performanceIcon: {
      width: 42,
      height: 42,
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
      fontSize: 35,
      fontWeight: "800",
      color: colors.primary,
      marginTop: spacing.lg,
    },

    turnaroundValue: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.primary,
      marginTop: spacing.lg,
    },

    performanceText: {
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

    filterCard: {
      marginBottom: spacing.lg,
    },

    filterLayout: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },

    filterLayoutSmall: {
      flexDirection: "column",
      alignItems: "stretch",
    },

    searchBox: {
      flex: 1,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.white,
    },

    searchInput: {
      flex: 1,
      minHeight: 46,
      color: colors.textPrimary,
      fontSize: 14,
      outlineStyle: "none",
    },

    filterList: {
      flexDirection: "row",
      gap: spacing.xs,
    },

    filterChip: {
      minHeight: 40,
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      backgroundColor: colors.white,
    },

    filterChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },

    filterChipText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    filterChipTextActive: {
      color: colors.white,
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
      marginTop: 3,
    },

    assistantGrid: {
      gap: spacing.md,
    },

    assistantGridDesktop: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
    },

    assistantCard: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 520,
      minWidth: 0,
      padding: spacing.lg,
    },

    assistantHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
    },

    assistantHeaderSmall: {
      flexDirection: "column",
    },

    assistantIdentity: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    avatar: {
      width: 50,
      height: 50,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 25,
      backgroundColor: colors.primary,
    },

    headAvatar: {
      backgroundColor:
        colors.secondary,
    },

    avatarText: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.white,
    },

    assistantCopy: {
      flex: 1,
      minWidth: 0,
    },

    nameRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.xs,
    },

    assistantName: {
      flexShrink: 1,
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    assistantEmail: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 4,
    },

    completionBadge: {
      minWidth: 86,
      alignItems: "center",
      padding: spacing.sm,
      borderRadius: radius.lg,
      backgroundColor:
        `${colors.secondary}18`,
    },

    completionValue: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.secondary,
    },

    completionLabel: {
      marginTop: 2,
      fontSize: 10,
      fontWeight: "700",
      color: colors.textMuted,
    },

    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginTop: spacing.md,
    },

    miniMetric: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 100,
      minWidth: 88,
      alignItems: "center",
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    miniMetricValue: {
      fontSize: 21,
      fontWeight: "800",
    },

    miniMetricLabel: {
      marginTop: 3,
      fontSize: 10,
      fontWeight: "700",
      color: colors.textMuted,
    },

    detailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginTop: spacing.md,
    },

    detailRow: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 220,
      minWidth: 180,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.white,
    },

    detailIcon: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 18,
      backgroundColor:
        `${colors.primary}12`,
    },

    detailCopy: {
      flex: 1,
      minWidth: 0,
    },

    detailLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.textMuted,
      textTransform: "uppercase",
    },

    detailValue: {
      marginTop: 2,
      fontSize: 13,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    progressSection: {
      marginTop: spacing.md,
    },

    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },

    progressTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    progressCount: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
    },

    recentSection: {
      paddingTop: spacing.md,
      marginTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    recentHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },

    recentTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    recentCount: {
      minWidth: 28,
      height: 28,
      textAlign: "center",
      textAlignVertical: "center",
      borderRadius: 14,
      fontSize: 11,
      fontWeight: "800",
      color: colors.primary,
      backgroundColor:
        `${colors.primary}12`,
    },

    recentList: {
      gap: spacing.xs,
    },

    recentRow: {
      minHeight: 70,
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

    recentRowPressed: {
      opacity: 0.72,
    },

    recentIcon: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      backgroundColor:
        `${colors.primary}12`,
    },

    recentCopy: {
      flex: 1,
      minWidth: 0,
    },

    recentStudent: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    recentTask: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },

    recentDate: {
      marginTop: 3,
      fontSize: 10,
      color: colors.textMuted,
    },

    noRecentText: {
      ...typography.body,
      color: colors.textMuted,
      paddingVertical: spacing.sm,
    },

    emptyCard: {
      minHeight: 280,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    emptyIcon: {
      width: 70,
      height: 70,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 35,
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
      color: colors.textMuted,
      textAlign: "center",
      marginTop: spacing.xs,
    },

    ...Platform.select({
      web: {
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

        assistantCard: {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 520,
          minWidth: 0,
          padding: spacing.lg,
          boxShadow:
            "0 4px 18px rgba(11, 60, 73, 0.05)",
        },
      },

      default: {},
    }),
  });