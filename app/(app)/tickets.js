import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Badge } from "../../src/components/ui/Badge";
import { Input } from "../../src/components/ui/Input";
import { useAuth } from "../../src/contexts/AuthContext";

import api from "../../src/lib/api";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

const DESKTOP_BREAKPOINT = 900;

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    tone: "danger",
    color: colors.danger,
    icon: "alert-circle-outline",
  },
  RESOLVED_PENDING_CONFIRM: {
    label: "Awaiting confirmation",
    tone: "warning",
    color: colors.warning,
    icon: "time-outline",
  },
  CONFIRMED_RESOLVED: {
    label: "Resolved",
    tone: "success",
    color: colors.secondary,
    icon: "checkmark-circle-outline",
  },
  REOPENED: {
    label: "Reopened",
    tone: "danger",
    color: colors.danger,
    icon: "refresh-circle-outline",
  },
};

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  {
    key: "RESOLVED_PENDING_CONFIRM",
    label: "Awaiting confirmation",
  },
  {
    key: "CONFIRMED_RESOLVED",
    label: "Resolved",
  },
  { key: "REOPENED", label: "Reopened" },
];

export default function Tickets() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const isStudent = user?.role === "STUDENT";
  const isAdminLevel =
    user?.role === "TEACHER" || user?.isHeadAssistant;

  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showNew, setShowNew] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");

  const load = useCallback(
    async ({ isRefresh = false } = {}) => {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      }

      try {
        let response;

        if (isStudent) {
          response = await api.get("/tickets/mine");
        } else if (isAdminLevel) {
          response = await api.get("/tickets/all");
        } else {
          response = await api.get(
            "/tickets/assigned-to-me"
          );
        }

        setTickets(response.data ?? []);
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            err.response?.data?.message ||
            "Couldn't load tickets."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isStudent, isAdminLevel]
  );

  const loadCategories = useCallback(async () => {
    if (!isStudent) return;

    try {
      const response = await api.get(
        "/ticket-categories"
      );

      const items = response.data ?? [];

      setCategories(items);

      if (items.length > 0) {
        setCategoryId((current) => current || items[0].id);
      }
    } catch {
      setCategories([]);
    }
  }, [isStudent]);

  useEffect(() => {
    load();
    loadCategories();
  }, [load, loadCategories]);

  const ticketCounts = useMemo(() => {
    return tickets.reduce(
      (counts, ticket) => {
        counts.total += 1;

        if (
          ticket.status === "OPEN" ||
          ticket.status === "REOPENED"
        ) {
          counts.open += 1;
        }

        if (
          ticket.status ===
          "RESOLVED_PENDING_CONFIRM"
        ) {
          counts.awaiting += 1;
        }

        if (
          ticket.status === "CONFIRMED_RESOLVED"
        ) {
          counts.resolved += 1;
        }

        return counts;
      },
      {
        total: 0,
        open: 0,
        awaiting: 0,
        resolved: 0,
      }
    );
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        ticket.status === statusFilter;

      const searchableText = [
        ticket.subject,
        ticket.category?.name,
        ticket.createdBy?.name,
        ticket.assignedAssistant?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search || searchableText.includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [tickets, searchText, statusFilter]);

  function validateNewTicket() {
    const errors = {};

    if (!categoryId) {
      errors.category = "Select a ticket category.";
    }

    if (!subject.trim()) {
      errors.subject = "Enter a subject.";
    } else if (subject.trim().length < 4) {
      errors.subject =
        "The subject must contain at least 4 characters.";
    }

    if (!firstMessage.trim()) {
      errors.firstMessage =
        "Describe the issue you need help with.";
    } else if (firstMessage.trim().length < 10) {
      errors.firstMessage =
        "Please provide a little more detail.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleCreate() {
    if (creating || !validateNewTicket()) {
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response = await api.post("/tickets", {
        categoryId,
        subject: subject.trim(),
        firstMessage: firstMessage.trim(),
      });

      const ticketId =
        response.data?.ticket?.id ||
        response.data?.id;

      setSubject("");
      setFirstMessage("");
      setFieldErrors({});
      setShowNew(false);

      if (ticketId) {
        router.push(`/(app)/tickets/${ticketId}`);
      } else {
        await load();
      }
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Couldn't create the ticket."
      );
    } finally {
      setCreating(false);
    }
  }

  function closeCreateForm() {
    if (creating) return;

    setShowNew(false);
    setSubject("");
    setFirstMessage("");
    setFieldErrors({});
  }

  function getPageDescription() {
    if (isStudent) {
      return "Ask for help, follow replies, and confirm when an issue has been resolved.";
    }

    if (isAdminLevel) {
      return "Review all student support tickets and oversee their resolution.";
    }

    return "Review and respond to the support tickets assigned to you.";
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <ActivityIndicator
          color={colors.primary}
          size="large"
        />

        <Text style={styles.loadingText}>
          Loading tickets...
        </Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View
        style={[
          styles.header,
          isDesktop && styles.headerDesktop,
        ]}
      >
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            STUDENT SUPPORT
          </Text>

          <Text style={[typography.h1, styles.pageTitle]}>
            Tickets
          </Text>

          <Text style={styles.pageDescription}>
            {getPageDescription()}
          </Text>
        </View>

        {isStudent ? (
          <Button
            title={
              showNew ? "Close form" : "New ticket"
            }
            variant={showNew ? "outline" : "warning"}
            onPress={() => {
              if (showNew) {
                closeCreateForm();
              } else {
                setShowNew(true);
              }
            }}
            style={[
              styles.newTicketButton,
              !isDesktop &&
                styles.newTicketButtonMobile,
            ]}
          />
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <View style={styles.errorContent}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={colors.danger}
              />
            </View>

            <View style={styles.errorTextContainer}>
              <Text style={styles.errorTitle}>
                Something went wrong
              </Text>

              <Text style={styles.errorDescription}>
                {error}
              </Text>
            </View>
          </View>

          <Button
            title="Retry"
            variant="outline"
            loading={refreshing}
            onPress={() =>
              load({ isRefresh: true })
            }
            style={styles.retryButton}
          />
        </View>
      ) : null}

      {showNew && isStudent ? (
        <NewTicketForm
          categories={categories}
          categoryId={categoryId}
          subject={subject}
          firstMessage={firstMessage}
          fieldErrors={fieldErrors}
          creating={creating}
          onCategoryChange={(id) => {
            setCategoryId(id);

            if (fieldErrors.category) {
              setFieldErrors((current) => ({
                ...current,
                category: "",
              }));
            }
          }}
          onSubjectChange={(value) => {
            setSubject(value);

            if (fieldErrors.subject) {
              setFieldErrors((current) => ({
                ...current,
                subject: "",
              }));
            }
          }}
          onMessageChange={(value) => {
            setFirstMessage(value);

            if (fieldErrors.firstMessage) {
              setFieldErrors((current) => ({
                ...current,
                firstMessage: "",
              }));
            }
          }}
          onCancel={closeCreateForm}
          onSubmit={handleCreate}
        />
      ) : null}

      <View style={styles.statsGrid}>
        <SummaryCard
          label="All tickets"
          value={ticketCounts.total}
          icon="file-tray-full-outline"
          accent={colors.primary}
          selected={statusFilter === "ALL"}
          onPress={() => setStatusFilter("ALL")}
        />

        <SummaryCard
          label="Open"
          value={ticketCounts.open}
          icon="alert-circle-outline"
          accent={colors.danger}
          selected={
            statusFilter === "OPEN" ||
            statusFilter === "REOPENED"
          }
          onPress={() => setStatusFilter("OPEN")}
        />

        <SummaryCard
          label="Awaiting confirmation"
          value={ticketCounts.awaiting}
          icon="time-outline"
          accent={colors.warning}
          selected={
            statusFilter ===
            "RESOLVED_PENDING_CONFIRM"
          }
          onPress={() =>
            setStatusFilter(
              "RESOLVED_PENDING_CONFIRM"
            )
          }
        />

        <SummaryCard
          label="Resolved"
          value={ticketCounts.resolved}
          icon="checkmark-circle-outline"
          accent={colors.secondary}
          selected={
            statusFilter === "CONFIRMED_RESOLVED"
          }
          onPress={() =>
            setStatusFilter(
              "CONFIRMED_RESOLVED"
            )
          }
        />
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textMuted}
          />

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search tickets..."
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            style={styles.searchInput}
          />

          {searchText ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearchText("")}
              style={styles.clearSearchButton}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            load({ isRefresh: true })
          }
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

          <Text style={styles.refreshText}>
            Refresh
          </Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const isSelected =
            statusFilter === filter.key;

          return (
            <Pressable
              key={filter.key}
              accessibilityRole="button"
              onPress={() =>
                setStatusFilter(filter.key)
              }
              style={({ pressed }) => [
                styles.filterChip,
                isSelected &&
                  styles.filterChipSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected &&
                    styles.filterChipTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.listHeader}>
        <View>
          <Text style={styles.listTitle}>
            {statusFilter === "ALL"
              ? "All tickets"
              : FILTERS.find(
                  (item) =>
                    item.key === statusFilter
                )?.label}
          </Text>

          <Text style={styles.listCount}>
            {filteredTickets.length}{" "}
            {filteredTickets.length === 1
              ? "ticket"
              : "tickets"}
          </Text>
        </View>
      </View>

      {filteredTickets.length === 0 ? (
        <EmptyState
          hasTickets={tickets.length > 0}
          isStudent={isStudent}
          onCreate={() => setShowNew(true)}
          onClearFilters={() => {
            setSearchText("");
            setStatusFilter("ALL");
          }}
        />
      ) : (
        <View style={styles.ticketList}>
          {filteredTickets.map((ticket) => (
            <TicketRow
              key={ticket.id}
              ticket={ticket}
              isStudent={isStudent}
              isAdminLevel={isAdminLevel}
              onPress={() =>
                router.push(
                  `/(app)/tickets/${ticket.id}`
                )
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
  selected,
  onPress,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.summaryCardWrapper,
        pressed && styles.pressed,
      ]}
    >
      <Card
        style={[
          styles.summaryCard,
          selected && {
            borderColor: accent,
          },
        ]}
      >
        <View
          style={[
            styles.summaryIcon,
            { backgroundColor: `${accent}16` },
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={accent}
          />
        </View>

        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>
            {label}
          </Text>

          <Text style={styles.summaryValue}>
            {value}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

function NewTicketForm({
  categories,
  categoryId,
  subject,
  firstMessage,
  fieldErrors,
  creating,
  onCategoryChange,
  onSubjectChange,
  onMessageChange,
  onCancel,
  onSubmit,
}) {
  return (
    <Card style={styles.createCard}>
      <View style={styles.createHeader}>
        <View style={styles.createHeaderIcon}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={25}
            color={colors.primary}
          />
        </View>

        <View style={styles.createHeaderText}>
          <Text style={styles.createTitle}>
            Create a support ticket
          </Text>

          <Text style={styles.createDescription}>
            Select the correct category and explain the
            issue clearly so the support team can help.
          </Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>
          Category
        </Text>

        <Text style={styles.fieldHelp}>
          Choose the category that best matches your
          issue.
        </Text>

        {categories.length > 0 ? (
          <View style={styles.categoryGrid}>
            {categories.map((category) => {
              const isSelected =
                category.id === categoryId;

              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  disabled={creating}
                  onPress={() =>
                    onCategoryChange(category.id)
                  }
                  style={({ pressed }) => [
                    styles.categoryChip,
                    isSelected &&
                      styles.categoryChipSelected,
                    pressed && styles.pressed,
                    creating && styles.disabled,
                  ]}
                >
                  <Ionicons
                    name={
                      isSelected
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={18}
                    color={
                      isSelected
                        ? colors.white
                        : colors.textMuted
                    }
                  />

                  <Text
                    style={[
                      styles.categoryText,
                      isSelected &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.noCategories}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.warning}
            />

            <Text style={styles.noCategoriesText}>
              No ticket categories are currently
              available.
            </Text>
          </View>
        )}

        {fieldErrors.category ? (
          <Text style={styles.fieldError}>
            {fieldErrors.category}
          </Text>
        ) : null}
      </View>

      <Input
        label="Subject"
        value={subject}
        onChangeText={onSubjectChange}
        placeholder="Briefly describe the issue"
        editable={!creating}
        error={fieldErrors.subject}
        maxLength={120}
      />

      <View style={styles.messageField}>
        <Text style={styles.fieldLabel}>
          Message
        </Text>

        <Text style={styles.fieldHelp}>
          Include any details that may help resolve
          your issue.
        </Text>

        <TextInput
          value={firstMessage}
          onChangeText={onMessageChange}
          placeholder="Describe what happened, what you expected, and any steps you already tried..."
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          editable={!creating}
          maxLength={1500}
          style={[
            styles.messageInput,
            fieldErrors.firstMessage &&
              styles.messageInputError,
          ]}
        />

        <View style={styles.messageMeta}>
          {fieldErrors.firstMessage ? (
            <Text style={styles.fieldError}>
              {fieldErrors.firstMessage}
            </Text>
          ) : (
            <View />
          )}

          <Text style={styles.characterCount}>
            {firstMessage.length}/1500
          </Text>
        </View>
      </View>

      <View style={styles.createActions}>
        <Button
          title="Cancel"
          variant="outline"
          disabled={creating}
          onPress={onCancel}
          style={styles.createActionButton}
        />

        <Button
          title="Submit ticket"
          loading={creating}
          disabled={
            categories.length === 0
          }
          onPress={onSubmit}
          style={styles.createActionButton}
        />
      </View>
    </Card>
  );
}

function TicketRow({
  ticket,
  isStudent,
  isAdminLevel,
  onPress,
}) {
  const config =
    STATUS_CONFIG[ticket.status] ||
    STATUS_CONFIG.OPEN;

  const dateValue =
    ticket.updatedAt ||
    ticket.createdAt ||
    null;

  const formattedDate = dateValue
    ? new Date(dateValue).toLocaleDateString(
        undefined,
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "";

  const secondaryPerson = isStudent
    ? ticket.assignedAssistant?.name
    : ticket.createdBy?.name;

  const personLabel = isStudent
    ? "Assigned to"
    : isAdminLevel
      ? "Student"
      : "From";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ticket: ${ticket.subject}`}
      onPress={onPress}
      style={({ pressed }) => [
        pressed && styles.pressed,
      ]}
    >
      <Card style={styles.ticketCard}>
        <View
          style={[
            styles.ticketStatusBar,
            { backgroundColor: config.color },
          ]}
        />

        <View style={styles.ticketMain}>
          <View style={styles.ticketTopRow}>
            <View style={styles.ticketTitleSection}>
              <Text
                style={styles.ticketSubject}
                numberOfLines={2}
              >
                {ticket.subject}
              </Text>

              <View style={styles.ticketMetaRow}>
                {ticket.category?.name ? (
                  <View style={styles.categoryMeta}>
                    <Ionicons
                      name="folder-outline"
                      size={15}
                      color={colors.textMuted}
                    />

                    <Text
                      style={styles.ticketMetaText}
                      numberOfLines={1}
                    >
                      {ticket.category.name}
                    </Text>
                  </View>
                ) : null}

                {formattedDate ? (
                  <View style={styles.dateMeta}>
                    <Ionicons
                      name="calendar-outline"
                      size={15}
                      color={colors.textMuted}
                    />

                    <Text style={styles.ticketMetaText}>
                      {formattedDate}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Badge
              label={config.label}
              tone={config.tone}
            />
          </View>

          <View style={styles.ticketBottomRow}>
            <View style={styles.personMeta}>
              <View style={styles.personAvatar}>
                <Ionicons
                  name="person-outline"
                  size={17}
                  color={colors.primary}
                />
              </View>

              <View style={styles.personText}>
                <Text style={styles.personLabel}>
                  {personLabel}
                </Text>

                <Text
                  style={styles.personName}
                  numberOfLines={1}
                >
                  {secondaryPerson || "Not assigned"}
                </Text>
              </View>
            </View>

            <View style={styles.openAction}>
              <Text style={styles.openActionText}>
                Open
              </Text>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.primary}
              />
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function EmptyState({
  hasTickets,
  isStudent,
  onCreate,
  onClearFilters,
}) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={
            hasTickets
              ? "search-outline"
              : "chatbubbles-outline"
          }
          size={32}
          color={colors.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {hasTickets
          ? "No matching tickets"
          : "No tickets yet"}
      </Text>

      <Text style={styles.emptyDescription}>
        {hasTickets
          ? "Try changing the selected status or clearing your search."
          : isStudent
            ? "Create a support ticket whenever you need help."
            : "There are currently no support tickets to review."}
      </Text>

      {hasTickets ? (
        <Button
          title="Clear filters"
          variant="outline"
          onPress={onClearFilters}
          style={styles.emptyButton}
        />
      ) : isStudent ? (
        <Button
          title="Create ticket"
          variant="warning"
          onPress={onCreate}
          style={styles.emptyButton}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },

  centeredScreen: {
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },

  header: {
    marginBottom: spacing.lg,
  },

  headerDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },

  pageTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  pageDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 23,
    maxWidth: 720,
  },

  newTicketButton: {
    minWidth: 145,
  },

  newTicketButtonMobile: {
    width: "100%",
    marginTop: spacing.md,
  },

  errorCard: {
    borderWidth: 1,
    borderColor: `${colors.danger}45`,
    borderRadius: radius.lg,
    backgroundColor: `${colors.danger}0D`,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  errorContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  errorIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.danger}15`,
    marginRight: spacing.md,
  },

  errorTextContainer: {
    flex: 1,
  },

  errorTitle: {
    ...typography.bodyBold,
    color: colors.danger,
    marginBottom: 3,
  },

  errorDescription: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 21,
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
  },

  createCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },

  createHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },

  createHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginRight: spacing.md,
  },

  createHeaderText: {
    flex: 1,
  },

  createTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  createDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },

  formSection: {
    marginBottom: spacing.md,
  },

  fieldLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  fieldHelp: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  categoryText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "700",
  },

  categoryTextSelected: {
    color: colors.white,
  },

  noCategories: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.warning}45`,
    borderRadius: radius.md,
    backgroundColor: `${colors.warning}10`,
    padding: spacing.md,
  },

  noCategoriesText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },

  fieldError: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },

  messageField: {
    marginTop: spacing.sm,
  },

  messageInput: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },

  messageInputError: {
    borderColor: colors.danger,
  },

  messageMeta: {
    minHeight: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  characterCount: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: "auto",
  },

  createActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  createActionButton: {
    minWidth: 130,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  summaryCardWrapper: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 205,
  },

  summaryCard: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },

  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  summaryContent: {
    flex: 1,
  },

  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 3,
  },

  summaryValue: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  searchBox: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },

  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },

  clearSearchButton: {
    padding: spacing.xs,
  },

  refreshButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },

  refreshText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  filterChipSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },

  filterChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
  },

  filterChipTextSelected: {
    color: colors.primary,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  listTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  listCount: {
    ...typography.caption,
    color: colors.textMuted,
  },

  ticketList: {
    gap: spacing.sm,
  },

  ticketCard: {
    flexDirection: "row",
    padding: 0,
    overflow: "hidden",
  },

  ticketStatusBar: {
    width: 5,
  },

  ticketMain: {
    flex: 1,
    padding: spacing.md,
  },

  ticketTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },

  ticketTitleSection: {
    flex: 1,
    minWidth: 0,
  },

  ticketSubject: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },

  ticketMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  categoryMeta: {
    maxWidth: 230,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  dateMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  ticketMetaText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  ticketBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  personMeta: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  personAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginRight: spacing.sm,
  },

  personText: {
    flex: 1,
    minWidth: 0,
  },

  personLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },

  personName: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "700",
    marginTop: 1,
  },

  openAction: {
    flexDirection: "row",
    alignItems: "center",
  },

  openActionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },

  emptyCard: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}12`,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  emptyDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 460,
  },

  emptyButton: {
    marginTop: spacing.md,
    minWidth: 140,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.55,
  },
});