import React, {
  useMemo,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  Link,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";

import api from "../../../src/lib/api";
import { colors } from "../../../src/theme";

import { styles } from "./[token].styles";

function getErrorMessage(
  error,
  fallback = "Couldn't reset your password.",
) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getTokenValue(value) {
  if (Array.isArray(value)) {
    return String(value[0] || "")
      .trim();
  }

  return String(value || "").trim();
}

function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  visible,
  onToggleVisibility,
  error,
  onSubmitEditing,
  returnKeyType,
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.passwordInputContainer,
          error &&
            styles.passwordInputContainerError,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={
            colors.textMuted
          }
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={
            onSubmitEditing
          }
          style={styles.passwordInput}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            visible
              ? "Hide password"
              : "Show password"
          }
          onPress={
            onToggleVisibility
          }
          style={({ pressed }) => [
            styles.visibilityButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name={
              visible
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={21}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      {error ? (
        <Text style={styles.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default function ResetPassword() {
  const router = useRouter();

  const params =
    useLocalSearchParams();

  const token = getTokenValue(
    params.token,
  );

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [fieldErrors, setFieldErrors] =
    useState({});

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const canSubmit = useMemo(
    () =>
      Boolean(token) &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      !loading,
    [
      token,
      password,
      confirmPassword,
      loading,
    ],
  );

  function validate() {
    const errors = {};

    if (!token) {
      errors.token =
        "The password reset link is invalid.";
    }

    if (!password) {
      errors.password =
        "Enter a new password.";
    } else if (password.length < 8) {
      errors.password =
        "Password must contain at least 8 characters.";
    } else if (password.length > 128) {
      errors.password =
        "Password is too long.";
    }

    if (!confirmPassword) {
      errors.confirmPassword =
        "Confirm your new password.";
    } else if (
      password !== confirmPassword
    ) {
      errors.confirmPassword =
        "The passwords do not match.";
    }

    setFieldErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  }

  function clearFieldError(field) {
    if (!fieldErrors[field]) {
      return;
    }

    setFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  async function handleSubmit() {
    if (loading) {
      return;
    }

    setError("");
    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        `/auth/reset-password/${encodeURIComponent(
          token,
        )}`,
        {
          password,
        },
      );

      setSuccessMessage(
        response.data?.msg ||
          "Password reset successful. You can now sign in with your new password.",
      );

      setPassword("");
      setConfirmPassword("");
      setFieldErrors({});
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Screen
        scroll
        contentContainerStyle={
          styles.screenContent
        }
      >
        <Card style={styles.invalidCard}>
          <View
            style={
              styles.invalidIcon
            }
          >
            <Ionicons
              name="link-outline"
              size={31}
              color={colors.danger}
            />
          </View>

          <Text style={styles.invalidTitle}>
            Invalid reset link
          </Text>

          <Text
            style={
              styles.invalidDescription
            }
          >
            This password reset link is
            incomplete or invalid. Request a
            new password reset email.
          </Text>

          <Button
            title="Request a new link"
            onPress={() =>
              router.replace(
                "/(auth)/forgot-password",
              )
            }
          />

          <Button
            title="Back to sign in"
            variant="outline"
            onPress={() =>
              router.replace(
                "/(auth)/login",
              )
            }
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      contentContainerStyle={
        styles.screenContent
      }
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        style={styles.keyboardView}
      >
        <View style={styles.page}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Ionicons
                name="school-outline"
                size={27}
                color={colors.white}
              />
            </View>

            <Text style={styles.brandName}>
              Mahmoud Nagy Platform
            </Text>
          </View>

          <Card style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name={
                    successMessage
                      ? "checkmark-circle-outline"
                      : "lock-closed-outline"
                  }
                  size={30}
                  color={
                    successMessage
                      ? colors.secondary
                      : colors.primary
                  }
                />
              </View>

              <Text style={styles.eyebrow}>
                PASSWORD RESET
              </Text>

              <Text style={styles.title}>
                {successMessage
                  ? "Password updated"
                  : "Create a new password"}
              </Text>

              <Text style={styles.subtitle}>
                {successMessage
                  ? "Your password has been changed successfully."
                  : "Enter a secure new password for your account."}
              </Text>
            </View>

            {error ? (
              <View style={styles.errorAlert}>
                <Ionicons
                  name="alert-circle-outline"
                  size={21}
                  color={colors.danger}
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>

                <Pressable
                  onPress={() =>
                    setError("")
                  }
                  style={
                    styles.dismissButton
                  }
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={colors.danger}
                  />
                </Pressable>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successState}>
                <View
                  style={
                    styles.successAlert
                  }
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={24}
                    color={colors.secondary}
                  />

                  <Text
                    style={
                      styles.successText
                    }
                  >
                    {successMessage}
                  </Text>
                </View>

                <Button
                  title="Go to sign in"
                  onPress={() =>
                    router.replace(
                      "/(auth)/login",
                    )
                  }
                  style={
                    styles.submitButton
                  }
                />
              </View>
            ) : (
              <>
                <PasswordField
                  label="New password"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    clearFieldError(
                      "password",
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter at least 8 characters"
                  visible={showPassword}
                  onToggleVisibility={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  error={
                    fieldErrors.password
                  }
                  returnKeyType="next"
                />

                <PasswordStrength
                  password={password}
                />

                <PasswordField
                  label="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(
                      value,
                    );

                    clearFieldError(
                      "confirmPassword",
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter the password again"
                  visible={
                    showConfirmPassword
                  }
                  onToggleVisibility={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current,
                    )
                  }
                  error={
                    fieldErrors.confirmPassword
                  }
                  returnKeyType="done"
                  onSubmitEditing={
                    handleSubmit
                  }
                />

                <Button
                  title="Reset password"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!canSubmit}
                  style={
                    styles.submitButton
                  }
                />
              </>
            )}

            <View style={styles.footer}>
              <Link
                href="/(auth)/login"
                asChild
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.loginLink,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="arrow-back-outline"
                    size={17}
                    color={colors.primary}
                  />

                  <Text
                    style={
                      styles.loginLinkText
                    }
                  >
                    Back to sign in
                  </Text>
                </Pressable>
              </Link>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function PasswordStrength({
  password,
}) {
  const requirements = [
    {
      id: "length",
      label: "At least 8 characters",
      passed: password.length >= 8,
    },
    {
      id: "letter",
      label: "Contains a letter",
      passed: /[A-Za-z]/.test(
        password,
      ),
    },
    {
      id: "number",
      label: "Contains a number",
      passed: /\d/.test(password),
    },
  ];

  return (
    <View style={styles.requirements}>
      {requirements.map(
        (requirement) => (
          <View
            key={requirement.id}
            style={
              styles.requirementRow
            }
          >
            <Ionicons
              name={
                requirement.passed
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={17}
              color={
                requirement.passed
                  ? colors.secondary
                  : colors.textMuted
              }
            />

            <Text
              style={[
                styles.requirementText,
                requirement.passed &&
                  styles.requirementPassed,
              ]}
            >
              {requirement.label}
            </Text>
          </View>
        ),
      )}
    </View>
  );
}