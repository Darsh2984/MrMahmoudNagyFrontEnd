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
    keyboardView: {
      flex: 1,
    },

    page: {
      flex: 1,
      minHeight: 0,
      backgroundColor:
        colors.background,
    },

    centeredScreen: {
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
    },

    loadingText: {
      ...typography.body,
      marginTop: spacing.md,
      color: colors.textMuted,
    },

    unavailableCard: {
      width: "100%",
      maxWidth: 520,
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.xl,
    },

    unavailableTitle: {
      ...typography.h2,
      textAlign: "center",
      color: colors.textPrimary,
    },

    unavailableText: {
      ...typography.body,
      textAlign: "center",
      lineHeight: 22,
      color: colors.textMuted,
    },

    unavailableActions: {
      width: "100%",
      flexDirection: "row",
      gap: spacing.sm,
    },

    flexButton: {
      flex: 1,
    },

    topBar: {
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    topBarContent: {
      width: "100%",
      minHeight: 84,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal:
        spacing.md,
      paddingVertical:
        spacing.sm,
    },

    topBarContentDesktop: {
      maxWidth: 1280,
      alignSelf: "center",
      paddingHorizontal:
        spacing.xl,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.background,
    },

    groupAvatar: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primary,
    },

    groupAvatarText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.white,
    },

    titleArea: {
      flex: 1,
      minWidth: 0,
    },

    groupName: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    groupMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 7,
      marginTop: 4,
    },

    groupMetaText: {
      ...typography.caption,
      color: colors.textMuted,
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    statusOnline: {
      backgroundColor:
        colors.secondary,
    },

    statusOffline: {
      backgroundColor:
        colors.warning,
    },

    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal:
        spacing.md,
      paddingVertical:
        spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor:
        `${colors.danger}35`,
      backgroundColor:
        `${colors.danger}10`,
    },

    errorText: {
      flex: 1,
      ...typography.body,
      color: colors.danger,
    },

    workspace: {
      flex: 1,
      minHeight: 0,
    },

    workspaceDesktop: {
      width: "100%",
      maxWidth: 1280,
      alignSelf: "center",
      flexDirection: "row",
      gap: spacing.lg,
      paddingHorizontal:
        spacing.xl,
      paddingVertical:
        spacing.lg,
    },

    conversationColumn: {
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: radius.lg,
      backgroundColor:
        colors.white,
    },

    messagesScroll: {
      flex: 1,
      minHeight: 0,
    },

    messagesContent: {
      flexGrow: 1,
      paddingHorizontal:
        spacing.md,
      paddingTop: spacing.md,
      paddingBottom:
        spacing.xl,
    },

    loadOlderButton: {
      alignSelf: "center",
      marginBottom:
        spacing.lg,
    },

    emptyMessages: {
      flex: 1,
      minHeight: 320,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
      padding: spacing.xl,
    },

    emptyIcon: {
      width: 76,
      height: 76,
      borderRadius: 38,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.primary}10`,
    },

    emptyTitle: {
      ...typography.h2,
      textAlign: "center",
      color: colors.textPrimary,
    },

    emptyText: {
      ...typography.body,
      maxWidth: 430,
      textAlign: "center",
      lineHeight: 22,
      color: colors.textMuted,
    },

    dateDivider: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginVertical:
        spacing.lg,
    },

    dateDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        colors.border,
    },

    dateDividerText: {
      ...typography.caption,
      fontWeight: "700",
      color: colors.textMuted,
    },

    messageRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom:
        spacing.md,
    },

    messageRowMine: {
      justifyContent:
        "flex-end",
    },

    messageRowOther: {
      justifyContent:
        "flex-start",
    },

    messageAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginRight:
        spacing.sm,
      backgroundColor:
        `${colors.primary}14`,
    },

    messageAvatarText: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.primary,
    },

    messageGroup: {
      maxWidth: "78%",
      alignItems:
        "flex-start",
    },

    messageGroupMine: {
      alignItems: "flex-end",
    },

    senderRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
      marginLeft:
        spacing.xs,
      marginBottom: 5,
    },

    senderRowMine: {
      justifyContent:
        "flex-end",
      marginLeft: 0,
      marginRight:
        spacing.xs,
    },

    senderName: {
      ...typography.caption,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    roleBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor:
        `${colors.secondary}1C`,
    },

    roleBadgeText: {
      fontSize: 10,
      lineHeight: 13,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    messageBubble: {
      minWidth: 80,
      paddingHorizontal:
        spacing.md,
      paddingVertical:
        spacing.sm,
      borderRadius: radius.lg,
    },

    messageBubbleMine: {
      borderBottomRightRadius:
        5,
      backgroundColor:
        colors.primary,
    },

    messageBubbleOther: {
      borderWidth: 1,
      borderColor:
        colors.border,
      borderBottomLeftRadius:
        5,
      backgroundColor:
        colors.white,
    },

    temporaryMessage: {
      opacity: 0.72,
    },

    messageText: {
      ...typography.body,
      lineHeight: 22,
      color: colors.textPrimary,
    },

    messageTextMine: {
      color: colors.white,
    },

    messageTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
      marginLeft:
        spacing.xs,
    },

    messageTimeRowMine: {
      marginLeft: 0,
      marginRight:
        spacing.xs,
    },

    messageTime: {
      fontSize: 11,
      lineHeight: 15,
      color: colors.textMuted,
    },

    messageImage: {
      width: 270,
      maxWidth: "100%",
      height: 190,
      marginBottom:
        spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    fileCard: {
      minWidth: 240,
      maxWidth: 340,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom:
        spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    fileIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.primary}12`,
    },

    fileCopy: {
      flex: 1,
      minWidth: 0,
    },

    fileName: {
      ...typography.bodyBold,
      lineHeight: 19,
      color: colors.textPrimary,
    },

    fileMeta: {
      ...typography.caption,
      marginTop: 3,
      color: colors.textMuted,
    },

    audioCard: {
      minWidth: 240,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom:
        spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    audioCardMine: {
      backgroundColor:
        "rgba(255,255,255,0.16)",
    },

    audioPlayButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primary,
    },

    audioPlayButtonMine: {
      backgroundColor:
        colors.white,
    },

    audioProgressArea: {
      flex: 1,
      gap: 5,
    },

    audioProgressTrack: {
      width: "100%",
      height: 4,
      overflow: "hidden",
      borderRadius: 2,
      backgroundColor:
        `${colors.primary}25`,
    },

    audioProgressTrackMine: {
      backgroundColor:
        "rgba(255,255,255,0.28)",
    },

    audioProgressFill: {
      height: "100%",
      backgroundColor:
        colors.primary,
    },

    audioProgressFillMine: {
      backgroundColor:
        colors.white,
    },

    audioDuration: {
      fontSize: 10,
      color: colors.textMuted,
    },

    audioDurationMine: {
      color:
        "rgba(255,255,255,0.84)",
    },

    typingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom:
        spacing.md,
      marginLeft:
        spacing.md,
    },

    typingDots: {
      flexDirection: "row",
      gap: 3,
      paddingHorizontal: 9,
      paddingVertical: 8,
      borderRadius: 14,
      backgroundColor:
        colors.background,
    },

    typingDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor:
        colors.textMuted,
    },

    typingText: {
      ...typography.caption,
      fontStyle: "italic",
      color: colors.textMuted,
    },

    composerContainer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    offlineNotice: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginBottom:
        spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.warning}10`,
    },

    offlineNoticeText: {
      flex: 1,
      ...typography.caption,
      color: colors.warning,
    },

    selectedAttachment: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom:
        spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    selectedAttachmentIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.primary}12`,
    },

    selectedAttachmentCopy: {
      flex: 1,
      minWidth: 0,
    },

    selectedAttachmentName: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    selectedAttachmentMeta: {
      ...typography.caption,
      marginTop: 2,
      color: colors.textMuted,
    },

    removeAttachmentButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.danger}10`,
    },

    composerRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: spacing.sm,
    },

    composerIconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.primary}10`,
    },

    inputContainer: {
      flex: 1,
      minHeight: 44,
      maxHeight: 130,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 22,
      backgroundColor:
        colors.background,
    },

    messageInput: {
      minHeight: 42,
      maxHeight: 126,
      paddingHorizontal:
        spacing.md,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.textPrimary,
      ...Platform.select({
        web: {
          outlineStyle: "none",
        },
      }),
    },

    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primary,
    },

    sendButtonDisabled: {
      opacity: 0.45,
    },

    recordingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      minHeight: 48,
    },

    recordingIndicator: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor:
        colors.danger,
    },

    recordingText: {
      flex: 1,
      ...typography.bodyBold,
      color: colors.danger,
    },

    cancelRecordingButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.danger}10`,
    },

    detailsColumn: {
      width: 310,
      gap: spacing.md,
    },

    detailsCard: {
      alignItems: "center",
      gap: spacing.sm,
    },

    detailsIcon: {
      width: 62,
      height: 62,
      borderRadius: 31,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.primary}10`,
    },

    detailsTitle: {
      ...typography.h3,
      textAlign: "center",
      color: colors.textPrimary,
    },

    detailsSubtitle: {
      ...typography.body,
      textAlign: "center",
      color: colors.textMuted,
    },

    detailsDivider: {
      width: "100%",
      height: 1,
      marginVertical:
        spacing.sm,
      backgroundColor:
        colors.border,
    },

    detailRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    detailRowIcon: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.primary}10`,
    },

    detailRowCopy: {
      flex: 1,
    },

    detailRowLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },

    detailRowValue: {
      ...typography.bodyBold,
      marginTop: 2,
      color: colors.textPrimary,
    },

    noticeCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      backgroundColor:
        `${colors.primary}08`,
    },

    noticeText: {
      flex: 1,
      ...typography.body,
      lineHeight: 21,
      color: colors.textMuted,
    },

    pressed: {
      opacity: 0.7,
    },
  });