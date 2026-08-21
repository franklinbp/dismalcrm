import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center"
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  }
});
