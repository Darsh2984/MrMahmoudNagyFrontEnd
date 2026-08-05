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
      maxWidth: 1320,
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

    header: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "space-between",
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
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.secondary}25`,
    },

    eyebrow: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: colors.primary,
    },

    pageTitle: {
      ...typography.h1,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },

    pageSubtitle: {
      ...typography.body,
      maxWidth: 720,
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

    alertClose: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
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
      backgroundColor:
        `${colors.secondary}22`,
      marginBottom: spacing.md,
    },

    summaryValue: {
      fontSize: 26,
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
      alignItems: "flex-start",
      justifyContent: "space-between",
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

    clearFiltersButton: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    clearFiltersText: {
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
      color: colors.textPrimary,
      fontSize: 14,
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

    horizontalChipList: {
      flexDirection: "row",
      gap: spacing.xs,
      paddingRight: spacing.md,
    },

    filterChip: {
      minHeight: 36,
      maxWidth: 230,
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

    activeFilterText: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    activeFilterLabel: {
      flex: 1,
      fontSize: 12,
      color: colors.textMuted,
    },

    sectionHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "space-between",
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

    loadingCard: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    questionGrid: {
      gap: spacing.md,
    },

    questionGridDesktop: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "stretch",
    },

    questionCard: {
      width: "100%",
      gap: spacing.md,
    },

    questionCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    questionTypeIcon: {
      width: 46,
      height: 46,
      flexShrink: 0,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.primary}12`,
    },

    questionTypeIconWritten: {
      backgroundColor:
        `${colors.secondary}18`,
    },

    questionHeading: {
      flex: 1,
      minWidth: 0,
    },

    questionTitle: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    questionBadges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },

    referenceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },

    referenceText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textMuted,
    },

    answerBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    answerLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textMuted,
    },

    answerValueCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primary,
    },

    answerValue: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.white,
    },

    markschemeAvailable: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.secondary,
    },

    markschemeMissing: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.warning,
    },

    topicSection: {
      gap: spacing.xs,
    },

    topicLabel: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: colors.textMuted,
    },

    topicList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },

    topicBadge: {
      maxWidth: 220,
      paddingVertical: 6,
      paddingHorizontal: spacing.sm,
      borderRadius: 999,
      backgroundColor:
        `${colors.secondary}18`,
    },

    topicBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    noTopicsText: {
      fontSize: 12,
      color: colors.textMuted,
    },

    fileActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    fileAction: {
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.white,
    },

    fileActionText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
    },

    cardActions: {
      flexDirection: "row",
      gap: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    cardButton: {
      flex: 1,
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
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
      backgroundColor:
        `${colors.secondary}22`,
    },

    emptyTitle: {
      fontSize: 18,
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

    pressed: {
      opacity: 0.74,
    },

    modalBackdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
      backgroundColor:
        "rgba(20, 28, 30, 0.58)",
    },

    modalBackdropPress: {
      ...StyleSheet.absoluteFillObject,
    },

    formModalCard: {
      width: "100%",
      maxWidth: 820,
      maxHeight: "94%",
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
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    modalHeaderIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.secondary}22`,
    },

    modalHeaderCopy: {
      flex: 1,
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

    formContent: {
      paddingBottom: spacing.lg,
    },

    formErrorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor:
        `${colors.danger}45`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.danger}10`,
    },

    formErrorText: {
      flex: 1,
      fontSize: 12,
      color: colors.danger,
    },

    formField: {
      marginBottom: spacing.md,
    },

    formFieldHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },

    formFieldLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    formFieldHint: {
      maxWidth: 440,
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

    typeSelector: {
      flexDirection: "row",
      gap: spacing.sm,
    },

    typeOption: {
      flex: 1,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
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

    answerSelector: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    answerOption: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
    },

    answerOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },

    answerOptionText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    answerOptionTextActive: {
      color: colors.white,
    },

    filePickerBox: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    filePickerIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.white,
    },

    filePickerCopy: {
      flex: 1,
      minWidth: 160,
    },

    filePickerTitle: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    filePickerSubtitle: {
      marginTop: 3,
      fontSize: 11,
      color: colors.textMuted,
    },

    fileClearButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.danger}10`,
    },

    removeMarkschemeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.sm,
    },

    removeMarkschemeText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textMuted,
    },

    taxonomyMiniLabel: {
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
      fontSize: 11,
      fontWeight: "800",
      color: colors.textMuted,
    },

    noTopicsBox: {
      minHeight: 110,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    noTopicsBoxText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
    },

    topicSelectionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    topicSelectionItem: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 220,
      minWidth: 180,
      maxWidth: 320,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.white,
    },

    topicSelectionItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },

    topicSelectionText: {
      flex: 1,
      fontSize: 12,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    topicSelectionTextSelected: {
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

    deleteModalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.textPrimary,
      textAlign: "center",
    },

    deleteModalDescription: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginTop: spacing.sm,
    },

    deleteModalActions: {
      width: "100%",
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.lg,
    },

    deleteModalButton: {
      flex: 1,
    },
  });