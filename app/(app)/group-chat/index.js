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

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";

import api from "../../../src/lib/api";

import {
  connectSocket,
  socket,
} from "../../../src/lib/socket";

import { colors } from "../../../src/theme";

import { styles } from "./index.styles";

const DESKTOP_BREAKPOINT = 900;

const CHAT_TYPE_GROUP = "GROUP_CHAT";
const CHAT_TYPE_SUPPORT =
  "STUDENT_SUPPORT_CHAT";

function getErrorMessage(
  error,
  fallback = "Something went wrong.",
) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function formatMessageTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function getSenderName(message) {
  if (!message) {
    return "Unknown user";
  }

  if (message.senderType === "PARENT") {
    return (
      message.parentDisplayName ||
      "Parent"
    );
  }

  return (
    message.sender?.name ||
    message.senderUser?.name ||
    "Unknown user"
  );
}

function getMessagePreview(chat) {
  const message = chat.lastMessage;

  if (!message) {
    return "No messages yet";
  }

  const senderName =
    getSenderName(message);

  if (message.content) {
    return `${senderName}: ${message.content}`;
  }

  const labels = {
    IMAGE: "sent an image",
    PDF: "sent a PDF",
    VIDEO: "sent a video",
    AUDIO: "sent a voice message",
    FILE: "sent a file",
  };

  return `${senderName}: ${
    labels[message.messageType] ||
    "sent an attachment"
  }`;
}

function getGroupInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "G";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`
    .toUpperCase();
}

function normalizeGroupChat(chat) {
  return {
    ...chat,
    type: CHAT_TYPE_GROUP,
    displayName:
      chat.name || "Unnamed group",
    displayYear: chat.year?.name || "",
    displayMeta: [
      chat.year?.name,
      `${Number(chat.memberCount || 0)} students`,
    ]
      .filter(Boolean)
      .join(" · "),
    searchText: [
      chat.name,
      chat.year?.name,
      chat.lastMessage?.sender?.name,
      chat.lastMessage?.content,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function normalizeSupportChat(chat) {
  return {
    ...chat,
    type: CHAT_TYPE_SUPPORT,
    displayName:
      chat.name ||
      `Student Support - ${
        chat.student?.name || "Student"
      }`,
    displayYear:
      chat.group?.year?.name || "",
    displayMeta: [
      chat.group?.year?.name,
      chat.group?.name,
      chat.student?.name,
    ]
      .filter(Boolean)
      .join(" · "),
    searchText: [
      chat.name,
      chat.student?.name,
      chat.group?.name,
      chat.group?.year?.name,
      chat.lastMessage?.senderUser?.name,
      chat.lastMessage?.parentDisplayName,
      chat.lastMessage?.content,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function getLastMessageDate(chat) {
  return new Date(
    chat.lastMessage?.createdAt ||
      chat.updatedAt ||
      0,
  ).getTime();
}

export default function GroupChatList() {
  const router = useRouter();

  const { width } =
    useWindowDimensions();

  const isDesktop =
    width >= DESKTOP_BREAKPOINT;

  const [chats, setChats] =
    useState([]);

  const [searchText, setSearchText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [socketConnected, setSocketConnected] =
    useState(socket.connected);

  const [error, setError] =
    useState("");

  const loadChats = useCallback(
    async ({
      isRefresh = false,
    } = {}) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [
          groupResponse,
          supportResponse,
        ] = await Promise.all([
          api.get("/group-chat"),
          api.get("/student-support-chat"),
        ]);

        const groupChats =
          Array.isArray(
            groupResponse.data?.chats,
          )
            ? groupResponse.data.chats.map(
                normalizeGroupChat,
              )
            : [];

        const supportChats =
          Array.isArray(
            supportResponse.data?.chats,
          )
            ? supportResponse.data.chats.map(
                normalizeSupportChat,
              )
            : [];

        const combinedChats = [
          ...supportChats,
          ...groupChats,
        ].sort(
          (left, right) =>
            getLastMessageDate(right) -
            getLastMessageDate(left),
        );

        setChats(combinedChats);
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load chats.",
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    let active = true;

    function handleConnect() {
      if (!active) {
        return;
      }

      setSocketConnected(true);
    }

    function handleDisconnect() {
      if (!active) {
        return;
      }

      setSocketConnected(false);
    }

    function handleNewGroupMessage(payload) {
      const groupId =
        payload?.groupId;

      const message =
        payload?.message;

      if (!groupId || !message) {
        return;
      }

      setChats((current) => {
        const exists =
          current.some(
            (chat) =>
              chat.type === CHAT_TYPE_GROUP &&
              String(chat.id) ===
                String(groupId),
          );

        if (!exists) {
          loadChats({
            isRefresh: true,
          });

          return current;
        }

        const updated =
          current.map((chat) => {
            if (
              chat.type !== CHAT_TYPE_GROUP ||
              String(chat.id) !==
                String(groupId)
            ) {
              return chat;
            }

            return {
              ...chat,
              lastMessage: message,
              unreadCount:
                Number(
                  chat.unreadCount || 0,
                ) + 1,
            };
          });

        return updated.sort(
          (left, right) =>
            getLastMessageDate(right) -
            getLastMessageDate(left),
        );
      });
    }

    socket.on(
      "connect",
      handleConnect,
    );

    socket.on(
      "disconnect",
      handleDisconnect,
    );

    socket.on(
      "new-group-chat-message",
      handleNewGroupMessage,
    );

    connectSocket().then(
      (connected) => {
        if (
          active &&
          connected &&
          socket.connected
        ) {
          handleConnect();
        }
      },
    );

    return () => {
      active = false;

      socket.off(
        "connect",
        handleConnect,
      );

      socket.off(
        "disconnect",
        handleDisconnect,
      );

      socket.off(
        "new-group-chat-message",
        handleNewGroupMessage,
      );
    };
  }, [loadChats]);

  const filteredChats =
    useMemo(() => {
      const search =
        searchText
          .trim()
          .toLowerCase();

      if (!search) {
        return chats;
      }

      return chats.filter((chat) =>
        String(chat.searchText || "")
          .toLowerCase()
          .includes(search),
      );
    }, [chats, searchText]);

  const totalUnread =
    useMemo(
      () =>
        chats.reduce(
          (total, chat) =>
            total +
            Number(
              chat.unreadCount || 0,
            ),
          0,
        ),
      [chats],
    );

  const groupChatCount =
    chats.filter(
      (chat) =>
        chat.type === CHAT_TYPE_GROUP,
    ).length;

  const supportChatCount =
    chats.filter(
      (chat) =>
        chat.type === CHAT_TYPE_SUPPORT,
    ).length;

  function openChat(chat) {
    if (chat.type === CHAT_TYPE_SUPPORT) {
      router.push({
        pathname:
          "/(app)/student-support-chat/[chatId]",

        params: {
          chatId: chat.id,
        },
      });

      return;
    }

    router.push({
      pathname:
        "/(app)/group-chat/[groupId]",

      params: {
        groupId: chat.id,
      },
    });
  }

  return (
    <Screen
      scroll={false}
      contentContainerStyle={
        styles.screenContent
      }
    >
      <View style={styles.page}>
        <View
          style={[
            styles.pageHeader,
            !isDesktop &&
              styles.pageHeaderMobile,
          ]}
        >
          <View style={styles.headerCopy}>
            <View
              style={
                styles.eyebrowRow
              }
            >
              <Text style={styles.eyebrow}>
                COMMUNICATION CENTER
              </Text>

              <View
                style={[
                  styles.connectionIndicator,

                  socketConnected
                    ? styles.connectionOnline
                    : styles.connectionOffline,
                ]}
              />

              <Text
                style={
                  styles.connectionText
                }
              >
                {socketConnected
                  ? "Live"
                  : "Reconnecting"}
              </Text>
            </View>

            <Text style={styles.title}>
              Chats
            </Text>

            <Text style={styles.subtitle}>
              Open group chats or private
              student support chats between
              the student, parent, teacher,
              and assigned assistants.
            </Text>
          </View>

          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text
                style={
                  styles.headerStatValue
                }
              >
                {groupChatCount}
              </Text>

              <Text
                style={
                  styles.headerStatLabel
                }
              >
                Groups
              </Text>
            </View>

            <View style={styles.headerStat}>
              <Text
                style={
                  styles.headerStatValue
                }
              >
                {supportChatCount}
              </Text>

              <Text
                style={
                  styles.headerStatLabel
                }
              >
                Support
              </Text>
            </View>

            <View style={styles.headerStat}>
              <Text
                style={
                  styles.headerStatValue
                }
              >
                {totalUnread}
              </Text>

              <Text
                style={
                  styles.headerStatLabel
                }
              >
                Unread
              </Text>
            </View>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
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

        <Card style={styles.toolbar}>
          <View
            style={
              styles.searchContainer
            }
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.textMuted}
            />

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search chats, students, groups, or messages"
              placeholderTextColor={
                colors.textMuted
              }
              style={styles.searchInput}
            />

            {searchText ? (
              <Pressable
                onPress={() =>
                  setSearchText("")
                }
                style={
                  styles.clearSearchButton
                }
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={
                    colors.textMuted
                  }
                />
              </Pressable>
            ) : null}
          </View>

          <Button
            title={
              refreshing
                ? "Refreshing"
                : "Refresh"
            }
            variant="outline"
            loading={refreshing}
            disabled={refreshing}
            onPress={() =>
              loadChats({
                isRefresh: true,
              })
            }
          />
        </Card>

        {loading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text
              style={styles.loadingText}
            >
              Loading chats...
            </Text>
          </Card>
        ) : (
          <ScrollView
            style={styles.chatScroll}
            contentContainerStyle={
              styles.chatList
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() =>
                  loadChats({
                    isRefresh: true,
                  })
                }
              />
            }
            showsVerticalScrollIndicator={
              false
            }
          >
            {!filteredChats.length ? (
              <Card
                style={styles.emptyState}
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={40}
                    color={colors.primary}
                  />
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  {searchText
                    ? "No matching chats"
                    : "No chats available"}
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  {searchText
                    ? "Try searching with another student, group, year, or message."
                    : "Group chats and student support chats will appear here when you have access."}
                </Text>
              </Card>
            ) : (
              filteredChats.map(
                (chat) => (
                  <ChatCard
                    key={`${chat.type}-${chat.id}`}
                    chat={chat}
                    onPress={() =>
                      openChat(chat)
                    }
                  />
                ),
              )
            )}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

function ChatCard({
  chat,
  onPress,
}) {
  const unreadCount =
    Number(chat.unreadCount || 0);

  const hasUnread =
    unreadCount > 0;

  const isSupport =
    chat.type === CHAT_TYPE_SUPPORT;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.chatCard,
        hasUnread &&
          styles.chatCardUnread,
        pressed &&
          styles.chatCardPressed,
      ]}
    >
      <View
        style={[
          styles.groupAvatar,
          hasUnread &&
            styles.groupAvatarUnread,
        ]}
      >
        <Text
          style={[
            styles.groupAvatarText,
            hasUnread &&
              styles.groupAvatarTextUnread,
          ]}
        >
          {isSupport
            ? "S"
            : getGroupInitials(
                chat.displayName,
              )}
        </Text>
      </View>

      <View style={styles.chatCopy}>
        <View
          style={styles.chatTopRow}
        >
          <View
            style={styles.chatNameRow}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.chatName,
                hasUnread &&
                  styles.chatNameUnread,
              ]}
            >
              {chat.displayName}
            </Text>

            <Badge
              label={
                isSupport
                  ? "Support"
                  : "Group"
              }
              tone={
                isSupport
                  ? "primary"
                  : "neutral"
              }
            />

            {chat.displayYear ? (
              <Badge
                label={chat.displayYear}
                tone="neutral"
              />
            ) : null}
          </View>

          <Text
            style={[
              styles.messageTime,
              hasUnread &&
                styles.messageTimeUnread,
            ]}
          >
            {formatMessageTime(
              chat.lastMessage
                ?.createdAt,
            )}
          </Text>
        </View>

        <View
          style={
            styles.chatBottomRow
          }
        >
          <Text
            numberOfLines={1}
            style={[
              styles.messagePreview,
              hasUnread &&
                styles.messagePreviewUnread,
            ]}
          >
            {getMessagePreview(chat)}
          </Text>

          {hasUnread ? (
            <View
              style={
                styles.unreadBadge
              }
            >
              <Text
                style={
                  styles.unreadBadgeText
                }
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </Text>
            </View>
          ) : (
            <Ionicons
              name="chevron-forward"
              size={19}
              color={colors.textMuted}
            />
          )}
        </View>

        <View style={styles.memberRow}>
          <Ionicons
            name={
              isSupport
                ? "person-circle-outline"
                : "people-outline"
            }
            size={15}
            color={colors.textMuted}
          />

          <Text
            numberOfLines={1}
            style={styles.memberText}
          >
            {isSupport
              ? chat.displayMeta ||
                "Student support chat"
              : `${Number(
                  chat.memberCount || 0,
                )} students`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}