import React from "react";
import {
  Slot,
  Redirect,
} from "expo-router";

import {
  View,
  Text,
  Pressable,
} from "react-native";

import { useAuth } from "../../src/contexts/AuthContext";

import { AppShell } from "../../src/components/layout/AppShell";
import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";

import {
  colors,
  spacing,
  typography,
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
        label: "Tasks",
        route: "/(app)/my-tasks",
        icon: "document-text-outline",
        activeIcon: "document-text",
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

// A student with no group has nothing to see yet.
// Removing a student from their group sends them
// back to this screen.
function WaitingForGroupScreen({
  onLogout,
}) {
  return (
    <Screen
      scroll={false}
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
      }}
    >
      <Card
        style={{
          maxWidth: 420,
          alignItems: "center",
        }}
      >
        <Text
          style={[
            typography.h2,
            {
              color: colors.primary,
              marginBottom: spacing.sm,
              textAlign: "center",
            },
          ]}
        >
          You're not in a group yet
        </Text>

        <Text
          style={[
            typography.body,
            {
              color: colors.textMuted,
              textAlign: "center",
              marginBottom: spacing.md,
            },
          ]}
        >
          Your teacher or assistant hasn't
          added you to a group yet. Once they
          do, you'll get full access to
          resources, tasks, and quizzes here.
        </Text>

        <Button
          title="Log out"
          variant="outline"
          onPress={onLogout}
        />
      </Card>
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.md,
              paddingHorizontal: spacing.sm,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  "rgba(245, 241, 235, 0.12)",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: colors.cream,
                }}
              >
                {getUserDisplayName(user)
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: spacing.sm,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 13,
                  lineHeight: 18,
                  fontWeight: "800",
                  color: colors.cream,
                }}
              >
                {getUserDisplayName(user)}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  lineHeight: 16,
                  fontWeight: "600",
                  color:
                    "rgba(245, 241, 235, 0.58)",
                }}
              >
                {getRoleLabel(user)}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={logout}
            style={({ pressed }) => ({
              minHeight: 44,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor:
                "rgba(245, 241, 235, 0.45)",
              backgroundColor: pressed
                ? "rgba(245, 241, 235, 0.18)"
                : "rgba(245, 241, 235, 0.10)",
            })}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: colors.cream,
              }}
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