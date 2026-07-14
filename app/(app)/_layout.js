import React from "react";
import { Slot, Redirect } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { AppShell } from "../../src/components/layout/AppShell";
import { Button } from "../../src/components/ui/Button";
import { View } from "react-native";
import { spacing } from "../../src/theme";

// Nav items differ by role — same AppShell/Sidebar renders all of them.
function getNavItems(role, isHeadAssistant) {
  if (role === "STUDENT") {
    return [
      { label: "Dashboard", route: "/(app)/dashboard" },
      { label: "Resources", route: "/(app)/resources" },
      { label: "Tasks", route: "/(app)/tasks" },
      { label: "Quizzes", route: "/(app)/quizzes" },
      { label: "Tickets", route: "/(app)/tickets" },
    ];
  }
  // TEACHER and ASSISTANT (including heads) share the same admin-style nav for now;
  // screen-level permission checks (via rbac) decide what's actually editable.
  const base = [
    { label: "Dashboard", route: "/(app)/dashboard" },
    { label: "Groups", route: "/(app)/groups" },
    { label: "Content", route: "/(app)/content" },
    { label: "Quizzes", route: "/(app)/quizzes" },
    { label: "Tickets", route: "/(app)/tickets" },
  ];
  if (role === "TEACHER" || isHeadAssistant) {
    base.push({ label: "Assistants", route: "/(app)/assistants" });
  }
  return base;
}

export default function AppLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

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
