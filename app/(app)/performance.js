import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Badge } from "../../src/components/ui/Badge";
import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/lib/api";
import { getToken } from "../../src/lib/storage";
import { formatDate } from "../../src/utils/formatDate";
import {
  colors,
  spacing,
  radius,
  typography,
} from "../../src/theme";

const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function StatCard({
  label,
  value,
  helper,
  accent,
}) {
  return (
    <Card
      style={[
        styles.statCard,
        {
          borderTopColor: accent,
        },
      ]}
    >
      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>

      {helper ? (
        <Text style={styles.statHelper}>
          {helper}
        </Text>
      ) : null}
    </Card>
  );
}

function EmptyState({
  title,
  description,
}) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>
          —
        </Text>
      </View>

      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      {description ? (
        <Text style={styles.emptyDescription}>
          {description}
        </Text>
      ) : null}
    </Card>
  );
}

function ErrorBanner({
  message,
  onDismiss,
}) {
  if (!message) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      style={styles.errorBanner}
    >
      <View style={styles.errorIndicator} />

      <Text style={styles.errorText}>
        {message}
      </Text>

      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss error"
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.errorDismiss,
            pressed &&
              styles.pressedOpacity,
          ]}
        >
          <Text style={styles.errorDismissText}>
            ×
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function LoadingPanel({
  message = "Loading...",
}) {
  return (
    <Card style={styles.loadingPanel}>
      <ActivityIndicator
        size="small"
        color={colors.primary}
      />

      <Text style={styles.loadingPanelText}>
        {message}
      </Text>
    </Card>
  );
}

function SectionTitle({
  title,
  description,
}) {
  return (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {description ? (
        <Text
          style={styles.sectionDescription}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

function SelectionChip({
  label,
  selected,
  onPress,
  tone = "primary",
  disabled = false,
}) {
  const selectedBackground =
    tone === "secondary"
      ? colors.secondary
      : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
        disabled,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectionChip,
        selected && {
          borderColor: selectedBackground,
          backgroundColor:
            selectedBackground,
        },
        disabled &&
          styles.selectionChipDisabled,
        pressed &&
          !disabled &&
          styles.selectionChipPressed,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.selectionChipText,
          selected &&
            styles.selectionChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PerformanceRow({
  title,
  subtitle,
  rightContent,
}) {
  return (
    <View style={styles.performanceRow}>
      <View style={styles.performanceRowText}>
        <Text
          numberOfLines={2}
          style={styles.performanceRowTitle}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            numberOfLines={1}
            style={
              styles.performanceRowSubtitle
            }
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.performanceRowRight}>
        {rightContent}
      </View>
    </View>
  );
}

function PerformanceSection({
  title,
  description,
  children,
}) {
  return (
    <View style={styles.performanceSection}>
      <SectionTitle
        title={title}
        description={description}
      />

      <Card style={styles.performanceListCard}>
        {children}
      </Card>
    </View>
  );
}

function PerformanceSummary({ data }) {
  const metrics = useMemo(() => {
    if (!data) {
      return {
        attendedCount: 0,
        attendancePercentage: 0,
        submittedTasks: 0,
        taskPercentage: 0,
        attemptedQuizzes: [],
        averageQuizPercentage: null,
      };
    }

    const attendedCount =
      data.attendance.filter(
        (attendance) =>
          attendance.present
      ).length;

    const attendancePercentage =
      data.attendance.length > 0
        ? Math.round(
            (attendedCount /
              data.attendance.length) *
              100
          )
        : 0;

    const submittedTasks =
      data.tasks.filter(
        (task) => task.submitted
      ).length;

    const taskPercentage =
      data.tasks.length > 0
        ? Math.round(
            (submittedTasks /
              data.tasks.length) *
              100
          )
        : 0;

    const attemptedQuizzes =
      data.quizzes.filter(
        (quiz) =>
          quiz.attempted &&
          quiz.score != null
      );

    const averageQuizPercentage =
      attemptedQuizzes.length > 0
        ? Math.round(
            attemptedQuizzes.reduce(
              (total, quiz) =>
                total +
                (quiz.score /
                  (quiz.total || 1)) *
                  100,
              0
            ) /
              attemptedQuizzes.length
          )
        : null;

    return {
      attendedCount,
      attendancePercentage,
      submittedTasks,
      taskPercentage,
      attemptedQuizzes,
      averageQuizPercentage,
    };
  }, [data]);

  if (!data) {
    return null;
  }

  return (
    <View>
      <View style={styles.statGrid}>
        <StatCard
          label="Attendance"
          value={`${metrics.attendancePercentage}%`}
          helper={`${metrics.attendedCount} of ${data.attendance.length} sessions`}
          accent={colors.secondary}
        />

        <StatCard
          label="Tasks submitted"
          value={`${metrics.submittedTasks}/${data.tasks.length}`}
          helper={`${metrics.taskPercentage}% completion`}
          accent={colors.primary}
        />

        <StatCard
          label="Average quiz score"
          value={
            metrics.averageQuizPercentage !=
            null
              ? `${metrics.averageQuizPercentage}%`
              : "—"
          }
          helper={
            metrics.attemptedQuizzes.length
              ? `${metrics.attemptedQuizzes.length} attempted`
              : "No attempted quizzes"
          }
          accent={colors.warning}
        />

        <StatCard
          label="In-class quizzes"
          value={`${data.inClassQuizzes.filter(
            (quiz) => quiz.grade != null
          ).length}/${data.inClassQuizzes.length}`}
          helper="Graded quizzes"
          accent={colors.danger}
        />
      </View>

      <PerformanceSection
        title="Attendance history"
        description="Session-by-session attendance record."
      >
        {data.attendance.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            description="Attendance will appear after sessions are recorded."
          />
        ) : (
          data.attendance.map(
            (attendance, index) => (
              <PerformanceRow
                key={
                  attendance.id ||
                  `${attendance.date}-${index}`
                }
                title={
                  attendance.title ||
                  "Session"
                }
                subtitle={formatDate(
                  attendance.date
                )}
                rightContent={
                  <Badge
                    label={
                      attendance.present
                        ? "Present"
                        : "Absent"
                    }
                    tone={
                      attendance.present
                        ? "success"
                        : "danger"
                    }
                  />
                }
              />
            )
          )
        )}
      </PerformanceSection>

      <PerformanceSection
        title="Tasks"
        description="Homework and task submission status."
      >
        {data.tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Assigned tasks will appear here."
          />
        ) : (
          data.tasks.map((task) => (
            <PerformanceRow
              key={task.taskId}
              title={task.title}
              subtitle={
                task.dueDate
                  ? `Due ${formatDate(
                      task.dueDate
                    )}`
                  : undefined
              }
              rightContent={
                <Badge
                  label={
                    task.submitted
                      ? "Submitted"
                      : "Not submitted"
                  }
                  tone={
                    task.submitted
                      ? "success"
                      : "neutral"
                  }
                />
              }
            />
          ))
        )}
      </PerformanceSection>

      <PerformanceSection
        title="Quizzes"
        description="Question-bank quiz attempts and scores."
      >
        {data.quizzes.length === 0 ? (
          <EmptyState
            title="No quizzes yet"
            description="Quiz results will appear after quizzes are assigned."
          />
        ) : (
          data.quizzes.map((quiz) => (
            <PerformanceRow
              key={quiz.quizId}
              title={quiz.title}
              rightContent={
                quiz.attempted ? (
                  <View style={styles.scorePill}>
                    <Text
                      style={styles.scorePillText}
                    >
                      {quiz.score ?? 0}/
                      {quiz.total ?? 0}
                    </Text>
                  </View>
                ) : (
                  <Badge
                    label="Not attempted"
                    tone="neutral"
                  />
                )
              }
            />
          ))
        )}
      </PerformanceSection>

      <PerformanceSection
        title="In-class quizzes"
        description="Grades entered for quizzes completed during class."
      >
        {data.inClassQuizzes.length ===
        0 ? (
          <EmptyState
            title="No in-class quizzes yet"
            description="In-class quiz grades will appear here."
          />
        ) : (
          data.inClassQuizzes.map(
            (quiz) => (
              <PerformanceRow
                key={quiz.quizId}
                title={quiz.quizName}
                rightContent={
                  quiz.grade != null ? (
                    <View
                      style={styles.scorePill}
                    >
                      <Text
                        style={
                          styles.scorePillText
                        }
                      >
                        {quiz.grade}/
                        {quiz.gradeOutOf}
                      </Text>
                    </View>
                  ) : (
                    <Badge
                      label="Not graded"
                      tone="neutral"
                    />
                  )
                }
              />
            )
          )
        )}
      </PerformanceSection>
    </View>
  );
}

function TeacherPerformanceView() {
  const [years, setYears] = useState([]);
  const [yearId, setYearId] =
    useState(null);

  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] =
    useState(null);

  const [members, setMembers] =
    useState([]);
  const [studentId, setStudentId] =
    useState(null);

  const [data, setData] = useState(null);

  const [yearsLoading, setYearsLoading] =
    useState(true);
  const [groupsLoading, setGroupsLoading] =
    useState(false);
  const [membersLoading, setMembersLoading] =
    useState(false);
  const [
    performanceLoading,
    setPerformanceLoading,
  ] = useState(false);

  const [error, setError] = useState("");
  const [exporting, setExporting] =
    useState(false);

  const currentYear = useMemo(
    () =>
      years.find(
        (year) => year.id === yearId
      ) || null,
    [years, yearId]
  );

  const currentGroup = useMemo(
    () =>
      groups.find(
        (group) => group.id === groupId
      ) || null,
    [groups, groupId]
  );

  const currentStudent = useMemo(
    () =>
      members.find(
        (membership) =>
          membership.student.id ===
          studentId
      )?.student || null,
    [members, studentId]
  );

  const loadYears = useCallback(
    async () => {
      setYearsLoading(true);
      setError("");

      try {
        const response =
          await api.get("/years/mine");

        const loadedYears =
          Array.isArray(response.data)
            ? response.data
            : [];

        setYears(loadedYears);

        setYearId((current) => {
          if (
            current &&
            loadedYears.some(
              (year) =>
                year.id === current
            )
          ) {
            return current;
          }

          return loadedYears[0]?.id || null;
        });
      } catch (requestError) {
        setError(
          requestError.response?.data?.msg ||
            "Couldn't load academic years."
        );
      } finally {
        setYearsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  useEffect(() => {
    let active = true;

    async function loadGroups() {
      setGroups([]);
      setGroupId(null);
      setMembers([]);
      setStudentId(null);
      setData(null);

      if (!yearId) {
        return;
      }

      setGroupsLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/groups/year/${yearId}`
        );

        if (!active) {
          return;
        }

        const loadedGroups =
          Array.isArray(response.data)
            ? response.data
            : [];

        setGroups(loadedGroups);
        setGroupId(
          loadedGroups[0]?.id || null
        );
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          requestError.response?.data?.msg ||
            "Couldn't load groups."
        );
      } finally {
        if (active) {
          setGroupsLoading(false);
        }
      }
    }

    loadGroups();

    return () => {
      active = false;
    };
  }, [yearId]);

  useEffect(() => {
    let active = true;

    async function loadMembers() {
      setMembers([]);
      setStudentId(null);
      setData(null);

      if (!groupId) {
        return;
      }

      setMembersLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/groups/${groupId}`
        );

        if (!active) {
          return;
        }

        const loadedMembers =
          Array.isArray(
            response.data?.members
          )
            ? response.data.members
            : [];

        setMembers(loadedMembers);
        setStudentId(
          loadedMembers[0]?.student?.id ||
            null
        );
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          requestError.response?.data?.msg ||
            "Couldn't load students."
        );
      } finally {
        if (active) {
          setMembersLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      active = false;
    };
  }, [groupId]);

  useEffect(() => {
    let active = true;

    async function loadPerformance() {
      setData(null);

      if (!groupId || !studentId) {
        return;
      }

      setPerformanceLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/performance/${groupId}/${studentId}`
        );

        if (active) {
          setData(response.data);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          requestError.response?.data?.msg ||
            "Couldn't load performance."
        );
      } finally {
        if (active) {
          setPerformanceLoading(false);
        }
      }
    }

    loadPerformance();

    return () => {
      active = false;
    };
  }, [groupId, studentId]);

  async function handleExport() {
    if (!groupId || exporting) {
      return;
    }

    setExporting(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error(
          "Authentication token is missing."
        );
      }

      const baseUrl = resolveApiBaseUrl();
      const exportUrl =
        `${baseUrl}/api/performance/export/` +
        encodeURIComponent(groupId);

      const safeGroupName =
        sanitizeFileName(
          currentGroup?.name ||
            "performance"
        );

      const fileName =
        `${safeGroupName}-performance-` +
        `${getDateStamp()}.xlsx`;

      if (Platform.OS === "web") {
        await exportOnWeb({
          exportUrl,
          token,
          fileName,
        });
      } else {
        await exportOnNative({
          exportUrl,
          token,
          fileName,
        });
      }
    } catch (requestError) {
      setError(
        requestError.message ||
          "Couldn't export performance data."
      );
    } finally {
      setExporting(false);
    }
  }

  if (yearsLoading) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <ActivityIndicator
          color={colors.primary}
          size="large"
        />

        <Text style={styles.screenLoadingText}>
          Loading performance data...
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <Text style={styles.eyebrow}>
            ACADEMIC ANALYTICS
          </Text>

          <Text style={styles.pageTitle}>
            Performance
          </Text>

          <Text style={styles.pageSubtitle}>
            Review attendance, tasks and quiz
            results for each student.
          </Text>
        </View>

        {groupId ? (
          <View style={styles.exportArea}>
            <Button
              title={
                exporting
                  ? "Preparing Excel..."
                  : "Export to Excel"
              }
              variant="secondary"
              onPress={handleExport}
              loading={exporting}
              disabled={exporting}
              style={styles.exportButton}
            />

            <Text
              style={styles.exportSupportText}
            >
              Available on Web, Android and iOS
            </Text>
          </View>
        ) : null}
      </View>

      <ErrorBanner
        message={error}
        onDismiss={() => setError("")}
      />

      {years.length === 0 ? (
        <EmptyState
          title="No academic years"
          description="Create an academic year before viewing performance."
        />
      ) : (
        <>
          <Card style={styles.filterCard}>
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <View>
                  <Text
                    style={styles.filterTitle}
                  >
                    Academic year
                  </Text>

                  <Text
                    style={
                      styles.filterDescription
                    }
                  >
                    Select the academic year.
                  </Text>
                </View>

                {currentYear ? (
                  <Badge
                    label={currentYear.name}
                    tone="success"
                  />
                ) : null}
              </View>

              <View style={styles.chipRow}>
                {years.map((year) => (
                  <SelectionChip
                    key={year.id}
                    label={year.name}
                    selected={
                      year.id === yearId
                    }
                    disabled={
                      exporting ||
                      groupsLoading
                    }
                    onPress={() =>
                      setYearId(year.id)
                    }
                  />
                ))}
              </View>
            </View>

            <View style={styles.filterDivider} />

            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <View>
                  <Text
                    style={styles.filterTitle}
                  >
                    Group
                  </Text>

                  <Text
                    style={
                      styles.filterDescription
                    }
                  >
                    Choose the group to inspect
                    or export.
                  </Text>
                </View>

                {currentGroup ? (
                  <Badge
                    label={currentGroup.name}
                    tone="neutral"
                  />
                ) : null}
              </View>

              {groupsLoading ? (
                <LoadingPanel message="Loading groups..." />
              ) : groups.length === 0 ? (
                <Text
                  style={styles.inlineEmptyText}
                >
                  No groups are available for this
                  academic year.
                </Text>
              ) : (
                <View style={styles.chipRow}>
                  {groups.map((group) => (
                    <SelectionChip
                      key={group.id}
                      label={group.name}
                      selected={
                        group.id === groupId
                      }
                      tone="secondary"
                      disabled={
                        exporting ||
                        membersLoading
                      }
                      onPress={() =>
                        setGroupId(group.id)
                      }
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterDivider} />

            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <View>
                  <Text
                    style={styles.filterTitle}
                  >
                    Student
                  </Text>

                  <Text
                    style={
                      styles.filterDescription
                    }
                  >
                    Select a student to view
                    individual results.
                  </Text>
                </View>

                {currentStudent ? (
                  <Badge
                    label={currentStudent.name}
                    tone="success"
                  />
                ) : null}
              </View>

              {membersLoading ? (
                <LoadingPanel message="Loading students..." />
              ) : members.length === 0 ? (
                <Text
                  style={styles.inlineEmptyText}
                >
                  No students are currently assigned
                  to this group.
                </Text>
              ) : (
                <View style={styles.studentChipRow}>
                  {members.map(
                    (membership) => (
                      <SelectionChip
                        key={
                          membership.student.id
                        }
                        label={
                          membership.student.name
                        }
                        selected={
                          membership.student.id ===
                          studentId
                        }
                        disabled={
                          exporting ||
                          performanceLoading
                        }
                        onPress={() =>
                          setStudentId(
                            membership.student.id
                          )
                        }
                      />
                    )
                  )}
                </View>
              )}
            </View>
          </Card>

          <View style={styles.resultsHeader}>
            <View>
              <Text style={styles.resultsTitle}>
                Student performance
              </Text>

              <Text
                style={styles.resultsSubtitle}
              >
                {currentStudent
                  ? `Showing results for ${currentStudent.name}`
                  : "Select a student to view results."}
              </Text>
            </View>

            {performanceLoading ? (
              <ActivityIndicator
                color={colors.primary}
              />
            ) : null}
          </View>

          {performanceLoading ? (
            <LoadingPanel message="Loading student performance..." />
          ) : data ? (
            <PerformanceSummary data={data} />
          ) : (
            <EmptyState
              title="Select a student"
              description="Choose a student above to view attendance, tasks and quiz results."
            />
          )}
        </>
      )}
    </Screen>
  );
}

function StudentPerformanceView() {
  const { user } = useAuth();

  const [data, setData] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadStudentPerformance() {
      setLoading(true);
      setError("");

      try {
        const profileResponse =
          await api.get(
            `/students/${user.id}`
          );

        const group =
          profileResponse.data
            ?.groupMemberships?.[0]?.group;

        if (!group) {
          if (active) {
            setError(
              "You have not been assigned to a group yet."
            );
          }

          return;
        }

        const performanceResponse =
          await api.get(
            `/performance/${group.id}/${user.id}`
          );

        if (active) {
          setData(
            performanceResponse.data
          );
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          requestError.response?.data?.msg ||
            "Couldn't load your performance."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (user?.id) {
      loadStudentPerformance();
    } else {
      setLoading(false);
      setError(
        "Student information is unavailable."
      );
    }

    return () => {
      active = false;
    };
  }, [user?.id]);

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

        <Text style={styles.screenLoadingText}>
          Loading your performance...
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderText}>
          <Text style={styles.eyebrow}>
            ACADEMIC PROGRESS
          </Text>

          <Text style={styles.pageTitle}>
            My Performance
          </Text>

          <Text style={styles.pageSubtitle}>
            Review your attendance, task
            submissions and quiz results.
          </Text>
        </View>
      </View>

      <ErrorBanner message={error} />

      {!error && data ? (
        <PerformanceSummary data={data} />
      ) : null}
    </Screen>
  );
}

export default function Performance() {
  const { user } = useAuth();

  if (user?.role === "STUDENT") {
    return <StudentPerformanceView />;
  }

  return <TeacherPerformanceView />;
}

async function exportOnWeb({
  exportUrl,
  token,
  fileName,
}) {
  const response = await fetch(exportUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: EXCEL_MIME_TYPE,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getExportErrorMessage(response)
    );
  }

  const blob = await response.blob();
  const objectUrl =
    URL.createObjectURL(blob);

  try {
    const anchor =
      document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  }
}

async function exportOnNative({
  exportUrl,
  token,
  fileName,
}) {
  if (!FileSystem.cacheDirectory) {
    throw new Error(
      "Temporary file storage is unavailable."
    );
  }

  const fileUri =
    FileSystem.cacheDirectory + fileName;

  const result =
    await FileSystem.downloadAsync(
      exportUrl,
      fileUri,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: EXCEL_MIME_TYPE,
        },
      }
    );

  if (
    result.status < 200 ||
    result.status >= 300
  ) {
    await safelyDeleteFile(fileUri);

    throw new Error(
      `Export failed with status ${result.status}.`
    );
  }

  const sharingAvailable =
    await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    await safelyDeleteFile(fileUri);

    throw new Error(
      "File sharing is not available on this device."
    );
  }

  try {
    await Sharing.shareAsync(result.uri, {
      mimeType: EXCEL_MIME_TYPE,
      dialogTitle:
        "Save or share performance report",
      UTI:
        "org.openxmlformats.spreadsheetml.sheet",
    });
  } finally {
    /*
     * Keep the downloaded file temporarily.
     * The operating system may still need it after
     * the share dialog resolves.
     */
    setTimeout(() => {
      safelyDeleteFile(fileUri);
    }, 60_000);
  }
}

async function safelyDeleteFile(fileUri) {
  try {
    await FileSystem.deleteAsync(fileUri, {
      idempotent: true,
    });
  } catch {
    // Cache cleanup must not fail the export flow.
  }
}

async function getExportErrorMessage(
  response
) {
  try {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      const body = await response.json();

      return (
        body.msg ||
        body.message ||
        "Couldn't export performance data."
      );
    }

    const text = await response.text();

    return (
      text ||
      "Couldn't export performance data."
    );
  } catch {
    return "Couldn't export performance data.";
  }
}

function resolveApiBaseUrl() {
  const configuredUrl =
    Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    api.defaults?.baseURL ||
    "http://localhost:6000";

  return configuredUrl
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
}

function sanitizeFileName(value) {
  const cleaned = value
    .trim()
    .replace(
      /[<>:"/\\|?*\u0000-\u001F]/g,
      "-"
    )
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "performance";
}

function getDateStamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  centeredScreen: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  screenLoadingText: {
    ...typography.body,
    color: colors.textMuted,
  },

  pageHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  pageHeaderText: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 300,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },

  pageTitle: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  pageSubtitle: {
    ...typography.body,
    maxWidth: 620,
    color: colors.textMuted,
    lineHeight: 22,
  },

  exportArea: {
    alignItems: "flex-end",
  },

  exportButton: {
    minWidth: 180,
  },

  exportSupportText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "right",
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.danger}60`,
    borderRadius: radius.md,
    backgroundColor: `${colors.danger}0D`,
  },

  errorIndicator: {
    alignSelf: "stretch",
    width: 4,
    backgroundColor: colors.danger,
  },

  errorText: {
    ...typography.body,
    flex: 1,
    color: colors.danger,
    padding: spacing.sm,
    lineHeight: 20,
  },

  errorDismiss: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },

  errorDismissText: {
    fontSize: 22,
    color: colors.danger,
  },

  pressedOpacity: {
    opacity: 0.6,
  },

  filterCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  filterSection: {
    width: "100%",
  },

  filterHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  filterTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  filterDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  filterDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },

  studentChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },

  selectionChip: {
    minHeight: 40,
    maxWidth: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },

  selectionChipPressed: {
    opacity: 0.72,
  },

  selectionChipDisabled: {
    opacity: 0.55,
  },

  selectionChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  selectionChipTextSelected: {
    color: colors.white,
  },

  inlineEmptyText: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 21,
  },

  loadingPanel: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  loadingPanelText: {
    ...typography.body,
    color: colors.textMuted,
  },

  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  resultsTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  resultsSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },

  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  statCard: {
    flexGrow: 1,
    flexBasis: 180,
    minWidth: 160,
    borderTopWidth: 4,
    padding: spacing.md,
  },

  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },

  statHelper: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  performanceSection: {
    marginBottom: spacing.xl,
  },

  sectionTitleContainer: {
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  sectionDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  performanceListCard: {
    padding: 0,
    overflow: "hidden",
  },

  performanceRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  performanceRowText: {
    flex: 1,
    minWidth: 0,
  },

  performanceRowTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  performanceRowSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },

  performanceRowRight: {
    flexShrink: 0,
    alignItems: "flex-end",
  },

  scorePill: {
    minWidth: 66,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: `${colors.primary}12`,
  },

  scorePillText: {
    ...typography.bodyBold,
    color: colors.primary,
  },

  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },

  emptyIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },

  emptyIconText: {
    fontSize: 20,
    color: colors.textMuted,
  },

  emptyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: "center",
  },

  emptyDescription: {
    ...typography.body,
    maxWidth: 420,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    marginTop: spacing.xs,
  },
});