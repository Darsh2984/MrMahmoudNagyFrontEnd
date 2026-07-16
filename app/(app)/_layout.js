import React from "react";
import { Slot, Redirect } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { AppShell } from "../../src/components/layout/AppShell";
import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { colors, spacing, typography } from "../../src/theme";

// Nav items differ by role — same AppShell/Sidebar renders all of them.
function getNavItems(role, isHeadAssistant) {
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
        label: "Tickets",
        route: "/(app)/tickets",
        icon: "chatbubble-ellipses-outline",
        activeIcon: "chatbubble-ellipses",
      },
    ];
  }

  const isRegularAssistant =
    role === "ASSISTANT" && !isHeadAssistant;

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
      icon: "clipboard-outline",
      activeIcon: "clipboard",
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
      label: "Tickets",
      route: "/(app)/tickets",
      icon: "chatbubble-ellipses-outline",
      activeIcon: "chatbubble-ellipses",
    },
  ];

  if (role === "TEACHER" || isHeadAssistant) {
    base.push(
      {
        label: "Assistants",
        route: "/(app)/assistants",
        icon: "person-add-outline",
        activeIcon: "person-add",
      },
      {
        label: "Schools",
        route: "/(app)/schools",
        icon: "school-outline",
        activeIcon: "school",
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

// A student with no group has nothing to see yet — old system's behavior,
// confirmed with the client: not a separate approval flag, just a natural
// consequence of the content hierarchy being group-scoped. Removing a student
// from their group ("disabling" them, per the client) sends them right back here.
function WaitingForGroupScreen({ onLogout }) {
  return (
    <Screen scroll={false} style={{ alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
      <Card style={{ maxWidth: 420, alignItems: "center" }}>
        <Text style={[typography.h2, { color: colors.primary, marginBottom: spacing.sm, textAlign: "center" }]}>
          You're not in a group yet
        </Text>
        <Text style={[typography.body, { color: colors.textMuted, textAlign: "center", marginBottom: spacing.md }]}>
          Your teacher or assistant hasn't added you to a group yet. Once they do, you'll get full access
          to resources, tasks, and quizzes here.
        </Text>
        <Button title="Log out" variant="outline" onPress={onLogout} />
      </Card>
    </Screen>
  );
}

export default function AppLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  if (user.role === "STUDENT" && (user.groupMemberships?.length || 0) === 0) {
    return <WaitingForGroupScreen onLogout={logout} />;
  }

  const items = getNavItems(user.role, user.isHeadAssistant);

  return (
    <AppShell
      items={items}
      title="Mahmoud Nagy Platform"
      footer={
        <View style={{ paddingTop: spacing.md }}>
          <Button title="Log out" variant="outline" onPress={logout} />
        </View>
      }
    >
      <Slot />
    </AppShell>
  );
}
