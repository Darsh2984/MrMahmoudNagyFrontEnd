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

export const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  page: {
    flex: 1,
    backgroundColor: colors.background,
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

  topBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },

  topBarContent: {
    width: "100%",
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  topBarContentDesktop: {
    maxWidth: 1280,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },

  titleArea: {
    flex: 1,
    minWidth: 0,
  },

  ticketSubject: {
    ...typography.h3,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 4,
  },

  studentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 3,
  },

  studentHeaderName: {
    ...typography.bodyBold,
    color: colors.primary,
    flex: 1,
  },

  titleMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.danger}35`,
    backgroundColor: `${colors.danger}0E`,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  errorText: {
    ...typography.body,
    color: colors.danger,
    flex: 1,
  },

  workspace: {
    flex: 1,
  },

  workspaceDesktop: {
    width: "100%",
    maxWidth: 1280,
    alignSelf: "center",
    flexDirection: "row",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },

  conversationColumn: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },

  messagesScroll: {
    flex: 1,
  },

  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  conversationIntro: {
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },

  introTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },

  introDescription: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 540,
  },

  emptyMessages: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
  },

  emptyMessagesTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  emptyMessagesDescription: {
    ...typography.body,
    color: colors.textMuted,
  },

  messageRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: spacing.md,
  },

  messageRowMine: {
    justifyContent: "flex-end",
  },

  messageRowOther: {
    justifyContent: "flex-start",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}14`,
    marginRight: spacing.sm,
  },

  avatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  messageGroup: {
    maxWidth: "78%",
    alignItems: "flex-start",
  },

  messageGroupMine: {
    alignItems: "flex-end",
  },

  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 5,
    marginLeft: spacing.xs,
  },

  senderRowMine: {
    justifyContent: "flex-end",
    marginLeft: 0,
    marginRight: spacing.xs,
  },

  senderName: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "800",
  },

  roleBadge: {
    borderRadius: 999,
    backgroundColor: `${colors.secondary}1C`,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },

  roleBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    color: colors.textPrimary,
    fontWeight: "700",
  },

  messageBubble: {
    minWidth: 80,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  messageBubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 5,
  },

  messageBubbleOther: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 5,
  },

  temporaryMessage: {
    opacity: 0.72,
  },

  messageText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  messageTextMine: {
    color: colors.white,
  },

  messageTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginLeft: spacing.xs,
  },

  messageTimeRowMine: {
    marginLeft: 0,
    marginRight: spacing.xs,
  },

  messageTime: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
  },

  messageImage: {
    width: 260,
    maxWidth: "100%",
    height: 180,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },

  fileCard: {
    minWidth: 245,
    maxWidth: 330,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: `${colors.background}F5`,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },

  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
  },

  fileText: {
    flex: 1,
    minWidth: 0,
  },

  fileName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    lineHeight: 19,
  },

  fileType: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  audioCard: {
    minWidth: 235,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  audioPlayButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },

  audioContent: {
    flex: 1,
  },

  audioTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  audioDuration: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  typingRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    marginLeft: 44,
  },

  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  typingDots: {
    flexDirection: "row",
    gap: 3,
  },

  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  typingText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
  },

  composerContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom:
      Platform.OS === "ios"
        ? spacing.lg
        : spacing.sm,
  },

  composerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },

  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  connectionText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },

  characterCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },

  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },

  composerTools: {
    flexDirection: "row",
    alignItems: "center",
  },

  toolButton: {
    width: 40,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  composerInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 130,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: "top",
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonEnabled: {
    backgroundColor: colors.primary,
  },

  sendButtonDisabled: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },

  attachmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },

  attachmentThumbnail: {
    width: 54,
    height: 54,
    borderRadius: radius.sm,
  },

  attachmentPreviewIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
  },

  attachmentPreviewText: {
    flex: 1,
    minWidth: 0,
  },

  attachmentPreviewName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  attachmentPreviewMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  removeAttachmentButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  recordingPanel: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: `${colors.danger}45`,
    borderRadius: radius.lg,
    backgroundColor: `${colors.danger}0C`,
    paddingHorizontal: spacing.md,
  },

  recordingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },

  recordingText: {
    ...typography.bodyBold,
    color: colors.danger,
  },

  recordingActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  recordingAction: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  stopRecordingButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger,
  },

  closedNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: `${colors.secondary}12`,
    padding: spacing.md,
  },

  closedNoticeText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: "center",
    flexShrink: 1,
  },

  detailsColumn: {
    width: 330,
    gap: spacing.md,
  },

  detailsCard: {
    padding: spacing.lg,
  },

  detailsHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },

  detailsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  detailsDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },

  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}10`,
    marginRight: spacing.sm,
  },

  detailText: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },

  detailValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  statusSummary: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },

  statusSummaryText: {
    flex: 1,
  },

  statusSummaryTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  statusSummaryDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
  },

  actionCard: {
    padding: spacing.md,
  },

  actionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  actionDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.md,
  },

  confirmActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  unavailableCard: {
    width: "100%",
    maxWidth: 460,
    alignItems: "center",
    padding: spacing.xl,
  },

  unavailableTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  unavailableDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },

  unavailableActions: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  flexButton: {
    flex: 1,
  },

  pressed: {
    opacity: 0.72,
  },
});