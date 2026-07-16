import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

const DESKTOP_BREAKPOINT = 850;

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const canSubmit = useMemo(
    () => normalizedEmail.length > 0 && password.length > 0 && !loading,
    [normalizedEmail, password, loading]
  );

  function validate() {
    const errors = {};

    if (!normalizedEmail) {
      errors.email = "Email address is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      errors.email = "Enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleLogin() {
    if (loading) return;

    setError("");

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const loggedInUser = await login(
        normalizedEmail,
        password
      );

      const isRegularAssistant =
        loggedInUser.role === "ASSISTANT" &&
        !loggedInUser.isHeadAssistant;

      let destination = "/(app)/dashboard";

      if (loggedInUser.role === "STUDENT") {
        destination = "/(app)/my-dashboard";
      } else if (isRegularAssistant) {
        destination = "/(app)/my-stats";
      }

      router.replace(destination);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Couldn't sign in. Check your email and password, then try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEmailChange(value) {
    setEmail(value);

    if (fieldErrors.email) {
      setFieldErrors((current) => ({
        ...current,
        email: "",
      }));
    }

    if (error) {
      setError("");
    }
  }

  function handlePasswordChange(value) {
    setPassword(value);

    if (fieldErrors.password) {
      setFieldErrors((current) => ({
        ...current,
        password: "",
      }));
    }

    if (error) {
      setError("");
    }
  }

  return (
    <Screen
      scroll
      contentContainerStyle={styles.screenContent}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View
          style={[
            styles.pageLayout,
            isDesktop && styles.pageLayoutDesktop,
          ]}
        >
          {isDesktop ? <BrandPanel /> : null}

          <View
            style={[
              styles.formColumn,
              isDesktop && styles.formColumnDesktop,
            ]}
          >
            {!isDesktop ? (
              <View style={styles.mobileBrand}>
                <View style={styles.mobileLogo}>
                  <Ionicons
                    name="school-outline"
                    size={27}
                    color={colors.white}
                  />
                </View>

                <Text style={styles.mobileBrandName}>
                  Mahmoud Nagy Platform
                </Text>
              </View>
            ) : null}

            <Card style={styles.loginCard}>
              <View style={styles.formHeader}>
                <Text style={styles.eyebrow}>WELCOME BACK</Text>

                <Text style={[typography.h1, styles.title]}>
                  Sign in to your account
                </Text>

                <Text style={styles.subtitle}>
                  Enter your details to continue to the learning
                  platform.
                </Text>
              </View>

              {error ? (
                <View style={styles.errorAlert}>
                  <View style={styles.errorIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={21}
                      color={colors.danger}
                    />
                  </View>

                  <Text style={styles.errorText}>{error}</Text>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss error"
                    onPress={() => setError("")}
                    style={styles.dismissButton}
                  >
                    <Ionicons
                      name="close"
                      size={19}
                      color={colors.danger}
                    />
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.fieldGroup}>
                <Input
                  label="Email address"
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  editable={!loading}
                  error={fieldErrors.email}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Input
                  label="Password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  autoComplete="password"
                  editable={!loading}
                  error={fieldErrors.password}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  disabled={loading}
                  onPress={() =>
                    setShowPassword((current) => !current)
                  }
                  style={({ pressed }) => [
                    styles.passwordToggle,
                    pressed && styles.pressed,
                    loading && styles.disabled,
                  ]}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={18}
                    color={colors.primary}
                  />

                  <Text style={styles.passwordToggleText}>
                    {showPassword
                      ? "Hide password"
                      : "Show password"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.forgotPasswordRow}>
                <Link
                  href="/(auth)/forgot-password"
                  style={styles.forgotPasswordLink}
                >
                  Forgot your password?
                </Link>
              </View>

              <Button
                title="Sign in"
                onPress={handleLogin}
                loading={loading}
                disabled={!canSubmit}
                style={styles.signInButton}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />

                <Text style={styles.dividerText}>
                  NEW TO THE PLATFORM?
                </Text>

                <View style={styles.dividerLine} />
              </View>

              <Link href="/(auth)/register" asChild>
                <Pressable
                  accessibilityRole="button"
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.registerButton,
                    pressed && styles.pressed,
                    loading && styles.disabled,
                  ]}
                >
                  <View style={styles.registerIcon}>
                    <Ionicons
                      name="person-add-outline"
                      size={20}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.registerContent}>
                    <Text style={styles.registerTitle}>
                      Create a student account
                    </Text>

                    <Text style={styles.registerDescription}>
                      Register now and wait to be added to your
                      academic group.
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.primary}
                  />
                </Pressable>
              </Link>
              <Link href="/(auth)/parent-lookup" asChild>
                <Pressable
                  accessibilityRole="button"
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.parentLookupButton,
                    pressed && styles.pressed,
                    loading && styles.disabled,
                  ]}
                >
                  <View style={styles.parentLookupIcon}>
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={colors.secondary}
                    />
                  </View>

                  <View style={styles.registerContent}>
                    <Text style={styles.parentLookupTitle}>
                      Parent? View your child's progress
                    </Text>

                    <Text style={styles.registerDescription}>
                      Use your child's access code to view their academic
                      information.
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.secondary}
                  />
                </Pressable>
              </Link>
            </Card>

            <Text style={styles.footerText}>
              Secure access for students, teachers, and assistants.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function BrandPanel() {
  return (
    <View style={styles.brandPanel}>
      <View>
        <View style={styles.brandHeader}>
          <View style={styles.brandLogo}>
            <Ionicons
              name="school-outline"
              size={31}
              color={colors.primary}
            />
          </View>

          <Text style={styles.brandName}>
            Mahmoud Nagy Platform
          </Text>
        </View>

        <Text style={styles.brandEyebrow}>
          LEARN. PRACTISE. IMPROVE.
        </Text>

        <Text style={styles.brandTitle}>
          Everything you need for a better learning experience.
        </Text>

        <Text style={styles.brandDescription}>
          Access lessons, resources, quizzes, homework, session
          information, and student support from one place.
        </Text>
      </View>

      <View style={styles.featureList}>
        <FeatureItem
          icon="library-outline"
          title="Organised resources"
          description="Browse learning materials by unit, chapter, and topic."
        />

        <FeatureItem
          icon="document-text-outline"
          title="Quizzes and homework"
          description="Complete assignments and track submitted work."
        />

        <FeatureItem
          icon="chatbubbles-outline"
          title="Direct student support"
          description="Create support tickets and follow every response."
        />
      </View>

      <View style={styles.brandFooter}>
        <Ionicons
          name="shield-checkmark-outline"
          size={18}
          color={colors.white}
        />

        <Text style={styles.brandFooterText}>
          Your account and learning data are protected.
        </Text>
      </View>
    </View>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={colors.primary}
        />
      </View>

      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>

        <Text style={styles.featureDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    width: "100%",
    padding: 0,
  },

  keyboardView: {
    flex: 1,
  },

  pageLayout: {
    flex: 1,
    width: "100%",
    minHeight: 700,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },

  pageLayoutDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    maxWidth: 1240,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },

  brandPanel: {
    flex: 1.05,
    maxWidth: 570,
    minHeight: 650,
    justifyContent: "space-between",
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    padding: spacing.xl,
  },

  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },

  brandLogo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    marginRight: spacing.md,
  },

  brandName: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    color: colors.white,
    flex: 1,
  },

  brandEyebrow: {
    ...typography.caption,
    color: colors.background,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: spacing.sm,
  },

  brandTitle: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    color: colors.white,
    maxWidth: 470,
    marginBottom: spacing.md,
  },

  brandDescription: {
    ...typography.body,
    color: colors.background,
    lineHeight: 24,
    maxWidth: 470,
    opacity: 0.9,
  },

  featureList: {
    gap: spacing.md,
    marginVertical: spacing.xl,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    marginRight: spacing.md,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    ...typography.bodyBold,
    color: colors.white,
    marginBottom: 3,
  },

  featureDescription: {
    ...typography.caption,
    color: colors.background,
    lineHeight: 19,
    opacity: 0.88,
  },

  brandFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
  },

  brandFooterText: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.85,
  },

  formColumn: {
    width: "100%",
    maxWidth: 480,
  },

  formColumnDesktop: {
    flex: 0.9,
    justifyContent: "center",
    maxWidth: 500,
  },

  mobileBrand: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  mobileLogo: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginBottom: spacing.sm,
  },

  mobileBrandName: {
    ...typography.bodyBold,
    color: colors.primary,
  },

  loginCard: {
    width: "100%",
    padding: spacing.xl,
  },

  formHeader: {
    marginBottom: spacing.lg,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
  },

  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },

  errorAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: `${colors.danger}45`,
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}0D`,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },

  errorIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },

  errorText: {
    ...typography.caption,
    color: colors.danger,
    lineHeight: 19,
    flex: 1,
    paddingTop: 6,
  },

  dismissButton: {
    padding: spacing.xs,
  },

  fieldGroup: {
    marginBottom: spacing.sm,
  },

  passwordToggle: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
  },

  passwordToggleText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },

  forgotPasswordRow: {
    alignItems: "flex-end",
    marginBottom: spacing.md,
  },

  forgotPasswordLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },

  signInButton: {
    width: "100%",
  },

  parentLookupButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${colors.secondary}55`,
    borderRadius: radius.md,
    backgroundColor: `${colors.secondary}0D`,
    padding: spacing.md,
    marginTop: spacing.sm,
  },

  parentLookupIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.secondary}18`,
    marginRight: spacing.sm,
  },

  parentLookupTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },

  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginHorizontal: spacing.sm,
  },

  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    padding: spacing.md,
  },

  registerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginRight: spacing.sm,
  },

  registerContent: {
    flex: 1,
    marginRight: spacing.sm,
  },

  registerTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  registerDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.55,
  },
});