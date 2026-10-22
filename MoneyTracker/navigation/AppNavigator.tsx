import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import VerifyOTPScreen from "../screens/VerifyOTPScreen";
import MainTabNavigator from "./MainTabNavigator";

import type { RootStackParamList } from "../types/navigation";
import AddLoanScreen from "../screens/AddLoan";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
          />

          <Stack.Screen
          name="AddLoan"
          component={AddLoanScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}