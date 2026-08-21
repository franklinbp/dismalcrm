import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { listTickets } from "../api/tickets";
import { useAuth } from "../auth/AuthContext";
import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";
import { TicketCard } from "../components/TicketCard";
import { connectCrmSocket } from "../sockets/crmSocket";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { RootStackParamList } from "../navigation/types";
import { Ticket, TicketStatus } from "../types/crm";

type Props = {
  status: TicketStatus;
  title: string;
};

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type TicketSocketEvent = {
  action?: string;
  ticket?: Ticket;
  ticketId?: number;
};

export function TicketListScreen({ status, title }: Props) {
  const navigation = useNavigation<Navigation>();
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtitle = useMemo(() => {
    if (status === "open") return "Conversaciones activas para responder.";
    if (status === "pending") return "Casos esperando asignacion o seguimiento.";
    return "Historial resuelto para consulta.";
  }, [status]);

  const loadTickets = useCallback(async () => {
    setError(null);
    const response = await listTickets(status);
    setTickets(response.tickets);
  }, [status]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        await loadTickets();
      } catch {
        setError("No se pudieron cargar los tickets.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [loadTickets]);

  useEffect(() => {
    if (!token) return;

    const socket = connectCrmSocket(token);
    const joinRooms = () => {
      socket.emit("joinTickets", status);
      socket.emit("joinNotification");
    };
    const handler = (event: TicketSocketEvent) => {
      if (!event?.ticket && !event?.ticketId) return;
      loadTickets().catch(() => undefined);
    };

    socket.on("connect", joinRooms);
    socket.on("ticket", handler);
    if (socket.connected) joinRooms();

    return () => {
      socket.off("connect", joinRooms);
      socket.off("ticket", handler);
    };
  }, [loadTickets, status, token]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadTickets();
    } catch {
      setError("No se pudo actualizar la lista.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              onPress={() =>
                navigation.navigate("TicketDetail", {
                  ticketId: item.id,
                  title: item.contact?.name || `Ticket #${item.id}`
                })
              }
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              title={error || "No hay tickets"}
              message="Cuando haya actividad para este estado aparecera aqui."
            />
          }
          contentContainerStyle={tickets.length === 0 ? styles.emptyList : undefined}
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
    backgroundColor: colors.background,
    gap: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center"
  }
});
