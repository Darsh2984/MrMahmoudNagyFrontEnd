import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
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
import { colors } from "../../src/theme";

import { styles } from "./quizzes.styles";

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    fallback
  );
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDateTime(value) {
  const date = parseDate(value);

  if (!date) {
    return "Not specified";
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRemainingTime(milliseconds) {
  if (
    !Number.isFinite(milliseconds) ||
    milliseconds <= 0
  ) {
    return "00:00";
  }

  const totalSeconds = Math.max(
    0,
    Math.floor(milliseconds / 1000),
  );

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds =
    totalSeconds % 60;

  if (hours > 0) {
    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  return [
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

function getQuizStateLabel(state) {
  switch (state) {
    case "UPCOMING":
      return "Upcoming";

    case "AVAILABLE":
      return "Available";

    case "IN_PROGRESS":
      return "In progress";

    case "COMPLETED":
      return "Completed";

    case "CLOSED":
      return "Closed";

    case "UNAVAILABLE":
      return "Unavailable";

    default:
      return "Unavailable";
  }
}

function getQuizStateTone(state) {
  switch (state) {
    case "COMPLETED":
      return "success";

    case "IN_PROGRESS":
    case "UPCOMING":
      return "warning";

    default:
      return "neutral";
  }
}

function getQuizIcon(quiz) {
  if (quiz.type === "PAPER") {
    if (quiz.state === "COMPLETED") {
      return {
        name: "checkmark-circle-outline",
        color: colors.primary,
      };
    }

    if (quiz.state === "IN_PROGRESS") {
      return {
        name: "cloud-upload-outline",
        color: colors.warning,
      };
    }

    if (quiz.state === "UPCOMING") {
      return {
        name: "calendar-outline",
        color: colors.warning,
      };
    }

    if (
      quiz.state === "CLOSED" ||
      quiz.state === "UNAVAILABLE"
    ) {
      return {
        name: "lock-closed-outline",
        color: colors.textMuted,
      };
    }

    return {
      name: "document-text-outline",
      color: colors.primary,
    };
  }

  switch (quiz.state) {
    case "COMPLETED":
      return {
        name: "checkmark-circle-outline",
        color: colors.primary,
      };

    case "IN_PROGRESS":
      return {
        name: "time-outline",
        color: colors.warning,
      };

    case "AVAILABLE":
      return {
        name: "play-circle-outline",
        color: colors.primary,
      };

    case "UPCOMING":
      return {
        name: "calendar-outline",
        color: colors.warning,
      };

    case "CLOSED":
      return {
        name: "lock-closed-outline",
        color: colors.textMuted,
      };

    default:
      return {
        name: "alert-circle-outline",
        color: colors.textMuted,
      };
  }
}

function getQuizActionLabel(quiz) {
  if (quiz.state === "COMPLETED") {
    return quiz.type === "PAPER"
      ? "View submission"
      : "View result";
  }

  if (quiz.type === "PAPER") {
    if (quiz.state === "IN_PROGRESS") {
      return "Continue Paper quiz";
    }

    if (quiz.state === "AVAILABLE") {
      return "Open Paper quiz";
    }

    if (quiz.state === "UPCOMING") {
      return "Not started yet";
    }

    if (quiz.state === "CLOSED") {
      return "Paper quiz closed";
    }

    return "Unavailable";
  }

  if (quiz.canContinue) {
    return "Continue quiz";
  }

  if (quiz.canStart) {
    return "Start quiz";
  }

  if (quiz.state === "UPCOMING") {
    return "Not started yet";
  }

  if (quiz.state === "CLOSED") {
    return "Quiz closed";
  }

  return "Unavailable";
}

export default function Quizzes() {
  const router = useRouter();
  const { user } = useAuth();

  const [quizzes, setQuizzes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [currentTime, setCurrentTime] =
    useState(Date.now());

  const isStudent =
    user?.role === "STUDENT";

  const summary = useMemo(() => {
    return quizzes.reduce(
      (result, quiz) => {
        switch (quiz.state) {
          case "COMPLETED":
            result.completed += 1;
            break;

          case "IN_PROGRESS":
            result.inProgress += 1;
            break;

          case "AVAILABLE":
            result.available += 1;
            break;

          case "UPCOMING":
            result.upcoming += 1;
            break;

          default:
            result.unavailable += 1;
            break;
        }

        return result;
      },
      {
        completed: 0,
        inProgress: 0,
        available: 0,
        upcoming: 0,
        unavailable: 0,
      },
    );
  }, [quizzes]);

  const loadQuizzes = useCallback(
    async ({
      showFullLoader = true,
    } = {}) => {
      if (!isStudent) {
        return;
      }

      if (showFullLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const response = await api.get(
          "/quiz-student/mine",
        );

        const loadedAt = Date.now();

        const responseQuizzes =
          Array.isArray(response.data)
            ? response.data
            : [];

        setQuizzes(
          responseQuizzes.map(
            (quiz) => ({
              ...quiz,
              __loadedAt: loadedAt,
            }),
          ),
        );

        setCurrentTime(loadedAt);
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load assigned quizzes.",
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isStudent],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!isStudent) {
      router.replace(
        "/(app)/quiz-management",
      );

      return;
    }

    loadQuizzes();
  }, [
    user,
    isStudent,
    router,
    loadQuizzes,
  ]);

  useEffect(() => {
    if (!isStudent) {
      return undefined;
    }

    const intervalId = setInterval(
      () => {
        setCurrentTime(Date.now());
      },
      1000,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [isStudent]);

  function getRemainingMilliseconds(
    quiz,
  ) {
    if (
      quiz.state !== "IN_PROGRESS" ||
      !quiz.expiresAt
    ) {
      return null;
    }

    const expiresAt = parseDate(
      quiz.expiresAt,
    );

    if (!expiresAt) {
      return null;
    }

    const serverTime = parseDate(
      quiz.serverTime,
    );

    if (!serverTime) {
      return (
        expiresAt.getTime() -
        currentTime
      );
    }

    const loadedAt =
      quiz.__loadedAt ||
      currentTime;

    const elapsedSinceLoad =
      Math.max(
        0,
        currentTime - loadedAt,
      );

    const estimatedServerNow =
      serverTime.getTime() +
      elapsedSinceLoad;

    return (
      expiresAt.getTime() -
      estimatedServerNow
    );
  }

  function canOpenQuiz(quiz) {
    if (quiz.type === "PAPER") {
      return [
        "AVAILABLE",
        "IN_PROGRESS",
        "COMPLETED",
      ].includes(quiz.state);
    }

    return Boolean(
      quiz.state === "COMPLETED" ||
        quiz.canStart ||
        quiz.canContinue,
    );
  }

  function openQuiz(quiz) {
    if (!canOpenQuiz(quiz)) {
      return;
    }

    router.push(
      `/(app)/quizzes/${quiz.id}`,
    );
  }

  function renderAvailabilityDetails(
    quiz,
  ) {
    if (
      quiz.state === "IN_PROGRESS" &&
      quiz.expiresAt
    ) {
      const remainingMilliseconds =
        getRemainingMilliseconds(quiz);

      return (
        <View style={styles.timerPanel}>
          <View
            style={styles.timerLabelRow}
          >
            <Ionicons
              name="timer-outline"
              size={17}
              color={colors.warning}
            />

            <Text
              style={styles.timerLabel}
            >
              {quiz.type === "PAPER"
                ? "Time until submission closes"
                : "Remaining attempt time"}
            </Text>
          </View>

          <Text style={styles.timerValue}>
            {formatRemainingTime(
              remainingMilliseconds,
            )}
          </Text>
        </View>
      );
    }

    if (
      quiz.type === "PAPER" &&
      quiz.state === "AVAILABLE"
    ) {
      return (
        <View
          style={styles.paperNoticePanel}
        >
          <Ionicons
            name="document-text-outline"
            size={18}
            color={colors.primary}
          />

          <Text
            style={styles.paperNoticeText}
          >
            Download the combined question
            paper, complete your work, and
            upload PDF or image answer files.
          </Text>
        </View>
      );
    }

    if (quiz.state === "UPCOMING") {
      return (
        <View style={styles.noticePanel}>
          <Ionicons
            name="calendar-outline"
            size={17}
            color={colors.warning}
          />

          <Text style={styles.noticeText}>
            This quiz starts on{" "}
            {formatDateTime(
              quiz.startAt,
            )}
            .
          </Text>
        </View>
      );
    }

    if (
      quiz.state === "CLOSED" ||
      quiz.state === "UNAVAILABLE"
    ) {
      return (
        <View style={styles.noticePanel}>
          <Ionicons
            name="lock-closed-outline"
            size={17}
            color={colors.textMuted}
          />

          <Text style={styles.noticeText}>
            {quiz.availabilityMessage ||
              (quiz.state === "CLOSED"
                ? "This quiz is closed."
                : "This quiz is currently unavailable.")}
          </Text>
        </View>
      );
    }

    return null;
  }

  function renderQuizCard(quiz) {
    const icon =
      getQuizIcon(quiz);

    const isPaperQuiz =
      quiz.type === "PAPER";

    const canOpen =
      canOpenQuiz(quiz);

    const totalQuestions =
      quiz.totalQuestions ?? 0;

    const totalPoints =
      quiz.totalPoints ?? 0;

    return (
      <Card
        key={quiz.id}
        style={styles.quizCard}
      >
        <View
          style={styles.quizMainRow}
        >
          <View
            style={[
              styles.quizIcon,

              quiz.state ===
                "IN_PROGRESS" &&
                styles.quizIconWarning,

              isPaperQuiz &&
                styles.paperQuizIcon,

              !canOpen &&
                quiz.state !==
                  "COMPLETED" &&
                styles.quizIconDisabled,
            ]}
          >
            <Ionicons
              name={icon.name}
              size={26}
              color={icon.color}
            />
          </View>

          <View style={styles.quizCopy}>
            <View
              style={styles.quizTitleRow}
            >
              <Text
                numberOfLines={2}
                style={styles.quizTitle}
              >
                {quiz.title}
              </Text>

              <Badge
                label={getQuizStateLabel(
                  quiz.state,
                )}
                tone={getQuizStateTone(
                  quiz.state,
                )}
              />
            </View>

            {quiz.description ? (
              <Text
                numberOfLines={2}
                style={
                  styles.quizDescription
                }
              >
                {quiz.description}
              </Text>
            ) : null}

            <View
              style={styles.quizMetaRow}
            >
              <View
                style={styles.metaItem}
              >
                <Ionicons
                  name={
                    isPaperQuiz
                      ? "document-text-outline"
                      : "options-outline"
                  }
                  size={14}
                  color={
                    colors.textMuted
                  }
                />

                <Text
                  style={styles.metaText}
                >
                  {isPaperQuiz
                    ? "Paper"
                    : "MCQ"}
                </Text>
              </View>

              <Text
                style={styles.metaDot}
              >
                ·
              </Text>

              <View
                style={styles.metaItem}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={14}
                  color={
                    colors.textMuted
                  }
                />

                <Text
                  style={styles.metaText}
                >
                  {totalQuestions}{" "}
                  {totalQuestions === 1
                    ? "question"
                    : "questions"}
                </Text>
              </View>

              <Text
                style={styles.metaDot}
              >
                ·
              </Text>

              <View
                style={styles.metaItem}
              >
                <Ionicons
                  name="star-outline"
                  size={14}
                  color={
                    colors.textMuted
                  }
                />

                <Text
                  style={styles.metaText}
                >
                  {totalPoints}{" "}
                  {totalPoints === 1
                    ? "point"
                    : "points"}
                </Text>
              </View>

              {quiz.durationMinutes ? (
                <>
                  <Text
                    style={styles.metaDot}
                  >
                    ·
                  </Text>

                  <View
                    style={styles.metaItem}
                  >
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={
                        colors.textMuted
                      }
                    />

                    <Text
                      style={
                        styles.metaText
                      }
                    >
                      {
                        quiz.durationMinutes
                      }{" "}
                      minutes
                    </Text>
                  </View>
                </>
              ) : null}
            </View>

            {quiz.startAt ||
            quiz.endAt ? (
              <View
                style={styles.dateList}
              >
                {quiz.startAt ? (
                  <View
                    style={styles.dateRow}
                  >
                    <Ionicons
                      name="play-outline"
                      size={13}
                      color={
                        colors.textMuted
                      }
                    />

                    <Text
                      style={
                        styles.dateText
                      }
                    >
                      Starts:{" "}
                      {formatDateTime(
                        quiz.startAt,
                      )}
                    </Text>
                  </View>
                ) : null}

                {quiz.endAt ? (
                  <View
                    style={styles.dateRow}
                  >
                    <Ionicons
                      name="stop-outline"
                      size={13}
                      color={
                        colors.textMuted
                      }
                    />

                    <Text
                      style={
                        styles.dateText
                      }
                    >
                      Ends:{" "}
                      {formatDateTime(
                        quiz.endAt,
                      )}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        {renderAvailabilityDetails(
          quiz,
        )}

        {quiz.state ===
        "COMPLETED" ? (
          <View
            style={styles.resultPanel}
          >
            <View>
              <Text
                style={styles.resultLabel}
              >
                {isPaperQuiz
                  ? quiz.score === null ||
                    quiz.score ===
                      undefined
                    ? "Grading status"
                    : "Final score"
                  : "Final score"}
              </Text>

              <Text
                style={styles.resultValue}
              >
                {isPaperQuiz &&
                (quiz.score === null ||
                  quiz.score ===
                    undefined)
                  ? "Awaiting grading"
                  : `${
                      quiz.score ?? 0
                    }/${totalPoints}`}
              </Text>
            </View>

            {quiz.isAutoSubmitted ? (
              <View
                style={
                  styles.autoSubmittedBadge
                }
              >
                <Ionicons
                  name="timer-outline"
                  size={15}
                  color={
                    colors.warning
                  }
                />

                <Text
                  style={
                    styles.autoSubmittedText
                  }
                >
                  Auto-submitted
                </Text>
              </View>
            ) : (
              <View
                style={
                  styles.submittedBadge
                }
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={15}
                  color={
                    colors.primary
                  }
                />

                <Text
                  style={
                    styles.submittedText
                  }
                >
                  Submitted
                </Text>
              </View>
            )}
          </View>
        ) : null}

        <Pressable
          disabled={!canOpen}
          onPress={() =>
            openQuiz(quiz)
          }
          style={({ pressed }) => [
            styles.quizAction,

            canOpen
              ? styles.quizActionEnabled
              : styles.quizActionDisabled,

            pressed &&
              canOpen &&
              styles.quizActionPressed,
          ]}
        >
          <Text
            style={[
              styles.quizActionText,

              !canOpen &&
                styles.quizActionTextDisabled,
            ]}
          >
            {getQuizActionLabel(quiz)}
          </Text>

          <Ionicons
            name={
              quiz.state ===
              "COMPLETED"
                ? "stats-chart-outline"
                : canOpen
                  ? "arrow-forward"
                  : "lock-closed-outline"
            }
            size={17}
            color={
              canOpen
                ? colors.white
                : colors.textMuted
            }
          />
        </Pressable>
      </Card>
    );
  }

  if (
    !user ||
    !isStudent ||
    loading
  ) {
    return (
      <Screen
        scroll={false}
        style={styles.loadingPage}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={styles.loadingText}
        >
          {isStudent
            ? "Loading your quizzes…"
            : "Opening Quiz Management…"}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.header}>
          <View
            style={styles.headerCopy}
          >
            <View
              style={styles.eyebrowRow}
            >
              <View
                style={
                  styles.eyebrowIcon
                }
              >
                <Ionicons
                  name="help-circle-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>

              <Text
                style={styles.eyebrow}
              >
                MY ASSESSMENTS
              </Text>
            </View>

            <Text
              style={styles.pageTitle}
            >
              Quizzes
            </Text>

            <Text
              style={styles.pageSubtitle}
            >
              Complete timed MCQ attempts
              or download and submit Paper
              quizzes.
            </Text>
          </View>

          <Button
            title={
              refreshing
                ? "Refreshing…"
                : "Refresh"
            }
            variant="outline"
            disabled={refreshing}
            onPress={() =>
              loadQuizzes({
                showFullLoader: false,
              })
            }
          />
        </View>

        {error ? (
          <View
            style={[
              styles.alert,
              styles.errorAlert,
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text
              style={styles.errorText}
            >
              {error}
            </Text>

            <Pressable
              accessibilityLabel="Dismiss error"
              onPress={() =>
                setError("")
              }
              style={styles.alertClose}
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.danger}
              />
            </Pressable>
          </View>
        ) : null}

        <View
          style={styles.statsGrid}
        >
          <Card style={styles.statCard}>
            <View
              style={styles.statIcon}
            >
              <Ionicons
                name="documents-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text
              style={styles.statValue}
            >
              {quizzes.length}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Assigned quizzes
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View
              style={styles.statIcon}
            >
              <Ionicons
                name="play-circle-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text
              style={styles.statValue}
            >
              {summary.available}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Available
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View
              style={
                styles.statWarningIcon
              }
            >
              <Ionicons
                name="time-outline"
                size={22}
                color={colors.warning}
              />
            </View>

            <Text
              style={styles.statValue}
            >
              {summary.inProgress}
            </Text>

            <Text
              style={styles.statLabel}
            >
              In progress
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View
              style={styles.statIcon}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text
              style={styles.statValue}
            >
              {summary.completed}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Completed
            </Text>
          </Card>
        </View>

        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Assigned quizzes
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Upcoming, active, and
              completed assessments.
            </Text>
          </View>
        </View>

        {!quizzes.length ? (
          <Card
            style={styles.emptyCard}
          >
            <View
              style={styles.emptyIcon}
            >
              <Ionicons
                name="help-circle-outline"
                size={36}
                color={colors.primary}
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              No quizzes assigned
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              New quizzes will appear here
              when your teacher assigns them
              to your group.
            </Text>

            <Button
              title={
                refreshing
                  ? "Refreshing…"
                  : "Refresh"
              }
              variant="outline"
              disabled={refreshing}
              onPress={() =>
                loadQuizzes({
                  showFullLoader: false,
                })
              }
            />
          </Card>
        ) : (
          <View
            style={styles.quizList}
          >
            {quizzes.map(
              renderQuizCard,
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}