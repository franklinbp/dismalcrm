import { TextInput, TextInputProps, StyleSheet, View, Text } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type Props = TextInputProps & {
  label: string;
};

export function TextField({ label, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.lg
  }
});
