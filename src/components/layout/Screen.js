import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { colors, spacing } from "../../theme";

export function Screen({ children, scroll = true, style }) {
  const Container = scroll ? ScrollView : View;
  return (
    <View style={styles.safe}>
      <Container
        style={[{ flex: 1 }, style]}
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
      >
        {children}
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md },
});

export default Screen;
