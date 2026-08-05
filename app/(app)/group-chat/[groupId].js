import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Screen } from "../../../src/components/layout/Screen";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";

import { useAuth } from "../../../src/contexts/AuthContext";

import api from "../../../src/lib/api";

import {
  connectSocket,
  socket,
} from "../../../src/lib/socket";

import {
  colors,
} from "../../../src/theme";

import { styles } from "./[groupId].styles";

const DESKTOP_BREAKPOINT = 900;
const MAX_ATTACHMENT_SIZE =
  50 * 1024 * 1024;

const TYPING_STOP_DELAY = 1200;

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

function getParamValue(value) {
  if (Array.isArray(value)) {
    return String(value[0] || "");
  }

  return String(value || "");
}

function getInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "?";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`
    .toUpperCase();
}

function getRoleLabel(user) {
  if (
    user?.role === "ASSISTANT" &&
    user?.isHeadAssistant
  ) {
    return "Head Assistant";
  }

  if (user?.role === "TEACHER") {
    return "Teacher";
  }

  if (user?.role === "ASSISTANT") {
    return "Assistant";
  }

  if (user?.role === "STUDENT") {
    return "Student";
  }

  return "Member";
}

function formatMessageTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
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
    yesterday.getDate() - 1,
  );

  const dateKey = [
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

  if (dateKey === todayKey) {
    return "Today";
  }

  if (dateKey === yesterdayKey) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (
    !Number.isFinite(size) ||
    size <= 0
  ) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(
    0,
    Math.floor(
      Number(milliseconds || 0) /
        1000,
    ),
  );

  const minutes = Math.floor(
    totalSeconds / 60,
  );

  const seconds =
    totalSeconds % 60;

  return `${minutes}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

function inferMimeType(name) {
  const extension = String(name || "")
    .split(".")
    .pop()
    .toLowerCase();

  const mimeTypes = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    mp4: "video/mp4",
    webm: "video/webm",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",
    doc: "application/msword",
    docx:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt:
      "application/vnd.ms-powerpoint",
    pptx:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip: "application/zip",
    txt: "text/plain",
    csv: "text/csv",
  };

  return (
    mimeTypes[extension] ||
    "application/octet-stream"
  );
}

function resolveAttachmentType(
  mimeType,
  name,
) {
  const type = String(
    mimeType ||
      inferMimeType(name),
  ).toLowerCase();

  if (type.startsWith("image/")) {
    return "IMAGE";
  }

  if (type === "application/pdf") {
    return "PDF";
  }

  if (type.startsWith("video/")) {
    return "VIDEO";
  }

  if (type.startsWith("audio/")) {
    return "AUDIO";
  }

  return "FILE";
}

function shouldShowDateDivider(
  messages,
  index,
) {
  if (index === 0) {
    return true;
  }

  const currentDate = new Date(
    messages[index]?.createdAt,
  );

  const previousDate = new Date(
    messages[index - 1]?.createdAt,
  );

  return (
    currentDate.getFullYear() !==
      previousDate.getFullYear() ||
    currentDate.getMonth() !==
      previousDate.getMonth() ||
    currentDate.getDate() !==
      previousDate.getDate()
  );
}

export default function GroupChatThread() {
  const params =
    useLocalSearchParams();

  const router = useRouter();

  const { user } = useAuth();

  const { width } =
    useWindowDimensions();

  const isDesktop =
    width >= DESKTOP_BREAKPOINT;

  const groupId = getParamValue(
    params.groupId,
  );

  const scrollRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);
  const initialScrollCompletedRef =
    useRef(false);

  const [group, setGroup] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [content, setContent] =
    useState("");

  const [attachment, setAttachment] =
    useState(null);

  const [typingUsers, setTypingUsers] =
    useState({});

  const [recording, setRecording] =
    useState(null);

  const [
    recordingDuration,
    setRecordingDuration,
  ] = useState(0);

  const [loading, setLoading] =
    useState(true);

  const [loadingOlder, setLoadingOlder] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [hasMore, setHasMore] =
    useState(false);

  const [nextBefore, setNextBefore] =
    useState(null);

  const [
    socketConnected,
    setSocketConnected,
  ] = useState(socket.connected);

  const [error, setError] =
    useState("");

  const loadMessages = useCallback(
    async ({
      before = null,
      older = false,
    } = {}) => {
      if (!groupId) {
        setError(
          "The group reference is missing.",
        );

        setLoading(false);
        return;
      }

      if (older) {
        setLoadingOlder(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response =
          await api.get(
            `/group-chat/${groupId}/messages`,
            {
              params: {
                limit: 40,
                ...(before
                  ? { before }
                  : {}),
              },
            },
          );

        const data =
          response.data || {};

        const loadedMessages =
          Array.isArray(data.messages)
            ? data.messages
            : [];

        setGroup(data.group || null);

        setMessages((current) => {
          if (!older) {
            return loadedMessages;
          }

          const existingIds =
            new Set(
              current.map((message) =>
                String(message.id),
              ),
            );

          const uniqueOlder =
            loadedMessages.filter(
              (message) =>
                !existingIds.has(
                  String(message.id),
                ),
            );

          return [
            ...uniqueOlder,
            ...current,
          ];
        });

        setHasMore(
          Boolean(data.hasMore),
        );

        setNextBefore(
          data.nextBefore || null,
        );

        await api.patch(
          `/group-chat/${groupId}/read`,
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Couldn't load this group chat.",
          ),
        );
      } finally {
        setLoading(false);
        setLoadingOlder(false);
      }
    },
    [groupId],
  );

  useEffect(() => {
    initialScrollCompletedRef.current =
      false;

    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!groupId) {
      return undefined;
    }

    let active = true;

    function joinGroupRoom() {
      socket.emit(
        "join-group-chat",
        {
          groupId,
        },
        (result) => {
          if (
            active &&
            result?.ok === false
          ) {
            setError(
              result.msg ||
                "Couldn't join the live group chat.",
            );
          }
        },
      );
    }

    function handleConnect() {
      if (!active) {
        return;
      }

      setSocketConnected(true);
      joinGroupRoom();
    }

    function handleDisconnect() {
      if (!active) {
        return;
      }

      setSocketConnected(false);
      setTypingUsers({});
    }

    function handleConnectError(
      connectionError,
    ) {
      if (!active) {
        return;
      }

      setSocketConnected(false);

      setError(
        connectionError?.message ||
          "Couldn't connect to live updates.",
      );
    }

    function handleNewMessage(payload) {
      if (
        String(payload?.groupId) !==
        String(groupId)
      ) {
        return;
      }

      const newMessage =
        payload?.message;

      if (!newMessage?.id) {
        return;
      }

      setMessages((current) => {
        const exists =
          current.some(
            (message) =>
              String(message.id) ===
              String(newMessage.id),
          );

        if (exists) {
          return current;
        }

        const temporaryIndex =
          current.findIndex(
            (message) =>
              message.isTemporary &&
              String(
                message.senderId,
              ) ===
                String(
                  newMessage.senderId,
                ) &&
              message.content ===
                newMessage.content &&
              message.attachmentName ===
                newMessage.attachmentName,
          );

        if (temporaryIndex !== -1) {
          const updated = [
            ...current,
          ];

          updated[temporaryIndex] =
            newMessage;

          return updated;
        }

        return [
          ...current,
          newMessage,
        ];
      });

      setTypingUsers((current) => {
        const updated = {
          ...current,
        };

        delete updated[
          newMessage.senderId
        ];

        return updated;
      });

      api.patch(
        `/group-chat/${groupId}/read`,
      ).catch(() => {});
    }

    function handleTyping(payload) {
      if (
        String(payload?.groupId) !==
          String(groupId) ||
        String(payload?.user?.id) ===
          String(user?.id)
      ) {
        return;
      }

      setTypingUsers((current) => {
        const updated = {
          ...current,
        };

        if (payload.isTyping) {
          updated[
            payload.user.id
          ] = payload.user;
        } else {
          delete updated[
            payload.user.id
          ];
        }

        return updated;
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
      "connect_error",
      handleConnectError,
    );

    socket.on(
      "new-group-chat-message",
      handleNewMessage,
    );

    socket.on(
      "group-chat-user-typing",
      handleTyping,
    );

    connectSocket().then(
      (connected) => {
        if (!active) {
          return;
        }

        if (
          connected &&
          socket.connected
        ) {
          handleConnect();
        }
      },
    );

    return () => {
      active = false;

      if (typingTimerRef.current) {
        clearTimeout(
          typingTimerRef.current,
        );
      }

      socket.emit(
        "group-chat-typing-stop",
        {
          groupId,
        },
      );

      socket.emit(
        "leave-group-chat",
        {
          groupId,
        },
      );

      socket.off(
        "connect",
        handleConnect,
      );

      socket.off(
        "disconnect",
        handleDisconnect,
      );

      socket.off(
        "connect_error",
        handleConnectError,
      );

      socket.off(
        "new-group-chat-message",
        handleNewMessage,
      );

      socket.off(
        "group-chat-user-typing",
        handleTyping,
      );
    };
  }, [
    groupId,
    user?.id,
  ]);

  useEffect(() => {
    if (
      !messages.length ||
      loadingOlder
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated:
          initialScrollCompletedRef.current,
      });

      initialScrollCompletedRef.current =
        true;
    }, 80);

    return () =>
      clearTimeout(timeout);
  }, [
    messages.length,
    loadingOlder,
  ]);

  useEffect(() => {
    return () => {
      if (recording) {
        recording
          .stopAndUnloadAsync()
          .catch(() => {});
      }
    };
  }, [recording]);

  const typingText =
    useMemo(() => {
      const people =
        Object.values(typingUsers);

      if (!people.length) {
        return "";
      }

      if (people.length === 1) {
        return `${
          people[0].name ||
          "Someone"
        } is typing...`;
      }

      if (people.length === 2) {
        return `${
          people[0].name ||
          "Someone"
        } and ${
          people[1].name ||
          "someone"
        } are typing...`;
      }

      return `${
        people[0].name ||
        "Someone"
      } and ${
        people.length - 1
      } others are typing...`;
    }, [typingUsers]);

  function stopTyping() {
    if (!isTypingRef.current) {
      return;
    }

    isTypingRef.current = false;

    socket.emit(
      "group-chat-typing-stop",
      {
        groupId,
      },
    );
  }

  function handleContentChange(value) {
    setContent(value);

    if (!socketConnected) {
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;

      socket.emit(
        "group-chat-typing-start",
        {
          groupId,
        },
      );
    }

    if (typingTimerRef.current) {
      clearTimeout(
        typingTimerRef.current,
      );
    }

    typingTimerRef.current =
      setTimeout(
        stopTyping,
        TYPING_STOP_DELAY,
      );
  }

  async function pickAttachment() {
    if (sending || recording) {
      return;
    }

    setError("");

    try {
      const result =
        await DocumentPicker
          .getDocumentAsync({
            type: [
              "application/pdf",
              "image/*",
              "video/*",
              "audio/*",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-powerpoint",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "text/plain",
              "text/csv",
              "application/zip",
            ],

            multiple: false,

            copyToCacheDirectory:
              true,
          });

      if (result.canceled) {
        return;
      }

      const asset =
        result.assets?.[0];

      if (!asset?.uri) {
        throw new Error(
          "The selected file could not be read.",
        );
      }

      if (
        asset.size &&
        asset.size >
          MAX_ATTACHMENT_SIZE
      ) {
        throw new Error(
          "The maximum chat attachment size is 50 MB.",
        );
      }

      const mimeType =
        asset.mimeType ||
        inferMimeType(asset.name);

      setAttachment({
        uri: asset.uri,

        file:
          Platform.OS === "web"
            ? asset.file || null
            : null,

        name:
          asset.name ||
          `attachment-${Date.now()}`,

        mimeType,

        size:
          asset.size || null,

        messageType:
          resolveAttachmentType(
            mimeType,
            asset.name,
          ),

        audioDuration: null,
      });
    } catch (pickerError) {
      setError(
        pickerError?.message ||
          "Couldn't select this attachment.",
      );
    }
  }

  async function startRecording() {
    if (sending || recording) {
      return;
    }

    setError("");

    try {
      const permission =
        await Audio
          .requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission",
          "Microphone access is required to record a voice message.",
        );

        return;
      }

      await Audio
        .setAudioModeAsync({
          allowsRecordingIOS:
            true,

          playsInSilentModeIOS:
            true,
        });

      const created =
        await Audio.Recording
          .createAsync(
            Audio
              .RecordingOptionsPresets
              .HIGH_QUALITY,

            (status) => {
              if (
                status.isRecording
              ) {
                setRecordingDuration(
                  status.durationMillis ||
                    0,
                );
              }
            },

            250,
          );

      setAttachment(null);

      setRecording(
        created.recording,
      );

      setRecordingDuration(0);
    } catch (recordingError) {
      setError(
        recordingError?.message ||
          "Couldn't start recording.",
      );
    }
  }

  async function stopRecording({
    discard = false,
  } = {}) {
    if (!recording) {
      return;
    }

    const currentRecording =
      recording;

    const duration =
      recordingDuration;

    setRecording(null);
    setRecordingDuration(0);

    try {
      await currentRecording
        .stopAndUnloadAsync();

      await Audio
        .setAudioModeAsync({
          allowsRecordingIOS:
            false,
        });

      if (discard) {
        return;
      }

      const uri =
        currentRecording.getURI();

      if (!uri) {
        throw new Error(
          "The recording could not be saved.",
        );
      }

      setAttachment({
        uri,
        file: null,

        name:
          `voice-message-${Date.now()}.m4a`,

        mimeType:
          "audio/mp4",

        size: null,

        messageType:
          "AUDIO",

        audioDuration:
          duration,
      });
    } catch (recordingError) {
      setError(
        recordingError?.message ||
          "Couldn't finish the recording.",
      );
    }
  }

  async function appendAttachment(
    formData,
  ) {
    if (!attachment) {
      return;
    }

    if (
      Platform.OS === "web" &&
      attachment.file
    ) {
      formData.append(
        "attachment",
        attachment.file,
        attachment.name,
      );

      return;
    }

    if (Platform.OS === "web") {
      const response =
        await fetch(
          attachment.uri,
        );

      if (!response.ok) {
        throw new Error(
          "The attachment could not be prepared.",
        );
      }

      const blob =
        await response.blob();

      formData.append(
        "attachment",
        blob,
        attachment.name,
      );

      return;
    }

    formData.append(
      "attachment",
      {
        uri: attachment.uri,
        name: attachment.name,
        type:
          attachment.mimeType ||
          "application/octet-stream",
      },
    );
  }

  async function sendMessage() {
    const text =
      content.trim();

    if (
      (!text && !attachment) ||
      sending ||
      recording
    ) {
      return;
    }

    stopTyping();

    setSending(true);
    setError("");

    const temporaryId =
      `temporary-${Date.now()}`;

    const temporaryMessage = {
      id: temporaryId,
      groupId,
      senderId: user?.id,

      messageType:
        attachment
          ?.messageType ||
        "TEXT",

      content:
        text || null,

      attachmentUrl:
        attachment
          ?.messageType ===
        "IMAGE"
          ? attachment.uri
          : null,

      attachmentName:
        attachment?.name ||
        null,

      attachmentMimeType:
        attachment?.mimeType ||
        null,

      attachmentSize:
        attachment?.size ||
        null,

      audioDuration:
        attachment
          ?.audioDuration ||
        null,

      createdAt:
        new Date()
          .toISOString(),

      sender: {
        id: user?.id,
        name:
          user?.name ||
          "You",

        role:
          user?.role,

        isHeadAssistant:
          Boolean(
            user
              ?.isHeadAssistant,
          ),
      },

      isTemporary: true,
    };

    setMessages((current) => [
      ...current,
      temporaryMessage,
    ]);

    try {
      const formData =
        new FormData();

      if (text) {
        formData.append(
          "content",
          text,
        );
      }

      if (attachment) {
        formData.append(
          "messageType",
          attachment
            .messageType,
        );

        if (
          attachment
            .audioDuration !==
            null &&
          attachment
            .audioDuration !==
            undefined
        ) {
          formData.append(
            "audioDuration",
            String(
              attachment
                .audioDuration,
            ),
          );
        }

        await appendAttachment(
          formData,
        );
      }

      const response =
        await api.post(
          `/group-chat/${groupId}/messages`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          },
        );

      const createdMessage =
        response.data?.message ||
        response.data;

      setContent("");
      setAttachment(null);

      setMessages((current) => {
        const withoutTemporary =
          current.filter(
            (message) =>
              message.id !==
              temporaryId,
          );

        if (
          !createdMessage?.id
        ) {
          return withoutTemporary;
        }

        const exists =
          withoutTemporary.some(
            (message) =>
              String(
                message.id,
              ) ===
              String(
                createdMessage.id,
              ),
          );

        return exists
          ? withoutTemporary
          : [
              ...withoutTemporary,
              createdMessage,
            ];
      });

      await api.patch(
        `/group-chat/${groupId}/read`,
      );
    } catch (requestError) {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !==
            temporaryId,
        ),
      );

      setError(
        getErrorMessage(
          requestError,
          "Couldn't send your message.",
        ),
      );
    } finally {
      setSending(false);
    }
  }

  async function loadOlderMessages() {
    if (
      !hasMore ||
      !nextBefore ||
      loadingOlder
    ) {
      return;
    }

    await loadMessages({
      before: nextBefore,
      older: true,
    });
  }

  if (loading) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={styles.loadingText}
        >
          Loading group chat...
        </Text>
      </Screen>
    );
  }

  if (!group) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <Card
          style={
            styles.unavailableCard
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color={colors.danger}
          />

          <Text
            style={
              styles.unavailableTitle
            }
          >
            Group chat unavailable
          </Text>

          <Text
            style={
              styles.unavailableText
            }
          >
            {error ||
              "This group chat could not be loaded."}
          </Text>

          <View
            style={
              styles.unavailableActions
            }
          >
            <Button
              title="Back"
              variant="outline"
              onPress={() =>
                router.back()
              }
              style={
                styles.flexButton
              }
            />

            <Button
              title="Retry"
              onPress={() =>
                loadMessages()
              }
              style={
                styles.flexButton
              }
            />
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === "ios"
          ? 70
          : 0
      }
    >
      <View style={styles.page}>
        <View style={styles.topBar}>
          <View
            style={[
              styles.topBarContent,
              isDesktop &&
                styles.topBarContentDesktop,
            ]}
          >
            <Pressable
              onPress={() =>
                router.back()
              }
              style={({
                pressed,
              }) => [
                styles.backButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color={colors.primary}
              />
            </Pressable>

            <View
              style={
                styles.groupAvatar
              }
            >
              <Text
                style={
                  styles.groupAvatarText
                }
              >
                {getInitials(
                  group.name,
                )}
              </Text>
            </View>

            <View
              style={
                styles.titleArea
              }
            >
              <Text
                numberOfLines={1}
                style={
                  styles.groupName
                }
              >
                {group.name}
              </Text>

              <View
                style={
                  styles.groupMetaRow
                }
              >
                {group.year?.name ? (
                  <Text
                    style={
                      styles.groupMetaText
                    }
                  >
                    {group.year.name}
                  </Text>
                ) : null}

                <View
                  style={[
                    styles.statusDot,

                    socketConnected
                      ? styles.statusOnline
                      : styles.statusOffline,
                  ]}
                />

                <Text
                  style={
                    styles.groupMetaText
                  }
                >
                  {socketConnected
                    ? "Live"
                    : "Reconnecting"}
                </Text>
              </View>
            </View>

            <Badge
              label="GROUP"
              tone="neutral"
            />
          </View>
        </View>

        {error ? (
          <View
            style={
              styles.errorBanner
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>

            <Pressable
              onPress={() =>
                setError("")
              }
            >
              <Ionicons
                name="close"
                size={19}
                color={colors.danger}
              />
            </Pressable>
          </View>
        ) : null}

        <View
          style={[
            styles.workspace,
            isDesktop &&
              styles.workspaceDesktop,
          ]}
        >
          <View
            style={
              styles.conversationColumn
            }
          >
            <ScrollView
              ref={scrollRef}
              style={
                styles.messagesScroll
              }
              contentContainerStyle={
                styles.messagesContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
            >
              {hasMore ? (
                <Button
                  title={
                    loadingOlder
                      ? "Loading..."
                      : "Load older messages"
                  }
                  variant="outline"
                  loading={
                    loadingOlder
                  }
                  disabled={
                    loadingOlder
                  }
                  onPress={
                    loadOlderMessages
                  }
                  style={
                    styles.loadOlderButton
                  }
                />
              ) : null}

              {!messages.length ? (
                <View
                  style={
                    styles.emptyMessages
                  }
                >
                  <View
                    style={
                      styles.emptyIcon
                    }
                  >
                    <Ionicons
                      name="chatbubbles-outline"
                      size={38}
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    Start the conversation
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    Messages sent here are visible to
                    authorized members of this group.
                  </Text>
                </View>
              ) : (
                messages.map(
                  (
                    message,
                    index,
                  ) => (
                    <React.Fragment
                      key={
                        message.id ||
                        `${message.senderId}-${index}`
                      }
                    >
                      {shouldShowDateDivider(
                        messages,
                        index,
                      ) ? (
                        <DateDivider
                          value={
                            message.createdAt
                          }
                        />
                      ) : null}

                      <MessageBubble
                        message={
                          message
                        }
                        mine={
                          String(
                            message
                              .senderId,
                          ) ===
                          String(
                            user?.id,
                          )
                        }
                      />
                    </React.Fragment>
                  ),
                )
              )}

              {typingText ? (
                <TypingIndicator
                  text={
                    typingText
                  }
                />
              ) : null}
            </ScrollView>

            <MessageComposer
              value={content}
              attachment={
                attachment
              }
              recording={
                recording
              }
              recordingDuration={
                recordingDuration
              }
              sending={sending}
              connected={
                socketConnected
              }
              onChangeText={
                handleContentChange
              }
              onPickAttachment={
                pickAttachment
              }
              onRemoveAttachment={() =>
                setAttachment(null)
              }
              onStartRecording={
                startRecording
              }
              onStopRecording={() =>
                stopRecording({
                  discard: false,
                })
              }
              onCancelRecording={() =>
                stopRecording({
                  discard: true,
                })
              }
              onSend={
                sendMessage
              }
            />
          </View>

          {isDesktop ? (
            <View
              style={
                styles.detailsColumn
              }
            >
              <Card
                style={
                  styles.detailsCard
                }
              >
                <View
                  style={
                    styles.detailsIcon
                  }
                >
                  <Ionicons
                    name="people-circle-outline"
                    size={31}
                    color={colors.primary}
                  />
                </View>

                <Text
                  style={
                    styles.detailsTitle
                  }
                >
                  {group.name}
                </Text>

                {group.year?.name ? (
                  <Text
                    style={
                      styles.detailsSubtitle
                    }
                  >
                    {group.year.name}
                  </Text>
                ) : null}

                <View
                  style={
                    styles.detailsDivider
                  }
                />

                <DetailRow
                  icon="chatbubbles-outline"
                  label="Chat type"
                  value="Group conversation"
                />

                <DetailRow
                  icon="shield-checkmark-outline"
                  label="Access"
                  value="Authorized members"
                />

                <DetailRow
                  icon={
                    socketConnected
                      ? "radio-outline"
                      : "cloud-offline-outline"
                  }
                  label="Connection"
                  value={
                    socketConnected
                      ? "Live"
                      : "Reconnecting"
                  }
                />
              </Card>

              <Card
                style={
                  styles.noticeCard
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={23}
                  color={colors.primary}
                />

                <Text
                  style={
                    styles.noticeText
                  }
                >
                  Use Tickets for private support.
                  Messages in this page are visible to
                  the group’s authorized participants.
                </Text>
              </Card>
            </View>
          ) : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function DateDivider({
  value,
}) {
  return (
    <View
      style={
        styles.dateDivider
      }
    >
      <View
        style={
          styles.dateDividerLine
        }
      />

      <Text
        style={
          styles.dateDividerText
        }
      >
        {formatMessageDate(
          value,
        )}
      </Text>

      <View
        style={
          styles.dateDividerLine
        }
      />
    </View>
  );
}

function MessageBubble({
  message,
  mine,
}) {
  const sender =
    message.sender || {};

  const senderName =
    sender.name ||
    (mine
      ? "You"
      : "Unknown user");

  return (
    <View
      style={[
        styles.messageRow,

        mine
          ? styles.messageRowMine
          : styles.messageRowOther,
      ]}
    >
      {!mine ? (
        <View
          style={
            styles.messageAvatar
          }
        >
          <Text
            style={
              styles.messageAvatarText
            }
          >
            {getInitials(
              senderName,
            )}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.messageGroup,

          mine &&
            styles.messageGroupMine,
        ]}
      >
        <View
          style={[
            styles.senderRow,

            mine &&
              styles.senderRowMine,
          ]}
        >
          <Text
            style={
              styles.senderName
            }
          >
            {mine
              ? "You"
              : senderName}
          </Text>

          <View
            style={
              styles.roleBadge
            }
          >
            <Text
              style={
                styles.roleBadgeText
              }
            >
              {getRoleLabel(
                sender,
              )}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.messageBubble,

            mine
              ? styles.messageBubbleMine
              : styles.messageBubbleOther,

            message.isTemporary &&
              styles.temporaryMessage,
          ]}
        >
          <MessageAttachment
            message={message}
            mine={mine}
          />

          {message.content ? (
            <Text
              style={[
                styles.messageText,

                mine &&
                  styles.messageTextMine,
              ]}
            >
              {message.content}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.messageTimeRow,

            mine &&
              styles.messageTimeRowMine,
          ]}
        >
          {message.isTemporary ? (
            <ActivityIndicator
              size="small"
              color={colors.textMuted}
            />
          ) : null}

          <Text
            style={
              styles.messageTime
            }
          >
            {message.isTemporary
              ? "Sending..."
              : formatMessageTime(
                  message.createdAt,
                )}
          </Text>

          {mine &&
          !message.isTemporary ? (
            <Ionicons
              name="checkmark-done"
              size={14}
              color={colors.textMuted}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function MessageAttachment({
  message,
  mine,
}) {
  const type =
    message.messageType ||
    "TEXT";

  const url =
    message.attachmentUrl;

  if (!url) {
    return null;
  }

  if (type === "IMAGE") {
    return (
      <Pressable
        onPress={() =>
          Linking.openURL(url)
        }
      >
        <Image
          source={{ uri: url }}
          resizeMode="cover"
          style={
            styles.messageImage
          }
        />
      </Pressable>
    );
  }

  if (type === "AUDIO") {
    return (
      <VoiceMessagePlayer
        url={url}
        duration={
          message.audioDuration
        }
        mine={mine}
      />
    );
  }

  return (
    <Pressable
      onPress={() =>
        Linking.openURL(url)
      }
      style={
        styles.fileCard
      }
    >
      <View
        style={
          styles.fileIcon
        }
      >
        <Ionicons
          name={
            type === "PDF"
              ? "document-text-outline"
              : type === "VIDEO"
                ? "videocam-outline"
                : "document-attach-outline"
          }
          size={22}
          color={colors.primary}
        />
      </View>

      <View
        style={
          styles.fileCopy
        }
      >
        <Text
          numberOfLines={1}
          style={
            styles.fileName
          }
        >
          {message.attachmentName ||
            "Attachment"}
        </Text>

        <Text
          style={
            styles.fileMeta
          }
        >
          {[
            type === "PDF"
              ? "PDF"
              : type === "VIDEO"
                ? "Video"
                : "File",

            formatFileSize(
              message
                .attachmentSize,
            ),
          ]
            .filter(Boolean)
            .join(" • ")}
        </Text>
      </View>

      <Ionicons
        name="open-outline"
        size={20}
        color={colors.primary}
      />
    </Pressable>
  );
}

function VoiceMessagePlayer({
  url,
  duration,
  mine,
}) {
  const soundRef =
    useRef(null);

  const [playing, setPlaying] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [position, setPosition] =
    useState(0);

  const [totalDuration, setTotalDuration] =
    useState(
      Number(duration || 0),
    );

  useEffect(() => {
    return () => {
      soundRef.current
        ?.unloadAsync()
        .catch(() => {});
    };
  }, []);

  async function togglePlayback() {
    try {
      setLoading(true);

      if (!soundRef.current) {
        const result =
          await Audio.Sound
            .createAsync(
              { uri: url },

              {
                shouldPlay: true,
              },

              (status) => {
                if (
                  !status.isLoaded
                ) {
                  return;
                }

                setPlaying(
                  status.isPlaying,
                );

                setPosition(
                  status.positionMillis ||
                    0,
                );

                setTotalDuration(
                  status.durationMillis ||
                    totalDuration,
                );

                if (
                  status
                    .didJustFinish
                ) {
                  setPlaying(false);
                  setPosition(0);

                  soundRef.current
                    ?.setPositionAsync(
                      0,
                    )
                    .catch(() => {});
                }
              },
            );

        soundRef.current =
          result.sound;

        setPlaying(true);
        return;
      }

      const status =
        await soundRef.current
          .getStatusAsync();

      if (!status.isLoaded) {
        return;
      }

      if (status.isPlaying) {
        await soundRef.current
          .pauseAsync();
      } else {
        await soundRef.current
          .playAsync();
      }
    } catch {
      Alert.alert(
        "Voice message",
        "This voice message could not be played.",
      );
    } finally {
      setLoading(false);
    }
  }

  const progress =
    totalDuration > 0
      ? Math.min(
          position /
            totalDuration,
          1,
        )
      : 0;

  return (
    <View
      style={[
        styles.audioCard,

        mine &&
          styles.audioCardMine,
      ]}
    >
      <Pressable
        onPress={togglePlayback}
        style={[
          styles.audioPlayButton,

          mine &&
            styles.audioPlayButtonMine,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              mine
                ? colors.primary
                : colors.white
            }
          />
        ) : (
          <Ionicons
            name={
              playing
                ? "pause"
                : "play"
            }
            size={19}
            color={
              mine
                ? colors.primary
                : colors.white
            }
          />
        )}
      </Pressable>

      <View
        style={
          styles.audioProgressArea
        }
      >
        <View
          style={[
            styles.audioProgressTrack,

            mine &&
              styles.audioProgressTrackMine,
          ]}
        >
          <View
            style={[
              styles.audioProgressFill,

              {
                width:
                  `${progress * 100}%`,
              },

              mine &&
                styles.audioProgressFillMine,
            ]}
          />
        </View>

        <Text
          style={[
            styles.audioDuration,

            mine &&
              styles.audioDurationMine,
          ]}
        >
          {formatDuration(
            position ||
              totalDuration,
          )}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator({
  text,
}) {
  return (
    <View
      style={
        styles.typingRow
      }
    >
      <View
        style={
          styles.typingDots
        }
      >
        <View
          style={
            styles.typingDot
          }
        />

        <View
          style={
            styles.typingDot
          }
        />

        <View
          style={
            styles.typingDot
          }
        />
      </View>

      <Text
        style={
          styles.typingText
        }
      >
        {text}
      </Text>
    </View>
  );
}

function MessageComposer({
  value,
  attachment,
  recording,
  recordingDuration,
  sending,
  connected,
  onChangeText,
  onPickAttachment,
  onRemoveAttachment,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onSend,
}) {
  const canSend =
    Boolean(
      value.trim() ||
      attachment,
    ) &&
    !sending &&
    !recording;

  return (
    <View
      style={
        styles.composerContainer
      }
    >
      {!connected ? (
        <View
          style={
            styles.offlineNotice
          }
        >
          <Ionicons
            name="cloud-offline-outline"
            size={16}
            color={colors.warning}
          />

          <Text
            style={
              styles.offlineNoticeText
            }
          >
            Live connection is reconnecting. REST
            messages can still be sent.
          </Text>
        </View>
      ) : null}

      {recording ? (
        <View
          style={
            styles.recordingRow
          }
        >
          <View
            style={
              styles.recordingIndicator
            }
          />

          <Text
            style={
              styles.recordingText
            }
          >
            Recording{" "}
            {formatDuration(
              recordingDuration,
            )}
          </Text>

          <Pressable
            onPress={
              onCancelRecording
            }
            style={
              styles.cancelRecordingButton
            }
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={colors.danger}
            />
          </Pressable>

          <Button
            title="Finish"
            variant="outline"
            onPress={
              onStopRecording
            }
          />
        </View>
      ) : (
        <>
          {attachment ? (
            <View
              style={
                styles.selectedAttachment
              }
            >
              <View
                style={
                  styles.selectedAttachmentIcon
                }
              >
                <Ionicons
                  name={
                    attachment.messageType ===
                    "IMAGE"
                      ? "image-outline"
                      : attachment.messageType ===
                          "AUDIO"
                        ? "mic-outline"
                        : attachment.messageType ===
                            "VIDEO"
                          ? "videocam-outline"
                          : "document-attach-outline"
                  }
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View
                style={
                  styles.selectedAttachmentCopy
                }
              >
                <Text
                  numberOfLines={1}
                  style={
                    styles.selectedAttachmentName
                  }
                >
                  {attachment.name}
                </Text>

                <Text
                  style={
                    styles.selectedAttachmentMeta
                  }
                >
                  {[
                    attachment
                      .messageType,

                    formatFileSize(
                      attachment
                        .size,
                    ),

                    attachment
                      .messageType ===
                    "AUDIO"
                      ? formatDuration(
                          attachment
                            .audioDuration,
                        )
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </Text>
              </View>

              <Pressable
                onPress={
                  onRemoveAttachment
                }
                style={
                  styles.removeAttachmentButton
                }
              >
                <Ionicons
                  name="close"
                  size={19}
                  color={colors.danger}
                />
              </Pressable>
            </View>
          ) : null}

          <View
            style={
              styles.composerRow
            }
          >
            <Pressable
              disabled={sending}
              onPress={
                onPickAttachment
              }
              style={
                styles.composerIconButton
              }
            >
              <Ionicons
                name="attach-outline"
                size={23}
                color={colors.primary}
              />
            </Pressable>

            <Pressable
              disabled={sending}
              onPress={
                onStartRecording
              }
              style={
                styles.composerIconButton
              }
            >
              <Ionicons
                name="mic-outline"
                size={22}
                color={colors.primary}
              />
            </Pressable>

            <View
              style={
                styles.inputContainer
              }
            >
              <TextInput
                value={value}
                onChangeText={
                  onChangeText
                }
                placeholder="Write a message..."
                placeholderTextColor={
                  colors.textMuted
                }
                multiline
                textAlignVertical="center"
                maxLength={5000}
                style={
                  styles.messageInput
                }
              />
            </View>

            <Pressable
              disabled={!canSend}
              onPress={onSend}
              style={[
                styles.sendButton,

                !canSend &&
                  styles.sendButtonDisabled,
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
      style={
        styles.detailRow
      }
    >
      <View
        style={
          styles.detailRowIcon
        }
      >
        <Ionicons
          name={icon}
          size={19}
          color={colors.primary}
        />
      </View>

      <View
        style={
          styles.detailRowCopy
        }
      >
        <Text
          style={
            styles.detailRowLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.detailRowValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}