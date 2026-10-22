import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState("");

  const handleSendOTP = () => {
    if (phone.length !== 10) return;

    navigation.navigate("VerifyOTP", { phone });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-slate-950"
    >
      <StatusBar barStyle="light-content" />

      <View className="flex-1 justify-center px-7">
        {/* App branding */}
        <View className="mb-12">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <Text className="text-3xl font-bold text-white">M</Text>
          </View>

          <Text className="text-4xl font-extrabold tracking-tight text-white">
            MiniLedger
          </Text>

          <Text className="mt-3 text-base leading-6 text-slate-400">
            Keep track of every rupee you lend.
            Simple, organized and stress-free.
          </Text>
        </View>

        {/* Login form */}
        <View className="gap-5">
          <View>
            <Text className="mb-3 text-sm font-semibold text-slate-200">
              Phone Number
            </Text>

            <View className="flex-row items-center rounded-xl border border-slate-700 bg-slate-900 px-4">
              <Text className="mr-3 text-base font-semibold text-slate-300">
                +91
              </Text>

              <TextInput
                value={phone}
                onChangeText={(value) =>
                  setPhone(value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="Enter your phone number"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                maxLength={10}
                className="flex-1 py-4 text-base text-white"
              />
            </View>
          </View>

          <Pressable
            onPress={handleSendOTP}
            disabled={phone.length !== 10}
            className={`items-center rounded-xl py-4 ${
              phone.length === 10
                ? "bg-blue-600"
                : "bg-slate-700"
            }`}
          >
            <Text className="text-base font-bold text-white">
              Continue with OTP
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text className="mt-10 text-center text-xs leading-5 text-slate-500">
          By continuing, you agree to use MiniLedger responsibly.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}