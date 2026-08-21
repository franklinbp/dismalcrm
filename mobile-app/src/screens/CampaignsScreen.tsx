import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { listCampaigns } from "../api/campaigns";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import {
  campaignStatusColor,
  campaignStatusLabel
} from "../lib/campaignPresentation";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Campaign } from "../types/crm";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function CampaignsScreen() {
  const navigation = useNavigation<Navigation>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setError(null);
    try {
      setCampaigns(await listCampaigns());
    } catch {
      setError("No se pudieron cargar las campanas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadCampaigns();
    }, [loadCampaigns])
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text style={styles.title}>Campanas</Text>
            <Text style={styles.subtitle}>Envios de WhatsApp y seguimiento.</Text>
          </View>
          <MaterialCommunityIcons name="bullhorn-outline" size={28} color={colors.accent} />
        </View>
        <PrimaryButton
          label="Nueva campana"
          onPress={() => navigation.navigate("CampaignComposer")}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={item => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void loadCampaigns();
              }}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => navigation.navigate("CampaignDetail", { campaignId: item.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.status, { color: campaignStatusColor(item.status) }]}>
                  {campaignStatusLabel(item.status)}
                </Text>
              </View>
              <Text style={styles.message} numberOfLines={2}>{item.messageBody}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>
                  {item.sender?.name || (item.senderMode === "ROUND_ROBIN" ? "Rotacion" : "Sin remitente")}
                </Text>
                <Text style={styles.meta}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : `#${item.id}`}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState
              title={error || "No hay campanas"}
              message="Las campanas creadas apareceran aqui."
            />
          }
          contentContainerStyle={campaigns.length ? styles.list : styles.emptyList}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg
  },
  titleCopy: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center"
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  cardTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  status: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12
  },
  pressed: {
    opacity: 0.72
  }
});
