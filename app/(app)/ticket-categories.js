import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import api from "../../src/lib/api";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

export default function TicketCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async ({ refresh = false } = {}) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const res = await api.get("/ticket-categories");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err.response?.data?.msg || "Couldn't load ticket categories."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || creating) return;

    setCreating(true);
    setError("");

    try {
      await api.post("/ticket-categories", {
        name: trimmedName,
        description: trimmedDescription,
      });

      setName("");
      setDescription("");
      await load();
    } catch (err) {
      setError(
        err.response?.data?.msg || "Couldn't create ticket category."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!id || deletingId) return;

    setDeletingId(id);
    setError("");

    try {
      await api.delete(`/ticket-categories/${id}`);
      setCategories((current) =>
        current.filter((category) => category.id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Couldn't delete this category. Categories linked to tickets cannot be removed."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Ionicons
              name="pricetags-outline"
              size={30}
              color={colors.primary}
            />
          </View>

          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loadingSpinner}
          />

          <Text style={styles.loadingTitle}>
            Loading ticket categories
          </Text>

          <Text style={styles.loadingText}>
            Preparing the categories students can choose when opening a
            support ticket.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load({ refresh: true })}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="pricetags-outline"
              size={27}
              color={colors.primary}
            />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.eyebrow}>SUPPORT MANAGEMENT</Text>
            <Text style={styles.title}>Ticket Categories</Text>
            <Text style={styles.subtitle}>
              Create and manage the categories students use when submitting
              support tickets.
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countValue}>{categories.length}</Text>
            <Text style={styles.countLabel}>
              {categories.length === 1 ? "Category" : "Categories"}
            </Text>
          </View>
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <View style={styles.errorRow}>
              <View style={styles.errorIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={colors.danger}
                />
              </View>

              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  Something went wrong
                </Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>

              <Pressable
                onPress={() => setError("")}
                style={({ pressed }) => [
                  styles.dismissButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>
          </Card>
        ) : null}

        <View style={styles.contentLayout}>
          <Card style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons
                  name="add-circle-outline"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <View style={styles.cardHeaderContent}>
                <Text style={styles.cardTitle}>Add category</Text>
                <Text style={styles.cardSubtitle}>
                  Create a clear category to help route student requests.
                </Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Category name <Text style={styles.required}>*</Text>
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  name.trim() && styles.inputWrapperFilled,
                ]}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={19}
                  color={colors.textMuted}
                />

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Example: Homework support"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  maxLength={80}
                  returnKeyType="next"
                />
              </View>

              <Text style={styles.helperText}>
                Use a short and specific name students will understand.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>

              <View
                style={[
                  styles.textAreaWrapper,
                  description.trim() && styles.inputWrapperFilled,
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={colors.textMuted}
                  style={styles.textAreaIcon}
                />

                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Briefly explain when students should use this category"
                  placeholderTextColor={colors.textMuted}
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={240}
                />
              </View>

              <View style={styles.fieldFooter}>
                <Text style={styles.helperText}>
                  Optional, but useful for reducing incorrectly assigned
                  tickets.
                </Text>

                <Text style={styles.characterCount}>
                  {description.length}/240
                </Text>
              </View>
            </View>

            <Button
              title={creating ? "Adding category..." : "Add category"}
              onPress={handleCreate}
              disabled={!name.trim() || creating}
            />
          </Card>

          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <View>
                <Text style={styles.listTitle}>Available categories</Text>
                <Text style={styles.listSubtitle}>
                  Categories currently available in the ticket form
                </Text>
              </View>

              <Pressable
                onPress={() => load({ refresh: true })}
                disabled={refreshing}
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.pressed,
                ]}
              >
                {refreshing ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />
                ) : (
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </Pressable>
            </View>

            {categories.length === 0 ? (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="pricetags-outline"
                    size={32}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No ticket categories yet
                </Text>

                <Text style={styles.emptyText}>
                  Add your first category so students can classify their
                  support requests.
                </Text>
              </Card>
            ) : (
              <View style={styles.categoryList}>
                {categories.map((category, index) => {
                  const isDeleting = deletingId === category.id;

                  return (
                    <Card key={category.id} style={styles.categoryCard}>
                      <View style={styles.categoryMain}>
                        <View style={styles.categoryIcon}>
                          <Ionicons
                            name="pricetag-outline"
                            size={21}
                            color={colors.primary}
                          />
                        </View>

                        <View style={styles.categoryContent}>
                          <View style={styles.categoryTitleRow}>
                            <Text
                              style={styles.categoryName}
                              numberOfLines={1}
                            >
                              {category.name}
                            </Text>

                            <View style={styles.numberBadge}>
                              <Text style={styles.numberBadgeText}>
                                {index + 1}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.categoryDescription}>
                            {category.description?.trim() ||
                              "No description has been added."}
                          </Text>
                        </View>
                      </View>

                      <Pressable
                        onPress={() => handleDelete(category.id)}
                        disabled={isDeleting || Boolean(deletingId)}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${category.name}`}
                        style={({ pressed }) => [
                          styles.deleteButton,
                          pressed && styles.deleteButtonPressed,
                          isDeleting && styles.deleteButtonDisabled,
                        ]}
                      >
                        {isDeleting ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.danger}
                          />
                        ) : (
                          <>
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color={colors.danger}
                            />
                            <Text style={styles.deleteButtonText}>
                              Delete
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </Card>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 60, 73, 0.10)",
  },

  loadingSpinner: {
    marginTop: spacing.lg,
  },

  loadingTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  loadingText: {
    maxWidth: 380,
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 60, 73, 0.10)",
  },

  headerContent: {
    flex: 1,
  },

  eyebrow: {
    marginBottom: 4,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.secondary,
  },

  title: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 4,
    maxWidth: 650,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },

  countBadge: {
    minWidth: 82,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.lg || 16,
    alignItems: "center",
    backgroundColor: colors.primary,
  },

  countValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.cream,
  },

  countLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(245, 241, 235, 0.68)",
  },

  errorCard: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(200, 93, 71, 0.22)",
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(200, 93, 71, 0.10)",
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  errorText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },

  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  contentLayout: {
    gap: spacing.lg,
  },

  formCard: {
    padding: spacing.lg,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  cardHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 60, 73, 0.09)",
  },

  cardHeaderContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },

  field: {
    marginBottom: spacing.md,
  },

  label: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  required: {
    color: colors.danger,
  },

  inputWrapper: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(51, 49, 46, 0.14)",
    borderRadius: radius.md || 12,
    backgroundColor: colors.background,
  },

  inputWrapperFilled: {
    borderColor: "rgba(11, 60, 73, 0.34)",
  },

  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: colors.text,
    outlineStyle: "none",
  },

  textAreaWrapper: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(51, 49, 46, 0.14)",
    borderRadius: radius.md || 12,
    backgroundColor: colors.background,
  },

  textAreaIcon: {
    marginTop: 15,
  },

  textArea: {
    flex: 1,
    minHeight: 108,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    outlineStyle: "none",
  },

  fieldFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: 6,
  },

  helperText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },

  characterCount: {
    fontSize: 11,
    color: colors.textMuted,
  },

  listSection: {
    flex: 1,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  listTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
  },

  listSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textMuted,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 60, 73, 0.08)",
  },

  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 60, 73, 0.09)",
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  emptyText: {
    maxWidth: 380,
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
  },

  categoryList: {
    gap: spacing.sm,
  },

  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
  },

  categoryMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 60, 73, 0.09)",
  },

  categoryContent: {
    flex: 1,
  },

  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  categoryName: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },

  numberBadge: {
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
    borderRadius: 99,
    backgroundColor: "rgba(139, 170, 145, 0.18)",
  },

  numberBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.secondary,
  },

  categoryDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },

  deleteButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md || 12,
    backgroundColor: "rgba(200, 93, 71, 0.09)",
  },

  deleteButtonPressed: {
    opacity: 0.72,
  },

  deleteButtonDisabled: {
    opacity: 0.55,
  },

  deleteButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.danger,
  },

  pressed: {
    opacity: 0.72,
  },
});