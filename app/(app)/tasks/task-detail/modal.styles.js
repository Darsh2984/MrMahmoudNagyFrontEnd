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
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: "rgba(5, 20, 25, 0.54)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "90%",
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
  },

  historyModalCard: {
    width: "100%",
    maxWidth: 740,
    maxHeight: "88%",
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
  },

  reopenModalCard: {
    width: "100%",
    maxWidth: 560,
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
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: `${colors.secondary}25`,
  },

  reopenModalIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: `${colors.warning}16`,
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
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.background,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.45,
  },

  currentAssignmentBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}25`,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}08`,
  },

  currentAssignmentIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: colors.white,
  },

  currentAssignmentCopy: {
    flex: 1,
    minWidth: 0,
  },

  currentAssignmentLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
  },

  currentAssignmentValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
  },

  modalErrorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.danger}45`,
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}08`,
  },

  modalErrorText: {
    flex: 1,
    ...typography.caption,
    color: colors.danger,
    lineHeight: 18,
  },

  searchBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  searchInput: {
    flex: 1,
    minHeight: 46,
    color: colors.textPrimary,
    fontSize: 14,
    outlineStyle: "none",
  },

  reasonField: {
    marginBottom: spacing.md,
  },

  formLabel: {
    marginBottom: spacing.xs,
    fontSize: 12,
    fontWeight: "800",
    color: colors.textPrimary,
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

  reopenReasonInput: {
    minHeight: 110,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    outlineStyle: "none",
  },

  listTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  assistantList: {
    maxHeight: 360,
  },

  assistantListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },

  assistantRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  assistantRowCurrent: {
    borderColor: `${colors.primary}35`,
    backgroundColor: `${colors.primary}08`,
  },

  assistantAvatar: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
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

  assistantNameRow: {
    flexDirection: "row",
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
    marginTop: 2,
  },

  assistantGroups: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 2,
  },

  assistantSelectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },

  assistantSelectText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  headBadge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: `${colors.secondary}25`,
  },

  headBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.primary,
  },

  currentText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
  },

  modalState: {
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },

  modalEmptyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: "center",
  },

  modalErrorTitle: {
    ...typography.bodyBold,
    color: colors.danger,
    textAlign: "center",
  },

  modalEmptyText: {
    ...typography.caption,
    maxWidth: 420,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },

  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  historyLoading: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },

  historyList: {
    maxHeight: 520,
  },

  historyListContent: {
    paddingVertical: spacing.sm,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 100,
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

  historyDotSuccess: {
    borderColor: `${colors.secondary}35`,
    backgroundColor: colors.secondary,
  },

  historyDotWarning: {
    borderColor: `${colors.warning}35`,
    backgroundColor: colors.warning,
  },

  historyDotDanger: {
    borderColor: `${colors.danger}35`,
    backgroundColor: colors.danger,
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

  historyEntryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  historyEntryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  historyAction: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  historyDate: {
    fontSize: 10,
    color: colors.textMuted,
  },

  historyMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  assignmentChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  assignmentChangeBox: {
    flex: 1,
    minWidth: 0,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  gradeChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  gradeChangeBox: {
    flex: 1,
    minWidth: 0,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  changeLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
  },

  changeValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  commentChangeBox: {
    gap: spacing.xs,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  commentChangeText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
  },

  historyReason: {
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}07`,
  },

  historyReasonLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
  },

  historyReasonText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
    marginTop: 3,
  },

  reopenSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  reopenSummaryIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.white,
  },

  reopenSummaryCopy: {
    flex: 1,
    minWidth: 0,
  },

  reopenStudentName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  reopenCurrentGrade: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  reopenWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.warning}45`,
    borderRadius: radius.md,
    backgroundColor: `${colors.warning}10`,
  },

  reopenWarningText: {
    flex: 1,
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
  },

  ...Platform.select({
    web: {
      modalCard: {
        width: "100%",
        maxWidth: 680,
        maxHeight: "90%",
        padding: spacing.lg,
        borderRadius: radius.xl,
        backgroundColor: colors.white,
        boxShadow:
          "0 18px 60px rgba(0, 0, 0, 0.18)",
      },

      historyModalCard: {
        width: "100%",
        maxWidth: 740,
        maxHeight: "88%",
        padding: spacing.lg,
        borderRadius: radius.xl,
        backgroundColor: colors.white,
        boxShadow:
          "0 18px 60px rgba(0, 0, 0, 0.18)",
      },

      reopenModalCard: {
        width: "100%",
        maxWidth: 560,
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