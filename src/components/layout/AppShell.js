import React, { useEffect, useState } from "react";
import { View, Text, Pressable, useWindowDimensions, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../theme";
import { Sidebar } from "./Sidebar";
import { Ionicons } from "@expo/vector-icons";

const WIDE_BREAKPOINT = 768;

export function AppShell({ items, title, footer, children }) {
  const { width } = useWindowDimensions();
  const [hydrated, setHydrated] = useState(false);
  const isWide = hydrated && width >= WIDE_BREAKPOINT;
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (isWide) {
    return (
      <View style={styles.rowContainer}>
        <Sidebar items={items} footer={footer} />
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.mobileHeader}>
        <Pressable
          onPress={() => setDrawerOpen(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          style={({ pressed }) => [
            styles.mobileMenuButton,
            pressed && styles.mobileMenuButtonPressed,
          ]}
        >
          <Ionicons name="menu-outline" size={27} color={colors.primary} />
        </Pressable>
        <Text style={[typography.h3, { color: colors.primary }]}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ flex: 1 }}>{children}</View>

      {drawerOpen ? (
        <View style={styles.drawerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDrawerOpen(false)} />
          <View style={styles.drawer}>
            <Sidebar items={items} footer={footer} width={220} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: { flex: 1, flexDirection: "row" },
  mobileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileMenuButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(11,60,73,0.08)",
  },
  mobileMenuButtonPressed: {
    opacity: 0.7,
  },
  drawerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  drawer: { height: "100%" },
});

export default AppShell;
