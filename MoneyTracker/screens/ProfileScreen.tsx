import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await logout();
          } catch {
            Alert.alert("Error", "Unable to logout.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Your account, loans, and repayment records will be permanently deleted. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAccount();
            } catch {
              Alert.alert("Error", "Unable to delete account.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-950 px-5 pt-8">
      <Text className="mb-8 text-3xl font-bold text-white">
        Profile
      </Text>

      <View className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-emerald-600">
          <Ionicons name="person" size={28} color="#FFFFFF" />
        </View>

        <Text className="mb-2 text-sm text-gray-400">
          Mobile Number
        </Text>

        <Text className="text-lg font-semibold text-white">
          {user?.mobileNumber ?? "Not available"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        disabled={loading}
        className="mb-4 flex-row items-center justify-center rounded-xl bg-gray-800 py-4"
      >
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text className="ml-2 font-semibold text-white">
          Logout
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDeleteAccount}
        disabled={loading}
        className="flex-row items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 py-4"
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
        <Text className="ml-2 font-semibold text-red-500">
          Delete Account
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          className="mt-5"
          color="#34D399"
          size="small"
        />
      )}
    </View>
  );
}
