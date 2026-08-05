import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/contexts/AuthContext";

import api from "../../src/lib/api";
import { formatDate } from "../../src/utils/formatDate";
import { colors } from "../../src/theme";

import { styles } from "./assistant-performance.styles";

const STATUS_FILTERS = [
  {
    value: "ALL",
    label: "All assistants",
  },
  {
    value: "PENDING",
    label: "Has pending work",
  },
  {
    value: "COMPLETED",
    label: "Has completed work",
  },
];

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getInitials(name) {
  if (!name) {
    return "A";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "A";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function formatHours(hours) {
  const value = Number(hours);

  if (!Number.isFinite(value)) {
    return "Not available";
  }

  if (value < 1) {
    return `${Math.max(
      1,
      Math.round(value * 60),
    )} min`;
  }

  if (value < 24) {
    return `${value.toFixed(
      value % 1 === 0 ? 0 : 1,
    )} hrs`;
  }

  const days = value / 24;

  return `${days.toFixed(
    days % 1 === 0 ? 0 : 1,
  )} days`;
}

function getStatusConfig(status) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Completed",
        tone: "success",
      };


    default:
      return {
        label: "Pending",
        tone: "warning",
      };
  }
}

export default function AssistantPerformance() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const isDesktop = width >= 1080;
  const isSmallScreen = width < 680;

  const hasAccess =
    user?.role === "TEACHER" ||
    Boolean(user?.isHeadAssistant);

  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const loadReport = useCallback(
    async ({ refresh = false } = {}) => {
      if (!hasAccess) {
        setError(
          "You do not have permission to view assistant performance.",
        );

        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await api.get(
          "/assistant-stats/all?recentLimit=12",
        );

        setReport(response.data || {});
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load assistant performance.",
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [hasAccess],
  );

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const assistants = useMemo(() => {
    return Array.isArray(
      report?.assistants,
    )
      ? report.assistants
      : [];
  }, [report?.assistants]);

  const totals = useMemo(() => {
    return assistants.reduce(
      (result, assistant) => {
        const homework =
          assistant.homework || {};

        const tickets =
          assistant.tickets || {};

        result.totalDelegated += Number(
          homework.totalDelegated || 0,
        );

        result.pending += Number(
          homework.pending || 0,
        );

        result.completed += Number(
          homework.completed || 0,
        );


        result.tickets += Number(
          tickets.opened || 0,
        );

        if (
          Number.isFinite(
            Number(
              homework.averageTurnaroundHours,
            ),
          )
        ) {
          result.turnaroundValues.push(
            Number(
              homework.averageTurnaroundHours,
            ),
          );
        }

        return result;
      },
      {
        totalDelegated: 0,
        pending: 0,
        completed: 0,
        tickets: 0,
        turnaroundValues: [],
      },
    );
  }, [assistants]);

  const averageCompletionRate =
    useMemo(() => {
      if (!assistants.length) {
        return 0;
      }

      const total = assistants.reduce(
        (sum, assistant) =>
          sum +
          Number(
            assistant.homework
              ?.completionRate || 0,
          ),
        0,
      );

      return Math.round(
        total / assistants.length,
      );
    }, [assistants]);

  const averageTurnaround =
    useMemo(() => {
      if (
        !totals.turnaroundValues.length
      ) {
        return null;
      }

      const total =
        totals.turnaroundValues.reduce(
          (sum, value) =>
            sum + value,
          0,
        );

      return Number(
        (
          total /
          totals.turnaroundValues.length
        ).toFixed(1),
      );
    }, [totals.turnaroundValues]);

  const filteredAssistants =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return assistants.filter(
        (assistant) => {
          const matchesSearch =
            !query ||
            assistant.assistantName
              ?.toLowerCase()
              .includes(query) ||
            assistant.assistantEmail
              ?.toLowerCase()
              .includes(query);

          const homework =
            assistant.homework || {};

          const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter ===
              "PENDING" &&
              Number(
                homework.pending || 0,
              ) > 0) ||
            (statusFilter ===
              "COMPLETED" &&
              Number(
                homework.completed || 0,
              ) > 0);

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      assistants,
      search,
      statusFilter,
    ]);

  function openTask(taskId) {
    if (!taskId) {
      return;
    }

    router.push(
      `/(app)/tasks/${taskId}`,
    );
  }

  if (loading) {
    return (
      <Screen scroll={false}>
        <View
          style={
            styles.loadingContainer
          }
        >
          <View
            style={styles.loadingIcon}
          >
            <Ionicons
              name="stats-chart-outline"
              size={30}
              color={colors.primary}
            />
          </View>

          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text
            style={styles.loadingTitle}
          >
            Loading performance report
          </Text>

          <Text
            style={styles.loadingText}
          >
            Preparing assistant grading and
            ticket statistics.
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
          onRefresh={() =>
            loadReport({
              refresh: true,
            })
          }
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.page}>
        <View
          style={[
            styles.header,
            isSmallScreen &&
              styles.headerSmall,
          ]}
        >
          <View
            style={styles.headerCopy}
          >
            <Text
              style={styles.eyebrow}
            >
              TEAM PERFORMANCE
            </Text>

            <Text
              style={styles.pageTitle}
            >
              Assistant Performance
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              Monitor delegated homework,
              grading turnaround,completion rates, and
              support-ticket workload.
            </Text>
          </View>

          <View
            style={styles.headerIcon}
          >
            <Ionicons
              name="stats-chart-outline"
              size={31}
              color={colors.primary}
            />
          </View>
        </View>

        {error ? (
          <Card
            style={styles.errorCard}
          >
            <View
              style={styles.errorRow}
            >
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={colors.danger}
              />

              <View
                style={
                  styles.errorContent
                }
              >
                <Text
                  style={styles.errorTitle}
                >
                  Report unavailable
                </Text>

                <Text
                  style={styles.errorText}
                >
                  {error}
                </Text>
              </View>
            </View>

            <Button
              title="Try again"
              variant="outline"
              onPress={() =>
                loadReport()
              }
            />
          </Card>
        ) : null}

        <View
          style={styles.summaryGrid}
        >
          <SummaryCard
            icon="people-outline"
            label="Assistants"
            value={assistants.length}
          />

          <SummaryCard
            icon="documents-outline"
            label="Delegated papers"
            value={
              totals.totalDelegated
            }
          />

          <SummaryCard
            icon="time-outline"
            label="Pending"
            value={totals.pending}
            tone="warning"
          />

          <SummaryCard
            icon="checkmark-done-outline"
            label="Completed"
            value={totals.completed}
            tone="success"
          />

        

          <SummaryCard
            icon="ticket-outline"
            label="Assigned tickets"
            value={totals.tickets}
          />
        </View>

        <View
          style={
            styles.performanceGrid
          }
        >
          <Card
            style={
              styles.performanceCard
            }
          >
            <View
              style={
                styles.performanceHeader
              }
            >
              <View
                style={
                  styles.performanceIcon
                }
              >
                <Ionicons
                  name="pie-chart-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text
                style={
                  styles.performanceTitle
                }
              >
                Average completion rate
              </Text>
            </View>

            <Text
              style={
                styles.performanceValue
              }
            >
              {averageCompletionRate}%
            </Text>

            <View
              style={styles.progressTrack}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      100,
                      averageCompletionRate,
                    )}%`,
                  },
                ]}
              />
            </View>

            <Text
              style={
                styles.performanceText
              }
            >
              Average completion percentage
              across all assistants.
            </Text>
          </Card>

          <Card
            style={
              styles.performanceCard
            }
          >
            <View
              style={
                styles.performanceHeader
              }
            >
              <View
                style={
                  styles.performanceIcon
                }
              >
                <Ionicons
                  name="speedometer-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text
                style={
                  styles.performanceTitle
                }
              >
                Average turnaround
              </Text>
            </View>

            <Text
              style={
                styles.turnaroundValue
              }
            >
              {formatHours(
                averageTurnaround,
              )}
            </Text>

            <Text
              style={
                styles.performanceText
              }
            >
              Average time between delegation
              and grading completion.
            </Text>
          </Card>
        </View>

        <Card
          style={styles.filterCard}
        >
          <View
            style={[
              styles.filterLayout,
              isSmallScreen &&
                styles.filterLayoutSmall,
            ]}
          >
            <View
              style={styles.searchBox}
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textMuted}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search assistants"
                placeholderTextColor={
                  colors.textMuted
                }
                style={
                  styles.searchInput
                }
              />

              {search ? (
                <Pressable
                  onPress={() =>
                    setSearch("")
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={
                      colors.textMuted
                    }
                  />
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.filterList
              }
            >
              {STATUS_FILTERS.map(
                (filter) => {
                  const active =
                    statusFilter ===
                    filter.value;

                  return (
                    <Pressable
                      key={filter.value}
                      onPress={() =>
                        setStatusFilter(
                          filter.value,
                        )
                      }
                      style={[
                        styles.filterChip,
                        active &&
                          styles.filterChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          active &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </ScrollView>
          </View>
        </Card>

        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Assistant workload
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              {filteredAssistants.length}{" "}
              {filteredAssistants.length === 1
                ? "assistant"
                : "assistants"}
            </Text>
          </View>
        </View>

        {!filteredAssistants.length ? (
          <Card
            style={styles.emptyCard}
          >
            <View
              style={styles.emptyIcon}
            >
              <Ionicons
                name="people-outline"
                size={36}
                color={colors.primary}
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              No assistants found
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              Adjust the search or performance
              filter.
            </Text>
          </Card>
        ) : (
          <View
            style={[
              styles.assistantGrid,
              isDesktop &&
                styles.assistantGridDesktop,
            ]}
          >
            {filteredAssistants.map(
              (assistant) => (
                <AssistantPerformanceCard
                  key={
                    assistant.assistantId
                  }
                  assistant={
                    assistant
                  }
                  onOpenTask={openTask}
                  compact={isSmallScreen}
                />
              ),
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone = "primary",
}) {
  const color =
    tone === "success"
      ? colors.secondary
      : tone === "warning"
        ? colors.warning
        : tone === "danger"
          ? colors.danger
          : colors.primary;

  return (
    <Card style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor:
              `${color}15`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={color}
        />
      </View>

      <Text
        style={styles.summaryValue}
      >
        {value}
      </Text>

      <Text
        style={styles.summaryLabel}
      >
        {label}
      </Text>
    </Card>
  );
}

function AssistantPerformanceCard({
  assistant,
  onOpenTask,
  compact,
}) {
  const homework =
    assistant.homework || {};

  const tickets =
    assistant.tickets || {};

  const recentDelegations =
    Array.isArray(
      homework.recentDelegations,
    )
      ? homework.recentDelegations
      : [];

  return (
    <Card
      style={styles.assistantCard}
    >
      <View
        style={[
          styles.assistantHeader,
          compact &&
            styles.assistantHeaderSmall,
        ]}
      >
        <View
          style={
            styles.assistantIdentity
          }
        >
          <View
            style={[
              styles.avatar,
              assistant.isHeadAssistant &&
                styles.headAvatar,
            ]}
          >
            <Text
              style={styles.avatarText}
            >
              {getInitials(
                assistant.assistantName,
              )}
            </Text>
          </View>

          <View
            style={styles.assistantCopy}
          >
            <View
              style={styles.nameRow}
            >
              <Text
                numberOfLines={1}
                style={
                  styles.assistantName
                }
              >
                {assistant.assistantName ||
                  "Unknown assistant"}
              </Text>

              <Badge
                label={
                  assistant.isHeadAssistant
                    ? "HEAD"
                    : "ASSISTANT"
                }
                tone={
                  assistant.isHeadAssistant
                    ? "info"
                    : "neutral"
                }
              />
            </View>

            <Text
              numberOfLines={1}
              style={
                styles.assistantEmail
              }
            >
              {assistant.assistantEmail ||
                ""}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.completionBadge
          }
        >
          <Text
            style={
              styles.completionValue
            }
          >
            {homework.completionRate ||
              0}
            %
          </Text>

          <Text
            style={
              styles.completionLabel
            }
          >
            completion
          </Text>
        </View>
      </View>

      <View
        style={styles.metricsGrid}
      >
        <MiniMetric
          label="Delegated"
          value={
            homework.totalDelegated ||
            0
          }
        />

        <MiniMetric
          label="Pending"
          value={homework.pending || 0}
          tone="warning"
        />

        <MiniMetric
          label="Completed"
          value={
            homework.completed || 0
          }
          tone="success"
        />

        
      </View>

      <View
        style={
          styles.detailGrid
        }
      >
        <DetailRow
          icon="speedometer-outline"
          label="Average turnaround"
          value={formatHours(
            homework.averageTurnaroundHours,
          )}
        />

        <DetailRow
          icon="ticket-outline"
          label="Assigned tickets"
          value={tickets.opened || 0}
        />

        <DetailRow
          icon="chatbubble-outline"
          label="Tickets replied"
          value={tickets.replied || 0}
        />

        <DetailRow
          icon="alert-circle-outline"
          label="Tickets still open"
          value={tickets.stillOpen || 0}
        />
      </View>

      <View
        style={
          styles.progressSection
        }
      >
        <View
          style={
            styles.progressHeader
          }
        >
          <Text
            style={styles.progressTitle}
          >
            Grading progress
          </Text>

          <Text
            style={
              styles.progressCount
            }
          >
            {homework.completed || 0}/
            {homework.totalDelegated || 0}
          </Text>
        </View>

        <View
          style={styles.progressTrack}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  100,
                  Number(
                    homework.completionRate ||
                      0,
                  ),
                )}%`,
              },
            ]}
          />
        </View>
      </View>

      <View
        style={
          styles.recentSection
        }
      >
        <View
          style={
            styles.recentHeader
          }
        >
          <Text
            style={styles.recentTitle}
          >
            Recent delegated work
          </Text>

          <Text
            style={styles.recentCount}
          >
            {recentDelegations.length}
          </Text>
        </View>

        {!recentDelegations.length ? (
          <Text
            style={styles.noRecentText}
          >
            No delegated submissions.
          </Text>
        ) : (
          <View
            style={styles.recentList}
          >
            {recentDelegations
              .slice(0, 5)
              .map((delegation) => {
                const status =
                  getStatusConfig(
                    delegation.status,
                  );

                return (
                  <Pressable
                    key={
                      delegation.delegationId
                    }
                    disabled={
                      !delegation.task?.id
                    }
                    onPress={() =>
                      onOpenTask(
                        delegation.task?.id,
                      )
                    }
                    style={({ pressed }) => [
                      styles.recentRow,
                      pressed &&
                        styles.recentRowPressed,
                    ]}
                  >
                    <View
                      style={
                        styles.recentIcon
                      }
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </View>

                    <View
                      style={
                        styles.recentCopy
                      }
                    >
                      <Text
                        numberOfLines={1}
                        style={
                          styles.recentStudent
                        }
                      >
                        {delegation.student
                          ?.name ||
                          "Unknown student"}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={
                          styles.recentTask
                        }
                      >
                        {delegation.task
                          ?.title ||
                          "Unknown task"}
                      </Text>

                      <Text
                        style={
                          styles.recentDate
                        }
                      >
                        Delegated{" "}
                        {formatDate(
                          delegation.delegatedAt,
                        )}
                      </Text>
                    </View>

                    <Badge
                      label={status.label}
                      tone={status.tone}
                    />

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={
                        colors.textMuted
                      }
                    />
                  </Pressable>
                );
              })}
          </View>
        )}
      </View>
    </Card>
  );
}

function MiniMetric({
  label,
  value,
  tone = "primary",
}) {
  const color =
    tone === "success"
      ? colors.secondary
      : tone === "warning"
        ? colors.warning
        : tone === "danger"
          ? colors.danger
          : colors.primary;

  return (
    <View
      style={styles.miniMetric}
    >
      <Text
        style={[
          styles.miniMetricValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={
          styles.miniMetricLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}) {
  return (
    <View
      style={styles.detailRow}
    >
      <View
        style={styles.detailIcon}
      >
        <Ionicons
          name={icon}
          size={17}
          color={colors.primary}
        />
      </View>

      <View
        style={styles.detailCopy}
      >
        <Text
          style={styles.detailLabel}
        >
          {label}
        </Text>

        <Text
          style={styles.detailValue}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}