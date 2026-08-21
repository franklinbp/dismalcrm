import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
};

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary"
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        (pressed || disabled) && styles.pressed
      ]}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.surface : colors.primary} />
      ) : (
        <Text style={[styles.label, variant !== "primary" && styles.labelMuted]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  primary: {
    backgroundColor: colors.primary
  },
  ghost: {
    backgroundColor: colors.primarySoft
  },
  danger: {
    backgroundColor: colors.danger
  },
  pressed: {
    opacity: 0.72
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700"
  },
  labelMuted: {
    color: colors.primary
  }
});
