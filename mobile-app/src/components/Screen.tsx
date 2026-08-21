import { PropsWithChildren } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

type Props = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function Screen({ children, style }: Props) {
  return (
    <SafeAreaView edges={["top", "right", "bottom", "left"]} style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  }
});
