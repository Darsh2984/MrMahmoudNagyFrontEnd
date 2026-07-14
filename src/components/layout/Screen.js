import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../theme";

export function Screen({ children, scroll = true, style }) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Container
        style={[{ flex: 1 }, style]}
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md },
});

export default Screen;
