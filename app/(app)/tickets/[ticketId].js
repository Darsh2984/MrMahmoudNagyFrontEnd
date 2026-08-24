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
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Screen } from "../../../src/components/layout/Screen";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";
import { useAuth } from "../../../src/contexts/AuthContext";

import api from "../../../src/lib/api";
import {
  connectSocket,
  socket,
} from "../../../src/lib/socket";

import {
  colors,
  spacing,
} from "../../../src/theme";

import { styles } from "./[ticketId].styles";

const DESKTOP_BREAKPOINT = 900;
const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024;
const TYPING_STOP_DELAY = 1200;

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    tone: "danger",
    color: colors.danger,
    icon: "alert-circle-outline",
    description: "This ticket is waiting for a resolution.",
  },

  RESOLVED_PENDING_CONFIRM: {
    label: "Awaiting confirmation",
    tone: "warning",
    color: colors.warning,
    icon: "time-outline",
    description:
      "The support team marked this ticket as resolved and is waiting for the student to confirm.",
  },

  CONFIRMED_RESOLVED: {
    label: "Resolved",
    tone: "success",
    color: colors.secondary,
    icon: "checkmark-circle-outline",
    description:
      "The student confirmed that the issue was resolved.",
  },

  REOPENED: {
    label: "Reopened",
    tone: "danger",
    color: colors.danger,
    icon: "refresh-circle-outline",
    description:
      "The issue was not resolved and the ticket has been reopened.",
  },
};

export default function TicketThread() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  const recorderState = useAudioRecorderState(
    audioRecorder,
    250
  );

  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const ticketId = Array.isArray(params.ticketId)
    ? params.ticketId[0]
    : params.ticketId;

  const scrollRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  const [attachment, setAttachment] = useState(null);

  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const [typingUsers, setTypingUsers] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [socketConnected, setSocketConnected] = useState(
    socket.connected
  );

  const [error, setError] = useState("");

  const isStudent = user?.role === "STUDENT";

  const isAssignedAssistant =
    String(ticket?.assignedAssistant?.id) ===
    String(user?.id);

  const isAdminLevel =
    user?.role === "TEACHER" ||
    Boolean(user?.isHeadAssistant);

  const canResolve =
    (isAssignedAssistant || isAdminLevel) &&
    (ticket?.status === "OPEN" ||
      ticket?.status === "REOPENED");

  const canConfirmResolution =
    isStudent &&
    ticket?.status === "RESOLVED_PENDING_CONFIRM";

  const conversationClosed =
    ticket?.status === "CONFIRMED_RESOLVED";

  const statusConfig =
    STATUS_CONFIG[ticket?.status] ||
    STATUS_CONFIG.OPEN;

  const load = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (!ticketId) {
        setError("The ticket reference is missing.");
        setLoading(false);
        return;
      }

      setError("");

      if (isRefresh) {
        setRefreshing(true);
      }

      try {
        const response = await api.get(
          `/tickets/${ticketId}`
        );

        const loadedTicket = response.data;

        setTicket(loadedTicket);
        setMessages(loadedTicket?.messages ?? []);
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            err.response?.data?.message ||
            "Couldn't load this ticket."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [ticketId]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!ticketId) {
      return undefined;
    }

    let active = true;

    function handleConnect() {
      if (!active) return;

      setSocketConnected(true);

      socket.emit(
        "join-ticket",
        { ticketId },
        (result) => {
          if (result?.ok === false) {
            setError(
              result.msg ||
                "Couldn't join the live conversation."
            );
          }
        }
      );
    }

    function handleDisconnect() {
      if (!active) return;

      setSocketConnected(false);
      setTypingUsers({});
    }

    function handleConnectError(err) {
      if (!active) return;

      setSocketConnected(false);

      setError(
        err?.message ||
          "Couldn't connect to live updates."
      );
    }

    function handleMessage(message) {
      if (
        String(message.ticketId) !==
        String(ticketId)
      ) {
        return;
      }

      setMessages((current) => {
        const temporaryIndex = current.findIndex(
          (item) =>
            item.isTemporary &&
            item.clientRequestId &&
            item.clientRequestId ===
              message.clientRequestId
        );

        if (temporaryIndex !== -1) {
          const updated = [...current];
          updated[temporaryIndex] = message;
          return updated;
        }

        const exists = current.some(
          (item) =>
            String(item.id) === String(message.id)
        );

        if (exists) {
          return current;
        }

        return [...current, message];
      });

      setTypingUsers((current) => {
        const updated = { ...current };
        delete updated[message.senderId];
        return updated;
      });
    }

    function handleTyping(payload) {
      if (
        String(payload.ticketId) !==
          String(ticketId) ||
        String(payload.user?.id) ===
          String(user?.id)
      ) {
        return;
      }

      setTypingUsers((current) => {
        const updated = { ...current };

        if (payload.isTyping) {
          updated[payload.user.id] = payload.user;
        } else {
          delete updated[payload.user.id];
        }

        return updated;
      });
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("new-ticket-message", handleMessage);
    socket.on("ticket-user-typing", handleTyping);

    connectSocket().then((connected) => {
      if (!active) return;

      if (connected && socket.connected) {
        handleConnect();
      }
    });

    return () => {
      active = false;

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      socket.emit("ticket-typing-stop", {
        ticketId,
      });

      socket.emit("leave-ticket", {
        ticketId,
      });

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off(
        "connect_error",
        handleConnectError
      );
      socket.off(
        "new-ticket-message",
        handleMessage
      );
      socket.off(
        "ticket-user-typing",
        handleTyping
      );
    };
  }, [ticketId, user?.id]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: messages.length > 1,
      });
    }, 80);

    return () => clearTimeout(timeout);
  }, [messages, typingUsers]);

  useEffect(() => {
  if (recording) {
    setRecordingDuration(
      recorderState.durationMillis || 0
    );
  }
}, [
  recording,
  recorderState.durationMillis,
]);

useEffect(() => {
  return () => {
    if (audioRecorder.isRecording) {
      audioRecorder.stop().catch(() => {});
    }
  };
}, [audioRecorder]);

  const studentName =
    ticket?.createdBy?.name || "Student";

  const participant = useMemo(() => {
    if (!ticket) return null;

    if (isStudent) {
      return {
        label: "Assigned support",
        name:
          ticket.assignedAssistant?.name ||
          "Waiting for assignment",
        icon: "headset-outline",
      };
    }

    return {
      label: "Student",
      name: studentName,
      icon: "person-outline",
    };
  }, [ticket, isStudent, studentName]);

  const formattedCreatedDate = useMemo(() => {
    if (!ticket?.createdAt) return "";

    return formatDateTime(ticket.createdAt);
  }, [ticket?.createdAt]);

  const typingText = useMemo(() => {
    const people = Object.values(typingUsers);

    if (people.length === 0) {
      return "";
    }

    if (people.length === 1) {
      return `${people[0].name || "Someone"} is typing...`;
    }

    if (people.length === 2) {
      return `${
        people[0].name || "Someone"
      } and ${
        people[1].name || "someone"
      } are typing...`;
    }

    return `${people[0].name || "Someone"} and ${
      people.length - 1
    } others are typing...`;
  }, [typingUsers]);

  function stopTyping() {
    if (!isTypingRef.current) {
      return;
    }

    isTypingRef.current = false;

    socket.emit("ticket-typing-stop", {
      ticketId,
    });
  }

  function handleContentChange(value) {
    setContent(value);

    if (
      !socketConnected ||
      conversationClosed
    ) {
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;

      socket.emit("ticket-typing-start", {
        ticketId,
      });
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(
      stopTyping,
      TYPING_STOP_DELAY
    );
  }

  async function pickAttachment() {
    if (sending || conversationClosed) {
      return;
    }

    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: [
            "application/pdf",
            "image/*",
            "video/*",
            "audio/*",
          ],
          multiple: false,
          copyToCacheDirectory: true,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        throw new Error(
          "The selected file could not be read."
        );
      }

      if (
        asset.size &&
        asset.size > MAX_ATTACHMENT_SIZE
      ) {
        throw new Error(
          "The maximum attachment size is 50 MB."
        );
      }

      setAttachment({
        uri: asset.uri,
        name:
          asset.name ||
          `attachment-${Date.now()}`,
        mimeType:
          asset.mimeType ||
          inferMimeType(asset.name),
        size: asset.size || null,
        messageType: resolveAttachmentType(
          asset.mimeType,
          asset.name
        ),
        audioDuration: null,
      });
    } catch (err) {
      setError(
        err.message ||
          "Couldn't select this attachment."
      );
    }
  }

  async function startRecording() {
    if (sending || conversationClosed) {
      return;
    }

    try {
      setError("");

      const permission =
        await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission",
          "Microphone access is required to record a voice message."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      setAttachment(null);
      setRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      setError(
        err.message ||
          "Couldn't start voice recording."
      );
    }
  }

  async function stopRecording({
    discard = false,
  } = {}) {
    if (!recording) {
      return;
    }

    const duration =
      recorderState.durationMillis ||
      recordingDuration;

    try {
      await audioRecorder.stop();

      await setAudioModeAsync({
        allowsRecording: false,
      });

      const uri = audioRecorder.uri;

      setRecording(false);
      setRecordingDuration(0);

      if (discard) {
        return;
      }

      if (!uri) {
        throw new Error(
          "The voice recording could not be saved."
        );
      }

      setAttachment({
        uri,
        name: `voice-message-${Date.now()}.m4a`,
        mimeType: "audio/mp4",
        size: null,
        messageType: "AUDIO",
        audioDuration: duration,
      });
    } catch (err) {
      setRecording(false);
      setRecordingDuration(0);

      setError(
        err.message ||
          "Couldn't finish voice recording."
      );
    }
  }

  async function sendMessage() {
    const text = content.trim();

    if (
      (!text && !attachment) ||
      sending ||
      conversationClosed ||
      recording
    ) {
      return;
    }

    stopTyping();
    setSending(true);
    setError("");

    const temporaryId = `temporary-${Date.now()}`;

    const temporaryMessage = {
      id: temporaryId,
      ticketId,
      senderId: user?.id,
      senderType:
        user?.role === "STUDENT"
          ? "STUDENT"
          : "ASSISTANT",
      content: text || null,
      messageType:
        attachment?.messageType || "TEXT",
      attachmentUrl:
        attachment?.messageType === "IMAGE"
          ? attachment.uri
          : null,
      attachmentName:
        attachment?.name || null,
      attachmentMimeType:
        attachment?.mimeType || null,
      attachmentSize:
        attachment?.size || null,
      audioDuration:
        attachment?.audioDuration || null,
      createdAt: new Date().toISOString(),
      sender: {
        id: user?.id,
        name: user?.name || "You",
        role: user?.role,
        isHeadAssistant:
          Boolean(user?.isHeadAssistant),
      },
      isTemporary: true,
    };

    setMessages((current) => [
      ...current,
      temporaryMessage,
    ]);

    try {
      const formData = new FormData();

      if (text) {
        formData.append("content", text);
      }

      if (attachment) {
        formData.append(
          "messageType",
          attachment.messageType
        );

        if (
          attachment.audioDuration !== null &&
          attachment.audioDuration !== undefined
        ) {
          formData.append(
            "audioDuration",
            String(attachment.audioDuration)
          );
        }

        if (Platform.OS === "web") {
          const response = await fetch(
            attachment.uri
          );

          const blob = await response.blob();

          formData.append(
            "attachment",
            blob,
            attachment.name
          );
        } else {
          formData.append("attachment", {
            uri: attachment.uri,
            name: attachment.name,
            type:
              attachment.mimeType ||
              "application/octet-stream",
          });
        }
      }

      const response = await api.post(
        `/tickets/${ticketId}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const createdMessage =
        response.data?.message ||
        response.data;

      setContent("");
      setAttachment(null);

      if (createdMessage?.id) {
        setMessages((current) => {
          const withoutTemporary = current.filter(
            (message) =>
              message.id !== temporaryId
          );

          const alreadyExists =
            withoutTemporary.some(
              (message) =>
                String(message.id) ===
                String(createdMessage.id)
            );

          return alreadyExists
            ? withoutTemporary
            : [
                ...withoutTemporary,
                createdMessage,
              ];
        });
      }
    } catch (err) {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== temporaryId
        )
      );

      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          "Couldn't send your message."
      );
    } finally {
      setSending(false);
    }
  }

  async function markResolved() {
    if (updatingStatus) return;

    setUpdatingStatus(true);
    setError("");

    try {
      await api.patch(
        `/tickets/${ticketId}/resolve`
      );

      await load();
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Couldn't mark the ticket as resolved."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function confirmResolution(resolved) {
    if (updatingStatus) return;

    setUpdatingStatus(true);
    setError("");

    try {
      await api.patch(
        `/tickets/${ticketId}/confirm`,
        { resolved }
      );

      await load();
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Couldn't update the resolution."
      );
    } finally {
      setUpdatingStatus(false);
    }
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
          Loading conversation...
        </Text>
      </Screen>
    );
  }

  if (!ticket) {
    return (
      <Screen
        scroll={false}
        style={styles.centeredScreen}
      >
        <Card style={styles.unavailableCard}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color={colors.danger}
          />

          <Text style={styles.unavailableTitle}>
            Ticket unavailable
          </Text>

          <Text
            style={
              styles.unavailableDescription
            }
          >
            {error ||
              "This ticket could not be loaded."}
          </Text>

          <View style={styles.unavailableActions}>
            <Button
              title="Back"
              variant="outline"
              onPress={() => router.back()}
              style={styles.flexButton}
            />

            <Button
              title="Retry"
              onPress={() => load()}
              style={styles.flexButton}
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
        Platform.OS === "ios" ? 70 : 0
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
              onPress={() => router.back()}
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
            </Pressable>

            <View style={styles.titleArea}>
              <Text
                style={styles.ticketSubject}
                numberOfLines={1}
              >
                {ticket.subject}
              </Text>

              <View style={styles.studentHeaderRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={17}
                  color={colors.primary}
                />

                <Text
                  style={styles.studentHeaderName}
                  numberOfLines={1}
                >
                  Student: {studentName}
                </Text>
              </View>

              <View style={styles.titleMetaRow}>
                {ticket.category?.name ? (
                  <Text style={styles.metaText}>
                    {ticket.category.name}
                  </Text>
                ) : null}

                {formattedCreatedDate ? (
                  <Text style={styles.metaText}>
                    {formattedCreatedDate}
                  </Text>
                ) : null}
              </View>
            </View>

            <Badge
              label={statusConfig.label}
              tone={statusConfig.tone}
            />
          </View>
        </View>

        {error ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              onPress={() => setError("")}
            >
              <Ionicons
                name="close"
                size={20}
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
          <View style={styles.conversationColumn}>
            <ScrollView
              ref={scrollRef}
              style={styles.messagesScroll}
              contentContainerStyle={
                styles.messagesContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.conversationIntro}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={30}
                  color={colors.primary}
                />

                <Text style={styles.introTitle}>
                  Conversation with {studentName}
                </Text>

                <Text
                  style={styles.introDescription}
                >
                  Every message displays the sender's
                  name and role so teachers and Head
                  Assistants can identify each reply.
                </Text>
              </View>

              {messages.length === 0 ? (
                <View style={styles.emptyMessages}>
                  <Text
                    style={styles.emptyMessagesTitle}
                  >
                    No messages yet
                  </Text>

                  <Text
                    style={
                      styles.emptyMessagesDescription
                    }
                  >
                    Send the first message below.
                  </Text>
                </View>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble
                    key={
                      message.id ||
                      `${message.senderId}-${index}`
                    }
                    message={message}
                    mine={
                      String(message.senderId) ===
                      String(user?.id)
                    }
                    temporary={
                      Boolean(message.isTemporary)
                    }
                  />
                ))
              )}

              {typingText ? (
                <TypingIndicator text={typingText} />
              ) : null}
            </ScrollView>

            <MessageComposer
              value={content}
              attachment={attachment}
              recording={recording}
              recordingDuration={
                recordingDuration
              }
              disabled={
                conversationClosed || sending
              }
              sending={sending}
              connected={socketConnected}
              conversationClosed={
                conversationClosed
              }
              onChangeText={handleContentChange}
              onPickAttachment={pickAttachment}
              onRemoveAttachment={() =>
                setAttachment(null)
              }
              onStartRecording={startRecording}
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
              onSend={sendMessage}
            />
          </View>

          {isDesktop ? (
            <View style={styles.detailsColumn}>
              <TicketDetailsPanel
                ticket={ticket}
                participant={participant}
                studentName={studentName}
                statusConfig={statusConfig}
                socketConnected={
                  socketConnected
                }
                refreshing={refreshing}
                onRefresh={() =>
                  load({ isRefresh: true })
                }
              />

              {canResolve ? (
                <ResolutionActionPanel
                  type="resolve"
                  loading={updatingStatus}
                  onResolve={markResolved}
                />
              ) : null}

              {canConfirmResolution ? (
                <ResolutionActionPanel
                  type="confirm"
                  loading={updatingStatus}
                  onConfirm={
                    confirmResolution
                  }
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  message,
  mine,
  temporary,
}) {
  const senderName =
    message.sender?.name ||
    message.senderName ||
    (mine ? "You" : "Unknown user");

  const senderRole = getRoleLabel(
    message.sender
  );

  const timestamp = message.createdAt
    ? formatTime(message.createdAt)
    : "";

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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(senderName)}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.messageGroup,
          mine && styles.messageGroupMine,
        ]}
      >
        <View
          style={[
            styles.senderRow,
            mine && styles.senderRowMine,
          ]}
        >
          <Text style={styles.senderName}>
            {mine ? "You" : senderName}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {senderRole}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.messageBubble,
            mine
              ? styles.messageBubbleMine
              : styles.messageBubbleOther,
            temporary &&
              styles.temporaryMessage,
          ]}
        >
          <MessageAttachment message={message} />

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
          {temporary ? (
            <ActivityIndicator
              size="small"
              color={colors.textMuted}
            />
          ) : null}

          <Text style={styles.messageTime}>
            {temporary
              ? "Sending..."
              : timestamp}
          </Text>

          {mine && !temporary ? (
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

function MessageAttachment({ message }) {
  const type =
    message.messageType || "TEXT";

  if (
    type === "TEXT" ||
    !message.attachmentUrl
  ) {
    return null;
  }

  if (type === "IMAGE") {
    return (
      <Pressable
        onPress={() =>
          openExternalFile(
            message.attachmentUrl
          )
        }
      >
        <Image
          source={{
            uri: message.attachmentUrl,
          }}
          style={styles.messageImage}
          resizeMode="cover"
        />
      </Pressable>
    );
  }

  if (type === "AUDIO") {
    return (
      <AudioMessage
        uri={message.attachmentUrl}
        duration={message.audioDuration}
      />
    );
  }

  const config = {
    PDF: {
      icon: "document-text-outline",
      label: "PDF document",
    },

    VIDEO: {
      icon: "videocam-outline",
      label: "Video",
    },

    FILE: {
      icon: "attach-outline",
      label: "Attachment",
    },
  }[type] || {
    icon: "attach-outline",
    label: "Attachment",
  };

  return (
    <Pressable
      onPress={() =>
        openExternalFile(
          message.attachmentUrl
        )
      }
      style={styles.fileCard}
    >
      <View style={styles.fileIcon}>
        <Ionicons
          name={config.icon}
          size={24}
          color={colors.primary}
        />
      </View>

      <View style={styles.fileText}>
        <Text
          style={styles.fileName}
          numberOfLines={1}
        >
          {message.attachmentName ||
            config.label}
        </Text>

        <Text style={styles.fileType}>
          {config.label}
          {message.attachmentSize
            ? ` · ${formatFileSize(
                message.attachmentSize
              )}`
            : ""}
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

function AudioMessage({ uri, duration }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const playing = Boolean(status.playing);

  const position = Math.max(
    0,
    Number(status.currentTime || 0) * 1000
  );

  const total =
    Number(status.duration || 0) > 0
      ? Number(status.duration) * 1000
      : Number(duration || 0);

  async function togglePlayback() {
    try {
      if (!status.isLoaded) {
        return;
      }

      if (status.playing) {
        player.pause();
        return;
      }

      if (
        status.didJustFinish ||
        (status.duration > 0 &&
          status.currentTime >= status.duration)
      ) {
        await player.seekTo(0);
      }

      player.play();
    } catch {
      openExternalFile(uri);
    }
  }

  return (
    <View style={styles.audioCard}>
      <Pressable
        onPress={togglePlayback}
        style={styles.audioPlayButton}
      >
        {status.isBuffering ||
        !status.isLoaded ? (
          <ActivityIndicator
            size="small"
            color={colors.white}
          />
        ) : (
          <Ionicons
            name={
              playing
                ? "pause"
                : "play"
            }
            size={21}
            color={colors.white}
          />
        )}
      </Pressable>

      <View style={styles.audioContent}>
        <Text style={styles.audioTitle}>
          Voice message
        </Text>

        <Text style={styles.audioDuration}>
          {formatDuration(
            playing ? position : total
          )}
        </Text>
      </View>

      <Ionicons
        name="mic-outline"
        size={20}
        color={colors.primary}
      />
    </View>
  );
}

function TypingIndicator({ text }) {
  return (
    <View style={styles.typingRow}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>

        <Text style={styles.typingText}>
          {text}
        </Text>
      </View>
    </View>
  );
}

function MessageComposer({
  value,
  attachment,
  recording,
  recordingDuration,
  disabled,
  sending,
  connected,
  conversationClosed,
  onChangeText,
  onPickAttachment,
  onRemoveAttachment,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onSend,
}) {
  const canSend =
    !disabled &&
    !recording &&
    (value.trim().length > 0 ||
      Boolean(attachment));

  return (
    <View style={styles.composerContainer}>
      {conversationClosed ? (
        <View style={styles.closedNotice}>
          <Ionicons
            name="lock-closed-outline"
            size={19}
            color={colors.secondary}
          />

          <Text style={styles.closedNoticeText}>
            This ticket is resolved. The
            conversation is closed.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.composerStatusRow}>
            <View style={styles.connectionStatus}>
              <View
                style={[
                  styles.connectionDot,
                  {
                    backgroundColor: connected
                      ? colors.secondary
                      : colors.warning,
                  },
                ]}
              />

              <Text style={styles.connectionText}>
                {connected
                  ? "Live chat connected"
                  : "Reconnecting..."}
              </Text>
            </View>

            <Text style={styles.characterCount}>
              {value.length}/2000
            </Text>
          </View>

          {recording ? (
            <View style={styles.recordingPanel}>
              <View style={styles.recordingInfo}>
                <View style={styles.recordingDot} />

                <Text style={styles.recordingText}>
                  Recording{" "}
                  {formatDuration(
                    recordingDuration
                  )}
                </Text>
              </View>

              <View style={styles.recordingActions}>
                <Pressable
                  onPress={onCancelRecording}
                  style={styles.recordingAction}
                >
                  <Ionicons
                    name="trash-outline"
                    size={21}
                    color={colors.danger}
                  />
                </Pressable>

                <Pressable
                  onPress={onStopRecording}
                  style={styles.stopRecordingButton}
                >
                  <Ionicons
                    name="stop"
                    size={20}
                    color={colors.white}
                  />
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {attachment ? (
                <AttachmentPreview
                  attachment={attachment}
                  onRemove={
                    onRemoveAttachment
                  }
                />
              ) : null}

              <View style={styles.composerRow}>
                <View style={styles.composerTools}>
                  <Pressable
                    onPress={onPickAttachment}
                    disabled={disabled}
                    style={styles.toolButton}
                  >
                    <Ionicons
                      name="attach-outline"
                      size={23}
                      color={colors.primary}
                    />
                  </Pressable>

                  <Pressable
                    onPress={onStartRecording}
                    disabled={disabled}
                    style={styles.toolButton}
                  >
                    <Ionicons
                      name="mic-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </Pressable>
                </View>

                <TextInput
                  value={value}
                  onChangeText={onChangeText}
                  placeholder="Write a message..."
                  placeholderTextColor={
                    colors.textMuted
                  }
                  multiline
                  maxLength={2000}
                  editable={!disabled}
                  style={styles.composerInput}
                />

                <Pressable
                  disabled={!canSend}
                  onPress={onSend}
                  style={[
                    styles.sendButton,
                    canSend
                      ? styles.sendButtonEnabled
                      : styles.sendButtonDisabled,
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
                      color={
                        canSend
                          ? colors.white
                          : colors.textMuted
                      }
                    />
                  )}
                </Pressable>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

function AttachmentPreview({
  attachment,
  onRemove,
}) {
  return (
    <View style={styles.attachmentPreview}>
      {attachment.messageType === "IMAGE" ? (
        <Image
          source={{ uri: attachment.uri }}
          style={styles.attachmentThumbnail}
        />
      ) : (
        <View style={styles.attachmentPreviewIcon}>
          <Ionicons
            name={getAttachmentIcon(
              attachment.messageType
            )}
            size={23}
            color={colors.primary}
          />
        </View>
      )}

      <View style={styles.attachmentPreviewText}>
        <Text
          style={styles.attachmentPreviewName}
          numberOfLines={1}
        >
          {attachment.name}
        </Text>

        <Text
          style={styles.attachmentPreviewMeta}
        >
          {getAttachmentLabel(
            attachment.messageType
          )}
          {attachment.size
            ? ` · ${formatFileSize(
                attachment.size
              )}`
            : ""}
        </Text>
      </View>

      <Pressable
        onPress={onRemove}
        style={styles.removeAttachmentButton}
      >
        <Ionicons
          name="close"
          size={20}
          color={colors.danger}
        />
      </Pressable>
    </View>
  );
}

function TicketDetailsPanel({
  ticket,
  participant,
  studentName,
  statusConfig,
  socketConnected,
  refreshing,
  onRefresh,
}) {
  return (
    <Card style={styles.detailsCard}>
      <View style={styles.detailsHeader}>
        <View>
          <Text style={styles.detailsTitle}>
            Ticket details
          </Text>

          <Text style={styles.detailsDescription}>
            Participants and current status.
          </Text>
        </View>

        <Pressable
          onPress={onRefresh}
          style={styles.refreshButton}
        >
          {refreshing ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          ) : (
            <Ionicons
              name="refresh-outline"
              size={19}
              color={colors.primary}
            />
          )}
        </Pressable>
      </View>

      <DetailRow
        icon="person-outline"
        label="Student"
        value={studentName}
      />

      <DetailRow
        icon="folder-outline"
        label="Category"
        value={
          ticket.category?.name ||
          "Uncategorised"
        }
      />

      <DetailRow
        icon={participant?.icon}
        label={participant?.label}
        value={participant?.name}
      />

      <DetailRow
        icon="radio-outline"
        label="Live connection"
        value={
          socketConnected
            ? "Connected"
            : "Reconnecting"
        }
        valueColor={
          socketConnected
            ? colors.secondary
            : colors.warning
        }
      />

      <View style={styles.statusSummary}>
        <Ionicons
          name={statusConfig.icon}
          size={25}
          color={statusConfig.color}
        />

        <View style={styles.statusSummaryText}>
          <Text style={styles.statusSummaryTitle}>
            {statusConfig.label}
          </Text>

          <Text
            style={
              styles.statusSummaryDescription
            }
          >
            {statusConfig.description}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueColor,
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={
            icon ||
            "information-circle-outline"
          }
          size={19}
          color={colors.primary}
        />
      </View>

      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text
          style={[
            styles.detailValue,
            valueColor && {
              color: valueColor,
            },
          ]}
        >
          {value || "Not available"}
        </Text>
      </View>
    </View>
  );
}

function ResolutionActionPanel({
  type,
  loading,
  onResolve,
  onConfirm,
}) {
  if (type === "confirm") {
    return (
      <Card style={styles.actionCard}>
        <Text style={styles.actionTitle}>
          Was your issue solved?
        </Text>

        <Text style={styles.actionDescription}>
          Confirm whether the support response
          resolved the problem.
        </Text>

        <View style={styles.confirmActions}>
          <Button
            title="Yes, resolved"
            variant="secondary"
            loading={loading}
            disabled={loading}
            onPress={() => onConfirm(true)}
            style={styles.flexButton}
          />

          <Button
            title="No, reopen"
            variant="danger"
            disabled={loading}
            onPress={() => onConfirm(false)}
            style={styles.flexButton}
          />
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.actionCard}>
      <Text style={styles.actionTitle}>
        Ready to resolve?
      </Text>

      <Text style={styles.actionDescription}>
        Mark this ticket as resolved after the
        student's issue has been addressed.
      </Text>

      <Button
        title="Mark as resolved"
        variant="secondary"
        loading={loading}
        disabled={loading}
        onPress={onResolve}
      />
    </Card>
  );
}

async function openExternalFile(url) {
  if (!url) return;

  const supported =
    await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
  }
}

function getRoleLabel(sender) {
  if (!sender) {
    return "User";
  }

  if (sender.role === "TEACHER") {
    return "Teacher";
  }

  if (
    sender.role === "ASSISTANT" &&
    sender.isHeadAssistant
  ) {
    return "Head Assistant";
  }

  if (sender.role === "ASSISTANT") {
    return "Assistant";
  }

  if (sender.role === "STUDENT") {
    return "Student";
  }

  return sender.role || "User";
}

function resolveAttachmentType(
  mimeType,
  filename
) {
  const mime = mimeType || "";
  const name = (filename || "").toLowerCase();

  if (
    mime === "application/pdf" ||
    name.endsWith(".pdf")
  ) {
    return "PDF";
  }

  if (mime.startsWith("image/")) {
    return "IMAGE";
  }

  if (mime.startsWith("video/")) {
    return "VIDEO";
  }

  if (mime.startsWith("audio/")) {
    return "AUDIO";
  }

  return "FILE";
}

function inferMimeType(filename = "") {
  const name = filename.toLowerCase();

  if (name.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  if (name.endsWith(".png")) {
    return "image/png";
  }

  if (name.endsWith(".mp4")) {
    return "video/mp4";
  }

  if (
    name.endsWith(".m4a") ||
    name.endsWith(".mp3")
  ) {
    return "audio/mp4";
  }

  return "application/octet-stream";
}

function getAttachmentIcon(type) {
  if (type === "PDF") {
    return "document-text-outline";
  }

  if (type === "IMAGE") {
    return "image-outline";
  }

  if (type === "VIDEO") {
    return "videocam-outline";
  }

  if (type === "AUDIO") {
    return "mic-outline";
  }

  return "attach-outline";
}

function getAttachmentLabel(type) {
  if (type === "PDF") return "PDF";
  if (type === "IMAGE") return "Image";
  if (type === "VIDEO") return "Video";
  if (type === "AUDIO") return "Voice message";

  return "Attachment";
}

function getInitials(name = "") {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "?";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(milliseconds = 0) {
  const totalSeconds = Math.floor(
    milliseconds / 1000
  );

  const minutes = Math.floor(
    totalSeconds / 60
  );

  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function formatFileSize(bytes) {
  if (!bytes) return "";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}