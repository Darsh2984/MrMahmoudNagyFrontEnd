import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import api from "../../../src/lib/api";
import { colors, radius, spacing, typography } from "../../../src/theme";

export default function VerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const started = useRef(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [accessCode, setAccessCode] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) {
      setError("This verification link is incomplete.");
      setBusy(false);
      return;
    }
    api.post("/auth/verify-student-email", { token })
      .then((response) => {
        const code = response.data?.user?.accessCode;
        if (!code) throw new Error("Your account was created, but its access code was not returned. Please sign in.");
        setAccessCode(code);
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.msg || requestError.message || "Could not verify this email. The link may have expired.");
      })
      .finally(() => setBusy(false));
  }, [token]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Card style={styles.card}>
        {busy ? (
          <><ActivityIndicator color={colors.primary} /><Text style={styles.body}>Verifying your email…</Text></>
        ) : accessCode ? (
          <>
            <Text style={styles.title}>Your account is ready</Text>
            <Text style={styles.body}>Email verified. Save this parent access code before signing in.</Text>
            <Text selectable style={styles.code}>{accessCode}</Text>
            <Button title="Continue to sign in" onPress={() => router.replace("/(auth)/login")} style={styles.button} />
          </>
        ) : (
          <>
            <Text style={styles.title}>Verification failed</Text>
            <Text accessibilityRole="alert" style={styles.body}>{error}</Text>
            <Button title="Back to registration" onPress={() => router.replace("/(auth)/register")} style={styles.button} />
          </>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg, backgroundColor: colors.background },
  card: { width: "100%", maxWidth: 500, alignItems: "center", padding: spacing.xl },
  title: { ...typography.h2, color: colors.primary, textAlign: "center", marginBottom: spacing.md },
  body: { ...typography.body, color: colors.textMuted, textAlign: "center", marginBottom: spacing.lg },
  code: { ...typography.h1, color: colors.warning, letterSpacing: 3, textAlign: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, width: "100%", marginBottom: spacing.lg },
  button: { width: "100%" },
});
