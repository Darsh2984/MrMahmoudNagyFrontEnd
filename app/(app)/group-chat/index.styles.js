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
    screenContent: {
      flex: 1,
      padding: 0,
    },

    page: {
      flex: 1,
      minHeight: 0,
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor:
        colors.background,
    },

    pageHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.lg,
    },

    pageHeaderMobile: {
      flexDirection: "column",
    },

    headerCopy: {
      flex: 1,
    },

    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginBottom: spacing.xs,
    },

    eyebrow: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "800",
      letterSpacing: 1.1,
    },

    connectionIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    connectionOnline: {
      backgroundColor:
        colors.secondary,
    },

    connectionOffline: {
      backgroundColor:
        colors.warning,
    },

    connectionText: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: "700",
    },

    title: {
      ...typography.h1,
      color: colors.textPrimary,
    },

    subtitle: {
      ...typography.body,
      maxWidth: 620,
      marginTop: spacing.xs,
      color: colors.textMuted,
      lineHeight: 22,
    },

    headerStats: {
      flexDirection: "row",
      gap: spacing.sm,
    },

    headerStat: {
      minWidth: 94,
      paddingHorizontal:
        spacing.md,
      paddingVertical:
        spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor:
        colors.white,
    },

    headerStatValue: {
      fontSize: 21,
      fontWeight: "900",
      color: colors.primary,
    },

    headerStatLabel: {
      marginTop: 2,
      fontSize: 11,
      color: colors.textMuted,
    },

    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.danger}45`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.danger}10`,
    },

    errorText: {
      flex: 1,
      ...typography.body,
      color: colors.danger,
    },

    dismissButton: {
      padding: 3,
    },

    toolbar: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },

    searchContainer: {
      flex: 1,
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal:
        spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },

    searchInput: {
      flex: 1,
      minHeight: 44,
      color: colors.textPrimary,
      fontSize: 14,
      ...Platform.select({
        web: {
          outlineStyle: "none",
        },
      }),
    },

    clearSearchButton: {
      padding: 3,
    },

    chatScroll: {
      flex: 1,
      minHeight: 0,
    },

    chatList: {
      gap: spacing.sm,
      paddingBottom: spacing.xl,
    },

    chatCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor:
        colors.white,
      ...Platform.select({
        web: {
          cursor: "pointer",
        },
      }),
    },

    chatCardUnread: {
      borderColor:
        `${colors.primary}55`,
      backgroundColor:
        `${colors.primary}05`,
    },

    chatCardPressed: {
      opacity: 0.75,
    },

    groupAvatar: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.primary}12`,
    },

    groupAvatarUnread: {
      backgroundColor:
        colors.primary,
    },

    groupAvatarText: {
      fontSize: 17,
      fontWeight: "900",
      color: colors.primary,
    },

    groupAvatarTextUnread: {
      color: colors.white,
    },

    chatCopy: {
      flex: 1,
      minWidth: 0,
    },

    chatTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
    },

    chatNameRow: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.xs,
    },

    chatName: {
      flexShrink: 1,
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    chatNameUnread: {
      fontWeight: "900",
      color: colors.primary,
    },

    messageTime: {
      fontSize: 11,
      color: colors.textMuted,
    },

    messageTimeUnread: {
      fontWeight: "800",
      color: colors.primary,
    },

    chatBottomRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: 6,
    },

    messagePreview: {
      flex: 1,
      fontSize: 13,
      color: colors.textMuted,
    },

    messagePreviewUnread: {
      fontWeight: "700",
      color: colors.textPrimary,
    },

    unreadBadge: {
      minWidth: 24,
      height: 24,
      paddingHorizontal: 6,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.primary,
    },

    unreadBadgeText: {
      fontSize: 10,
      fontWeight: "900",
      color: colors.white,
    },

    memberRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 7,
    },

    memberText: {
      fontSize: 11,
      color: colors.textMuted,
    },

    loadingCard: {
      flex: 1,
      minHeight: 260,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
    },

    loadingText: {
      ...typography.body,
      color: colors.textMuted,
    },

    emptyState: {
      minHeight: 280,
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
      maxWidth: 420,
      textAlign: "center",
      lineHeight: 22,
      color: colors.textMuted,
    },
  });