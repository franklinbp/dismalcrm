import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getMediaUrl } from "../api/client";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Message } from "../types/crm";

type Props = {
  message: Message;
};

export function MessageBubble({ message }: Props) {
  const mine = Boolean(message.fromMe);
  const mediaUrl = getMediaUrl(message.mediaUrl);
  const isImage = Boolean(
    mediaUrl &&
      (message.mediaType?.startsWith("image") ||
        /\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(mediaUrl))
  );

  const openMedia = () => {
    if (mediaUrl) {
      Linking.openURL(mediaUrl).catch(() => undefined);
    }
  };

  return (
    <View style={[styles.row, mine && styles.rowMine]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.other]}>
        {isImage && mediaUrl ? (
          <Pressable onPress={openMedia} accessibilityRole="imagebutton">
            <Image source={{ uri: mediaUrl }} style={styles.image} resizeMode="cover" />
          </Pressable>
        ) : null}
        {!isImage && mediaUrl ? (
          <Pressable style={styles.attachment} onPress={openMedia}>
            <MaterialCommunityIcons name="file-outline" color={colors.primary} size={22} />
            <Text style={styles.attachmentText}>Abrir archivo adjunto</Text>
          </Pressable>
        ) : null}
        {message.body ? <Text style={styles.body}>{message.body}</Text> : null}
        {!message.body && !mediaUrl ? <Text style={styles.body}>Mensaje sin contenido</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs
  },
  rowMine: {
    alignItems: "flex-end"
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1
  },
  mine: {
    backgroundColor: colors.bubbleMine,
    borderColor: colors.primarySoft
  },
  other: {
    backgroundColor: colors.bubbleOther,
    borderColor: colors.border
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21
  },
  image: {
    width: 220,
    height: 180,
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.xs
  },
  attachment: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 42
  },
  attachmentText: {
    flex: 1,
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800"
  }
});
