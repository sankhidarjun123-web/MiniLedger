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
import { useAuth } from "../contexts/AuthContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "VerifyOTP">;

export default function VerifyOTPScreen({ navigation, route }: Props) {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { phone } = route.params;
  const { verify } = useAuth();

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");

      await verify(phone, otp);

      navigation.replace("MainTabs");
    } catch (error: any) {
      console.error(
        "OTP verification failed:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message || "OTP verification failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-slate-950"
    >
      <StatusBar barStyle="light-content" />

      <View className="flex-1 justify-center px-7">

        {/* Branding */}
        <View className="mb-10">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <Text className="text-3xl font-bold text-white">M</Text>
          </View>

          <Text className="text-3xl font-extrabold text-white">
            Verify OTP
          </Text>

          <Text className="mt-3 text-base leading-6 text-slate-400">
            We've sent a verification code to
          </Text>

          <Text className="mt-2 text-base font-semibold text-white">
            +91 {phone}
          </Text>
        </View>

        {/* OTP Form */}
        <View className="gap-5">

          <View>
            <Text className="mb-3 text-sm font-semibold text-slate-200">
              Enter 6-digit OTP
            </Text>

            <TextInput
              value={otp}
              onChangeText={(value) =>
                setOtp(value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-5 text-center text-2xl font-bold tracking-[12px] text-white"
            />
          </View>

          <Pressable
            onPress={handleVerifyOTP}
            disabled={otp.length !== 6 || isSubmitting}
            className={`items-center rounded-xl py-4 ${otp.length === 6 && !isSubmitting
              ? "bg-blue-600"
              : "bg-slate-700"
              }`}
          >
            <Text className="text-base font-bold text-white">
              {isSubmitting ? "Verifying..." : "Verify & Continue"}
            </Text>
          </Pressable>
          {error ? (
            <Text className="text-sm text-red-400">{error}</Text>
          ) : null}
        </View>

        <Text className="mt-10 text-center text-xs text-slate-500">
          Securely access your MiniLedger account.
        </Text>

      </View>
    </KeyboardAvoidingView>
  );
}