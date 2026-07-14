import React, { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/contexts/AuthContext";
import { colors, spacing, typography } from "../../src/theme";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(app)/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Couldn't log in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", maxWidth: 420, alignSelf: "center", width: "100%" }}>
        <Text style={[typography.h1, { color: colors.primary, marginBottom: spacing.lg, textAlign: "center" }]}>
          Sign in
        </Text>
        <Card>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" autoCapitalize="none" keyboardType="email-address" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          {error ? <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>{error}</Text> : null}
          <Button title="Sign in" onPress={handleLogin} loading={loading} />
        </Card>
      </View>
    </Screen>
  );
}
