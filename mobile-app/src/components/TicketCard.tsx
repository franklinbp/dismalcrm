import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Ticket } from "../types/crm";

type Props = {
  ticket: Ticket;
  onPress: () => void;
};

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value?: string) {
  if (!value) return "";

  try {
    return formatDistanceToNowStrict(new Date(value), {
      addSuffix: true,
      locale: es
    });
  } catch {
    return "";
  }
}

export function TicketCard({ ticket, onPress }: Props) {
  const unread = Number(ticket.unreadMessages || 0);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        unread > 0 && styles.unread,
        pressed && styles.pressed
      ]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(ticket.contact?.name)}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.name}>
            {ticket.contact?.name || `Ticket #${ticket.id}`}
          </Text>
          <Text style={styles.time}>{formatDate(ticket.updatedAt)}</Text>
        </View>
        <Text numberOfLines={2} style={styles.message}>
          {ticket.lastMessage || "Sin mensajes recientes"}
        </Text>
        <View style={styles.footer}>
          {ticket.queue?.name ? <Text style={styles.queue}>{ticket.queue.name}</Text> : null}
          {unread > 0 ? <Text style={styles.badge}>{unread}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  unread: {
    backgroundColor: colors.unread
  },
  pressed: {
    opacity: 0.75
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  avatarText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800"
  },
  content: {
    flex: 1,
    gap: spacing.xs
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  time: {
    color: colors.textMuted,
    fontSize: 12
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 19
  },
  footer: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  queue: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 6,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  badge: {
    minWidth: 24,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.accent,
    color: colors.surface,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  }
});
