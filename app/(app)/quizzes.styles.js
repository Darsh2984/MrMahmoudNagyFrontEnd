import {
  Platform,
  StyleSheet,
} from "react-native";

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

    loadingPage: {
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    loadingText: {
      ...typography.body,
      color: colors.textMuted,
    },

    header: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      gap: spacing.lg,
      marginBottom: spacing.lg,
    },

    headerCopy: {
      flex: 1,
      minWidth: 260,
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
        `${colors.secondary}35`,
    },

    eyebrow: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: colors.primary,
    },

    pageTitle: {
      ...typography.h1,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },

    pageSubtitle: {
      ...typography.body,
      maxWidth: 700,
      color: colors.textMuted,
      lineHeight: 23,
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
      borderColor:
        `${colors.danger}55`,
      backgroundColor:
        `${colors.danger}12`,
    },

    errorText: {
      flex: 1,
      ...typography.body,
      color: colors.danger,
    },

    alertClose: {
      padding: 4,
    },

    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },

    statCard: {
      flex: 1,
      minWidth: 180,
    },

    statIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
      backgroundColor:
        `${colors.secondary}25`,
    },

    statWarningIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
      backgroundColor:
        `${colors.warning}15`,
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

    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
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

    quizList: {
      gap: spacing.md,
    },

    quizCard: {
      gap: spacing.md,
    },

    quizMainRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    quizIcon: {
      width: 52,
      height: 52,
      flexShrink: 0,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        `${colors.secondary}25`,
    },

    paperQuizIcon: {
      backgroundColor:
        `${colors.primary}10`,
    },

    quizIconWarning: {
      backgroundColor:
        `${colors.warning}15`,
    },

    quizIconDisabled: {
      backgroundColor:
        colors.background,
    },

    quizCopy: {
      flex: 1,
      minWidth: 0,
    },

    quizTitleRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      gap: spacing.sm,
    },

    quizTitle: {
      flex: 1,
      minWidth: 170,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    quizDescription: {
      marginTop: spacing.xs,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textMuted,
    },

    quizMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 5,
      marginTop: spacing.sm,
    },

    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    metaText: {
      fontSize: 12,
      color: colors.textMuted,
    },

    metaDot: {
      fontSize: 12,
      color: colors.textMuted,
    },

    dateList: {
      gap: 4,
      marginTop: spacing.sm,
    },

    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    dateText: {
      flex: 1,
      fontSize: 11,
      lineHeight: 16,
      color: colors.textMuted,
    },

    noticePanel: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.xs,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    noticeText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textMuted,
    },

    paperNoticePanel: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.primary}28`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}08`,
    },

    paperNoticeText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textPrimary,
    },

    timerPanel: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.warning}45`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.warning}10`,
    },

    timerLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },

    timerLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    timerValue: {
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: 0.8,
      color: colors.warning,
    },

    resultPanel: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.secondary}16`,
    },

    resultLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textMuted,
    },

    resultValue: {
      marginTop: 3,
      fontSize: 22,
      fontWeight: "900",
      color: colors.textPrimary,
    },

    autoSubmittedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 999,
      backgroundColor:
        `${colors.warning}18`,
    },

    autoSubmittedText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.warning,
    },

    submittedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 999,
      backgroundColor:
        `${colors.secondary}25`,
    },

    submittedText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
    },

    quizAction: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
    },

    quizActionEnabled: {
      backgroundColor:
        colors.primary,
    },

    quizActionDisabled: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor:
        colors.background,
    },

    quizActionPressed: {
      opacity: 0.78,
    },

    quizActionText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.white,
    },

    quizActionTextDisabled: {
      color: colors.textMuted,
    },

    emptyCard: {
      minHeight: 280,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    emptyIcon: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
      backgroundColor:
        `${colors.secondary}22`,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: spacing.xs,
    },

    emptyDescription: {
      ...typography.body,
      maxWidth: 430,
      color: colors.textMuted,
      lineHeight: 21,
      textAlign: "center",
      marginBottom: spacing.md,
    },

    pressed: {
      opacity: 0.76,
    },

    ...Platform.select({
      web: {
        quizCard: {
          gap: spacing.md,
          boxShadow:
            "0 4px 16px rgba(11, 60, 73, 0.06)",
        },
      },

      default: {},
    }),
  });