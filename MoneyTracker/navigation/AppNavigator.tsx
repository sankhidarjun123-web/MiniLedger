import { createNativeStackNavigator } from "@react-navigation/native-stack";


// Screens
import LoginScreen from "../screens/LoginScreen";
import VerifyOTPScreen from "../screens/VerifyOTPScreen";
import DashboardScreen from "../screens/DashboardScreen";

import type { RootStackParamList } from "../types/navigation";


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}