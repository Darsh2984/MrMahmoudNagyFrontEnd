import { StyleSheet } from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

export const styles =
  StyleSheet.create({
    page: {
      width: "100%",
      maxWidth: 1320,
      alignSelf: "center",
      paddingBottom: spacing.xl,
    },

    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.lg,
      marginBottom: spacing.lg,
    },

    headerCompact: {
      flexDirection: "column",
    },

    headerCopy: {
      flex: 1,
      maxWidth: 760,
    },

    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },

    eyebrowIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.secondary + "35",
    },

    eyebrow: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.1,
      color: colors.primary,
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
    },

    globalBadge: {
      minWidth: 150,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor: colors.white,
    },

    globalBadgeLabel: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: colors.textMuted,
    },

    globalBadgeValue: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.primary,
    },

    message: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderRadius: radius.lg,
    },

    errorMessage: {
      borderColor:
        colors.danger + "60",
      backgroundColor:
        colors.danger + "12",
    },

    successMessage: {
      borderColor:
        colors.secondary,
      backgroundColor:
        colors.secondary + "20",
    },

    messageText: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
    },

    errorText: {
      color: colors.danger,
    },

    closeMessage: {
      padding: 4,
    },

    browserCard: {
      padding: 0,
      overflow: "hidden",
      marginBottom: spacing.lg,
    },

    breadcrumbs: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    breadcrumbButton: {
      maxWidth: 220,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: spacing.sm,
      paddingHorizontal: 3,
    },

    breadcrumbLink: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
    },

    breadcrumbCurrent: {
      color: colors.textPrimary,
      fontWeight: "800",
    },

    browserHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.lg,
      padding: spacing.lg,
    },

    browserHeaderCompact: {
      flexDirection: "column",
      alignItems: "stretch",
    },

    browserHeaderCopy: {
      flex: 1,
    },

    sectionLabel: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: 5,
    },

    browserTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      marginBottom: 5,
    },

    browserDescription: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 21,
    },

    mainLayout: {
      gap: spacing.lg,
    },

    mainLayoutDesktop: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    contentColumn: {
      flex: 1,
      minWidth: 0,
    },

    sideColumn: {
      width: "100%",
      gap: spacing.md,
    },

    sideColumnDesktop: {
      width: 340,
    },

    listHeader: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },

    listTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    listCount: {
      marginTop: 3,
      fontSize: 12,
      color: colors.textMuted,
    },

    refreshButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.white,
    },

    itemList: {
      gap: spacing.sm,
    },

    itemCard: {
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor: colors.white,
    },

    itemOpenArea: {
      minHeight: 82,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
    },

    itemIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.secondary + "28",
    },

    itemCopy: {
      flex: 1,
      minWidth: 0,
    },

    itemTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 4,
    },

    itemSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
    },

    itemActions: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingHorizontal: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor:
        colors.background,
    },

    itemActionButton: {
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
    },

    itemActionDivider: {
      width: 1,
      height: 22,
      backgroundColor:
        colors.border,
    },

    itemEditActionText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.primary,
    },

    itemDeleteActionText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.danger,
    },

    disabledAction: {
      opacity: 0.55,
    },

    resourceCard: {
      gap: spacing.md,
    },

    resourceMain: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },

    resourceIcon: {
      width: 52,
      height: 52,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.secondary + "25",
    },

    videoIcon: {
      backgroundColor:
        colors.warning + "18",
    },

    resourceCopy: {
      flex: 1,
      minWidth: 0,
    },

    resourceTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 6,
    },

    resourceTypeRow: {
      alignSelf: "flex-start",
      paddingVertical: 4,
      paddingHorizontal: 9,
      borderRadius: 999,
      backgroundColor:
        colors.background,
    },

    resourceTypeText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textMuted,
    },

    resourceActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    loadingCard: {
      minHeight: 190,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    loadingText: {
      ...typography.body,
      color: colors.textMuted,
    },

    emptyCard: {
      minHeight: 260,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    emptyIcon: {
      width: 66,
      height: 66,
      borderRadius: 33,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.secondary + "28",
      marginBottom: spacing.md,
    },

    emptyTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: spacing.xs,
    },

    emptyText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: spacing.lg,
      maxWidth: 420,
    },

    actionCard: {
      gap: spacing.md,
    },

    actionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },

    actionIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.secondary + "25",
    },

    videoActionIcon: {
      backgroundColor:
        colors.warning + "18",
    },

    actionCopy: {
      flex: 1,
    },

    actionTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 3,
    },

    actionDescription: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 19,
    },

    inputLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },

    input: {
      minHeight: 48,
      width: "100%",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.white,
      color: colors.textPrimary,
      fontSize: 15,
    },

    helpCard: {
      backgroundColor:
        colors.secondary + "16",
    },

    helpIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.white,
      marginBottom: spacing.sm,
    },

    helpTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },

    helpText: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 21,
    },

    modalBackdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
      backgroundColor:
        "rgba(20, 20, 20, 0.55)",
    },

    modalCard: {
      width: "100%",
      maxWidth: 540,
      padding: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor: colors.white,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },

    modalIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.secondary + "25",
    },

    modalHeadingCopy: {
      flex: 1,
    },

    modalTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 4,
    },

    modalDescription: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 19,
    },

    modalClose: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 18,
      backgroundColor:
        colors.background,
    },

    modalActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      gap: spacing.sm,
      marginTop: spacing.lg,
    },

    replacementBox: {
      gap: spacing.md,
      padding: spacing.md,
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor:
        colors.background,
    },

    replacementInfo: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },

    replacementCopy: {
      flex: 1,
    },

    replacementTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 3,
    },

    replacementDescription: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
    },

    keepCurrentButton: {
      alignSelf: "flex-start",
      paddingVertical: 5,
    },

    keepCurrentText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.danger,
    },

    pressed: {
      opacity: 0.72,
    },
  });