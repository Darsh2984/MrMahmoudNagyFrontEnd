import { StyleSheet } from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../src/theme";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20, 20, 20, 0.62)",
  },

  modalCard: {
    width: "100%",
    maxWidth: 1450,
    height: "94%",
    overflow: "hidden",
    borderRadius: radius.xl,
    backgroundColor: colors.white,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  headerCopy: {
    flex: 1,
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textMuted,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.danger}45`,
    backgroundColor: `${colors.danger}12`,
  },

  errorText: {
    flex: 1,
    color: colors.danger,
  },

  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.secondary}55`,
    backgroundColor: `${colors.secondary}18`,
  },

  successText: {
    flex: 1,
    color: colors.primary,
  },

  body: {
    flex: 1,
    flexDirection: "row",
    minHeight: 0,
  },

  attemptsColumn: {
    width: 420,
    maxWidth: "42%",
    padding: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.background,
  },

  detailColumn: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.white,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },

  summaryBox: {
    flexGrow: 1,
    minWidth: 82,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },

  summaryBoxWarning: {
    borderColor: `${colors.warning}70`,
    backgroundColor: `${colors.warning}12`,
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 10,
    color: colors.textMuted,
  },

  attemptList: {
    flex: 1,
  },

  attemptListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },

  attemptCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },

  attemptCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.secondary}13`,
  },

  attemptCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
  },

  studentCopy: {
    flex: 1,
    minWidth: 0,
  },

  studentName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  studentGroup: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },

  attemptMeta: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  metaValue: {
    flex: 1,
    minWidth: 0,
  },

  metaLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
  },

  metaText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  paperStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  fileCountText: {
    fontSize: 11,
    color: colors.textMuted,
  },

  detailScroll: {
    flex: 1,
  },

  detailContent: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },

  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 240,
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },

  emptyState: {
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },

  emptyDetail: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 300,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  emptyText: {
    marginTop: 5,
    textAlign: "center",
    color: colors.textMuted,
  },

  submissionHeader: {
    gap: spacing.md,
  },

  submissionTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },

  largeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  largeAvatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
  },

  submissionStudentCopy: {
    flex: 1,
  },

  submissionStudentName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  submissionStudentInfo: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  submissionDates: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  reviewSection: {
    gap: spacing.md,
  },

  reviewHeading: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  reviewTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  reviewSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  subsectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  resultBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },

  questionReviewCard: {
    gap: spacing.md,
  },

  writtenQuestionCard: {
    gap: spacing.md,
  },

  questionReviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  questionNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  questionNumberText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.white,
  },

  questionReviewCopy: {
    flex: 1,
  },

  questionReviewTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  questionPoints: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  answerComparison: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  answerBox: {
    flexGrow: 1,
    minWidth: 145,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  answerBoxSuccess: {
    borderColor: `${colors.secondary}80`,
    backgroundColor: `${colors.secondary}18`,
  },

  answerBoxDanger: {
    borderColor: `${colors.danger}65`,
    backgroundColor: `${colors.danger}10`,
  },

  answerBoxLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
  },

  answerBoxValue: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  fileActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },

  noMarkschemeText: {
    fontSize: 12,
    color: colors.textMuted,
  },

  fileList: {
    gap: spacing.sm,
  },

  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  fileIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}25`,
  },

  fileCopy: {
    flex: 1,
    minWidth: 0,
  },

  fileName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  fileMeta: {
    marginTop: 2,
    fontSize: 10,
    color: colors.textMuted,
  },

  emptyFileText: {
    padding: spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textMuted,
    backgroundColor: colors.background,
  },

  deleteFileButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.danger}10`,
  },

  gradingCard: {
    gap: spacing.md,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  fieldHint: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },

  input: {
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

  commentsInput: {
    minHeight: 120,
  },

  correctedPickerHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  selectedFiles: {
    gap: spacing.xs,
  },

  selectedFileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  removeFileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.7,
  },
});