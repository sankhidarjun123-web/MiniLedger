import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import { api } from "../config/axios";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "AddLoan">;

export default function AddLoanScreen({ navigation }: Props) {
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [receipt, setReceipt] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickReceipt = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceipt(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);

    if (!friendName.trim()) {
      Alert.alert("Missing information", "Enter your friend's name.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a valid loan amount.");
      return;
    }

    if (dueDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      Alert.alert("Invalid date", "Due date cannot be in the past.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("friendName", friendName.trim());
      formData.append("amount", String(parsedAmount));
      formData.append("dueDate", dueDate.toISOString().split("T")[0]);
      formData.append("notes", notes.trim());

      if (receipt) {
        formData.append("receipt", {
          uri: receipt.uri,
          name: receipt.fileName || `loan-receipt-${Date.now()}.jpg`,
          type: receipt.mimeType || "image/jpeg",
        } as any);
      }

      await api.post("/loans", formData);

      Alert.alert("Success", "Loan added successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error(
        "Add loan error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to add loan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#111827]"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-2xl font-bold text-white">
        Add New Loan
      </Text>

      <Text className="mt-2 text-sm text-gray-400">
        Keep track of money you've lent.
      </Text>

      {/* Friend Name */}
      <Text className="mb-2 mt-7 text-sm font-medium text-gray-300">
        Friend's Name *
      </Text>

      <TextInput
        value={friendName}
        onChangeText={setFriendName}
        placeholder="Enter friend's name"
        placeholderTextColor="#8491A5"
        className="rounded-xl border border-[#293548] bg-[#1B2432] px-4 py-4 text-white"
      />

      {/* Amount */}
      <Text className="mb-2 mt-5 text-sm font-medium text-gray-300">
        Amount (₹) *
      </Text>

      <View className="flex-row items-center rounded-xl border border-[#293548] bg-[#1B2432] px-4">
        <Text className="mr-2 text-lg text-emerald-400">₹</Text>

        <TextInput
          value={amount}
          onChangeText={(value) =>
            setAmount(value.replace(/[^0-9.]/g, ""))
          }
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#8491A5"
          className="flex-1 py-4 text-white"
        />
      </View>

      {/* Due Date */}
      <Text className="mb-2 mt-5 text-sm font-medium text-gray-300">
        Due Date *
      </Text>

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        className="flex-row items-center justify-between rounded-xl border border-[#293548] bg-[#1B2432] px-4 py-4"
      >
        <Text className="text-white">
          {dueDate.toLocaleDateString("en-IN")}
        </Text>

        <Ionicons name="calendar-outline" size={20} color="#34D399" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDueDate(selectedDate);
          }}
        />
      )}

      {/* Notes */}
      <Text className="mb-2 mt-5 text-sm font-medium text-gray-300">
        Notes (Optional)
      </Text>

      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any additional details..."
        placeholderTextColor="#8491A5"
        multiline
        textAlignVertical="top"
        numberOfLines={4}
        className="min-h-28 rounded-xl border border-[#293548] bg-[#1B2432] px-4 py-3 text-white"
      />

      {/* Receipt */}
      <Text className="mb-2 mt-5 text-sm font-medium text-gray-300">
        Loan Receipt (Optional)
      </Text>

      <TouchableOpacity
        onPress={pickReceipt}
        className="items-center justify-center rounded-xl border border-dashed border-[#526178] bg-[#1B2432] p-6"
      >
        {receipt ? (
          <Image
            source={{ uri: receipt.uri }}
            className="h-40 w-full rounded-lg"
            resizeMode="contain"
          />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={32} color="#34D399" />

            <Text className="mt-2 font-medium text-white">
              Upload Receipt
            </Text>

            <Text className="mt-1 text-xs text-gray-400">
              Choose an image from your gallery
            </Text>
          </>
        )}
      </TouchableOpacity>

      {receipt && (
        <TouchableOpacity
          onPress={() => setReceipt(null)}
          className="mt-2 self-end"
        >
          <Text className="text-sm text-red-400">Remove image</Text>
        </TouchableOpacity>
      )}

      {/* Submit */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleSubmit}
        className="mt-8 items-center rounded-xl bg-emerald-400 py-4"
      >
        {loading ? (
          <ActivityIndicator color="#111827" />
        ) : (
          <Text className="font-bold text-[#111827]">
            Save Loan
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}