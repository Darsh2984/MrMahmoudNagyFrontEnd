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

export const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 1320,
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },

  fullPageLoading: {
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

  pressed: {
    opacity: 0.72,
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
    borderColor: `${colors.danger}55`,
    backgroundColor: `${colors.danger}12`,
  },

  successAlert: {
    borderColor: `${colors.secondary}55`,
    backgroundColor: `${colors.secondary}15`,
  },

  alertText: {
    flex: 1,
    ...typography.body,
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
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  heroCopy: {
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
    borderColor: `${colors.secondary}45`,
    borderRadius: radius.pill,
    backgroundColor: `${colors.secondary}18`,
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
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  statLabel: {
    marginTop: 3,
    fontSize: 12,
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

  sideColumn: {
    width: "100%",
    gap: spacing.md,
  },

  sideColumnDesktop: {
    width: 320,
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
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
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
    borderColor: `${colors.primary}35`,
    borderRadius: radius.lg,
    backgroundColor: `${colors.primary}08`,
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
    backgroundColor: colors.primary,
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

  submissionCard: {
    padding: spacing.lg,
  },

  cardSelectionRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },

  cardSelectionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },

  submissionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  submissionHeaderSmall: {
    flexDirection: "column",
  },

  studentIdentity: {
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
    backgroundColor: `${colors.primary}14`,
  },

  studentAvatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.primary,
  },

  studentInfo: {
    flex: 1,
    minWidth: 0,
  },

  studentName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  studentMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  statusBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },

  lateWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.warning}55`,
    borderRadius: radius.md,
    backgroundColor: `${colors.warning}12`,
  },

  lateWarningText: {
    flex: 1,
    minWidth: 0,
  },

  lateWarningTitle: {
    ...typography.bodyBold,
    color: colors.warning,
  },

  lateWarningDescription: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
    marginTop: 2,
  },

  filesSection: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  filesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  filesSectionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  filesCount: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
  },

  fileRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  fileOrder: {
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: `${colors.primary}12`,
  },

  fileOrderText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  fileDetails: {
    flex: 1,
    minWidth: 0,
  },

  fileName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  fileMeta: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 2,
  },

  noFileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  noFileText: {
    ...typography.body,
    color: colors.textMuted,
  },

  gradingPanel: {
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}35`,
    borderRadius: radius.lg,
    backgroundColor: `${colors.primary}07`,
  },

  gradingHeading: {
    marginBottom: spacing.md,
  },

  gradingTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },

  gradingSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 3,
  },

  formField: {
    marginBottom: spacing.md,
  },

  formLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  formHelper: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  gradeInputWrapper: {
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  gradeInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    outlineStyle: "none",
  },

  gradeSuffix: {
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    backgroundColor: colors.background,
  },

  gradeSuffixText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textMuted,
  },

  commentsInput: {
    minHeight: 110,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    outlineStyle: "none",
  },

  correctedPickerHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  selectedFilesList: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  selectedFileRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  selectedFileIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: `${colors.primary}12`,
  },

  removeSelectedFile: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}10`,
  },

  noSelectedFiles: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  noSelectedFilesText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: spacing.md,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
  },

  delegationPanel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.warning}45`,
    borderRadius: radius.md,
    backgroundColor: `${colors.warning}10`,
  },

  delegationText: {
    flex: 1,
    minWidth: 0,
  },

  delegationTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  delegationSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 3,
  },

  delegationActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  historyActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.md,
  },

  gradedPanel: {
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.secondary}45`,
    borderRadius: radius.lg,
    backgroundColor: `${colors.secondary}0C`,
  },

  gradedHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  gradedIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: `${colors.secondary}18`,
  },

  gradedText: {
    flex: 1,
    minWidth: 0,
  },

  gradedTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  gradedSubtitle: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: "800",
    marginTop: 2,
  },

  gradedByText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  feedbackBox: {
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
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

  returnedFilesSection: {
    marginTop: spacing.md,
  },

  correctedFileRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: `${colors.secondary}45`,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  correctedFileIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: `${colors.secondary}16`,
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
    backgroundColor: `${colors.secondary}25`,
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
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },

  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },

  progressText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
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
    backgroundColor: `${colors.secondary}22`,
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
    backgroundColor: `${colors.danger}12`,
    marginBottom: spacing.md,
  },

  notFoundTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
  },

  notFoundText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: spacing.md,
  },

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: "rgba(5, 20, 25, 0.52)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "88%",
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
  },

  historyModalCard: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "85%",
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  modalIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: `${colors.secondary}25`,
  },

  modalHeadingCopy: {
    flex: 1,
    minWidth: 0,
  },

  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },

  mutedText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 3,
  },

  modalClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },

  searchInput: {
    flex: 1,
    minHeight: 46,
    color: colors.textPrimary,
    outlineStyle: "none",
  },

  reasonField: {
    marginBottom: spacing.md,
  },

  reasonInput: {
    minHeight: 82,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    outlineStyle: "none",
  },

  assistantList: {
    maxHeight: 360,
  },

  assistantListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },

  assistantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  assistantAvatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: `${colors.primary}14`,
  },

  assistantAvatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },

  assistantInfo: {
    flex: 1,
    minWidth: 0,
  },

  assistantName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  assistantRole: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },

  assistantGroups: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  assistantSelectButton: {
    minWidth: 100,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  assistantSelectButtonActive: {
    backgroundColor: colors.primary,
  },

  assistantSelectText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  assistantSelectTextActive: {
    color: colors.white,
  },

  modalState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  modalEmptyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  historyLoading: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },

  historyList: {
    maxHeight: 480,
  },

  historyListContent: {
    paddingVertical: spacing.sm,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 90,
  },

  historyRail: {
    width: 30,
    alignItems: "center",
  },

  historyDot: {
    width: 14,
    height: 14,
    borderWidth: 3,
    borderColor: `${colors.primary}35`,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },

  historyLine: {
    flex: 1,
    width: 2,
    marginVertical: 4,
    backgroundColor: colors.border,
  },

  historyContent: {
    flex: 1,
    minWidth: 0,
    paddingLeft: spacing.sm,
    paddingBottom: spacing.lg,
  },

  historyAction: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  historyMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  historyReason: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  ...Platform.select({
    web: {
      submissionCard: {
        padding: spacing.lg,
        boxShadow:
          "0 4px 18px rgba(11, 60, 73, 0.05)",
      },

      modalCard: {
        width: "100%",
        maxWidth: 680,
        maxHeight: "88%",
        padding: spacing.lg,
        borderRadius: radius.xl,
        backgroundColor: colors.white,
        boxShadow:
          "0 18px 60px rgba(0, 0, 0, 0.18)",
      },

      historyModalCard: {
        width: "100%",
        maxWidth: 680,
        maxHeight: "85%",
        padding: spacing.lg,
        borderRadius: radius.xl,
        backgroundColor: colors.white,
        boxShadow:
          "0 18px 60px rgba(0, 0, 0, 0.18)",
      },
    },

    default: {},
  }),
});