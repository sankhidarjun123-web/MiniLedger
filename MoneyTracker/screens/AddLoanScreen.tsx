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

import { api } from "../config/axios";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "AddLoan">;

export default function AddLoanScreen({
  navigation,
  route,
}: Props) {
  const existingLoan = route.params?.loan;
  const isEditing = Boolean(existingLoan);

  const [friendName, setFriendName] = useState(
    existingLoan?.friend_name ?? ""
  );

  const [amount, setAmount] = useState(
    existingLoan ? String(existingLoan.amount) : ""
  );

  const [dueDate, setDueDate] = useState(
    existingLoan
      ? new Date(`${existingLoan.due_date.split("T")[0]}T12:00:00`)
      : new Date()
  );

  const [notes, setNotes] = useState(
    existingLoan?.notes ?? ""
  );

  const [receipt, setReceipt] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Existing receipt or newly selected receipt.
  const receiptPreview = receipt?.uri
    ? receipt.uri
    : existingLoan?.receipt_image
      ? `data:image/jpeg;base64,${existingLoan.receipt_image}`
      : null;

  // Pick receipt image
  const pickReceipt = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your photos."
        );
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
    } catch (error) {
      console.error("Image picker error:", error);

      Alert.alert("Error", "Unable to select image.");
    }
  };

  // Date picker handler
  const handleDateChange = (
    event: any,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);

    if (event.type === "set" && selectedDate) {
      setDueDate(selectedDate);
    }
  };

  // Add or update loan
  const handleSubmit = async () => {
    const parsedAmount = Number(amount);

    if (!friendName.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter your friend's name."
      );
      return;
    }

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      Alert.alert(
        "Invalid amount",
        "Please enter a valid loan amount."
      );
      return;
    }

    if (Number.isNaN(dueDate.getTime())) {
      Alert.alert("Invalid date", "Please select a valid due date.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("friendName", friendName.trim());
      formData.append("amount", String(parsedAmount));
      formData.append(
        "dueDate",
        `${dueDate.getFullYear()}-${String(
          dueDate.getMonth() + 1
        ).padStart(2, "0")}-${String(
          dueDate.getDate()
        ).padStart(2, "0")}`
      );
      formData.append("notes", notes.trim());

      // Attach only if a new image was selected.
      if (receipt) {
        formData.append(
          "receipt",
          {
            uri: receipt.uri,
            name:
              receipt.fileName ||
              `loan-receipt-${Date.now()}.jpg`,
            type: receipt.mimeType || "image/jpeg",
          } as any
        );
      }

      if (isEditing && existingLoan) {
        await api.put(
          `/loans/change/${existingLoan.id}`,
          formData
        );
      } else {
        await api.post("/loans/add", formData);
      }

      Alert.alert(
        "Success",
        isEditing
          ? "Loan updated successfully."
          : "Loan added successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "Save loan error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to save loan."
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
      {/* Header */}
      <Text className="mb-2 text-2xl font-bold text-white">
        {isEditing ? "Update Loan" : "Add New Loan"}
      </Text>

      <Text className="mb-6 text-sm text-gray-400">
        {isEditing
          ? "Update the details of your existing loan."
          : "Record money you have lent to someone."}
      </Text>

      {/* Friend Name */}
      <Text className="mb-2 text-sm font-medium text-gray-300">
        Friend's Name *
      </Text>

      <TextInput
        value={friendName}
        onChangeText={setFriendName}
        placeholder="Enter friend's name"
        placeholderTextColor="#718096"
        className="mb-5 rounded-xl border border-[#293548] bg-[#1B2432] px-4 py-4 text-white"
      />

      {/* Amount */}
      <Text className="mb-2 text-sm font-medium text-gray-300">
        Loan Amount (₹) *
      </Text>

      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
        placeholderTextColor="#718096"
        keyboardType="decimal-pad"
        className="mb-5 rounded-xl border border-[#293548] bg-[#1B2432] px-4 py-4 text-white"
      />

      {/* Due Date */}
      <Text className="mb-2 text-sm font-medium text-gray-300">
        Due Date *
      </Text>

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        className="mb-5 rounded-xl border border-[#293548] bg-[#1B2432] px-4 py-4"
      >
        <Text className="text-white">
          {dueDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Notes */}
      <Text className="mb-2 text-sm font-medium text-gray-300">
        Notes
      </Text>

      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Add some details about this loan..."
        placeholderTextColor="#718096"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="mb-5 min-h-28 rounded-xl border border-[#293548] bg-[#1B2432] px-4 py-4 text-white"
      />

      {/* Receipt Image */}
      <Text className="mb-2 text-sm font-medium text-gray-300">
        Loan Receipt (Optional)
      </Text>

      {receiptPreview ? (
        <View className="mb-4">
          <Image
            source={{ uri: receiptPreview }}
            className="h-52 w-full rounded-xl bg-[#1B2432]"
            resizeMode="contain"
          />

          <Text className="mt-2 text-xs text-gray-400">
            {receipt
              ? "New receipt selected"
              : "Previously uploaded receipt"}
          </Text>
        </View>
      ) : (
        <View className="mb-4 items-center justify-center rounded-xl border border-dashed border-[#46546A] bg-[#1B2432] p-8">
          <Text className="text-sm text-gray-400">
            No receipt image selected
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={pickReceipt}
        className="mb-6 items-center rounded-xl border border-blue-500 py-4"
      >
        <Text className="font-semibold text-blue-400">
          {receiptPreview ? "Change Receipt Image" : "Upload Receipt Image"}
        </Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className={`items-center rounded-xl py-4 ${
          loading ? "bg-blue-800" : "bg-blue-600"
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="font-bold text-white">
            {isEditing ? "Update Loan" : "Save Loan"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}