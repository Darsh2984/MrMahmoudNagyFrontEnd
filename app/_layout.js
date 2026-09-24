import React from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AuthProvider } from "../src/contexts/AuthContext";
import PushNotificationRegistrar from "../src/components/notifications/PushNotificationRegistrar";
import { colors } from "../src/theme";

function RootSafeArea() {
  const insets = useSafeAreaInsets();
  const androidTopFallback = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : 0;

  return (
    <View
      style={[
        styles.safeRoot,
        {
          paddingTop: Math.max(insets.top, androidTopFallback),
          paddingBottom: Math.max(insets.bottom, Platform.OS === "android" ? 16 : 0),
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
        <AuthProvider>
          <PushNotificationRegistrar />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </AuthProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootSafeArea />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
