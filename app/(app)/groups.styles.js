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
    flexOne: {
      flex: 1,
      minWidth: 0,
    },

    centeredScreen: {
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    loadingIcon: {
      width: 60,
      height: 60,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 30,
      backgroundColor:
        `${colors.primary}12`,
      marginBottom: spacing.sm,
    },

    loadingTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginTop: spacing.sm,
    },

    loadingText: {
      ...typography.body,
      maxWidth: 360,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 21,
      marginTop: spacing.xs,
    },

    pageHeader: {
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor:
        colors.primary,
      overflow: "hidden",
    },

    pageHeaderMobile: {
      padding: spacing.md,
      marginBottom: spacing.md,
      borderRadius: radius.md,
    },

    pageHeaderMain: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    pageHeaderMainMobile: {
      gap: spacing.sm,
    },

    pageHeaderIcon: {
      width: 54,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        "rgba(255,255,255,0.14)",
    },

    pageHeaderIconMobile: {
      width: 42,
      height: 42,
      borderRadius: radius.sm,
    },

    pageHeaderText: {
      flex: 1,
      minWidth: 0,
      maxWidth: 820,
    },

    eyebrow: {
      ...typography.caption,
      color: "#D7E6E3",
      fontWeight: "800",
      letterSpacing: 1.2,
      marginBottom: spacing.xs,
    },

    pageTitle: {
      ...typography.h1,
      color: colors.white,
      marginBottom: spacing.xs,
    },

    pageTitleMobile: {
      fontSize: 24,
      lineHeight: 29,
      marginBottom: 3,
    },

    pageSubtitle: {
      ...typography.body,
      color: "#E4ECEA",
      lineHeight: 22,
    },

    pageSubtitleMobile: {
      fontSize: 13,
      lineHeight: 19,
    },

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },

    summaryGridMobile: {
      gap: spacing.xs,
      marginBottom: spacing.md,
    },

    summaryCard: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 190,
      minWidth: 160,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
    },

    summaryIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}10`,
    },

    summaryContent: {
      flex: 1,
      minWidth: 0,
    },

    summaryValue: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    summaryLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },

    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor:
        `${colors.danger}55`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.danger}0D`,
    },

    errorIcon: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },

    errorText: {
      ...typography.body,
      flex: 1,
      color: colors.danger,
      lineHeight: 20,
      paddingHorizontal:
        spacing.xs,
    },

    errorDismiss: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
    },

    creationCard: {
      marginBottom: spacing.lg,
      padding: spacing.lg,
    },

    creationHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    mobileHeaderRow: {
      alignItems: "flex-start",
    },

    creationHeaderIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}10`,
    },

    creationHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    creationTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: 3,
    },

    creationDescription: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
    },

    assistantNoticeCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.primary}20`,
      backgroundColor:
        `${colors.primary}08`,
    },

    assistantNoticeIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 21,
      backgroundColor:
        `${colors.primary}10`,
    },

    assistantNoticeContent: {
      flex: 1,
      minWidth: 0,
    },

    assistantNoticeTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: 4,
    },

    assistantNoticeText: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 21,
    },

    inlineForm: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "stretch",
      gap: spacing.sm,
    },

    inlineInput: {
      ...typography.body,
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 220,
      minHeight: 50,
      paddingHorizontal:
        spacing.md,
      paddingVertical:
        spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
      color: colors.textPrimary,

      ...(Platform.OS === "web"
        ? {
            outlineStyle: "none",
          }
        : null),
    },

    createYearButton: {
      minWidth: 150,
    },

    addGroupButton: {
      minWidth: 125,
    },

    mobileFullButton: {
      width: "100%",
      alignSelf: "stretch",
    },

    mobilePanel: {
      padding: spacing.sm,
      borderRadius: radius.md,
    },

    sectionHeader: {
      marginBottom: spacing.sm,
    },

    sectionHeaderCompact: {
      marginBottom: 0,
    },

    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },

    sectionTitle: {
      ...typography.h3,
      color: colors.textPrimary,
    },

    sectionDescription: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 4,
    },

    managementShell: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    managementShellCompact: {
      flexDirection: "column",
    },

    yearPanel: {
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: 270,
      padding: spacing.md,
    },

    yearPanelCompact: {
      width: "100%",
      minWidth: 0,
      flexBasis: "auto",
      flexGrow: 0,
      flexShrink: 0,
    },

    managementBody: {
      flex: 1,
      minWidth: 0,
    },

    managementBodyMobile: {
      width: "100%",
      flexBasis: "auto",
    },

    yearListScroll: {
      width: "100%",
      maxHeight: 320,
      marginTop: spacing.md,
    },

    yearList: {
      gap: spacing.xs,
      paddingBottom: spacing.xs,
    },

    yearChipRow: {
      flexDirection: "row",
      gap: spacing.xs,
      paddingBottom: spacing.lg,
    },

    yearChipRowWrapped: {
      flexWrap: "wrap",
      paddingBottom: spacing.md,
    },

    selectedYearBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.xs,
      marginBottom: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: `${colors.primary}25`,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}08`,
    },

    selectedYearBannerText: {
      flex: 1,
      minWidth: 0,
    },

    selectedYearLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: 2,
    },

    selectedYearName: {
      ...typography.bodyBold,
      color: colors.primary,
      lineHeight: 21,
    },

    selectionChip: {
      minHeight: 43,
      maxWidth: 260,
      flexShrink: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      paddingHorizontal:
        spacing.md,
      paddingVertical:
        spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      backgroundColor:
        colors.white,
    },

    selectionChipWide: {
      width: "100%",
      maxWidth: "100%",
      justifyContent: "flex-start",
    },

    selectionChipSelected: {
      borderColor: colors.primary,
      backgroundColor:
        colors.primary,
    },

    selectionChipText: {
      fontSize: 13,
      fontWeight: "700",
      flexShrink: 1,
      minWidth: 0,
      color: colors.textPrimary,
    },

    selectionChipTextSelected: {
      color: colors.white,
    },

    workspace: {
      width: "100%",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    workspaceCompact: {
      flexDirection: "column",
    },

    groupsColumn: {
      flexGrow: 0.75,
      flexShrink: 1,
      flexBasis: 300,
      minWidth: 280,
    },

    rosterColumn: {
      flexGrow: 1.7,
      flexShrink: 1,
      flexBasis: 520,
      minWidth: 320,
    },

    fullWidthColumn: {
      width: "100%",
      minWidth: 0,
      flexBasis: "auto",
      flexGrow: 0,
      flexShrink: 0,
    },

    columnCard: {
      padding: spacing.md,
    },

    columnHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    columnHeaderMobile: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: spacing.xs,
    },

    countBadge: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: 58,
      paddingHorizontal:
        spacing.sm,
      paddingVertical:
        spacing.xs,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}0D`,
    },

    countBadgeValue: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.primary,
    },

    countBadgeLabel: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 1,
    },

    groupSearch: {
      marginTop: spacing.md,
    },

    searchInput: {
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal:
        spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    searchTextInput: {
      ...typography.body,
      flex: 1,
      minWidth: 0,
      paddingVertical:
        spacing.sm,
      color: colors.textPrimary,

      ...(Platform.OS === "web"
        ? {
            outlineStyle: "none",
          }
        : null),
    },

    searchClearButton: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
    },

    groupList: {
      gap: spacing.xs,
      marginTop: spacing.md,
    },

    groupItem: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },

    groupItemActive: {
      borderColor: colors.primary,
      backgroundColor:
        colors.primary,
    },

    groupItemIcon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}10`,
    },

    groupItemIconActive: {
      backgroundColor:
        "rgba(255,255,255,0.14)",
    },

    groupItemText: {
      flex: 1,
      minWidth: 0,
    },

    groupName: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    groupNameActive: {
      color: colors.white,
    },

    groupCount: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 3,
    },

    groupCountActive: {
      color: "#D7E1DF",
    },

    rosterCard: {
      padding: spacing.lg,
    },

    rosterHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: spacing.md,
    },

    rosterHeaderMobile: {
      flexDirection: "column",
      flexWrap: "nowrap",
      alignItems: "stretch",
      gap: spacing.sm,
    },

    rosterIdentity: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 260,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    rosterIdentityMobile: {
      width: "100%",
      flexBasis: "auto",
      flexGrow: 0,
      alignItems: "flex-start",
    },

    rosterHeaderIcon: {
      width: 54,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        colors.primary,
    },

    rosterHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    rosterTitle: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: spacing.xs,
    },

    rosterMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },

    metaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal:
        spacing.xs,
      paddingVertical: 4,
      borderRadius: radius.pill,
      backgroundColor:
        colors.background,
    },

    metaPillText: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.textMuted,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginVertical: spacing.lg,
    },

    sessionLinkSection: {
      width: "100%",
      gap: spacing.md,
    },

    sessionLinkHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      gap: spacing.md,
    },

    sessionLinkTitleRow: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },

    sessionLinkIcon: {
      width: 44,
      height: 44,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}10`,
    },

    sessionLinkHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    sessionLinkForm: {
      width: "100%",
      flexDirection: "row",
      alignItems: "stretch",
      gap: spacing.sm,
    },

    sessionLinkFormCompact: {
      flexDirection: "column",
    },

    sessionLinkInput: {
      ...typography.body,
      flex: 1,
      minWidth: 0,
      minHeight: 50,
      paddingHorizontal:
        spacing.md,
      paddingVertical:
        spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
      color: colors.textPrimary,

      ...(Platform.OS === "web"
        ? {
            outlineStyle: "none",
          }
        : null),
    },

    sessionLinkSaveButton: {
      minWidth: 125,
    },

    currentSessionLink: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.secondary}35`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.secondary}10`,
    },

    currentSessionLinkContent: {
      flex: 1,
      minWidth: 0,
    },

    currentSessionLinkLabel: {
      ...typography.caption,
      fontWeight: "700",
      color: colors.textMuted,
      marginBottom: 3,
    },

    currentSessionLinkText: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: 20,
    },

    noSessionLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    noSessionLinkText: {
      ...typography.body,
      flex: 1,
      color: colors.textMuted,
      lineHeight: 20,
    },

    sessionLinkClearHelp: {
      ...typography.caption,
      color: colors.warning,
      lineHeight: 18,
    },

    assistantSection: {
      width: "100%",
    },

    subsectionHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      gap: spacing.md,
      marginBottom: spacing.sm,
    },

    subsectionHeaderText: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 240,
    },

    subsectionTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: 3,
    },

    subsectionDescription: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      maxWidth: 540,
    },

    textAction: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingHorizontal:
        spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}0D`,
    },

    textActionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
    },

    assistantChipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },

    assistantChip: {
      maxWidth: 280,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingLeft: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      backgroundColor:
        colors.white,
    },

    assistantChipAvatar: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 17,
      backgroundColor:
        `${colors.primary}12`,
    },

    assistantChipAvatarText: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.primary,
    },

    assistantChipInfo: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 5,
    },

    assistantChipText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    assistantRoleText: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 1,
    },

    removeChipButton: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      marginRight: 3,
    },

    pickerPanel: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.primary}20`,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    pickerPanelHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    pickerPanelIcon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}10`,
    },

    pickerPanelTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: 3,
    },

    pickerAssistantList: {
      gap: spacing.xs,
    },

    pickerAssistantRow: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },

    pickerAssistantName: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    pickerAssistantMeta: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },

    addCircle: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
      backgroundColor:
        `${colors.primary}10`,
    },

    iconActionButton: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      backgroundColor:
        colors.white,
    },

    unassignedList: {
      gap: spacing.xs,
      marginTop: spacing.sm,
    },

    unassignedBulkBar: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: `${colors.primary}25`,
      borderRadius: radius.md,
      backgroundColor: `${colors.primary}08`,
    },

    bulkSelectionInfo: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 220,
      minWidth: 0,
    },

    bulkSelectionTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: 2,
    },

    bulkSelectionText: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
    },

    bulkActionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: spacing.xs,
    },

    bulkTextButton: {
      minHeight: 38,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.white,
    },

    bulkTextButtonLabel: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
    },

    unassignedRow: {
      minHeight: 62,
      gap: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },
    unassignedRowSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}0D`,
    },

    unassignedMainRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    studentCheckbox: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 7,
      backgroundColor: colors.white,
    },

    studentCheckboxSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },

    unassignedInfo: {
      flex: 1,
      minWidth: 0,
    },

    unassignedName: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    unassignedSchool: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },

    unassignedMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 3,
    },

    unassignedMetaText: {
      ...typography.caption,
      flexShrink: 1,
      minWidth: 0,
      color: colors.textMuted,
    },

    unassignedDesiredYearText: {
      color: colors.primary,
      fontWeight: "700",
    },

    unassignedYearBlock: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.xs,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.background,
    },

    unassignedYearBlockActive: {
      borderColor: `${colors.primary}35`,
      backgroundColor: `${colors.primary}08`,
    },

    unassignedYearIcon: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
      backgroundColor: colors.white,
    },

    unassignedYearContent: {
      flex: 1,
      minWidth: 0,
    },

    unassignedYearLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: 2,
    },

    unassignedYearValue: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      lineHeight: 21,
    },

    unassignedYearValueActive: {
      color: colors.primary,
    },

    addStudentAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal:
        spacing.xs,
      paddingVertical: 6,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}0D`,
    },

    addStudentActionSelected: {
      backgroundColor: colors.primary,
    },

    addStudentLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
    },

    addStudentLabelSelected: {
      color: colors.white,
    },

    studentsHeader: {
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    studentSearch: {
      width: "100%",
      maxWidth: 420,
    },

    rosterList: {
      gap: spacing.sm,
    },

    studentBlock: {
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },

    studentBlockEditing: {
      borderColor:
        `${colors.primary}60`,
    },

    studentRow: {
      minHeight: 76,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
    },

    avatar: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      backgroundColor:
        `${colors.primary}12`,
    },

    avatarLarge: {
      width: 46,
      height: 46,
      borderRadius: 23,
    },

    avatarText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
    },

    avatarTextLarge: {
      fontSize: 14,
    },

    smallAvatar: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      backgroundColor:
        `${colors.primary}12`,
    },

    smallAvatarText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
    },

    studentInfo: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 180,
      minWidth: 0,
    },

    studentName: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: 3,
    },

    studentMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
    },

    studentMeta: {
      ...typography.caption,
      flexShrink: 1,
      color: colors.textMuted,
    },

    studentActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: spacing.xs,
    },

    actionButton: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal:
        spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}0D`,
    },

    actionButtonActive: {
      backgroundColor:
        `${colors.primary}18`,
    },

    actionButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
    },

    removeStudentButton: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal:
        spacing.sm,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.danger}0D`,
    },

    removeStudentText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.danger,
    },

    editPanel: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      backgroundColor:
        colors.background,
    },

    editPanelHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    editPanelHeaderIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}10`,
    },

    editPanelTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: 3,
    },

    editPanelDescription: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
    },

    accessCodeBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor:
        `${colors.primary}35`,
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}0D`,
    },

    accessCodeIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 21,
      backgroundColor:
        colors.white,
    },

    accessCodeContent: {
      flex: 1,
      minWidth: 0,
    },

    accessCodeLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: "700",
      marginBottom: 4,
    },

    accessCodeValue: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "800",
      letterSpacing: 1.8,
      color: colors.primary,
    },

    accessCodeHelp: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: spacing.xs,
    },

    editFields: {
      gap: spacing.md,
    },

    parentFieldsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      gap: spacing.md,
    },

    parentFieldColumn: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 270,
      minWidth: 240,
      gap: spacing.md,
    },

    editActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      gap: spacing.sm,
      marginTop: spacing.lg,
    },

    phoneField: {
      width: "100%",
    },

    fieldLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: spacing.xs,
    },

    fieldLabel: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    optionalLabel: {
      ...typography.caption,
      color: colors.textMuted,
    },

    phoneInputContainer: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "stretch",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },

    countryButton: {
      minWidth: 122,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      paddingHorizontal:
        spacing.sm,
      borderRightWidth: 1,
      borderRightColor:
        colors.border,
      backgroundColor:
        colors.background,
    },

    countryFlag: {
      fontSize: 21,
    },

    callingCode: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },

    phoneTextInput: {
      ...typography.body,
      flex: 1,
      minWidth: 0,
      paddingHorizontal:
        spacing.sm,
      paddingVertical:
        spacing.sm,
      color: colors.textPrimary,

      ...(Platform.OS === "web"
        ? {
            outlineStyle: "none",
          }
        : null),
    },

    modalRoot: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.md,
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        "rgba(17, 24, 39, 0.76)",
    },

    modalCard: {
      width: "100%",
      maxWidth: 520,
      height: "82%",
      maxHeight: 660,
      minHeight: 420,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor:
        colors.white,

      ...(Platform.OS === "web"
        ? {
            boxShadow:
              "0 24px 80px rgba(0, 0, 0, 0.35)",
          }
        : {
            elevation: 24,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 0.3,
            shadowRadius: 24,
          }),
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    modalHeaderIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}10`,
    },

    modalHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    modalTitle: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: 4,
    },

    modalSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 18,
    },

    modalCloseButton: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      backgroundColor:
        colors.background,
    },

    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginHorizontal:
        spacing.lg,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      paddingHorizontal:
        spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    countrySearchInput: {
      ...typography.body,
      flex: 1,
      minWidth: 0,
      paddingVertical:
        spacing.sm,
      color: colors.textPrimary,

      ...(Platform.OS === "web"
        ? {
            outlineStyle: "none",
          }
        : null),
    },

    clearSearchButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
    },

    countryListContent: {
      paddingHorizontal:
        spacing.lg,
      paddingBottom: spacing.lg,
    },

    countryOption: {
      minHeight: 62,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal:
        spacing.sm,
      paddingVertical:
        spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    countryOptionSelected: {
      borderBottomColor:
        "transparent",
      borderRadius: radius.md,
      backgroundColor:
        `${colors.primary}0D`,
    },

    countryOptionFlag: {
      width: 42,
      fontSize: 25,
    },

    countryOptionDetails: {
      flex: 1,
      minWidth: 0,
    },

    countryOptionName: {
      ...typography.body,
      color: colors.textPrimary,
    },

    countryOptionNameSelected: {
      color: colors.primary,
      fontWeight: "700",
    },

    countryOptionCode: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },

    countryOptionCallingCode: {
      ...typography.bodyBold,
      color: colors.textMuted,
      marginLeft: spacing.sm,
    },

    selectedMark: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor:
        colors.primary,
      marginLeft: spacing.sm,
    },

    emptyCountryList: {
      flexGrow: 1,
      justifyContent: "center",
      padding: spacing.xl,
    },

    inlineEmpty: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor:
        colors.background,
    },

    inlineEmptyText: {
      ...typography.body,
      flexShrink: 1,
      color: colors.textMuted,
      lineHeight: 20,
    },

    loadingPanel: {
      minHeight: 90,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    loadingPanelText: {
      ...typography.body,
      color: colors.textMuted,
    },

    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },

    emptyStateCompact: {
      paddingVertical:
        spacing.lg,
    },

    emptyIcon: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 26,
      backgroundColor:
        colors.background,
      marginBottom: spacing.sm,
    },

    emptyTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      textAlign: "center",
    },

    emptyDescription: {
      ...typography.body,
      maxWidth: 460,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 21,
      marginTop: spacing.xs,
    },

    pressedOpacity: {
      opacity: 0.68,
    },

    disabledOpacity: {
      opacity: 0.55,
    },
  });
