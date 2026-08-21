import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  cancelCampaign,
  getCampaign,
  getCampaignMetrics,
  listCampaignRecipients
} from "../api/campaigns";
import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";
import {
  campaignStatusColor,
  campaignStatusLabel
} from "../lib/campaignPresentation";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Campaign, CampaignMetrics, CampaignRecipient } from "../types/crm";

type Props = NativeStackScreenProps<RootStackParamList, "CampaignDetail">;

export function CampaignDetailScreen({ route }: Props) {
  const { campaignId } = route.params;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [campaignData, metricsData, recipientData] = await Promise.all([
        getCampaign(campaignId),
        getCampaignMetrics(campaignId),
        listCampaignRecipients(campaignId)
      ]);
      setCampaign(campaignData);
      setMetrics(metricsData);
      setRecipients(recipientData);
    } catch {
      setError("No se pudo cargar el detalle de la campana.");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  function confirmCancel() {
    Alert.alert("Cancelar campana", "Se detendran los mensajes que aun no se han procesado.", [
      { text: "Volver", style: "cancel" },
      { text: "Cancelar campana", style: "destructive", onPress: () => void handleCancel() }
    ]);
  }

  async function handleCancel() {
    setCanceling(true);
    try {
      const updated = await cancelCampaign(campaignId);
      setCampaign(updated);
      await load();
    } catch {
      setError("No se pudo cancelar la campana.");
    } finally {
      setCanceling(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }

  const canCancel = campaign?.status === "READY" || campaign?.status === "RUNNING";

  return (
    <Screen>
      <FlatList
        data={recipients}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {campaign ? (
              <View style={styles.summary}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{campaign.name}</Text>
                  <Text style={[styles.status, { color: campaignStatusColor(campaign.status) }]}>
                    {campaignStatusLabel(campaign.status)}
                  </Text>
                </View>
                <Text style={styles.message}>{campaign.messageBody}</Text>
                <View style={styles.senderRow}>
                  <MaterialCommunityIcons name="whatsapp" size={18} color={colors.accent} />
                  <Text style={styles.senderText}>
                    {campaign.sender?.name || (campaign.senderMode === "ROUND_ROBIN" ? "Rotacion de remitentes" : "Remitente configurado")}
                  </Text>
                </View>
                {canCancel ? (
                  <Pressable
                    style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                    disabled={canceling}
                    onPress={confirmCancel}
                  >
                    {canceling ? (
                      <ActivityIndicator color={colors.danger} />
                    ) : (
                      <Text style={styles.cancelLabel}>Cancelar campana</Text>
                    )}
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {metrics ? (
              <View style={styles.metrics}>
                <Metric label="Destinatarios" value={metrics.recipients.total} />
                <Metric label="Enviados" value={metrics.recipients.sent} accent />
                <Metric label="Pendientes" value={metrics.recipients.pending + metrics.recipients.retrying} />
                <Metric label="Fallidos" value={metrics.recipients.failed} danger />
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>Destinatarios</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.recipient}>
            <View style={styles.recipientIcon}>
              <MaterialCommunityIcons name="account-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.recipientCopy}>
              <Text style={styles.recipientName}>{item.name || item.phoneE164}</Text>
              <Text style={styles.recipientPhone}>{item.phoneE164}</Text>
            </View>
            <Text style={[styles.recipientStatus, item.status === "FAILED" && styles.failed]}>
              {recipientStatusLabel(item.status)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title={error || "Sin destinatarios"}
            message="Esta campana todavia no tiene destinatarios registrados."
          />
        }
      />
    </Screen>
  );
}

function Metric({ label, value, accent, danger }: { label: string; value: number; accent?: boolean; danger?: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, accent && styles.accent, danger && styles.failed]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function recipientStatusLabel(status: CampaignRecipient["status"]) {
  if (status === "SENT") return "Enviado";
  if (status === "FAILED") return "Fallido";
  if (status === "RETRYING") return "Reintentando";
  return "Pendiente";
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  headerContent: { gap: spacing.lg, marginBottom: spacing.sm },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    padding: spacing.md,
    fontSize: 13
  },
  summary: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md
  },
  titleRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  title: { flex: 1, color: colors.text, fontSize: 21, fontWeight: "900" },
  status: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  message: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  senderRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  senderText: { color: colors.text, fontSize: 13, fontWeight: "700" },
  cancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 8,
    backgroundColor: colors.dangerSoft
  },
  cancelLabel: { color: colors.danger, fontSize: 14, fontWeight: "900" },
  metrics: { flexDirection: "row", gap: spacing.sm },
  metric: {
    flex: 1,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: spacing.xs
  },
  metricValue: { color: colors.text, fontSize: 20, fontWeight: "900" },
  metricLabel: { color: colors.textMuted, fontSize: 10, textAlign: "center" },
  accent: { color: colors.success },
  failed: { color: colors.danger },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  recipient: {
    minHeight: 62,
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
  recipientIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.primarySoft
  },
  recipientCopy: { flex: 1, minWidth: 0 },
  recipientName: { color: colors.text, fontSize: 14, fontWeight: "800" },
  recipientPhone: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  recipientStatus: { color: colors.textMuted, fontSize: 11, fontWeight: "800" },
  pressed: { opacity: 0.72 }
});
