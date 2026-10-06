import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import api from "../../../src/lib/api";
import {
  colors,
  radius,
  spacing,
} from "../../../src/theme";

function readToken(value) {
  if (Array.isArray(value)) {
    return String(value[0] || "").trim();
  }

  return String(value || "").trim();
}

function errorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.message ||
    fallback
  );
}

function askForPermanentDeletion() {
  const message =
    "This permanently deletes the account and its personal data. This cannot be undone. Continue?";

  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(message));
  }

  return new Promise((resolve) => {
    Alert.alert(
      "Permanently delete account",
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: "Delete permanently",
          style: "destructive",
          onPress: () => resolve(true),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => resolve(false),
      },
    );
  });
}

export default function AccountDeletionReview() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const token = readToken(params.token);

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRequest() {
      if (!token) {
        setError("This deletion request link is incomplete.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/auth/account-deletion/${encodeURIComponent(token)}`,
        );

        if (active) {
          setRequest(response.data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            errorMessage(
              requestError,
              "Could not load this deletion request.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRequest();

    return () => {
      active = false;
    };
  }, [token]);

  async function confirmDeletion() {
    if (deleting) {
      return;
    }

    if (!(await askForPermanentDeletion())) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await api.post(
        `/auth/account-deletion/${encodeURIComponent(token)}/confirm`,
      );

      setSuccess(
        response.data?.msg ||
          "The account was permanently deleted.",
      );
      setRequest((current) => ({
        ...current,
        status: "COMPLETED",
      }));
    } catch (requestError) {
      setError(
        errorMessage(
          requestError,
          "Could not delete the account.",
        ),
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.page}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={27}
              color={colors.white}
            />
          </View>

          <Text style={styles.brandName}>
            Mahmoud Nagy Platform
          </Text>
        </View>

        <Card style={styles.card}>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
              <Text style={styles.loadingText}>
                Loading deletion request...
              </Text>
            </View>
          ) : error && !request ? (
            <View style={styles.centered}>
              <View style={styles.iconDanger}>
                <Ionicons
                  name="alert-circle-outline"
                  size={34}
                  color={colors.danger}
                />
              </View>
              <Text style={styles.title}>Invalid request</Text>
              <Text style={styles.description}>{error}</Text>
            </View>
          ) : request?.status === "COMPLETED" || success ? (
            <View style={styles.centered}>
              <View style={styles.iconSuccess}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={36}
                  color={colors.secondary}
                />
              </View>
              <Text style={styles.title}>Account deleted</Text>
              <Text style={styles.description}>
                {success || "This account has already been deleted."}
              </Text>
              <Button
                title="Go to sign in"
                onPress={() => router.replace("/(auth)/login")}
                style={styles.actionButton}
              />
            </View>
          ) : (
            <>
              <View style={styles.headingRow}>
                <View style={styles.iconDanger}>
                  <Ionicons
                    name="trash-outline"
                    size={31}
                    color={colors.danger}
                  />
                </View>

                <View style={styles.headingCopy}>
                  <Text style={styles.eyebrow}>
                    ACCOUNT DELETION REQUEST
                  </Text>
                  <Text style={styles.title}>
                    Review before deleting
                  </Text>
                </View>
              </View>

              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailValue}>{request?.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{request?.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Role</Text>
                  <Text style={styles.detailValue}>{request?.role}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Requested</Text>
                  <Text style={styles.detailValue}>
                    {request?.requestedAt
                      ? new Date(request.requestedAt).toLocaleString()
                      : "—"}
                  </Text>
                </View>
              </View>

              <View style={styles.warningBox}>
                <Ionicons
                  name="warning-outline"
                  size={23}
                  color={colors.warning}
                />
                <Text style={styles.warningText}>
                  This action permanently removes the user's account,
                  personal data, submissions, messages, and stored files.
                  It cannot be undone.
                </Text>
              </View>

              {request?.expired ? (
                <Text style={styles.errorText}>
                  This review link has expired. Ask the user to submit a new request.
                </Text>
              ) : null}

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              <Button
                title="Permanently delete account"
                variant="danger"
                loading={deleting}
                disabled={request?.expired}
                onPress={confirmDeletion}
                style={styles.actionButton}
              />
            </>
          )}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingVertical: 30,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 22,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  brandName: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.primary,
  },
  card: {
    padding: 26,
  },
  centered: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 13,
    fontSize: 14,
    color: colors.textMuted,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headingCopy: {
    flex: 1,
  },
  iconDanger: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(200, 93, 71, 0.10)",
  },
  iconSuccess: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139, 170, 145, 0.15)",
  },
  eyebrow: {
    marginBottom: 5,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: colors.danger,
  },
  title: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "900",
    color: colors.textPrimary,
    textAlign: "center",
  },
  description: {
    maxWidth: 480,
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
    textAlign: "center",
  },
  detailsBox: {
    marginTop: 25,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    paddingVertical: 8,
  },
  detailLabel: {
    width: 90,
    fontSize: 13,
    fontWeight: "800",
    color: colors.textMuted,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "right",
  },
  warningBox: {
    marginTop: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: radius.md,
    backgroundColor: "rgba(215, 126, 66, 0.10)",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  errorText: {
    marginTop: 15,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.danger,
    textAlign: "center",
  },
  actionButton: {
    marginTop: 20,
  },
});
