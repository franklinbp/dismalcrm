import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {
  CampaignMedia,
  createAndSendCampaign,
  listCampaignClients,
  listCampaignSenders
} from "../api/campaigns";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { CampaignClient, CampaignSender, CampaignSenderMode } from "../types/crm";

type Props = NativeStackScreenProps<RootStackParamList, "CampaignComposer">;
type CountryFilter = "ALL" | "EC" | "PE";

export function CampaignComposerScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [senderMode, setSenderMode] = useState<CampaignSenderMode>("SINGLE");
  const [senderId, setSenderId] = useState<number | null>(null);
  const [ratePerMin, setRatePerMin] = useState("20");
  const [media, setMedia] = useState<CampaignMedia | null>(null);
  const [senders, setSenders] = useState<CampaignSender[]>([]);
  const [clients, setClients] = useState<CampaignClient[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<CountryFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [senderRows, clientRows] = await Promise.all([
          listCampaignSenders(),
          listCampaignClients()
        ]);
        setSenders(senderRows);
        setClients(clientRows);
        const preferredSender = senderRows.find(sender => sender.status === "online") || senderRows[0];
        setSenderId(preferredSender?.id || null);
      } catch {
        setError("No se pudieron cargar remitentes y clientes.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return clients.filter(client => {
      const matchesCountry = country === "ALL" || client.countryCode === country;
      const searchable = `${client.name} ${client.tradeName || ""} ${client.phoneE164}`.toLowerCase();
      return matchesCountry && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [clients, country, search]);

  const visibleClients = filteredClients.slice(0, 100);
  const selectedClients = clients.filter(client => selected[client.id]);
  const allVisibleSelected =
    visibleClients.length > 0 && visibleClients.every(client => selected[client.id]);

  function toggleClient(clientId: number) {
    setSelected(current => ({ ...current, [clientId]: !current[clientId] }));
  }

  function toggleVisibleClients() {
    setSelected(current => {
      const next = { ...current };
      visibleClients.forEach(client => {
        next[client.id] = !allVisibleSelected;
      });
      return next;
    });
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Autoriza el acceso a tus fotos para adjuntar una imagen.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return;
    setMedia({
      uri: asset.uri,
      name: asset.fileName || `campana-${Date.now()}.jpg`,
      mimeType: asset.mimeType || "image/jpeg"
    });
  }

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return;
    setMedia({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType || "application/octet-stream"
    });
  }

  function chooseAttachment() {
    Alert.alert("Adjuntar a la campana", "Selecciona el tipo de archivo.", [
      { text: "Foto o video", onPress: () => void pickImage() },
      { text: "Documento", onPress: () => void pickDocument() },
      { text: "Cancelar", style: "cancel" }
    ]);
  }

  function validate() {
    if (!name.trim()) return "Escribe un nombre para la campana.";
    if (!messageBody.trim()) return "Escribe el mensaje que se enviara.";
    if (senderMode === "SINGLE" && !senderId) return "Selecciona un remitente.";
    if (selectedClients.length === 0) return "Selecciona al menos un cliente.";
    const parsedRate = Number(ratePerMin);
    if (!Number.isFinite(parsedRate) || parsedRate < 1 || parsedRate > 120) {
      return "La velocidad debe estar entre 1 y 120 mensajes por minuto.";
    }
    return null;
  }

  function confirmSend() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    Alert.alert(
      "Confirmar campana",
      `Se prepararan ${selectedClients.length} destinatarios para envio.`,
      [
        { text: "Volver", style: "cancel" },
        { text: "Confirmar envio", onPress: () => void sendCampaign() }
      ]
    );
  }

  async function sendCampaign() {
    setSending(true);
    setError(null);
    try {
      const campaign = await createAndSendCampaign({
        name: name.trim(),
        messageBody: messageBody.trim(),
        senderMode,
        senderId,
        ratePerMin: Number(ratePerMin),
        media,
        recipients: selectedClients.map(client => ({
          phoneE164: client.phoneE164,
          name: client.tradeName || client.name
        }))
      });
      navigation.replace("CampaignDetail", { campaignId: campaign.id });
    } catch {
      setError("No se pudo preparar la campana. El borrador puede revisarse desde el listado.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            >
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Field label="Nombre de campana">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej. Renovacion agosto"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
              </Field>

              <Field label="Mensaje">
                <TextInput
                  value={messageBody}
                  onChangeText={setMessageBody}
                  placeholder="Mensaje para tus clientes"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, styles.messageInput]}
                />
              </Field>

              <Field label="Modo de envio">
                <View style={styles.segmented}>
                  <Segment
                    label="Un remitente"
                    active={senderMode === "SINGLE"}
                    onPress={() => setSenderMode("SINGLE")}
                  />
                  <Segment
                    label="Rotacion"
                    active={senderMode === "ROUND_ROBIN"}
                    onPress={() => setSenderMode("ROUND_ROBIN")}
                  />
                </View>
              </Field>

              {senderMode === "SINGLE" ? (
                <Field label="Remitente">
                  <View style={styles.optionList}>
                    {senders.map(sender => (
                      <Pressable
                        key={sender.id}
                        style={[styles.option, senderId === sender.id && styles.optionSelected]}
                        onPress={() => setSenderId(sender.id)}
                      >
                        <MaterialCommunityIcons
                          name={sender.status === "online" ? "whatsapp" : "cellphone-off"}
                          size={20}
                          color={senderId === sender.id ? colors.accent : colors.textMuted}
                        />
                        <View style={styles.optionCopy}>
                          <Text style={styles.optionTitle}>{sender.name}</Text>
                          <Text style={styles.optionMeta}>{sender.phone || "Linea configurada"}</Text>
                        </View>
                        {senderId === sender.id ? (
                          <MaterialCommunityIcons name="check-circle" size={20} color={colors.accent} />
                        ) : null}
                      </Pressable>
                    ))}
                    {!senders.length ? <Text style={styles.muted}>No hay remitentes configurados.</Text> : null}
                  </View>
                </Field>
              ) : null}

              <Field label="Mensajes por minuto">
                <TextInput
                  value={ratePerMin}
                  onChangeText={setRatePerMin}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </Field>

              <Field label="Adjunto">
                <View style={styles.attachmentRow}>
                  <Pressable style={styles.attachmentButton} onPress={chooseAttachment}>
                    <MaterialCommunityIcons name="paperclip" size={21} color={colors.primary} />
                    <Text style={styles.attachmentLabel}>Seleccionar archivo</Text>
                  </Pressable>
                  {media ? (
                    <Pressable style={styles.removeMedia} onPress={() => setMedia(null)}>
                      <MaterialCommunityIcons name="close" size={20} color={colors.danger} />
                    </Pressable>
                  ) : null}
                </View>
                {media ? <Text style={styles.muted} numberOfLines={1}>{media.name}</Text> : null}
              </Field>

              <View style={styles.recipientsHeader}>
                <Text style={styles.sectionTitle}>Destinatarios</Text>
                <Text style={styles.selectedCount}>{selectedClients.length} seleccionados</Text>
              </View>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar cliente o telefono"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <View style={styles.countryRow}>
                {(["ALL", "EC", "PE"] as CountryFilter[]).map(value => (
                  <Segment
                    key={value}
                    label={value === "ALL" ? "Todos" : value === "EC" ? "Ecuador" : "Peru"}
                    active={country === value}
                    onPress={() => setCountry(value)}
                  />
                ))}
              </View>

              <Pressable style={styles.selectAll} onPress={toggleVisibleClients}>
                <MaterialCommunityIcons
                  name={allVisibleSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={22}
                  color={colors.primary}
                />
                <Text style={styles.selectAllLabel}>
                  {allVisibleSelected ? "Quitar visibles" : "Seleccionar visibles"}
                </Text>
              </Pressable>

              <View style={styles.clientList}>
                {visibleClients.map(client => (
                  <Pressable
                    key={client.id}
                    style={[styles.client, selected[client.id] && styles.clientSelected]}
                    onPress={() => toggleClient(client.id)}
                  >
                    <MaterialCommunityIcons
                      name={selected[client.id] ? "checkbox-marked" : "checkbox-blank-outline"}
                      size={22}
                      color={selected[client.id] ? colors.accent : colors.textMuted}
                    />
                    <View style={styles.optionCopy}>
                      <Text style={styles.optionTitle}>{client.tradeName || client.name}</Text>
                      <Text style={styles.optionMeta}>{client.phoneE164} · {client.countryCode || "Sin pais"}</Text>
                    </View>
                  </Pressable>
                ))}
                {!visibleClients.length ? <Text style={styles.muted}>No hay clientes para este filtro.</Text> : null}
              </View>

              {filteredClients.length > visibleClients.length ? (
                <Text style={styles.limitText}>Mostrando los primeros 100 resultados.</Text>
              ) : null}
            </ScrollView>

            <View style={styles.footer}>
              <PrimaryButton
                label={`Preparar envio (${selectedClients.length})`}
                loading={sending}
                disabled={sending}
                onPress={confirmSend}
              />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segment, active && styles.segmentActive]} onPress={onPress}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    padding: spacing.md,
    fontSize: 13,
    lineHeight: 18
  },
  field: { gap: spacing.sm },
  label: { color: colors.text, fontSize: 13, fontWeight: "800" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  messageInput: { minHeight: 120, maxHeight: 220 },
  segmented: { flexDirection: "row", gap: spacing.sm },
  segment: {
    minHeight: 42,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm
  },
  segmentActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  segmentText: { color: colors.textMuted, fontSize: 13, fontWeight: "700", textAlign: "center" },
  segmentTextActive: { color: colors.primary },
  optionList: { gap: spacing.sm },
  option: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  optionMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  attachmentRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  attachmentButton: {
    minHeight: 44,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  attachmentLabel: { color: colors.primary, fontSize: 14, fontWeight: "800" },
  removeMedia: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 8,
    backgroundColor: colors.dangerSoft
  },
  muted: { color: colors.textMuted, fontSize: 13 },
  recipientsHeader: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  selectedCount: { color: colors.accent, fontSize: 13, fontWeight: "800" },
  countryRow: { flexDirection: "row", gap: spacing.sm },
  selectAll: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm
  },
  selectAllLabel: { color: colors.primary, fontSize: 14, fontWeight: "800" },
  clientList: { gap: spacing.sm },
  client: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  clientSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  limitText: { color: colors.textMuted, fontSize: 12, textAlign: "center" },
  footer: {
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md
  }
});
