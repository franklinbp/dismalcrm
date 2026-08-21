import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { CampaignComposerScreen } from "../screens/CampaignComposerScreen";
import { CampaignDetailScreen } from "../screens/CampaignDetailScreen";
import { CampaignsScreen } from "../screens/CampaignsScreen";
import { TicketDetailScreen } from "../screens/TicketDetailScreen";
import { TicketListScreen } from "../screens/TicketListScreen";
import { colors } from "../theme/colors";
import { MainTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel
      }}
    >
      <Tabs.Screen
        name="OpenTickets"
        options={{
          title: "Abiertos",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" color={color} size={size} />
          )
        }}
      >
        {() => <TicketListScreen status="open" title="Tickets abiertos" />}
      </Tabs.Screen>
      <Tabs.Screen
        name="PendingTickets"
        options={{
          title: "Pendientes",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clock-outline" color={color} size={size} />
          )
        }}
      >
        {() => <TicketListScreen status="pending" title="Tickets pendientes" />}
      </Tabs.Screen>
      <Tabs.Screen
        name="ClosedTickets"
        options={{
          title: "Cerrados",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="check-circle-outline" color={color} size={size} />
          )
        }}
      >
        {() => <TicketListScreen status="closed" title="Tickets cerrados" />}
      </Tabs.Screen>
      <Tabs.Screen
        name="Campaigns"
        component={CampaignsScreen}
        options={{
          title: "Campanas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bullhorn-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
          )
        }}
      />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "800" },
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      {token ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="TicketDetail"
            component={TicketDetailScreen}
            options={({ route }) => ({
              title: route.params.title || `Ticket #${route.params.ticketId}`
            })}
          />
          <Stack.Screen
            name="CampaignComposer"
            component={CampaignComposerScreen}
            options={{ title: "Nueva campana" }}
          />
          <Stack.Screen
            name="CampaignDetail"
            component={CampaignDetailScreen}
            options={({ route }) => ({ title: `Campana #${route.params.campaignId}` })}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 66,
    paddingBottom: 10,
    paddingTop: 8
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700"
  }
});
