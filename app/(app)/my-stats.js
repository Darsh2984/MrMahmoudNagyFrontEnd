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
  Text,
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

import { styles } from "./my-stats.styles";

const TICKET_STAT_ITEMS = [
  {
    key: "opened",
    label: "Assigned tickets",
    description: "Total tickets assigned to you",
    icon: "file-tray-full-outline",
    tone: "primary",
  },
  {
    key: "replied",
    label: "Replied",
    description: "Tickets where you sent a response",
    icon: "chatbubble-ellipses-outline",
    tone: "success",
  },
  {
    key: "resolvedConfirmed",
    label: "Confirmed resolved",
    description: "Resolved and confirmed by students",
    icon: "checkmark-circle-outline",
    tone: "success",
  },
  {
    key: "pendingConfirmation",
    label: "Awaiting confirmation",
    description: "Waiting for student confirmation",
    icon: "time-outline",
    tone: "warning",
  },
  {
    key: "reopened",
    label: "Reopened",
    description: "Tickets reopened by students",
    icon: "refresh-circle-outline",
    tone: "danger",
  },
  {
    key: "stillOpen",
    label: "Still open",
    description: "Tickets still requiring attention",
    icon: "alert-circle-outline",
    tone: "danger",
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

function getFirstName(name) {
  if (!name) {
    return "";
  }

  return name.trim().split(/\s+/)[0] || "";
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

function getToneColor(tone) {
  switch (tone) {
    case "success":
      return colors.secondary;

    case "warning":
      return colors.warning;

    case "danger":
      return colors.danger;

    default:
      return colors.primary;
  }
}

function formatHours(hours) {
  const value = Number(hours);

  if (!Number.isFinite(value)) {
    return "No completed papers yet";
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

function getDelegationStatusConfig(status) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Completed",
        tone: "success",
        icon: "checkmark-circle-outline",
      };

    

    default:
      return {
        label: "Pending",
        tone: "warning",
        icon: "time-outline",
      };
  }
}

export default function MyStats() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const isDesktop = width >= 1050;
  const isCompact = width < 680;

  const [dashboard, setDashboard] =
    useState(null);

  const [assignments, setAssignments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadDashboard = useCallback(
    async ({ refresh = false } = {}) => {
      if (!user?.id) {
        setError(
          "Your assistant account could not be identified.",
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
        const [
          statsResponse,
          assignmentsResponse,
        ] = await Promise.all([
          api.get(
            "/assistant-stats/me?recentLimit=20",
          ),

          api.get(
            `/assistant-assignments/assistant/${user.id}`,
          ),
        ]);

        setDashboard(
          statsResponse.data || {},
        );

        setAssignments(
          Array.isArray(
            assignmentsResponse.data,
          )
            ? assignmentsResponse.data
            : [],
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load your assistant dashboard.",
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const tickets =
    dashboard?.tickets || {};

  const homework =
    dashboard?.homework || {};

  const recentDelegations =
    Array.isArray(
      homework.recentDelegations,
    )
      ? homework.recentDelegations
      : [];

  const responseRate = useMemo(() => {
    const opened = Number(
      tickets.opened || 0,
    );

    const replied = Number(
      tickets.replied || 0,
    );

    if (!opened) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (replied / opened) * 100,
      ),
    );
  }, [
    tickets.opened,
    tickets.replied,
  ]);

  const uniqueGroups = useMemo(() => {
    const groups = new Map();

    for (const assignment of assignments) {
      const group =
        assignment?.group || assignment;

      if (!group?.id) {
        continue;
      }

      groups.set(
        String(group.id),
        group,
      );
    }

    return Array.from(
      groups.values(),
    );
  }, [assignments]);

  function openDelegatedTask(delegation) {
    const taskId =
      delegation?.task?.id;

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
              name="analytics-outline"
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
            Loading your dashboard
          </Text>

          <Text
            style={styles.loadingText}
          >
            Preparing your delegated homework,
            ticket activity, and assigned groups.
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
            loadDashboard({
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

            isCompact &&
              styles.headerCompact,
          ]}
        >
          <View
            style={styles.headerContent}
          >
            <Text style={styles.eyebrow}>
              ASSISTANT DASHBOARD
            </Text>

            <Text style={styles.title}>
              Welcome back
              {user?.name
                ? `, ${getFirstName(
                    user.name,
                  )}`
                : ""}
            </Text>

            <Text
              style={styles.subtitle}
            >
              Review your delegated homework,
              grading workload, ticket activity,
              and assigned groups.
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text
              style={styles.avatarText}
            >
              {getInitials(user?.name)}
            </Text>
          </View>
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <View
              style={styles.errorRow}
            >
              <View
                style={styles.errorIcon}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={colors.danger}
                />
              </View>

              <View
                style={styles.errorContent}
              >
                <Text
                  style={styles.errorTitle}
                >
                  Dashboard unavailable
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
                loadDashboard()
              }
            />
          </Card>
        ) : null}

        <View
          style={[
            styles.contentLayout,

            isDesktop &&
              styles.contentLayoutDesktop,
          ]}
        >
          <View
            style={styles.mainColumn}
          >
            <SectionHeader
              eyebrow="HOMEWORK"
              title="Delegated grading"
              description="Your assigned papers and grading progress."
            />

            <View
              style={styles.metricsGrid}
            >
              <MetricCard
                icon="documents-outline"
                label="Total delegated"
                value={
                  homework.totalDelegated ||
                  0
                }
                tone="primary"
              />

              <MetricCard
                icon="time-outline"
                label="Pending"
                value={
                  homework.pending || 0
                }
                tone="warning"
              />

              <MetricCard
                icon="checkmark-done-outline"
                label="Completed"
                value={
                  homework.completed || 0
                }
                tone="success"
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
                      size={21}
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={
                      styles.performanceTitle
                    }
                  >
                    Homework completion
                  </Text>
                </View>

                <Text
                  style={
                    styles.performanceValue
                  }
                >
                  {homework.completionRate ||
                    0}
                  %
                </Text>

                <View
                  style={
                    styles.progressTrack
                  }
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

                <Text
                  style={
                    styles.performanceDescription
                  }
                >
                  {homework.completed || 0} of{" "}
                  {homework.totalDelegated || 0}{" "}
                  delegated papers completed
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
                      size={21}
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
                    homework.averageTurnaroundHours,
                  )}
                </Text>

                <Text
                  style={
                    styles.performanceDescription
                  }
                >
                  Average time from delegation
                  until grading completion.
                </Text>
              </Card>
            </View>

            <View
              style={
                styles.sectionSpacing
              }
            >
              <SectionHeader
                eyebrow="RECENT WORK"
                title="Delegated submissions"
                description="Open pending papers directly from this list."
                count={
                  recentDelegations.length
                }
              />

              {!recentDelegations.length ? (
                <Card
                  style={styles.emptyCard}
                >
                  <View
                    style={styles.emptyIcon}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={34}
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={styles.emptyTitle}
                  >
                    No delegated homework
                  </Text>

                  <Text
                    style={
                      styles.emptyDescription
                    }
                  >
                    Papers delegated to you will
                    appear here.
                  </Text>
                </Card>
              ) : (
                <View
                  style={
                    styles.delegationList
                  }
                >
                  {recentDelegations.map(
                    (delegation) => (
                      <DelegationCard
                        key={
                          delegation.delegationId
                        }
                        delegation={
                          delegation
                        }
                        onOpen={() =>
                          openDelegatedTask(
                            delegation,
                          )
                        }
                        compact={
                          isCompact
                        }
                      />
                    ),
                  )}
                </View>
              )}
            </View>

            <View
              style={
                styles.sectionSpacing
              }
            >
              <SectionHeader
                eyebrow="TICKETS"
                title="Support activity"
                description="Your assigned student-support tickets."
              />

              <View
                style={styles.ticketGrid}
              >
                {TICKET_STAT_ITEMS.map(
                  (item) => (
                    <TicketStatCard
                      key={item.key}
                      item={item}
                      value={
                        tickets[item.key] ||
                        0
                      }
                    />
                  ),
                )}
              </View>

              <Card
                style={
                  styles.ticketProgressCard
                }
              >
                <View
                  style={
                    styles.ticketProgressHeader
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.ticketProgressTitle
                      }
                    >
                      Ticket response rate
                    </Text>

                    <Text
                      style={
                        styles.ticketProgressSubtitle
                      }
                    >
                      Tickets with at least one
                      assistant response
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.ticketProgressValue
                    }
                  >
                    {responseRate}%
                  </Text>
                </View>

                <View
                  style={
                    styles.progressTrack
                  }
                >
                  <View
                    style={[
                      styles.progressFill,

                      {
                        width:
                          `${responseRate}%`,
                      },
                    ]}
                  />
                </View>
              </Card>
            </View>
          </View>

          <View
            style={[
              styles.sideColumn,

              isDesktop &&
                styles.sideColumnDesktop,
            ]}
          >
            <Card
              style={styles.profileCard}
            >
              <View
                style={
                  styles.profileAvatar
                }
              >
                <Text
                  style={
                    styles.profileAvatarText
                  }
                >
                  {getInitials(
                    dashboard?.assistant?.name ||
                      user?.name,
                  )}
                </Text>
              </View>

              <Text
                style={
                  styles.profileName
                }
              >
                {dashboard?.assistant?.name ||
                  user?.name ||
                  "Assistant"}
              </Text>

              <Text
                style={
                  styles.profileEmail
                }
              >
                {dashboard?.assistant?.email ||
                  user?.email ||
                  ""}
              </Text>

              <Badge
                label={
                  dashboard?.assistant
                    ?.isHeadAssistant
                    ? "Head Assistant"
                    : "Assistant"
                }
                tone={
                  dashboard?.assistant
                    ?.isHeadAssistant
                    ? "info"
                    : "neutral"
                }
              />
            </Card>

            <Card
              style={styles.groupsCard}
            >
              <View
                style={
                  styles.sideCardHeader
                }
              >
                <View
                  style={
                    styles.sideCardIcon
                  }
                >
                  <Ionicons
                    name="people-outline"
                    size={21}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text
                    style={
                      styles.sideCardTitle
                    }
                  >
                    Assigned groups
                  </Text>

                  <Text
                    style={
                      styles.sideCardSubtitle
                    }
                  >
                    {uniqueGroups.length}{" "}
                    {uniqueGroups.length === 1
                      ? "group"
                      : "groups"}
                  </Text>
                </View>
              </View>

              {!uniqueGroups.length ? (
                <Text
                  style={styles.noGroupsText}
                >
                  No groups are currently
                  assigned to your account.
                </Text>
              ) : (
                <View
                  style={styles.groupList}
                >
                  {uniqueGroups.map(
                    (group) => (
                      <View
                        key={group.id}
                        style={styles.groupRow}
                      >
                        <View
                          style={
                            styles.groupIcon
                          }
                        >
                          <Ionicons
                            name="people"
                            size={16}
                            color={
                              colors.primary
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.groupInfo
                          }
                        >
                          <Text
                            numberOfLines={1}
                            style={
                              styles.groupName
                            }
                          >
                            {group.name ||
                              "Unnamed group"}
                          </Text>

                          {group.year?.name ? (
                            <Text
                              style={
                                styles.groupMeta
                              }
                            >
                              {
                                group.year
                                  .name
                              }
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ),
                  )}
                </View>
              )}
            </Card>

            <Card
              style={styles.tipCard}
            >
              <View
                style={styles.tipIcon}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text
                style={styles.tipTitle}
              >
                Grading workflow
              </Text>

              <Text
                style={styles.tipText}
              >
                Open a pending delegated paper,
                review the student files, add
                feedback and corrected files,
                then save the final grade.
              </Text>
            </Card>
          </View>
        </View>
      </View>
    </Screen>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  count,
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionEyebrow}>
          {eyebrow}
        </Text>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text
          style={styles.sectionDescription}
        >
          {description}
        </Text>
      </View>

      {count !== undefined ? (
        <Text style={styles.sectionCount}>
          {count}
        </Text>
      ) : null}
    </View>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}) {
  const color =
    getToneColor(tone);

  return (
    <Card style={styles.metricCard}>
      <View
        style={[
          styles.metricIcon,

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

      <Text style={styles.metricValue}>
        {value}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </Card>
  );
}

function TicketStatCard({
  item,
  value,
}) {
  const color = getToneColor(
    item.tone,
  );

  return (
    <Card style={styles.ticketCard}>
      <View
        style={[
          styles.ticketIcon,

          {
            backgroundColor:
              `${color}15`,
          },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={21}
          color={color}
        />
      </View>

      <Text
        style={styles.ticketValue}
      >
        {value}
      </Text>

      <Text
        style={styles.ticketLabel}
      >
        {item.label}
      </Text>

      <Text
        style={
          styles.ticketDescription
        }
      >
        {item.description}
      </Text>
    </Card>
  );
}

function DelegationCard({
  delegation,
  onOpen,
  compact,
}) {
  const statusConfig =
    getDelegationStatusConfig(
      delegation.status,
    );

  const taskGroups =
    Array.isArray(
      delegation.task?.groups,
    )
      ? delegation.task.groups
      : [];

  const canOpen =
    Boolean(delegation.task?.id);

  return (
    <Card
      style={
        styles.delegationCard
      }
    >
      <View
        style={[
          styles.delegationHeader,

          compact &&
            styles.delegationHeaderCompact,
        ]}
      >
        <View
          style={
            styles.delegationIdentity
          }
        >
          <View
            style={
              styles.studentAvatar
            }
          >
            <Text
              style={
                styles.studentAvatarText
              }
            >
              {getInitials(
                delegation.student?.name,
              )}
            </Text>
          </View>

          <View
            style={
              styles.delegationInfo
            }
          >
            <Text
              numberOfLines={1}
              style={
                styles.delegationStudent
              }
            >
              {delegation.student?.name ||
                "Unknown student"}
            </Text>

            <Text
              numberOfLines={2}
              style={
                styles.delegationTask
              }
            >
              {delegation.task?.title ||
                "Unknown task"}
            </Text>
          </View>
        </View>

        <Badge
          label={statusConfig.label}
          tone={statusConfig.tone}
        />
      </View>

      <View
        style={styles.delegationMetaGrid}
      >
        <MetaItem
          icon="calendar-outline"
          label="Delegated"
          value={
            formatDate(
              delegation.delegatedAt,
            ) || "Unknown"
          }
        />

        <MetaItem
          icon="flag-outline"
          label="Deadline"
          value={
            formatDate(
              delegation.task?.deadline,
            ) || "No deadline"
          }
        />

        {delegation.status ===
        "COMPLETED" ? (
          <MetaItem
            icon="checkmark-done-outline"
            label="Grade"
            value={
              delegation.grade != null
                ? `${delegation.grade}/${delegation.task?.gradeOutOf ?? "-"}`
                : "Completed"
            }
          />
        ) : (
          <MetaItem
            icon="school-outline"
            label="Grade out of"
            value={
              delegation.task?.gradeOutOf ??
              "-"
            }
          />
        )}
      </View>

      {taskGroups.length ? (
        <View
          style={
            styles.delegationGroups
          }
        >
          {taskGroups.map((group) => (
            <View
              key={group.id}
              style={
                styles.delegationGroupBadge
              }
            >
              <Ionicons
                name="people-outline"
                size={12}
                color={colors.primary}
              />

              <Text
                style={
                  styles.delegationGroupText
                }
              >
                {group.name}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {delegation.modifiedAfterDeadline ? (
        <View
          style={styles.lateWarning}
        >
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={colors.warning}
          />

          <Text
            style={
              styles.lateWarningText
            }
          >
            The student modified this
            submission after the deadline.
          </Text>
        </View>
      ) : null}

      <View
        style={styles.delegationFooter}
      >
        <Text
          style={
            styles.delegatedByText
          }
        >
          Assigned by{" "}
          {delegation.delegatedBy?.name ||
            "Teacher"}
        </Text>

        <Button
          title={
            delegation.status ===
            "COMPLETED"
              ? "View task"
              : "Open grading"
          }
          variant={
            delegation.status ===
            "COMPLETED"
              ? "outline"
              : "secondary"
          }
          disabled={!canOpen}
          onPress={onOpen}
        />
      </View>
    </Card>
  );
}

function MetaItem({
  icon,
  label,
  value,
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons
        name={icon}
        size={16}
        color={colors.textMuted}
      />

      <View style={styles.metaCopy}>
        <Text style={styles.metaLabel}>
          {label}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.metaValue}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}