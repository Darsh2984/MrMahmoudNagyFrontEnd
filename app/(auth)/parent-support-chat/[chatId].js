import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import api from "../../../src/lib/api";

import {
  connectParentSocket,
  socket,
} from "../../../src/lib/socket";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../src/theme";

const PARENT_ACCESS_CODE_KEY =
  "parent_access_code";

function getApiError(error, fallback) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getParamValue(value) {
  if (Array.isArray(value)) {
    return String(value[0] || "");
  }

  return String(value || "");
}

function formatMessageTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMessageDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();

  const yesterday = new Date(today);
  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const key = [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ].join("-");

  const todayKey = [
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ].join("-");

  const yesterdayKey = [
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
  ].join("-");

  if (key === todayKey) {
    return "Today";
  }

  if (key === yesterdayKey) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getSenderName(message) {
  if (message?.senderType === "PARENT") {
    return (
      message.parentDisplayName ||
      "Parent"
    );
  }

  return (
    message?.senderUser?.name ||
    "School"
  );
}

function getSenderRole(message) {
  if (message?.senderType === "PARENT") {
    return "Parent";
  }

  const sender = message?.senderUser;

  if (
    sender?.role === "ASSISTANT" &&
    sender?.isHeadAssistant
  ) {
    return "Head Assistant";
  }

  if (sender?.role === "TEACHER") {
    return "Teacher";
  }

  if (sender?.role === "ASSISTANT") {
    return "Assistant";
  }

  if (sender?.role === "STUDENT") {
    return "Student";
  }

  return "School";
}

function shouldShowDateDivider(
  current,
  previous
) {
  if (!current?.createdAt) {
    return false;
  }

  if (!previous?.createdAt) {
    return true;
  }

  return (
    formatMessageDate(current.createdAt) !==
    formatMessageDate(previous.createdAt)
  );
}

export default function ParentSupportChat() {
  const router = useRouter();

  const params = useLocalSearchParams();

  const chatId = getParamValue(
    params.chatId
  );

  const scrollRef = useRef(null);

  const [accessCode, setAccessCode] =
    useState("");

  const [chat, setChat] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [draft, setDraft] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [typingUsers, setTypingUsers] =
    useState([]);

  const loadMessages = useCallback(
    async ({
      codeOverride,
      silent = false,
    } = {}) => {
      const code =
        String(
          codeOverride || accessCode || ""
        )
          .trim()
          .toUpperCase();

      if (!chatId) {
        setError(
          "The requested support chat is invalid."
        );
        setLoading(false);
        return;
      }

      if (!code) {
        setError(
          "Please enter the student access code again."
        );
        setLoading(false);
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      setError("");

      try {
        const response = await api.post(
          `/parent-access/chats/${chatId}/messages`,
          {
            accessCode: code,
          }
        );

        setChat(response.data?.chat || null);

        setMessages(
          Array.isArray(
            response.data?.messages
          )
            ? response.data.messages
            : []
        );

        await api.post(
          `/parent-access/chats/${chatId}/read`,
          {
            accessCode: code,
          }
        );

        setTimeout(() => {
          scrollRef.current?.scrollToEnd?.({
            animated: true,
          });
        }, 120);
      } catch (requestError) {
        setError(
          getApiError(
            requestError,
            "Couldn't load this support chat."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [
      accessCode,
      chatId,
    ]
  );

  useEffect(() => {
    let active = true;

    async function restoreCode() {
      const savedCode =
        await AsyncStorage.getItem(
          PARENT_ACCESS_CODE_KEY
        );

      if (!active) {
        return;
      }

      const normalized =
        String(savedCode || "")
          .trim()
          .toUpperCase();

      setAccessCode(normalized);

      await loadMessages({
        codeOverride: normalized,
      });
    }

    restoreCode();

    return () => {
      active = false;
    };
  }, [loadMessages]);

  useEffect(() => {
    if (!chatId || !accessCode) {
      return undefined;
    }

    let active = true;

    function handleNewSupportMessage(payload) {
      if (
        String(payload?.chatId) !== String(chatId) ||
        !payload?.message
      ) {
        return;
      }

      setMessages((current) => {
        const exists = current.some(
          (message) =>
            String(message.id) ===
            String(payload.message.id)
        );

        if (exists) {
          return current;
        }

        return [
          ...current,
          payload.message,
        ];
      });

      setTimeout(() => {
        scrollRef.current?.scrollToEnd?.({
          animated: true,
        });
      }, 120);
    }

    function handleTyping(payload) {
      if (
        String(payload?.chatId) !== String(chatId)
      ) {
        return;
      }

      /*
       * Parent should not see their own typing indicator.
       */
      if (payload.parent) {
        return;
      }

      const typingId =
        payload.user?.id
          ? `USER:${payload.user.id}`
          : "";

      if (!typingId) {
        return;
      }

      const label =
        payload.user?.name || "School";

      setTypingUsers((current) => {
        const withoutCurrent =
          current.filter(
            (item) => item.id !== typingId
          );

        if (!payload.isTyping) {
          return withoutCurrent;
        }

        return [
          ...withoutCurrent,
          {
            id: typingId,
            label,
          },
        ];
      });
    }

    socket.on(
      "new-student-support-chat-message",
      handleNewSupportMessage
    );

    socket.on(
      "student-support-chat-user-typing",
      handleTyping
    );

    connectParentSocket(accessCode).then(
      (connected) => {
        if (
          !active ||
          !connected ||
          !socket.connected
        ) {
          return;
        }

        socket.emit(
          "join-student-support-chat",
          {
            chatId,
          }
        );
      }
    );

    return () => {
      active = false;

      socket.emit(
        "student-support-chat-typing-stop",
        {
          chatId,
        }
      );

      socket.emit(
        "leave-student-support-chat",
        {
          chatId,
        }
      );

      socket.off(
        "new-student-support-chat-message",
        handleNewSupportMessage
      );

      socket.off(
        "student-support-chat-user-typing",
        handleTyping
      );
    };
  }, [
    accessCode,
    chatId,
  ]);

  function handleDraftChange(value) {
    setDraft(value);

    if (!chatId || !socket.connected) {
      return;
    }

    if (value.trim()) {
      socket.emit(
        "student-support-chat-typing-start",
        {
          chatId,
        }
      );
    } else {
      socket.emit(
        "student-support-chat-typing-stop",
        {
          chatId,
        }
      );
    }
  }

  async function handleSend() {
    const content = draft.trim();

    if (
      !content ||
      sending ||
      !accessCode ||
      !chatId
    ) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await api.post(
        `/parent-access/chats/${chatId}/messages/send`,
        {
          accessCode,
          content,
        }
      );

      const created =
        response.data?.message;

      if (created) {
        setMessages((current) => [
          ...current,
          created,
        ]);
      }

      setDraft("");

      socket.emit(
        "student-support-chat-typing-stop",
        {
          chatId,
        }
      );

      setTimeout(() => {
        scrollRef.current?.scrollToEnd?.({
          animated: true,
        });
      }, 120);
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Couldn't send the message."
        )
      );
    } finally {
      setSending(false);
    }
  }

  function handleBack() {
    router.replace(
      "/(auth)/parent-lookup"
    );
  }

  const title =
    chat?.name ||
    "Student Support Chat";

  const studentName =
    chat?.student?.name || "Student";

  const groupLabel = [
    chat?.group?.year?.name,
    chat?.group?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          title,
        }}
      />

      <Screen
        scroll={false}
        contentContainerStyle={
          styles.screenContent
        }
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
          style={styles.keyboardView}
        >
          <View style={styles.page}>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to parent access"
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={21}
                  color={colors.primary}
                />

                <Text
                  style={styles.backButtonText}
                >
                  Back
                </Text>
              </Pressable>

              <View style={styles.headerMain}>
                <Text
                  numberOfLines={1}
                  style={styles.eyebrow}
                >
                  PARENT SUPPORT CHAT
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.title}
                >
                  {studentName}
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.subtitle}
                >
                  {groupLabel ||
                    "Private student support"}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Refresh messages"
                onPress={() =>
                  loadMessages({
                    silent: false,
                  })
                }
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="refresh"
                  size={21}
                  color={colors.primary}
                />
              </Pressable>
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
                  onPress={() => setError("")}
                  style={styles.dismissButton}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={colors.danger}
                  />
                </Pressable>
              </View>
            ) : null}

            <Card style={styles.chatCard}>
              {loading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator
                    size="large"
                    color={colors.primary}
                  />

                  <Text style={styles.stateText}>
                    Loading support chat…
                  </Text>
                </View>
              ) : (
                <>
                  <ScrollView
                    ref={scrollRef}
                    style={styles.messagesScroll}
                    contentContainerStyle={
                      styles.messagesContent
                    }
                    keyboardShouldPersistTaps="handled"
                  >
                    {messages.length ? (
                      messages.map(
                        (message, index) => {
                          const previous =
                            messages[index - 1];

                          const isParent =
                            message.senderType ===
                            "PARENT";

                          return (
                            <React.Fragment
                              key={message.id}
                            >
                              {shouldShowDateDivider(
                                message,
                                previous
                              ) ? (
                                <View
                                  style={
                                    styles.dateDivider
                                  }
                                >
                                  <Text
                                    style={
                                      styles.dateDividerText
                                    }
                                  >
                                    {formatMessageDate(
                                      message.createdAt
                                    )}
                                  </Text>
                                </View>
                              ) : null}

                              <View
                                style={[
                                  styles.messageRow,
                                  isParent &&
                                    styles.messageRowMine,
                                ]}
                              >
                                <View
                                  style={[
                                    styles.messageBubble,
                                    isParent
                                      ? styles.messageBubbleMine
                                      : styles.messageBubbleOther,
                                  ]}
                                >
                                  <View
                                    style={
                                      styles.messageHeader
                                    }
                                  >
                                    <Text
                                      style={[
                                        styles.messageSender,
                                        isParent &&
                                          styles.messageSenderMine,
                                      ]}
                                    >
                                      {getSenderName(
                                        message
                                      )}
                                    </Text>

                                    <Text
                                      style={[
                                        styles.messageRole,
                                        isParent &&
                                          styles.messageRoleMine,
                                      ]}
                                    >
                                      {getSenderRole(
                                        message
                                      )}
                                    </Text>
                                  </View>

                                  <Text
                                    style={[
                                      styles.messageText,
                                      isParent &&
                                        styles.messageTextMine,
                                    ]}
                                  >
                                    {message.content}
                                  </Text>

                                  <Text
                                    style={[
                                      styles.messageTime,
                                      isParent &&
                                        styles.messageTimeMine,
                                    ]}
                                  >
                                    {formatMessageTime(
                                      message.createdAt
                                    )}
                                  </Text>
                                </View>
                              </View>
                            </React.Fragment>
                          );
                        }
                      )
                    ) : (
                      <View style={styles.emptyState}>
                        <Ionicons
                          name="chatbubble-outline"
                          size={34}
                          color={colors.textMuted}
                        />

                        <Text
                          style={
                            styles.emptyTitle
                          }
                        >
                          No messages yet
                        </Text>

                        <Text
                          style={
                            styles.emptyText
                          }
                        >
                          Send the first message to
                          the teacher team.
                        </Text>
                      </View>
                    )}
                  </ScrollView>

                  {typingUsers.length ? (
                    <View
                      style={
                        styles.typingIndicator
                      }
                    >
                      <Text
                        style={
                          styles.typingText
                        }
                      >
                        {typingUsers
                          .map(
                            (item) =>
                              item.label
                          )
                          .join(", ")}{" "}
                        {typingUsers.length === 1
                          ? "is"
                          : "are"}{" "}
                        typing...
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.composer}>
                    <TextInput
                      value={draft}
                      onChangeText={
                        handleDraftChange
                      }
                      placeholder="Write a message..."
                      placeholderTextColor={
                        colors.textMuted
                      }
                      multiline
                      editable={!sending}
                      style={styles.input}
                    />

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Send message"
                      onPress={handleSend}
                      disabled={
                        !draft.trim() ||
                        sending
                      }
                      style={({ pressed }) => [
                        styles.sendButton,
                        (!draft.trim() ||
                          sending) &&
                          styles.sendButtonDisabled,
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      {sending ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.white}
                        />
                      ) : (
                        <Ionicons
                          name="send"
                          size={20}
                          color={colors.white}
                        />
                      )}
                    </Pressable>
                  </View>
                </>
              )}
            </Card>
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  page: {
    flex: 1,
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    padding: spacing.md,
    gap: spacing.md,
  },

  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  backButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.primary,
  },

  headerMain: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.primary,
  },

  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 2,
  },

  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor:
      colors.danger + "10",
  },

  errorText: {
    flex: 1,
    color: colors.danger,
    fontWeight: "800",
  },

  dismissButton: {
    padding: spacing.xs,
  },

  chatCard: {
    flex: 1,
    padding: 0,
    overflow: "hidden",
  },

  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },

  stateText: {
    ...typography.body,
    color: colors.textMuted,
  },

  messagesScroll: {
    flex: 1,
    backgroundColor: colors.background,
  },

  messagesContent: {
    flexGrow: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },

  dateDivider: {
    alignSelf: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },

  dateDividerText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
  },

  messageRow: {
    alignItems: "flex-start",
  },

  messageRowMine: {
    alignItems: "flex-end",
  },

  messageBubble: {
    maxWidth: "78%",
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: 5,
  },

  messageBubbleOther: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  messageBubbleMine: {
    backgroundColor: colors.primary,
  },

  messageHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
  },

  messageSender: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  messageSenderMine: {
    color: colors.white,
  },

  messageRole: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.primary,
    textTransform: "uppercase",
  },

  messageRoleMine: {
    color: colors.white,
    opacity: 0.85,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
  },

  messageTextMine: {
    color: colors.white,
  },

  messageTime: {
    alignSelf: "flex-end",
    fontSize: 10,
    color: colors.textMuted,
  },

  messageTimeMine: {
    color: colors.white,
    opacity: 0.8,
  },

  emptyState: {
    flex: 1,
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
  },

  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },

  typingIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },

  typingText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },

  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 130,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    outlineStyle:
      Platform.OS === "web"
        ? "none"
        : undefined,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  sendButtonDisabled: {
    opacity: 0.45,
  },

  pressed: {
    opacity: 0.72,
  },
});