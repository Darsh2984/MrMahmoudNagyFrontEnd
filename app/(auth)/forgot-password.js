import React, {
  useMemo,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  Link,
  useRouter,
} from "expo-router";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";

import api from "../../src/lib/api";
import { colors } from "../../src/theme";

import { styles } from "./forgot-password.styles";

function getErrorMessage(
  error,
  fallback = "Couldn't send the password reset email.",
) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [fieldError, setFieldError] =
    useState("");

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const normalizedEmail =
    email.trim().toLowerCase();

  const canSubmit = useMemo(
    () =>
      normalizedEmail.length > 0 &&
      !loading,
    [normalizedEmail, loading],
  );

  function validate() {
    if (!normalizedEmail) {
      setFieldError(
        "Email address is required.",
      );

      return false;
    }

    if (
      !/^\S+@\S+\.\S+$/.test(
        normalizedEmail,
      )
    ) {
      setFieldError(
        "Enter a valid email address.",
      );

      return false;
    }

    setFieldError("");

    return true;
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
        "/auth/forgot-password",
        {
          email: normalizedEmail,
        },
      );

      setSuccessMessage(
        response.data?.msg ||
          "If an account exists for this email, a password reset link has been sent.",
      );
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

  function handleEmailChange(value) {
    setEmail(value);

    if (fieldError) {
      setFieldError("");
    }

    if (error) {
      setError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
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
                  name="key-outline"
                  size={28}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.eyebrow}>
                PASSWORD RECOVERY
              </Text>

              <Text style={styles.title}>
                Forgot your password?
              </Text>

              <Text style={styles.subtitle}>
                Enter the email address connected to
                your account. We will send you a
                secure password reset link.
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
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss error"
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
              <View
                style={
                  styles.successAlert
                }
              >
                <View
                  style={
                    styles.successIcon
                  }
                >
                  <Ionicons
                    name="mail-unread-outline"
                    size={23}
                    color={colors.secondary}
                  />
                </View>

                <View
                  style={
                    styles.successCopy
                  }
                >
                  <Text
                    style={
                      styles.successTitle
                    }
                  >
                    Check your email
                  </Text>

                  <Text
                    style={
                      styles.successText
                    }
                  >
                    {successMessage}
                  </Text>

                  <Text
                    style={
                      styles.successHint
                    }
                  >
                    The reset link expires after 15
                    minutes. Also check your spam or
                    junk folder.
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <View
                  style={
                    styles.fieldGroup
                  }
                >
                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    Email address
                  </Text>

                  <Input
                    value={email}
                    onChangeText={
                      handleEmailChange
                    }
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="send"
                    onSubmitEditing={
                      handleSubmit
                    }
                    error={fieldError}
                  />
                </View>

                <Button
                  title="Send reset link"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!canSubmit}
                  style={
                    styles.submitButton
                  }
                />
              </>
            )}

            {successMessage ? (
              <Button
                title="Send another link"
                variant="outline"
                onPress={() => {
                  setSuccessMessage("");
                  setError("");
                }}
              />
            ) : null}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Remembered your password?
              </Text>

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

          <Text style={styles.securityNote}>
            For your security, we do not confirm
            whether an email address is registered
            on the platform.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}