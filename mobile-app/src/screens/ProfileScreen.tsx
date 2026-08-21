import { StyleSheet, Text, View } from "react-native";
import appConfig from "../../app.json";
import { useAuth } from "../auth/AuthContext";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { apiUrl } from "../config/env";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "D"}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{user?.name || "Usuario"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.role}>{user?.profile || "Agente"}</Text>
        </View>
        <View style={styles.releaseInfo}>
          <Text style={styles.releaseTitle}>DismalCRM {appConfig.expo.version}</Text>
          <Text style={styles.releaseDetail}>Conexion segura: {new URL(apiUrl).host}</Text>
        </View>
        <PrimaryButton label="Cerrar sesion" variant="ghost" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.xl
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  avatarText: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: "900"
  },
  info: {
    gap: spacing.xs
  },
  name: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900"
  },
  email: {
    color: colors.textMuted,
    fontSize: 15
  },
  role: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 6,
    backgroundColor: colors.accentSoft,
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm
  },
  releaseInfo: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg
  },
  releaseTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  releaseDetail: {
    color: colors.textMuted,
    fontSize: 13
  }
});
