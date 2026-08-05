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
    page: {
      width: "100%",
      maxWidth: 1320,
      alignSelf: "center",
      paddingBottom: spacing.xl,
    },

    loadingScreen: {
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    loadingText: {
      ...typography.body,
      color: colors.textMuted,
    },

    header: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.lg,
      marginBottom: spacing.lg,
    },

    headerCopy: {
      flex: 1,
      minWidth: 280,
      maxWidth: 760,
    },

    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },

    eyebrowIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.secondary}22`,
    },

    eyebrow: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.1,
      color: colors.primary,
    },

    pageTitle: {
      ...typography.h1,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },

    pageSubtitle: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 23,
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

    alertDanger: {
      borderColor:
        `${colors.danger}55`,
      backgroundColor:
        `${colors.danger}10`,
    },

    alertSuccess: {
      borderColor:
        `${colors.secondary}55`,
      backgroundColor:
        `${colors.secondary}12`,
    },

    alertText: {
      flex: 1,
      ...typography.body,
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
      flexBasis: 200,
      minWidth: 170,
    },

    summaryIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
      backgroundColor:
        `${colors.secondary}20`,
    },

    summaryValue: {
      fontSize: 27,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    summaryLabel: {
      marginTop: 3,
      fontSize: 12,
      color: colors.textMuted,
    },

    filtersCard: {
      marginBottom: spacing.lg,
    },

    filtersHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    filtersTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    filtersSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color: colors.textMuted,
    },

    clearButton: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    clearButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
    },

    searchBox: {
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
      fontSize: 14,
      color: colors.textPrimary,
    },

    filterSection: {
      marginTop: spacing.md,
    },

    filterLabel: {
      marginBottom: spacing.xs,
      fontSize: 12,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    chipList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },

    filterChip: {
      minHeight: 36,
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
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
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    sectionSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color: colors.textMuted,
    },

    quizGrid: {
      gap: spacing.md,
    },

    quizGridDesktop: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "stretch",
    },

    quizCard: {
      width: "100%",
      gap: spacing.md,
    },

    quizCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    quizTypeIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.primary}12`,
    },

    paperQuizIcon: {
      backgroundColor:
        `${colors.secondary}18`,
    },

    quizHeading: {
      flex: 1,
      minWidth: 0,
    },

    quizTitle: {
      fontSize: 17,
      lineHeight: 23,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },

    description: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 21,
    },

    detailsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },

    detailItem: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 120,
      minWidth: 115,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    detailLabel: {
      fontSize: 10,
      color: colors.textMuted,
    },

    detailValue: {
      marginTop: 2,
      fontSize: 13,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    scheduleBox: {
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    scheduleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
    },

    scheduleLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textMuted,
    },

    scheduleValue: {
      flex: 1,
      fontSize: 12,
      fontWeight: "700",
      textAlign: "right",
      color: colors.textPrimary,
    },

    groupSection: {
      gap: spacing.xs,
    },

    groupLabel: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.7,
      textTransform: "uppercase",
      color: colors.textMuted,
    },

    groupList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },

    groupBadge: {
      paddingVertical: 6,
      paddingHorizontal: spacing.sm,
      borderRadius: 999,
      backgroundColor:
        `${colors.secondary}18`,
    },

    groupBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    noGroupsText: {
      fontSize: 12,
      color: colors.textMuted,
    },

    processingRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    processingText: {
      fontSize: 12,
      color: colors.textMuted,
    },

    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    actionButton: {
      flexGrow: 1,
      flexBasis: 120,
    },

    emptyCard: {
      minHeight: 280,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
      backgroundColor:
        `${colors.secondary}22`,
    },

    emptyTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.textPrimary,
      textAlign: "center",
    },

    emptyDescription: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },

    modalBackdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
      backgroundColor:
        "rgba(20, 28, 30, 0.58)",
    },

    formModalCard: {
      width: "100%",
      maxWidth: 650,
      maxHeight: "92%",
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.white,

      ...Platform.select({
        web: {
          boxShadow:
            "0 20px 54px rgba(0,0,0,0.20)",
        },

        default: {
          elevation: 10,
        },
      }),
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.md,
      marginBottom: spacing.md,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    modalSubtitle: {
      marginTop: 4,
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
    },

    modalClose: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.background,
    },

    formErrorBox: {
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.danger}45`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.danger}10`,
    },

    formErrorText: {
      fontSize: 12,
      color: colors.danger,
    },

    formField: {
      marginBottom: spacing.md,
    },

    formFieldHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },

    formFieldLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    formFieldHint: {
      fontSize: 11,
      color: colors.textMuted,
    },

    input: {
      width: "100%",
      minHeight: 48,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.white,
      color: colors.textPrimary,
      fontSize: 14,
    },

    textArea: {
      minHeight: 100,
      textAlignVertical: "top",
    },

    typeSelector: {
      flexDirection: "row",
      gap: spacing.sm,
    },

    typeOption: {
      flex: 1,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.white,
    },

    typeOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },

    typeOptionText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    typeOptionTextActive: {
      color: colors.white,
    },

    modalActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      gap: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    deleteModalCard: {
      width: "100%",
      maxWidth: 460,
      alignItems: "center",
      padding: spacing.xl,
    },

    deleteIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
      backgroundColor:
        `${colors.danger}12`,
    },

    deleteTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.textPrimary,
      textAlign: "center",
    },

    deleteDescription: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginTop: spacing.sm,
    },

    deleteActions: {
      width: "100%",
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.lg,
    },

    deleteButton: {
      flex: 1,
    },

    pressed: {
      opacity: 0.74,
    },
  });