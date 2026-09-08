import React, { useEffect, useState } from "react";
import { View, Text, Pressable, useWindowDimensions, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../theme";
import { Sidebar } from "./Sidebar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WIDE_BREAKPOINT = 768;

export function AppShell({ items, title, footer, children }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
      <View
        style={[
          styles.mobileHeader,
          { paddingTop: insets.top + spacing.sm },
        ]}
      >
        <Pressable onPress={() => setDrawerOpen(true)} hitSlop={12}>
          <Text style={[typography.h3, { color: colors.primary }]}>≡</Text>
        </Pressable>
        <Text style={[typography.h3, { color: colors.primary }]}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ flex: 1 }}>{children}</View>

      {drawerOpen ? (
        <View style={styles.drawerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDrawerOpen(false)} />
          <View
            style={[
              styles.drawer,
              {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
              },
            ]}
          >
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
