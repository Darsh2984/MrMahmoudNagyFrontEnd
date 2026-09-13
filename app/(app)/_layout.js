import React from "react";

import {
  Slot,
  Redirect,
} from "expo-router";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../src/contexts/AuthContext";

import { AppShell } from "../../src/components/layout/AppShell";
import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";

import {
  colors,
  radius,
  spacing,
} from "../../src/theme";

// Nav items differ by role.
// The same AppShell and Sidebar render all items.
function getNavItems(
  role,
  isHeadAssistant
) {
  if (role === "STUDENT") {
    return [
      {
        label: "Dashboard",
        route: "/(app)/my-dashboard",
        icon: "grid-outline",
        activeIcon: "grid",
      },
      {
        label: "Resources",
        route: "/(app)/resources",
        icon: "library-outline",
        activeIcon: "library",
      },
      {
        label: "Sessions",
        route: "/(app)/sessions",
        icon: "calendar-outline",
        activeIcon: "calendar",
      },
      {
      {
        label: "Submit your Hw",
        route: "/(app)/my-tasks",
        icon: "document-text-outline",
        activeIcon: "document-text",
      },
      {
        label: "Quizzes",
        route: "/(app)/my-tasks",
        icon: "document-text-outline",
        activeIcon: "document-text",
      },
      {
        label: "Nagy's Mind",
        externalUrl:
          "https://chatgpt.com/g/g-68daa005e46081919fe3515f32c48f72-ask-mahmoud-nagys-mind-4-0-pro",
        icon: "bulb-outline",
        activeIcon: "bulb",
      },
      {
        label: "Quizzes",
        route: "/(app)/quizzes",
        icon: "help-circle-outline",
        activeIcon: "help-circle",
      },
      {
        label: "Performance",
        route: "/(app)/performance",
        icon: "analytics-outline",
        activeIcon: "analytics",
      },
      {
        label: "Group Chat",
        route: "/(app)/group-chat",
        icon: "people-circle-outline",
        activeIcon: "people-circle",
      },
      {
        label: "Tickets",
        route: "/(app)/tickets",
        icon: "chatbubble-ellipses-outline",
        activeIcon: "chatbubble-ellipses",
      },
    ];
  }

  const isRegularAssistant =
    role === "ASSISTANT" &&
    !isHeadAssistant;

  const base = [
    {
      label: "Dashboard",
      route: isRegularAssistant
        ? "/(app)/my-stats"
        : "/(app)/dashboard",
      icon: "grid-outline",
      activeIcon: "grid",
    },
    {
      label: "Groups",
      route: "/(app)/groups",
      icon: "people-outline",
      activeIcon: "people",
    },
    {
      label: "Content",
      route: "/(app)/content",
      icon: "folder-open-outline",
      activeIcon: "folder-open",
    },
    {
      label: "Question Bank",
      route: "/(app)/questions",
      icon: "library-outline",
      activeIcon: "library",
    },
    {
      label: "Quiz Management",
      route: "/(app)/quiz-management",
      icon: "clipboard-outline",
      activeIcon: "clipboard",
    },
    {
      label: "Sessions",
      route: "/(app)/sessions",
      icon: "calendar-outline",
      activeIcon: "calendar",
    },
    {
      label: "Tasks",
      route: "/(app)/tasks",
      icon: "document-text-outline",
      activeIcon: "document-text",
    },
    {
      label: "In-Class Quizzes",
      route: "/(app)/inclass-quizzes",
      icon: "school-outline",
      activeIcon: "school",
    },
    {
      label: "Performance",
      route: "/(app)/performance",
      icon: "analytics-outline",
      activeIcon: "analytics",
    },
    {
      label: "Group Chat",
      route: "/(app)/group-chat",
      icon: "people-circle-outline",
      activeIcon: "people-circle",
    },
    {
      label: "Tickets",
      route: "/(app)/tickets",
      icon: "chatbubble-ellipses-outline",
      activeIcon: "chatbubble-ellipses",
    },
  ];

  if (
    role === "TEACHER" ||
    isHeadAssistant
  ) {
    base.push(
      {
        label: "Assistants",
        route: "/(app)/assistants",
        icon: "person-add-outline",
        activeIcon: "person-add",
      },
      {
        label: "AI Correction",
        route: "/(app)/ai-correction",
        icon: "sparkles-outline",
        activeIcon: "sparkles",
      },
      {
        label: "Assistant Performance",
        route: "/(app)/assistant-performance",
        icon: "stats-chart-outline",
        activeIcon: "stats-chart",
      },
      {
        label: "Schools",
        route: "/(app)/schools",
        icon: "business-outline",
        activeIcon: "business",
      },
      {
        label: "Ticket Categories",
        route: "/(app)/ticket-categories",
        icon: "pricetags-outline",
        activeIcon: "pricetags",
      }
    );
  }

  return base;
}

function getUserDisplayName(user) {
  const fullName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    user?.name ||
    user?.email ||
    "Signed-in user"
  );
}

function getFirstName(user) {
  return String(
    getUserDisplayName(user)
  )
    .trim()
    .split(/\s+/)[0];
}

function getRoleLabel(user) {
  if (user?.role === "TEACHER") {
    return "Teacher";
  }

  if (
    user?.role === "ASSISTANT" &&
    user?.isHeadAssistant
  ) {
    return "Head Assistant";
  }

  if (user?.role === "ASSISTANT") {
    return "Assistant";
  }

  if (user?.role === "STUDENT") {
    return "Student";
  }

  return user?.role || "User";
}

function WaitingForGroupScreen({
  user,
  onLogout,
}) {
  return (
    <Screen
      scroll
      style={styles.pendingScreen}
      contentContainerStyle={
        styles.pendingScreenContent
      }
    >
      <View style={styles.pendingPage}>
        <View style={styles.pendingTopRow}>
          <View style={styles.pendingTopCopy}>
            <Text style={styles.pendingEyebrow}>
              STUDENT REGISTRATION
            </Text>

            <Text style={styles.pendingWelcome}>
              Welcome
              {user
                ? `, ${getFirstName(user)}`
                : ""}
            </Text>

            <Text
              style={styles.pendingWelcomeText}
            >
              Your student account has been
              created successfully.
            </Text>
          </View>

          <View style={styles.pendingUserIcon}>
            <Ionicons
              name="person-outline"
              size={27}
              color={colors.primary}
            />
          </View>
        </View>

        <Card style={styles.pendingCard}>
          <View
            style={styles.pendingClockOuter}
          >
            <View
              style={styles.pendingClockInner}
            >
              <Ionicons
                name="time-outline"
                size={44}
                color={colors.warning}
              />
            </View>
          </View>

          <Text style={styles.pendingWord}>
            PENDING
          </Text>

          <Text style={styles.pendingTitle}>
            Your group assignment is being
            prepared
          </Text>

          <Text style={styles.pendingDescription}>
            Your request has been sent to Mr Mahmoud
            Nagy and he will add you to a group
            shortly. Contact the Team to let them
            add you to the dedicated group for your
            selected academic year.
          </Text>

          <View style={styles.accessBox}>
            <View style={styles.accessIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={25}
                color={colors.primary}
              />
            </View>

            <View style={styles.accessCopy}>
              <Text style={styles.accessTitle}>
                Access will be activated once
                you are added
              </Text>

              <Text style={styles.accessDescription}>
                Once you are assigned to the dedicated
                group for your selected academic year,
                you will get access to the system,
                including your resources, sessions,
                tasks, quizzes, performance and group
                chat.
              </Text>
            </View>
          </View>

          <View style={styles.pendingNotice}>
            <Ionicons
              name="checkmark-circle-outline"
              size={21}
              color={colors.secondary}
            />

            <Text
              style={styles.pendingNoticeText}
            >
              You do not need to register again
              or send another request.
            </Text>
          </View>

          <View style={styles.pendingDivider} />

          <Text style={styles.pendingHelp}>
            You can safely log out while your
            account is pending.
          </Text>

          <Button
            title="Log out"
            variant="outline"
            onPress={onLogout}
            style={styles.pendingLogoutButton}
          />
        </Card>

        <View style={styles.pendingFooter}>
          <Ionicons
            name="shield-checkmark-outline"
            size={19}
            color={colors.secondary}
          />

          <Text
            style={styles.pendingFooterText}
          >
            Your registration has been received
            successfully.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

export default function AppLayout() {
  const {
    user,
    loading,
    logout,
  } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Redirect href="/(auth)/login" />
    );
  }

  const studentHasNoGroup =
    user.role === "STUDENT" &&
    (user.groupMemberships?.length || 0) === 0;

  if (studentHasNoGroup) {
    return (
      <WaitingForGroupScreen
        user={user}
        onLogout={logout}
      />
    );
  }

  const items = getNavItems(
    user.role,
    user.isHeadAssistant
  );

  return (
    <AppShell
      items={items}
      title="Mahmoud Nagy Platform"
      footer={
        <View>
          <View style={styles.sidebarUserRow}>
            <View
              style={styles.sidebarAvatar}
            >
              <Text
                style={styles.sidebarAvatarText}
              >
                {getUserDisplayName(user)
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View
              style={styles.sidebarUserCopy}
            >
              <Text
                numberOfLines={1}
                style={styles.sidebarUserName}
              >
                {getUserDisplayName(user)}
              </Text>

              <Text
                numberOfLines={1}
                style={styles.sidebarRole}
              >
                {getRoleLabel(user)}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={logout}
            style={({ pressed }) => [
              styles.sidebarLogoutButton,
              pressed &&
                styles.sidebarLogoutPressed,
            ]}
          >
            <Text
              style={styles.sidebarLogoutText}
            >
              Log out
            </Text>
          </Pressable>
        </View>
      }
    >
      <Slot />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  /*
   * PENDING SCREEN
   */

  pendingScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  pendingScreenContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 28,
  },

  pendingPage: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },

  pendingTopRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: 22,
  },

  pendingTopCopy: {
    flex: 1,
    minWidth: 0,
  },

  pendingEyebrow: {
    marginBottom: 6,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: colors.secondary,
  },

  pendingWelcome: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.text,
  },

  pendingWelcomeText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },

  pendingUserIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(11, 60, 73, 0.08)",
    flexShrink: 0,
  },

  pendingCard: {
    width: "100%",
    alignItems: "center",
    paddingTop: 38,
    paddingBottom: 30,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor:
      "rgba(215, 126, 66, 0.22)",
  },

  pendingClockOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(215, 126, 66, 0.07)",
  },

  pendingClockInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(215, 126, 66, 0.14)",
  },

  pendingWord: {
    marginTop: 22,
    fontSize: 46,
    lineHeight: 52,
    fontWeight: "900",
    letterSpacing: 3.5,
    color: colors.warning,
    textAlign: "center",
  },

  pendingTitle: {
    maxWidth: 560,
    marginTop: 8,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  pendingDescription: {
    maxWidth: 590,
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: "center",
  },

  accessBox: {
    width: "100%",
    maxWidth: 600,
    marginTop: 26,
    padding: 17,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor:
      "rgba(11, 60, 73, 0.12)",
    backgroundColor:
      "rgba(11, 60, 73, 0.05)",
  },

  accessIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(11, 60, 73, 0.09)",
    flexShrink: 0,
  },

  accessCopy: {
    flex: 1,
    minWidth: 0,
  },

  accessTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    color: colors.text,
  },

  accessDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },

  pendingNotice: {
    width: "100%",
    maxWidth: 600,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  pendingNoticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },

  pendingDivider: {
    width: "100%",
    maxWidth: 600,
    height: 1,
    marginTop: 26,
    marginBottom: 18,
    backgroundColor:
      "rgba(51, 49, 46, 0.08)",
  },

  pendingHelp: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
  },

  pendingLogoutButton: {
    minWidth: 150,
    marginTop: 15,
  },

  pendingFooter: {
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
  },

  pendingFooterText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: "center",
  },

  /*
   * SIDEBAR FOOTER
   */

  sidebarUserRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  sidebarAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(245, 241, 235, 0.12)",
  },

  sidebarAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.cream,
  },

  sidebarUserCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.sm,
  },

  sidebarUserName: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: colors.cream,
  },

  sidebarRole: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    color:
      "rgba(245, 241, 235, 0.58)",
  },

  sidebarLogoutButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor:
      "rgba(245, 241, 235, 0.45)",
    backgroundColor:
      "rgba(245, 241, 235, 0.10)",
  },

  sidebarLogoutPressed: {
    backgroundColor:
      "rgba(245, 241, 235, 0.18)",
  },

  sidebarLogoutText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.cream,
  },
});