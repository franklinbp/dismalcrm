import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {
  listMessages,
  mergeMessage,
  sendMediaMessage,
  sendTextMessage,
  updateTicketStatus,
  UploadableMedia
} from "../api/tickets";
import { useAuth } from "../auth/AuthContext";
import { MessageBubble } from "../components/MessageBubble";
import { Screen } from "../components/Screen";
import { connectCrmSocket } from "../sockets/crmSocket";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { RootStackParamList } from "../navigation/types";
import { Message, Ticket } from "../types/crm";

type Props = NativeStackScreenProps<RootStackParamList, "TicketDetail">;

export function TicketDetailScreen({ route }: Props) {
  const { ticketId } = route.params;
  const { token } = useAuth();
  const listRef = useRef<FlatList<Message>>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setError(null);
    const response = await listMessages(ticketId);
    setMessages(response.messages.reverse());
    setTicket(response.ticket);
  }, [ticketId]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        await loadMessages();
      } catch {
        setError("No se pudo cargar la conversacion.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [loadMessages]);

  useEffect(() => {
    if (!token) return;
    const socket = connectCrmSocket(token);

    const joinChat = () => socket.emit("joinChatBox", String(ticketId));

    const handler = (event: { action?: string; message?: Message }) => {
      if (!event?.message) return;
      setMessages(current => mergeMessage(current, event.message as Message));
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    };

    socket.on("connect", joinChat);
    socket.on("appMessage", handler);
    if (socket.connected) joinChat();

    return () => {
      socket.off("connect", joinChat);
      socket.off("appMessage", handler);
    };
  }, [ticketId, token]);

  async function handleSend() {
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    setText("");

    try {
      await sendTextMessage(ticketId, body);
    } catch {
      setText(body);
      setError("No se pudo enviar el mensaje. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  }

  async function handleClose() {
    const nextStatus = ticket?.status === "closed" ? "open" : "closed";
    setError(null);

    try {
      const updated = await updateTicketStatus(ticketId, nextStatus);
      setTicket(updated);
    } catch {
      setError("No se pudo actualizar el estado del ticket.");
    }
  }

  async function uploadMedia(media: UploadableMedia) {
    if (sending) return;

    setSending(true);
    setError(null);

    try {
      await sendMediaMessage(ticketId, media);
    } catch {
      setError("No se pudo enviar el archivo. Verifica su tamano y la conexion.");
    } finally {
      setSending(false);
    }
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Autoriza el acceso a tus fotos para adjuntar archivos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    await uploadMedia({
      uri: asset.uri,
      name: asset.fileName || `dismal-${Date.now()}.jpg`,
      mimeType: asset.mimeType || "image/jpeg"
    });
  }

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    await uploadMedia({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType || "application/octet-stream"
    });
  }

  function handleAttach() {
    Alert.alert("Adjuntar archivo", "Selecciona el origen del archivo.", [
      { text: "Fotos o videos", onPress: () => void pickImage() },
      { text: "Documento", onPress: () => void pickDocument() },
      { text: "Cancelar", style: "cancel" }
    ]);
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.contactBar}>
          <View>
            <Text style={styles.contactName}>{ticket?.contact?.name || `Ticket #${ticketId}`}</Text>
            <Text style={styles.contactMeta}>
              {ticket?.queue?.name || "Sin cola"} - {ticket?.status || "cargando"}
            </Text>
          </View>
          <Pressable style={styles.statusButton} onPress={handleClose}>
            <Text style={styles.statusButtonText}>
              {ticket?.status === "closed" ? "Reabrir" : "Cerrar"}
            </Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" color={colors.danger} size={20} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void loadMessages()}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={styles.messageList}
            data={messages}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.messages}
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        <View style={styles.composer}>
          <Pressable
            style={({ pressed }) => [styles.attach, pressed && styles.pressed]}
            disabled={sending}
            onPress={handleAttach}
            accessibilityLabel="Adjuntar archivo"
          >
            <MaterialCommunityIcons name="paperclip" color={colors.primary} size={23} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escribe una respuesta"
            placeholderTextColor={colors.textMuted}
            multiline
            blurOnSubmit={false}
            textAlignVertical="top"
            onFocus={() => {
              setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 250);
            }}
            style={styles.input}
          />
          <Pressable
            style={({ pressed }) => [styles.send, (pressed || sending) && styles.pressed]}
            disabled={sending}
            onPress={handleSend}
          >
            <MaterialCommunityIcons name="send" color={colors.surface} size={20} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contactBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface
  },
  contactName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  contactMeta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs
  },
  statusButton: {
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  statusButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.dangerSoft,
    borderBottomWidth: 1,
    borderBottomColor: colors.dangerBorder
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18
  },
  retryText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "900"
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  messages: {
    paddingVertical: spacing.md,
    flexGrow: 1,
    justifyContent: "flex-end"
  },
  messageList: {
    flex: 1,
    minHeight: 0
  },
  composer: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: colors.background,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  attach: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  pressed: {
    opacity: 0.72
  }
});
