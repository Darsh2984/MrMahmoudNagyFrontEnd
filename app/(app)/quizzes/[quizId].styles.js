import { StyleSheet } from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../src/theme";

export const styles = StyleSheet.create({
  screenContent: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },

  centeredScreen: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },

  pageHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },

  pageHeaderCopy: {
    flex: 1,
    minWidth: 240,
    maxWidth: 700,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },

  pageTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  pageDescription: {
    ...typography.body,
    color: colors.textMuted,
    maxWidth: 660,
    lineHeight: 23,
  },

  timerCard: {
    minWidth: 190,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}35`,
    borderRadius: radius.lg,
    backgroundColor: `${colors.primary}08`,
  },

  timerCardWarning: {
    borderColor: `${colors.warning}65`,
    backgroundColor: `${colors.warning}10`,
  },

  timerCardExpired: {
    borderColor: `${colors.danger}55`,
    backgroundColor: `${colors.danger}10`,
  },

  timerHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  timerHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  timerHeadingWarning: {
    color: colors.warning,
  },

  timerText: {
    marginTop: spacing.xs,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: colors.primary,
  },

  timerTextWarning: {
    color: colors.warning,
  },

  timeWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.warning}55`,
    borderRadius: radius.md,
    backgroundColor: `${colors.warning}10`,
  },

  timeWarningText: {
    flex: 1,
    ...typography.body,
    lineHeight: 21,
    color: colors.textPrimary,
  },

  autoSubmittingAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.warning}55`,
    borderRadius: radius.md,
    backgroundColor: `${colors.warning}10`,
  },

  autoSubmittingText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },

  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.danger}40`,
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}12`,
  },

  errorContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  errorText: {
    flex: 1,
    ...typography.body,
    color: colors.danger,
  },

  errorCloseButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  questionCounter: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  answeredCounter: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  progressPercentage: {
    ...typography.bodyBold,
    color: colors.primary,
  },

  progressTrack: {
    height: 8,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },

  progressFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },

  workspace: {
    width: "100%",
  },

  workspaceDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },

  mainColumn: {
    flex: 1,
    minWidth: 0,
  },

  questionCard: {
    padding: spacing.lg,
  },

  questionTopRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  questionBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },

  savedStatusCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  questionTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  questionReference: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  fileIconContainer: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}12`,
  },

  fileButtonTextContainer: {
    flex: 1,
  },

  fileButtonTitle: {
    ...typography.bodyBold,
    color: colors.primary,
    marginBottom: 2,
  },

  fileButtonDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },

  sectionLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  sectionHelp: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.md,
  },

  optionsGrid: {
    gap: spacing.sm,
  },

  optionsGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  optionTile: {
    width: "100%",
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  optionTileDesktop: {
    width: "48.8%",
  },

  optionTileSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`,
  },

  optionLetterCircle: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.background,
  },

  optionLetterCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  optionLetter: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  optionLetterSelected: {
    color: colors.white,
  },

  optionText: {
    flex: 1,
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  optionTextSelected: {
    color: colors.primary,
  },

  optionCheckArea: {
    width: 26,
    alignItems: "flex-end",
  },

  unselectedCircle: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
  },

  savingStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  savingStatusText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },

  savedStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  savedStatusText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "700",
  },

  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.md,
  },

  navigationRowMobile: {
    alignItems: "stretch",
  },

  navigationButton: {
    flex: 1,
  },

  navigatorCard: {
    width: 290,
    padding: spacing.lg,
  },

  navigatorTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  navigatorDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.md,
  },

  questionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  questionNumber: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  questionNumberAnswered: {
    borderColor: `${colors.secondary}80`,
    backgroundColor: `${colors.secondary}18`,
  },

  questionNumberCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  questionNumberText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  questionNumberTextAnswered: {
    color: colors.secondary,
  },

  questionNumberTextCurrent: {
    color: colors.white,
  },

  questionCheck: {
    position: "absolute",
    right: -3,
    top: -3,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },

  navigatorDivider: {
    height: 1,
    marginVertical: spacing.lg,
    backgroundColor: colors.border,
  },

  navigatorStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  navigatorStatLabel: {
    ...typography.body,
    color: colors.textMuted,
  },

  navigatorStatValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  legend: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },

  legendCurrent: {
    backgroundColor: colors.primary,
  },

  legendAnswered: {
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}55`,
  },

  legendUnanswered: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  legendLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  navigatorSubmitButton: {
    width: "100%",
    marginTop: spacing.lg,
  },

  pressed: {
    opacity: 0.76,
  },

  disabledControl: {
    opacity: 0.55,
  },

  emptyQuestionCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },

  emptyQuestionText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 480,
    padding: spacing.xl,
  },

  modalIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderRadius: 29,
    backgroundColor: `${colors.warning}15`,
  },

  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  modalDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 23,
    marginBottom: spacing.md,
  },

  unansweredWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.warning}45`,
    borderRadius: radius.md,
    backgroundColor: `${colors.warning}12`,
  },

  unansweredWarningText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },

  allAnsweredNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.secondary}45`,
    borderRadius: radius.md,
    backgroundColor: `${colors.secondary}12`,
  },

  allAnsweredNoticeText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },

  modalFootnote: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: spacing.md,
  },

  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  modalButton: {
    flex: 1,
  },

  submittedCard: {
    width: "100%",
    maxWidth: 460,
    alignItems: "center",
    padding: spacing.xl,
  },

  successIcon: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderRadius: 36,
    backgroundColor: `${colors.secondary}18`,
  },

  autoSubmitIcon: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderRadius: 36,
    backgroundColor: `${colors.warning}16`,
  },

  submittedTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  submittedDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  scorePanel: {
    width: "100%",
    alignItems: "center",
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  scoreLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  scoreValue: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: "800",
    color: colors.primary,
  },

  scoreTotal: {
    fontSize: 22,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },

  submittedNotice: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: `${colors.secondary}12`,
  },

  submittedNoticeText: {
    flex: 1,
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  autoSubmittedNotice: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: `${colors.warning}10`,
  },

  autoSubmittedNoticeText: {
    flex: 1,
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  fullWidthButton: {
    width: "100%",
  },

  emptyCard: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    padding: spacing.xl,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderRadius: 31,
    backgroundColor: `${colors.danger}12`,
  },

  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  emptyDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

    submittedTimerText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.8,
    color: colors.secondary,
  },

  paperSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  paperSummaryCard: {
    flex: 1,
    minWidth: 165,
    padding: spacing.md,
  },

  paperSummaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },

  paperSummaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  paperSummaryStatusValue: {
    fontSize: 15,
    lineHeight: 22,
  },

  paperCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  paperSectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  paperSectionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      `${colors.primary}10`,
  },

  paperSectionCopy: {
    flex: 1,
  },

  paperSectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  paperSectionDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 21,
  },

  paperUploadZone: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor:
      `${colors.primary}55`,
    borderRadius: radius.lg,
    backgroundColor:
      `${colors.primary}06`,
  },

  paperUploadTitle: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },

  paperUploadDescription: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  paperFileList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  paperFileRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  paperFileOrder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      `${colors.primary}12`,
  },

  paperFileOrderText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },

  paperFileCopy: {
    flex: 1,
    minWidth: 0,
  },

  paperFileName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  paperFileMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  paperFileAction: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor:
      `${colors.primary}0D`,
  },

  paperFileDelete: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor:
      `${colors.danger}0D`,
  },

  paperEmptyFiles: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor:
      colors.background,
  },

  paperEmptyFilesTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  paperEmptyFilesDescription: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  paperSubmittedPanel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor:
      `${colors.secondary}45`,
    borderRadius: radius.md,
    backgroundColor:
      `${colors.secondary}10`,
  },

  paperSubmittedText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 21,
  },

  paperAutoSubmittedPanel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor:
      `${colors.warning}45`,
    borderRadius: radius.md,
    backgroundColor:
      `${colors.warning}10`,
  },

  paperAutoSubmittedText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 21,
  },

  gradingCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  gradingHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  gradingTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },

  gradingSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    maxWidth: 600,
    lineHeight: 19,
    marginTop: spacing.xs,
  },

  pendingGradingPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor:
      `${colors.warning}10`,
  },

  pendingGradingText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },

  gradingComments: {
    width: "100%",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor:
      colors.background,
  },

  gradingCommentsLabel: {
    ...typography.caption,
    fontWeight: "800",
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },

  gradingCommentsText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  backButton: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
  },
});