import { useState } from "react";
import { isAxiosError } from "axios";
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

function getLoginErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return "No se pudo iniciar sesion. Intenta nuevamente.";
  }

  const status = error.response?.status;

  if (status === 401) {
    return "Correo o contrasena incorrectos.";
  }

  if (status === 404) {
    return "El acceso movil aun no esta publicado en el servidor.";
  }

  if (status === 502 || status === 503) {
    return "DismalCRM esta temporalmente fuera de servicio.";
  }

  if (!error.response) {
    return "No se pudo establecer una conexion HTTPS segura con DismalCRM.";
  }

  return "No se pudo iniciar sesion. Intenta nuevamente.";
}

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) {
      setError("Ingresa email y contrasena.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (loginError) {
      setError(getLoginErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.brand}>
          <Image
            source={require("../../assets/dismalcrm-icon.png")}
            style={styles.logoMark}
            resizeMode="contain"
            accessibilityLabel="DismalCRM"
          />
          <View style={styles.brandText}>
            <Text style={styles.logo}>DismalCRM</Text>
            <Text style={styles.subtitle}>Atencion comercial y conversaciones en tiempo real.</Text>
          </View>
        </View>

        <View style={styles.form}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            placeholder="usuario@empresa.com"
          />
          <TextField
            label="Contrasena"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            placeholder="Tu contrasena"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="Entrar" loading={loading} onPress={handleLogin} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.xxl
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg
  },
  brandText: {
    flex: 1,
    gap: spacing.xs
  },
  logoMark: {
    width: 78,
    height: 78,
    borderRadius: 8
  },
  logo: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23
  },
  form: {
    gap: spacing.lg
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20
  }
});
