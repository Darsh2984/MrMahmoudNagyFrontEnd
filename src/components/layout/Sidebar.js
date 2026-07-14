import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { colors, spacing, typography } from "../../theme";

// items: [{ label, route, icon? }]. Same component renders the Teacher nav,
// the Assistant/Head nav, or the Student nav — just pass different items.
// This replaces the old system's separate TeacherSidebar.jsx / StudentSidebar.jsx.
export function Sidebar({ items, footer, width = 220 }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={[styles.container, { width }]}>
      <View style={{ flex: 1 }}>
        {items.map((item) => {
          const active = pathname === item.route;
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route)}
              style={[styles.item, active && styles.itemActive]}
            >
              <Text style={[typography.body, { color: active ? colors.warning : colors.cream }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    height: "100%",
  },
  item: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  itemActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});

export default Sidebar;
