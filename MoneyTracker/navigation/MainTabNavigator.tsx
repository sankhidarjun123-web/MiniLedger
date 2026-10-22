import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../screens/HomeScreen";
import LoansScreen from "../screens/LoansScreen";
import RepaymentsScreen from "../screens/RepaymentsScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { MainTabParamList } from "../types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#34D399",
        tabBarInactiveTintColor: "#8491A5",

        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopColor: "#293548",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },

        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home-outline",
            Loans: "wallet-outline",
            Repayments: "receipt-outline",
            Profile: "person-outline",
          } as const;

          return (
            <Ionicons
              name={icons[route.name]}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Loans" component={LoansScreen} />
      <Tab.Screen name="Repayments" component={RepaymentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}