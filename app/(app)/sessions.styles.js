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
    loadingScreen: {
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    loadingText: {
      ...typography.body,
      color: colors.textMuted,
      marginTop: spacing.sm,
    },

    pressed: {
      opacity: 0.82,
    },

    pageHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },

    pageHeadingText: {
      flex: 1,
      minWidth: 240,
    },

    pageEyebrow: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.5,
      color: colors.secondary,
      marginBottom: spacing.xs,
    },

    pageTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: -0.7,
    },

    pageSubtitle: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 22,
      marginTop: spacing.xs,
      maxWidth: 620,
    },

    createButton: {
      minWidth: 160,
    },

    headerJoinButton: {
      minWidth: 175,
    },

    notice: {
      borderWidth: 1,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },

    noticeText: {
      ...typography.body,
      flex: 1,
    },

    noticeClose: {
      fontSize: 22,
      color: colors.textMuted,
      marginLeft: spacing.md,
    },

    filtersCard: {
      marginBottom: spacing.lg,
      padding: spacing.lg,
    },

    selectorSection: {
      gap: spacing.sm,
    },

    selectorLabel: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: colors.textMuted,
      textTransform: "uppercase",
    },

    selectorEmpty: {
      ...typography.caption,
      color: colors.textMuted,
    },

    selectorRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    selectorChip: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
    },

    selectorChipText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    selectorChipTextActive: {
      color: colors.white,
    },

    filterDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },

    inlineLoading: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },

    inlineLoadingText: {
      ...typography.caption,
      color: colors.textMuted,
    },

    workspace: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      gap: spacing.lg,
    },

    sessionListColumn: {
      flex: 0.82,
      minWidth: 290,
    },

    detailsColumn: {
      flex: 1.55,
      minWidth: 340,
    },

    columnCard: {
      padding: 0,
      overflow: "hidden",
    },

    columnHeader: {
      backgroundColor: colors.primary,
      padding: spacing.lg,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    columnEyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      color: "#B7CDC8",
      textTransform: "uppercase",
    },

    columnTitle: {
      ...typography.h2,
      color: colors.white,
      marginTop: 2,
    },

    countBadge: {
      width: 38,
      height: 38,
      borderRadius: radius.pill,
      backgroundColor:
        "rgba(255,255,255,0.14)",
      alignItems: "center",
      justifyContent: "center",
    },

    countBadgeText: {
      color: colors.white,
      fontWeight: "800",
    },

    listLoading: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    listEmpty: {
      padding: spacing.xl,
      alignItems: "center",
    },

    listEmptyTitle: {
      ...typography.h3,
      color: colors.primary,
      textAlign: "center",
    },

    listEmptyText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 21,
      marginTop: spacing.xs,
    },

    listEmptyButton: {
      marginTop: spacing.md,
    },

    sessionList: {
      padding: spacing.sm,
    },

    sessionCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: radius.md,
      padding: spacing.sm,
      marginBottom: spacing.xs,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: "transparent",
    },

    sessionCardActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    sessionDateBlock: {
      width: 64,
      minHeight: 60,
      borderRadius: radius.md,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xs,
    },

    sessionDateBlockActive: {
      backgroundColor:
        "rgba(255,255,255,0.14)",
    },

    sessionDateDay: {
      fontSize: 21,
      lineHeight: 23,
      fontWeight: "800",
      color: colors.primary,
    },

    sessionDateMonth: {
      fontSize: 9,
      fontWeight: "700",
      color: colors.textMuted,
      textTransform: "uppercase",
      textAlign: "center",
    },

    sessionCardBody: {
      flex: 1,
      paddingHorizontal: spacing.sm,
    },

    sessionCardTitle: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    sessionMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      marginTop: spacing.xs,
    },

    sessionMeta: {
      fontSize: 10,
      color: colors.textMuted,
    },

    sessionMetaDot: {
      fontSize: 10,
      color: colors.textMuted,
      marginHorizontal: spacing.xs,
    },

    sessionTextActive: {
      color: colors.white,
    },

    sessionMetaActive: {
      color: "#C8D8D5",
    },

    sessionArrow: {
      fontSize: 25,
      color: colors.textMuted,
    },

    detailsStack: {
      gap: spacing.md,
    },

    detailsLoadingCard: {
      minHeight: 300,
      alignItems: "center",
      justifyContent: "center",
    },

    detailsPlaceholder: {
      minHeight: 390,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    detailsPlaceholderIcon: {
      width: 66,
      height: 66,
      borderRadius: radius.pill,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },

    detailsPlaceholderIconText: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.secondary,
    },

    detailsPlaceholderTitle: {
      ...typography.h2,
      color: colors.primary,
    },

    detailsPlaceholderText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      maxWidth: 350,
      lineHeight: 22,
      marginTop: spacing.xs,
    },

    sessionDetailsCard: {
      padding: spacing.lg,
    },

    detailsHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    detailsHeading: {
      flex: 1,
      minWidth: 220,
    },

    detailsEyebrow: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.secondary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },

    detailsTitle: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "800",
      color: colors.primary,
      marginTop: spacing.xs,
    },

    detailsDateRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.sm,
    },

    dateIcon: {
      fontSize: 15,
      marginRight: spacing.xs,
    },

    detailsDate: {
      ...typography.body,
      color: colors.textMuted,
    },

    detailsActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    smallActionButton: {
      minWidth: 88,
    },

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginTop: spacing.lg,
    },

    summaryCard: {
      flex: 1,
      minWidth: 105,
      backgroundColor: colors.background,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },

    summaryPresent: {
      backgroundColor: "#F0F5F1",
      borderColor: "#D8E5DB",
    },

    summaryAbsent: {
      backgroundColor: "#FFF4F1",
      borderColor: "#F0D7D0",
    },

    summaryValue: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "800",
      color: colors.primary,
    },

    summaryPresentText: {
      color: "#577762",
    },

    summaryAbsentText: {
      color: colors.danger,
    },

    summaryLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textMuted,
      marginTop: spacing.xs,
      textTransform: "uppercase",
    },

    attendanceCard: {
      padding: spacing.lg,
    },

    sectionHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.md,
      marginBottom: spacing.md,
    },

    sectionHeadingText: {
      flex: 1,
      minWidth: 220,
    },

    sectionTitle: {
      ...typography.h3,
      color: colors.primary,
    },

    sectionSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 2,
    },

    bulkAttendanceActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    bulkAction: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },

    bulkActionText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.secondary,
    },

    roster: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      overflow: "hidden",
    },

    rosterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.white,
    },

    rosterRowLast: {
      borderBottomWidth: 0,
    },

    studentIdentity: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 170,
    },

    studentAvatar: {
      width: 34,
      height: 34,
      borderRadius: radius.pill,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },

    studentAvatarText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.primary,
    },

    studentName: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    attendanceStatus: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      minWidth: 92,
      justifyContent: "center",
    },

    presentStatus: {
      backgroundColor: "#EDF4EF",
    },

    absentStatus: {
      backgroundColor: "#FFF0EC",
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: radius.pill,
      marginRight: 6,
    },

    attendanceStatusText: {
      fontSize: 11,
      fontWeight: "800",
    },

    rosterEmpty: {
      padding: spacing.xl,
      borderRadius: radius.md,
      backgroundColor: colors.background,
    },

    rosterEmptyTitle: {
      ...typography.bodyBold,
      color: colors.primary,
      textAlign: "center",
    },

    rosterEmptyText: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: spacing.xs,
    },

    attendanceFooter: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.md,
      marginTop: spacing.md,
    },

    attendanceFooterText: {
      ...typography.caption,
      color: colors.textMuted,
    },

    liveQuestionsCard: {
      padding: spacing.lg,
    },

    liveHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.md,
      marginBottom: spacing.md,
    },

    liveCountBadge: {
      minWidth: 34,
      height: 34,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },

    liveCountText: {
      fontWeight: "800",
      color: colors.primary,
    },

    inlineError: {
      ...typography.caption,
      color: colors.danger,
      marginBottom: spacing.sm,
    },

    questionComposer: {
      backgroundColor: colors.background,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },

    questionPromptInput: {
      minHeight: 80,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.white,
      color: colors.textPrimary,
      padding: spacing.sm,
      fontSize: 14,
      textAlignVertical: "top",

      ...(Platform.OS === "web"
        ? {
            outlineStyle: "none",
          }
        : null),
    },

    questionComposerFooter: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: spacing.md,
      marginTop: spacing.sm,
    },

    marksField: {
      minWidth: 110,
    },

    marksLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },

    marksInput: {
      minHeight: 42,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.white,
      color: colors.textPrimary,
      paddingHorizontal: spacing.sm,
      fontSize: 14,

      ...(Platform.OS === "web"
        ? {
            outlineStyle: "none",
          }
        : null),
    },

    questionsEmpty: {
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.lg,
    },

    questionsEmptyTitle: {
      ...typography.bodyBold,
      color: colors.primary,
      textAlign: "center",
    },

    questionsEmptyText: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: spacing.xs,
    },

    questionList: {
      gap: spacing.sm,
    },

    questionItem: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      overflow: "hidden",
    },

    questionHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      backgroundColor: colors.white,
    },

    questionNumber: {
      width: 34,
      height: 34,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },

    questionNumberText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.white,
    },

    questionHeading: {
      flex: 1,
    },

    questionPrompt: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    questionMeta: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },

    questionChevron: {
      color: colors.primary,
      marginLeft: spacing.sm,
    },

    answerSection: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: "#FCFBF9",
      padding: spacing.sm,
    },

    noAnswersText: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      padding: spacing.md,
    },

    answerRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    answerStudent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 190,
    },

    answerAvatar: {
      width: 34,
      height: 34,
      borderRadius: radius.pill,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },

    answerAvatarText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
    },

    answerStudentName: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    answerOpenText: {
      fontSize: 11,
      color: colors.primary,
      marginTop: 2,
    },

    gradeControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },

    gradeInput: {
      width: 72,
      minHeight: 38,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      backgroundColor: colors.white,
      paddingHorizontal: spacing.sm,
      color: colors.textPrimary,
      fontSize: 12,

      ...(Platform.OS === "web"
        ? {
            outlineStyle: "none",
          }
        : null),
    },

    gradeButton: {
      minHeight: 38,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },

    emptyPageCard: {
      minHeight: 300,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    emptyPageIcon: {
      width: 64,
      height: 64,
      borderRadius: radius.pill,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },

    emptyPageIconText: {
      fontSize: 25,
      fontWeight: "800",
      color: colors.secondary,
    },

    emptyPageTitle: {
      ...typography.h2,
      color: colors.primary,
      textAlign: "center",
    },

    emptyPageText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      maxWidth: 440,
      lineHeight: 22,
      marginTop: spacing.xs,
    },

    emptySessionJoinButton: {
      marginTop: spacing.lg,
      minWidth: 180,
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor:
        "rgba(11, 60, 73, 0.48)",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
    },

    formModal: {
      width: "100%",
      maxWidth: 520,
      borderRadius: radius.lg,
      backgroundColor: colors.white,
      padding: spacing.lg,
    },

    modalHeadingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: spacing.lg,
    },

    modalHeadingText: {
      flex: 1,
      paddingRight: spacing.md,
    },

    modalEyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: colors.secondary,
    },

    modalTitle: {
      ...typography.h2,
      color: colors.primary,
      marginTop: spacing.xs,
    },

    modalSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: spacing.xs,
    },

    modalCloseButton: {
      width: 34,
      height: 34,
      borderRadius: radius.pill,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },

    modalCloseText: {
      fontSize: 22,
      lineHeight: 24,
      color: colors.textMuted,
    },

    modalActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      gap: spacing.sm,
      marginTop: spacing.md,
    },

    modalActionButton: {
      minWidth: 130,
    },

    formError: {
      ...typography.caption,
      color: colors.danger,
      marginTop: spacing.xs,
    },

    deleteModal: {
      width: "100%",
      maxWidth: 470,
      borderRadius: radius.lg,
      backgroundColor: colors.white,
      padding: spacing.lg,
      alignItems: "center",
    },

    deleteIcon: {
      width: 58,
      height: 58,
      borderRadius: radius.pill,
      backgroundColor: "#FFF0EC",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },

    deleteIconText: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.danger,
    },

    deleteTitle: {
      ...typography.h2,
      color: colors.primary,
      textAlign: "center",
    },

    deleteMessage: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginTop: spacing.sm,
    },

    deleteWarning: {
      width: "100%",
      borderRadius: radius.md,
      backgroundColor: "#FFF4F1",
      borderWidth: 1,
      borderColor: "#F0D7D0",
      padding: spacing.md,
      marginTop: spacing.md,
    },

    deleteWarningText: {
      ...typography.caption,
      color: colors.danger,
      lineHeight: 19,
      textAlign: "center",
    },

    /*
     * STUDENT GROUP SESSION LINK
     */

    studentGroupSessionCard: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: `${colors.secondary}55`,
      backgroundColor: "#F7FAF7",
    },

    studentGroupSessionInfo: {
      flex: 1,
      minWidth: 250,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },

    studentGroupSessionIcon: {
      width: 52,
      height: 52,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },

    studentGroupSessionIconText: {
      marginLeft: 3,
      fontSize: 18,
      color: colors.white,
    },

    studentGroupSessionText: {
      flex: 1,
      minWidth: 0,
    },

    studentGroupSessionEyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: colors.secondary,
    },

    studentGroupSessionTitle: {
      ...typography.h3,
      color: colors.primary,
      marginTop: 3,
    },

    studentGroupSessionDescription: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 20,
      marginTop: 4,
    },

    studentJoinButton: {
      minWidth: 180,
    },

    noStudentSessionLink: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.background,
    },

    noStudentSessionLinkText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textMuted,
    },

    studentSessionTabs: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    studentSessionTab: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      minWidth: 150,
    },

    studentSessionTabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    studentSessionTabTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    studentSessionTabDate: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },

    studentSessionHero: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },

    studentHeroTopRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
    },

    studentHeroText: {
      flex: 1,
      minWidth: 220,
    },

    studentHeroEyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: "#B7CDC8",
    },

    studentHeroTitle: {
      fontSize: 25,
      lineHeight: 31,
      fontWeight: "800",
      color: colors.white,
      marginTop: spacing.xs,
    },

    studentHeroDate: {
      ...typography.body,
      color: "#D8E4E1",
      marginTop: spacing.sm,
    },

    heroJoinButton: {
      minWidth: 175,
    },

    studentAttendanceRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor:
        "rgba(255,255,255,0.16)",
    },

    studentAttendanceLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: "#D8E4E1",
    },

    studentAttendanceBadge: {
      paddingVertical: 7,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
    },

    studentAttendancePresent: {
      backgroundColor: "#EAF4ED",
    },

    studentAttendanceAbsent: {
      backgroundColor: "#FFF0EC",
    },

    studentAttendancePending: {
      backgroundColor:
        "rgba(255,255,255,0.14)",
    },

    studentAttendanceBadgeText: {
      fontSize: 12,
      fontWeight: "800",
    },

    studentAttendancePresentText: {
      color: "#577762",
    },

    studentAttendanceAbsentText: {
      color: colors.danger,
    },

    studentAttendancePendingText: {
      color: colors.white,
    },

    studentQuestionsHeading: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: spacing.md,
    },

    studentQuestionCard: {
      marginBottom: spacing.md,
      padding: spacing.lg,
    },

    studentQuestionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    studentQuestionHeading: {
      flex: 1,
    },

    studentQuestionPrompt: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      lineHeight: 22,
    },

    studentQuestionMarks: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },

    studentAnswerStatus: {
      marginTop: spacing.md,
      alignItems: "flex-start",
    },

    studentUploadButton: {
      marginTop: spacing.md,
      alignSelf: "flex-start",
    },
  });