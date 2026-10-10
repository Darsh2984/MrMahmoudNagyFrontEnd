import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Alert, Platform, Pressable, Text, View } from "react-native";
import * as Updates from "expo-updates";

export default function AppUpdateNotice() {
  const { isUpdatePending } = Updates.useUpdates();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const last = useRef(0);
  useEffect(() => { if (isUpdatePending) setReady(true); }, [isUpdatePending]);
  const check = useCallback(async (manual = false) => {
    if (Platform.OS === "web") return;
    if (lock.current || (!manual && Date.now() - last.current < 5 * 60 * 1000)) return;
    if (!Updates.isEnabled) {
      if (manual) Alert.alert("Updates unavailable", "This installation does not support over-the-air updates. Install the latest store version.");
      return;
    }
    lock.current = true; last.current = Date.now(); setBusy(true);
    const diagnostics = "Channel: " + (Updates.channel || "none") +
      "\nRuntime: " + Updates.runtimeVersion + "\nUpdate: " + (Updates.updateId || "embedded") +
      "\nRecovery launch: " + String(Updates.isEmergencyLaunch);
    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        await Updates.fetchUpdateAsync();
        setReady(true);
      } else if (manual) Alert.alert("No compatible update available", diagnostics);
    } catch (error) {
      if (manual) Alert.alert("Could not check for updates", error.message + "\n\n" + diagnostics);
    } finally { lock.current = false; setBusy(false); }
  }, []);
  useEffect(() => {
    if (Platform.OS === "web") return;
    check();
    const subscription = AppState.addEventListener("change", state => { if (state === "active") check(); });
    const timer = setInterval(() => { if (AppState.currentState === "active") check(); }, 5 * 60 * 1000);
    return () => { subscription.remove(); clearInterval(timer); };
  }, [check]);
  if (Platform.OS === "web") return null;
  async function apply() {
    Alert.alert("Apply update?", "The app will reload. Your login will remain saved. Finish any upload or unsaved work first.", [
      { text: "Later", style: "cancel" },
      { text: "Apply now", onPress: async () => {
        try { await Updates.reloadAsync(); }
        catch (error) { Alert.alert("Update failed", error.message); }
      } },
    ]);
  }
  return <View style={{ backgroundColor: "#EDF5F2", padding: 8 }}>
    <Pressable disabled={busy} onPress={ready ? apply : () => check(true)} accessibilityRole="button">
      <Text style={{ color: "#123E48", textAlign: "center" }}>
        {busy ? "Checking for updates…" : ready ? "Update ready — tap to apply" : "Check for app updates"}
      </Text>
    </Pressable>
  </View>;
}
