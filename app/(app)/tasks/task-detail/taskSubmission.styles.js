import {
  Platform,
  StyleSheet,
} from "react-native";

import {
  colors,
  spacing,
  radius,
  typography,
} from "../../../../src/theme";

export const styles = StyleSheet.create({
  submissionCard: {
    padding: spacing.lg,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.45,
  },

  cardSelectionRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
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

  cardSelectionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },

  submissionHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  studentIdentity: {
    flex: 1,
    minWidth: 220,
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

  noFileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  noFileText: {
    flex: 1,
    ...typography.body,
    color: colors.textMuted,
  },

  aiUnavailablePanel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },

  aiUnavailableCopy: {
    flex: 1,
    minWidth: 0,
  },

  aiUnavailableTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  aiUnavailableText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
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

  delegationIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: `${colors.primary}12`,
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

  gradingPanel: {
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}35`,
    borderRadius: radius.lg,
    backgroundColor: `${colors.primary}07`,
  },

  gradingHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  gradingHeadingIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: `${colors.primary}12`,
  },

  gradingHeadingCopy: {
    flex: 1,
    minWidth: 0,
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
    lineHeight: 17,
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  correctedPickerCopy: {
    flex: 1,
    minWidth: 220,
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

  selectedFileCopy: {
    flex: 1,
    minWidth: 0,
  },

  selectedFileName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  selectedFileMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
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

  gradingActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  correctedFileOpenArea: {
    flex: 1,
    minWidth: 0,
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
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

  correctedFileDeleteButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}10`,
  },

  gradedActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  ...Platform.select({
    web: {
      submissionCard: {
        padding: spacing.lg,
        boxShadow:
          "0 4px 18px rgba(11, 60, 73, 0.05)",
      },
    },

    default: {},
  }),
});
