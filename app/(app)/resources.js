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

import { useRouter } from "expo-router";

import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui/Card";

import api from "../../src/lib/api";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../src/theme";

const LEVELS = {
  UNITS: "units",
  CHAPTERS: "chapters",
  TOPICS: "topics",
  RESOURCES: "resources",
};

export default function Resources() {
  const router = useRouter();

  const [
    level,
    setLevel,
  ] = useState(LEVELS.UNITS);

  const [
    navigationPath,
    setNavigationPath,
  ] = useState([]);

  const [
    items,
    setItems,
  ] = useState([]);

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);

  const [
    contentLoading,
    setContentLoading,
  ] = useState(false);

  const [
    openingResourceId,
    setOpeningResourceId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const currentTitle =
    useMemo(() => {
      if (
        navigationPath.length === 0
      ) {
        return "Learning resources";
      }

      return navigationPath[
        navigationPath.length - 1
      ].name;
    }, [navigationPath]);

  const currentDescription =
    useMemo(() => {
      if (
        level === LEVELS.UNITS
      ) {
        return "Choose a unit to browse its chapters, topics, videos, and study materials.";
      }

      if (
        level === LEVELS.CHAPTERS
      ) {
        return "Choose a chapter to continue browsing the course structure.";
      }

      if (
        level === LEVELS.TOPICS
      ) {
        return "Choose a topic to view its available learning resources.";
      }

      return "Open a study material or watch an available lesson video.";
    }, [level]);

  const materialCount =
    useMemo(
      () =>
        level ===
        LEVELS.RESOURCES
          ? items.filter(
              (item) =>
                item.kind ===
                "material"
            ).length
          : 0,
      [
        items,
        level,
      ]
    );

  const videoCount =
    useMemo(
      () =>
        level ===
        LEVELS.RESOURCES
          ? items.filter(
              (item) =>
                item.kind ===
                "video"
            ).length
          : 0,
      [
        items,
        level,
      ]
    );

  const clearError =
    useCallback(() => {
      setError("");
    }, []);

  /*
   * GLOBAL UNITS
   *
   * Units are not linked to academic years.
   */
  const loadUnits =
    useCallback(
      async ({
        initial = false,
      } = {}) => {
        if (initial) {
          setInitialLoading(true);
        } else {
          setContentLoading(true);
        }

        setError("");

        try {
          const response =
            await api.get(
              "/units"
            );

          setItems(
            Array.isArray(
              response.data
            )
              ? response.data
              : []
          );

          setLevel(
            LEVELS.UNITS
          );

          setNavigationPath(
            []
          );
        } catch (
          requestError
        ) {
          setItems([]);

          setError(
            requestError
              .response
              ?.data?.msg ||
              requestError
                .response
                ?.data
                ?.message ||
              "Couldn't load units."
          );
        } finally {
          if (initial) {
            setInitialLoading(
              false
            );
          } else {
            setContentLoading(
              false
            );
          }
        }
      },
      []
    );

  /*
   * UNIT → CHAPTERS
   */
  const loadChapters =
    useCallback(
      async (unit) => {
        if (!unit?.id) {
          return;
        }

        setContentLoading(
          true
        );

        setError("");

        try {
          const response =
            await api.get(
              `/units/${unit.id}`
            );

          setItems(
            Array.isArray(
              response.data
                ?.chapters
            )
              ? response.data
                  .chapters
              : []
          );

          setLevel(
            LEVELS.CHAPTERS
          );

          setNavigationPath([
            {
              id: unit.id,
              name:
                unit.name ||
                "Unit",
              type:
                LEVELS.UNITS,
            },
          ]);
        } catch (
          requestError
        ) {
          setItems([]);

          setError(
            requestError
              .response
              ?.data?.msg ||
              requestError
                .response
                ?.data
                ?.message ||
              "Couldn't load chapters."
          );
        } finally {
          setContentLoading(
            false
          );
        }
      },
      []
    );

  /*
   * CHAPTER → TOPICS
   */
  const loadTopics =
    useCallback(
      async (
        unit,
        chapter
      ) => {
        if (
          !unit?.id ||
          !chapter?.id
        ) {
          return;
        }

        setContentLoading(
          true
        );

        setError("");

        try {
          const response =
            await api.get(
              `/chapters/${chapter.id}`
            );

          setItems(
            Array.isArray(
              response.data
                ?.topics
            )
              ? response.data
                  .topics
              : []
          );

          setLevel(
            LEVELS.TOPICS
          );

          setNavigationPath([
            {
              id: unit.id,
              name:
                unit.name ||
                "Unit",
              type:
                LEVELS.UNITS,
            },
            {
              id:
                chapter.id,
              name:
                chapter.name ||
                "Chapter",
              type:
                LEVELS.CHAPTERS,
            },
          ]);
        } catch (
          requestError
        ) {
          setItems([]);

          setError(
            requestError
              .response
              ?.data?.msg ||
              requestError
                .response
                ?.data
                ?.message ||
              "Couldn't load topics."
          );
        } finally {
          setContentLoading(
            false
          );
        }
      },
      []
    );

  /*
   * TOPIC → MATERIALS + VIDEOS
   */
  const loadResources =
    useCallback(
      async (
        unit,
        chapter,
        topic
      ) => {
        if (
          !unit?.id ||
          !chapter?.id ||
          !topic?.id
        ) {
          return;
        }

        setContentLoading(
          true
        );

        setError("");

        try {
          const response =
            await api.get(
              `/topics/${topic.id}`
            );

          const materials =
            Array.isArray(
              response.data
                ?.materials
            )
              ? response.data.materials.map(
                  (
                    material
                  ) => ({
                    ...material,
                    kind:
                      "material",
                  })
                )
              : [];

          const videos =
            Array.isArray(
              response.data
                ?.videos
            )
              ? response.data.videos.map(
                  (
                    video
                  ) => ({
                    ...video,
                    kind:
                      "video",
                  })
                )
              : [];

          setItems([
            ...videos,
            ...materials,
          ]);

          setLevel(
            LEVELS.RESOURCES
          );

          setNavigationPath([
            {
              id: unit.id,
              name:
                unit.name ||
                "Unit",
              type:
                LEVELS.UNITS,
            },
            {
              id:
                chapter.id,
              name:
                chapter.name ||
                "Chapter",
              type:
                LEVELS.CHAPTERS,
            },
            {
              id:
                topic.id,
              name:
                topic.name ||
                "Topic",
              type:
                LEVELS.TOPICS,
            },
          ]);
        } catch (
          requestError
        ) {
          setItems([]);

          setError(
            requestError
              .response
              ?.data?.msg ||
              requestError
                .response
                ?.data
                ?.message ||
              "Couldn't load resources."
          );
        } finally {
          setContentLoading(
            false
          );
        }
      },
      []
    );

  /*
   * Initial root load.
   *
   * The app layout already prevents a student
   * without a group from entering the platform,
   * so Resources does not need to fetch the
   * student's year/group before loading Units.
   */
  useEffect(() => {
    loadUnits({
      initial: true,
    });
  }, [loadUnits]);

  async function handleItemPress(
    item
  ) {
    if (
      contentLoading
    ) {
      return;
    }

    if (
      level ===
      LEVELS.UNITS
    ) {
      await loadChapters(
        item
      );

      return;
    }

    if (
      level ===
      LEVELS.CHAPTERS
    ) {
      await loadTopics(
        navigationPath[0],
        item
      );

      return;
    }

    if (
      level ===
      LEVELS.TOPICS
    ) {
      await loadResources(
        navigationPath[0],
        navigationPath[1],
        item
      );

      return;
    }

    await openResource(
      item
    );
  }

  async function handleBreadcrumbPress(
    index
  ) {
    if (
      contentLoading
    ) {
      return;
    }

    if (index === -1) {
      await loadUnits();
      return;
    }

    if (index === 0) {
      await loadChapters(
        navigationPath[0]
      );

      return;
    }

    if (index === 1) {
      await loadTopics(
        navigationPath[0],
        navigationPath[1]
      );
    }
  }

  async function openResource(
    item
  ) {
    if (
      !item?.id ||
      !item?.kind
    ) {
      setError(
        "This resource cannot be opened."
      );

      return;
    }

    setOpeningResourceId(
      item.id
    );

    setError("");

    try {
      router.push(
        `/resource-viewer/${item.kind}/${item.id}`
      );
    } catch {
      setError(
        "Couldn't open this resource."
      );
    } finally {
      setOpeningResourceId(
        null
      );
    }
  }

  function retryCurrentLevel() {
    if (
      level ===
      LEVELS.UNITS
    ) {
      loadUnits();
      return;
    }

    if (
      level ===
      LEVELS.CHAPTERS
    ) {
      loadChapters(
        navigationPath[0]
      );

      return;
    }

    if (
      level ===
      LEVELS.TOPICS
    ) {
      loadTopics(
        navigationPath[0],
        navigationPath[1]
      );

      return;
    }

    loadResources(
      navigationPath[0],
      navigationPath[1],
      navigationPath[2]
    );
  }

  if (initialLoading) {
    return (
      <Screen
        scroll={false}
        style={
          styles.centeredScreen
        }
      >
        <ActivityIndicator
          color={
            colors.primary
          }
          size="large"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Preparing your
          resources...
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View
        style={
          styles.pageHeader
        }
      >
        <View
          style={
            styles.pageHeaderText
          }
        >
          <Text
            style={
              styles.eyebrow
            }
          >
            STUDY LIBRARY
          </Text>

          <Text
            style={
              styles.pageTitle
            }
          >
            Resources
          </Text>

          <Text
            style={
              styles.pageSubtitle
            }
          >
            Browse the learning
            structure and access
            available study
            materials and lesson
            videos.
          </Text>
        </View>
      </View>

      {error ? (
        <ErrorBanner
          message={error}
          onDismiss={
            clearError
          }
          onRetry={
            retryCurrentLevel
          }
        />
      ) : null}

      <Breadcrumbs
        path={
          navigationPath
        }
        disabled={
          contentLoading
        }
        onPress={
          handleBreadcrumbPress
        }
      />

      <Card
        style={
          styles.contentCard
        }
      >
        <View
          style={
            styles.contentHeader
          }
        >
          <View
            style={
              styles.contentHeaderText
            }
          >
            <Text
              style={
                styles.contentTitle
              }
            >
              {currentTitle}
            </Text>

            <Text
              style={
                styles.contentDescription
              }
            >
              {
                currentDescription
              }
            </Text>
          </View>

          <LevelBadge
            level={level}
            count={
              items.length
            }
          />
        </View>

        {level ===
          LEVELS.RESOURCES &&
        items.length > 0 ? (
          <View
            style={
              styles.summaryRow
            }
          >
            <SummaryItem
              label="Videos"
              value={
                videoCount
              }
            />

            <View
              style={
                styles.summaryDivider
              }
            />

            <SummaryItem
              label="Materials"
              value={
                materialCount
              }
            />
          </View>
        ) : null}

        <View
          style={
            styles.sectionDivider
          }
        />

        {contentLoading ? (
          <LoadingState />
        ) : items.length ===
          0 ? (
          <EmptyState
            level={level}
          />
        ) : (
          <View
            style={
              styles.itemList
            }
          >
            {items.map(
              (
                item,
                index
              ) => (
                <ResourceRow
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  level={
                    level
                  }
                  index={
                    index
                  }
                  opening={
                    openingResourceId ===
                    item.id
                  }
                  disabled={Boolean(
                    openingResourceId
                  )}
                  onPress={() =>
                    handleItemPress(
                      item
                    )
                  }
                />
              )
            )}
          </View>
        )}
      </Card>
    </Screen>
  );
}

function Breadcrumbs({
  path,
  disabled,
  onPress,
}) {
  return (
    <View
      style={
        styles.breadcrumbContainer
      }
    >
      <Pressable
        accessibilityRole="button"
        disabled={
          disabled
        }
        onPress={() =>
          onPress(-1)
        }
        style={({
          pressed,
        }) => [
          styles.breadcrumbButton,

          pressed &&
            !disabled &&
            styles.pressedOpacity,
        ]}
      >
        <Text
          style={
            styles.breadcrumbButtonText
          }
        >
          Resources
        </Text>
      </Pressable>

      {path.map(
        (
          entry,
          index
        ) => {
          const isCurrent =
            index ===
            path.length - 1;

          return (
            <React.Fragment
              key={
                entry.id
              }
            >
              <Text
                style={
                  styles.breadcrumbSeparator
                }
              >
                ›
              </Text>

              {isCurrent ? (
                <Text
                  numberOfLines={
                    1
                  }
                  style={
                    styles.breadcrumbCurrent
                  }
                >
                  {
                    entry.name
                  }
                </Text>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  disabled={
                    disabled
                  }
                  onPress={() =>
                    onPress(
                      index
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.breadcrumbButton,

                    pressed &&
                      !disabled &&
                      styles.pressedOpacity,
                  ]}
                >
                  <Text
                    numberOfLines={
                      1
                    }
                    style={
                      styles.breadcrumbButtonText
                    }
                  >
                    {
                      entry.name
                    }
                  </Text>
                </Pressable>
              )}
            </React.Fragment>
          );
        }
      )}
    </View>
  );
}

function ResourceRow({
  item,
  level,
  index,
  opening,
  disabled,
  onPress,
}) {
  const isResource =
    level ===
    LEVELS.RESOURCES;

  const isVideo =
    isResource &&
    item.kind ===
      "video";

  const title =
    item.name ||
    item.title ||
    "Untitled";

  const subtitle =
    getItemSubtitle(
      item,
      level,
      index
    );

  return (
    <Pressable
      accessibilityRole={
        isResource
          ? "link"
          : "button"
      }
      disabled={
        disabled
      }
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.itemPressable,

        pressed &&
          !disabled &&
          styles.itemPressablePressed,

        disabled &&
          !opening &&
          styles.disabledOpacity,
      ]}
    >
      <View
        style={[
          styles.itemIcon,

          isVideo &&
            styles.itemIconVideo,

          isResource &&
            !isVideo &&
            styles.itemIconDocument,
        ]}
      >
        <Text
          style={
            styles.itemIconText
          }
        >
          {getItemIcon(
            level,
            item.kind
          )}
        </Text>
      </View>

      <View
        style={
          styles.itemText
        }
      >
        <Text
          numberOfLines={2}
          style={
            styles.itemTitle
          }
        >
          {title}
        </Text>

        <Text
          numberOfLines={2}
          style={
            styles.itemSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>

      <View
        style={
          styles.itemAction
        }
      >
        {opening ? (
          <ActivityIndicator
            size="small"
            color={
              colors.primary
            }
          />
        ) : isResource ? (
          <>
            <Text
              style={
                styles.itemActionLabel
              }
            >
              {isVideo
                ? "Watch"
                : "Open"}
            </Text>

            <Text
              style={
                styles.externalArrow
              }
            >
              ›
            </Text>
          </>
        ) : (
          <Text
            style={
              styles.navigationArrow
            }
          >
            ›
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function LevelBadge({
  level,
  count,
}) {
  const label =
    level === LEVELS.UNITS
      ? `${count} ${
          count === 1
            ? "unit"
            : "units"
        }`
      : level ===
          LEVELS.CHAPTERS
        ? `${count} ${
            count === 1
              ? "chapter"
              : "chapters"
          }`
        : level ===
            LEVELS.TOPICS
          ? `${count} ${
              count === 1
                ? "topic"
                : "topics"
            }`
          : `${count} ${
              count === 1
                ? "resource"
                : "resources"
            }`;

  return (
    <View
      style={
        styles.levelBadge
      }
    >
      <Text
        style={
          styles.levelBadgeText
        }
      >
        {label}
      </Text>
    </View>
  );
}

function SummaryItem({
  label,
  value,
}) {
  return (
    <View
      style={
        styles.summaryItem
      }
    >
      <Text
        style={
          styles.summaryValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.summaryLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View
      style={
        styles.loadingPanel
      }
    >
      <ActivityIndicator
        size="small"
        color={
          colors.primary
        }
      />

      <Text
        style={
          styles.loadingPanelText
        }
      >
        Loading content...
      </Text>
    </View>
  );
}

function EmptyState({
  level,
}) {
  const content =
    level === LEVELS.UNITS
      ? {
          title:
            "No units available",

          description:
            "No learning units have been added yet.",
        }
      : level ===
          LEVELS.CHAPTERS
        ? {
            title:
              "No chapters available",

            description:
              "This unit does not contain any chapters yet.",
          }
        : level ===
            LEVELS.TOPICS
          ? {
              title:
                "No topics available",

              description:
                "This chapter does not contain any topics yet.",
            }
          : {
              title:
                "No resources available",

              description:
                "No materials or videos have been uploaded for this topic yet.",
            };

  return (
    <View
      style={
        styles.emptyState
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <Text
          style={
            styles.emptyIconText
          }
        >
          —
        </Text>
      </View>

      <Text
        style={
          styles.emptyTitle
        }
      >
        {content.title}
      </Text>

      <Text
        style={
          styles.emptyDescription
        }
      >
        {content.description}
      </Text>
    </View>
  );
}

function ErrorBanner({
  message,
  onDismiss,
  onRetry,
}) {
  return (
    <View
      accessibilityRole="alert"
      style={
        styles.errorBanner
      }
    >
      <View
        style={
          styles.errorIndicator
        }
      />

      <View
        style={
          styles.errorContent
        }
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          Something went wrong
        </Text>

        <Text
          style={
            styles.errorMessage
          }
        >
          {message}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={
          onRetry
        }
        style={({
          pressed,
        }) => [
          styles.retryButton,

          pressed &&
            styles.pressedOpacity,
        ]}
      >
        <Text
          style={
            styles.retryButtonText
          }
        >
          Retry
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss error"
        onPress={
          onDismiss
        }
        style={({
          pressed,
        }) => [
          styles.dismissButton,

          pressed &&
            styles.pressedOpacity,
        ]}
      >
        <Text
          style={
            styles.dismissButtonText
          }
        >
          ×
        </Text>
      </Pressable>
    </View>
  );
}

function getItemIcon(
  level,
  resourceKind
) {
  if (
    level ===
    LEVELS.UNITS
  ) {
    return "U";
  }

  if (
    level ===
    LEVELS.CHAPTERS
  ) {
    return "C";
  }

  if (
    level ===
    LEVELS.TOPICS
  ) {
    return "T";
  }

  return resourceKind ===
    "video"
    ? "▶"
    : "PDF";
}

function getItemSubtitle(
  item,
  level,
  index
) {
  if (
    level ===
    LEVELS.UNITS
  ) {
    const count =
      item._count
        ?.chapters;

    return typeof count ===
      "number"
      ? `${count} ${
          count === 1
            ? "chapter"
            : "chapters"
        }`
      : `Unit ${
          index + 1
        }`;
  }

  if (
    level ===
    LEVELS.CHAPTERS
  ) {
    const count =
      item._count
        ?.topics;

    return typeof count ===
      "number"
      ? `${count} ${
          count === 1
            ? "topic"
            : "topics"
        }`
      : `Chapter ${
          index + 1
        }`;
  }

  if (
    level ===
    LEVELS.TOPICS
  ) {
    const materialCount =
      item._count
        ?.materials || 0;

    const videoCount =
      item._count
        ?.videos || 0;

    const total =
      materialCount +
      videoCount;

    return total > 0
      ? `${total} ${
          total === 1
            ? "resource"
            : "resources"
        }`
      : `Topic ${
          index + 1
        }`;
  }

  return item.kind ===
    "video"
    ? "Lesson video"
    : "Study material";
}

const styles =
  StyleSheet.create({
    centeredScreen: {
      alignItems: "center",
      justifyContent:
        "center",
      gap: spacing.sm,
    },

    loadingText: {
      ...typography.body,
      color:
        colors.textMuted,
    },

    pageHeader: {
      marginBottom:
        spacing.lg,
    },

    pageHeaderText: {
      maxWidth: 760,
    },

    eyebrow: {
      ...typography.caption,

      color:
        colors.secondary,

      fontWeight: "800",

      letterSpacing: 1.2,

      marginBottom:
        spacing.xs,
    },

    pageTitle: {
      ...typography.h1,

      color:
        colors.primary,

      marginBottom:
        spacing.xs,
    },

    pageSubtitle: {
      ...typography.body,

      color:
        colors.textMuted,

      lineHeight: 22,
    },

    errorBanner: {
      flexDirection: "row",
      alignItems: "center",

      overflow: "hidden",

      marginBottom:
        spacing.md,

      borderWidth: 1,

      borderColor:
        `${colors.danger}55`,

      borderRadius:
        radius.md,

      backgroundColor:
        `${colors.danger}0D`,
    },

    errorIndicator: {
      alignSelf: "stretch",

      width: 4,

      backgroundColor:
        colors.danger,
    },

    errorContent: {
      flex: 1,
      padding: spacing.sm,
    },

    errorTitle: {
      ...typography.bodyBold,

      color:
        colors.danger,

      marginBottom: 2,
    },

    errorMessage: {
      ...typography.caption,

      color:
        colors.danger,

      lineHeight: 18,
    },

    retryButton: {
      minHeight: 38,

      justifyContent:
        "center",

      paddingHorizontal:
        spacing.sm,
    },

    retryButtonText: {
      fontSize: 12,

      fontWeight: "800",

      color:
        colors.danger,
    },

    dismissButton: {
      width: 40,
      height: 40,

      alignItems: "center",
      justifyContent:
        "center",
    },

    dismissButtonText: {
      fontSize: 22,

      color:
        colors.danger,
    },

    breadcrumbContainer: {
      minHeight: 40,

      flexDirection: "row",
      flexWrap: "wrap",

      alignItems: "center",

      gap: spacing.xs,

      marginBottom:
        spacing.sm,
    },

    breadcrumbButton: {
      minHeight: 32,

      justifyContent:
        "center",

      maxWidth: 220,
    },

    breadcrumbButtonText: {
      ...typography.caption,

      color:
        colors.primary,

      fontWeight: "700",
    },

    breadcrumbCurrent: {
      ...typography.caption,

      maxWidth: 240,

      color:
        colors.textMuted,

      fontWeight: "600",
    },

    breadcrumbSeparator: {
      fontSize: 18,

      color:
        colors.textMuted,
    },

    contentCard: {
      padding: spacing.lg,
    },

    contentHeader: {
      flexDirection: "row",
      flexWrap: "wrap",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap: spacing.md,
    },

    contentHeaderText: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 280,
    },

    contentTitle: {
      ...typography.h2,

      color:
        colors.primary,

      marginBottom: 4,
    },

    contentDescription: {
      ...typography.body,

      color:
        colors.textMuted,

      lineHeight: 21,
    },

    levelBadge: {
      minHeight: 34,

      alignItems: "center",
      justifyContent:
        "center",

      paddingHorizontal:
        spacing.sm,

      borderRadius:
        radius.pill,

      backgroundColor:
        `${colors.primary}0D`,
    },

    levelBadgeText: {
      fontSize: 12,

      fontWeight: "800",

      color:
        colors.primary,
    },

    summaryRow: {
      flexDirection: "row",
      alignItems: "center",

      alignSelf:
        "flex-start",

      marginTop:
        spacing.lg,

      paddingHorizontal:
        spacing.md,

      paddingVertical:
        spacing.sm,

      borderRadius:
        radius.md,

      backgroundColor:
        colors.background,
    },

    summaryItem: {
      minWidth: 82,
      alignItems: "center",
    },

    summaryValue: {
      ...typography.h3,

      color:
        colors.primary,
    },

    summaryLabel: {
      ...typography.caption,

      color:
        colors.textMuted,

      marginTop: 2,
    },

    summaryDivider: {
      width: 1,
      height: 34,

      backgroundColor:
        colors.border,

      marginHorizontal:
        spacing.sm,
    },

    sectionDivider: {
      height: 1,

      marginVertical:
        spacing.lg,

      backgroundColor:
        colors.border,
    },

    itemList: {
      gap: spacing.sm,
    },

    itemPressable: {
      minHeight: 76,

      flexDirection: "row",
      alignItems: "center",

      gap: spacing.sm,

      padding: spacing.sm,

      borderWidth: 1,

      borderColor:
        colors.border,

      borderRadius:
        radius.md,

      backgroundColor:
        colors.white,

      ...(Platform.OS ===
      "web"
        ? {
            transitionDuration:
              "140ms",

            transitionProperty:
              "background-color, border-color, transform",
          }
        : null),
    },

    itemPressablePressed: {
      opacity: 0.74,

      transform: [
        {
          scale:
            0.995,
        },
      ],
    },

    itemIcon: {
      width: 46,
      height: 46,

      flexShrink: 0,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius:
        radius.md,

      backgroundColor:
        `${colors.primary}10`,
    },

    itemIconVideo: {
      backgroundColor:
        `${colors.warning}14`,
    },

    itemIconDocument: {
      backgroundColor:
        `${colors.secondary}18`,
    },

    itemIconText: {
      fontSize: 12,

      fontWeight: "900",

      color:
        colors.primary,
    },

    itemText: {
      flex: 1,
      minWidth: 0,
    },

    itemTitle: {
      ...typography.bodyBold,

      color:
        colors.textPrimary,
    },

    itemSubtitle: {
      ...typography.caption,

      color:
        colors.textMuted,

      lineHeight: 17,

      marginTop: 3,
    },

    itemAction: {
      minWidth: 52,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "flex-end",

      gap: 5,
    },

    itemActionLabel: {
      fontSize: 12,

      fontWeight: "800",

      color:
        colors.primary,
    },

    externalArrow: {
      fontSize: 17,

      color:
        colors.primary,
    },

    navigationArrow: {
      fontSize: 28,

      color:
        colors.primary,
    },

    loadingPanel: {
      minHeight: 180,

      alignItems: "center",
      justifyContent:
        "center",

      gap: spacing.sm,
    },

    loadingPanelText: {
      ...typography.body,

      color:
        colors.textMuted,
    },

    emptyState: {
      minHeight: 220,

      alignItems: "center",
      justifyContent:
        "center",

      padding: spacing.xl,
    },

    emptyIcon: {
      width: 46,
      height: 46,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius: 23,

      backgroundColor:
        colors.background,

      marginBottom:
        spacing.sm,
    },

    emptyIconText: {
      fontSize: 22,

      color:
        colors.textMuted,
    },

    emptyTitle: {
      ...typography.bodyBold,

      color:
        colors.textPrimary,

      textAlign: "center",
    },

    emptyDescription: {
      ...typography.body,

      maxWidth: 440,

      color:
        colors.textMuted,

      textAlign: "center",

      lineHeight: 21,

      marginTop:
        spacing.xs,
    },

    pressedOpacity: {
      opacity: 0.68,
    },

    disabledOpacity: {
      opacity: 0.5,
    },
  });