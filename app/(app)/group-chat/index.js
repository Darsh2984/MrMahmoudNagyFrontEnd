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
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

function getMessagePreview(message) {
  if (!message) {
    return "No messages yet";
  }

  const senderName =
    message.sender?.name ||
    "Unknown user";

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
        const response =
          await api.get(
            "/group-chat",
          );

        const loadedChats =
          Array.isArray(
            response.data?.chats,
          )
            ? response.data.chats
            : [];

        setChats(loadedChats);
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load group chats.",
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

    function handleNewMessage(payload) {
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
          (left, right) => {
            const leftDate =
              new Date(
                left.lastMessage
                  ?.createdAt || 0,
              ).getTime();

            const rightDate =
              new Date(
                right.lastMessage
                  ?.createdAt || 0,
              ).getTime();

            return rightDate - leftDate;
          },
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
      handleNewMessage,
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
        handleNewMessage,
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

      return chats.filter((chat) => {
        const searchableText = [
          chat.name,
          chat.year?.name,
          chat.lastMessage
            ?.sender?.name,
          chat.lastMessage
            ?.content,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          search,
        );
      });
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

  function openChat(chat) {
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
                GROUP COMMUNICATION
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
              Group Chat
            </Text>

            <Text style={styles.subtitle}>
              Chat with students, teachers,
              and assistants inside each
              assigned group.
            </Text>
          </View>

          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text
                style={
                  styles.headerStatValue
                }
              >
                {chats.length}
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
              placeholder="Search groups or messages"
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
              Loading group chats...
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
                    name="people-circle-outline"
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
                    ? "No matching groups"
                    : "No group chats available"}
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  {searchText
                    ? "Try searching with a different group or year name."
                    : "You will see a chat here when you have access to a group."}
                </Text>
              </Card>
            ) : (
              filteredChats.map(
                (chat) => (
                  <ChatCard
                    key={chat.id}
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
          {getGroupInitials(
            chat.name,
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
              {chat.name ||
                "Unnamed group"}
            </Text>

            {chat.year?.name ? (
              <Badge
                label={chat.year.name}
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
            {getMessagePreview(
              chat.lastMessage,
            )}
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
            name="people-outline"
            size={15}
            color={colors.textMuted}
          />

          <Text
            style={styles.memberText}
          >
            {Number(
              chat.memberCount || 0,
            )}{" "}
            students
          </Text>
        </View>
      </View>
    </Pressable>
  );
}