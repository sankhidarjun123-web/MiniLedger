import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import type { Repayment } from "../../types";
import { api } from "../../config/axios";

interface Props {
  repayment: Repayment;
  onChanged?: () => void;
}

export default function RepaymentCard({
  repayment,
  onChanged,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(String(repayment.amount));
  const [notes, setNotes] = useState(repayment.notes || "");
  const [repaymentDate, setRepaymentDate] = useState(
    new Date(repayment.repayment_date)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [image, setImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [loading, setLoading] = useState(false);

  // Select a replacement payment proof image
  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow gallery access to upload an image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Unable to select image.");
    }
  };

  // Update repayment
  const handleUpdate = async () => {
    const parsedAmount = Number(amount);

    if (
      !amount.trim() ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(amount.trim())
    ) {
      Alert.alert(
        "Invalid Amount",
        "Enter a valid amount with up to 2 decimal places."
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("amount", String(parsedAmount));
      formData.append("repaymentDate", repaymentDate.toISOString());
      formData.append("notes", notes.trim());

      if (image) {
        formData.append(
          "image",
          {
            uri: image.uri,
            name: image.fileName || `repayment-${Date.now()}.jpg`,
            type: image.mimeType || "image/jpeg",
          } as any
        );
      }

      const response = await api.put(
        `/repayments/change/${repayment.id}`,
        formData
      );

      if (response.data.success) {
        Alert.alert("Success", "Repayment updated successfully.");
        setIsEditing(false);
        setImage(null);
        onChanged?.();
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to update repayment."
        );
      }
    } catch (error: any) {
      console.error(
        "Update repayment error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update repayment."
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete repayment
  const handleDelete = () => {
    Alert.alert(
      "Delete Repayment",
      "Are you sure you want to delete this repayment? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              const response = await api.delete(
                `/repayments/remove/${repayment.id}`
              );

              if (response.data.success) {
                Alert.alert("Success", "Repayment deleted successfully.");
                onChanged?.();
              } else {
                Alert.alert(
                  "Error",
                  response.data.message || "Failed to delete repayment."
                );
              }
            } catch (error: any) {
              console.error(
                "Delete repayment error:",
                error.response?.data || error.message
              );

              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete repayment."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelEdit = () => {
    setAmount(String(repayment.amount));
    setNotes(repayment.notes || "");
    setRepaymentDate(new Date(repayment.repayment_date));
    setImage(null);
    setIsEditing(false);
  };

  return (
    <View className="mb-3 rounded-2xl border border-[#293548] bg-[#1B2432] p-4">

      {/* Repayment Information */}
      <View className="flex-row">
        <View className="flex-1">
          <Text className="font-semibold text-white">
            {repayment.friend_name}
          </Text>

          <Text className="mt-2 text-lg font-bold text-emerald-400">
            + ₹{Number(repayment.amount).toLocaleString("en-IN")}
          </Text>

          <Text className="mt-2 text-xs text-gray-400">
            {new Date(repayment.repayment_date).toLocaleDateString("en-IN")}
          </Text>

          {repayment.notes ? (
            <Text className="mt-2 text-sm text-gray-400">
              {repayment.notes}
            </Text>
          ) : null}
        </View>

        {/* Existing Payment Proof */}
        {repayment.image_url ? (
          <Image
            source={{ uri: repayment.image_url }}
            className="ml-3 h-16 w-16 rounded-xl"
            resizeMode="cover"
          />
        ) : null}
      </View>

      {/* Edit Form */}
      {isEditing && (
        <View className="mt-5 border-t border-[#293548] pt-4">

          <Text className="mb-2 font-semibold text-white">
            Amount (₹)
          </Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="Enter amount"
            placeholderTextColor="#9CA3AF"
            className="rounded-xl border border-[#293548] bg-[#111827] px-4 py-3 text-white"
          />

          <Text className="mb-2 mt-4 font-semibold text-white">
            Repayment Date
          </Text>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="rounded-xl border border-[#293548] bg-[#111827] px-4 py-3"
          >
            <Text className="text-white">
              {repaymentDate.toLocaleDateString("en-IN")}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={repaymentDate}
              mode="date"
              maximumDate={new Date()}
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);

                if (selectedDate) {
                  setRepaymentDate(selectedDate);
                }
              }}
            />
          )}

          <Text className="mb-2 mt-4 font-semibold text-white">
            Notes
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="min-h-20 rounded-xl border border-[#293548] bg-[#111827] px-4 py-3 text-white"
          />

          {/* Replace Image */}
          <Text className="mb-2 mt-4 font-semibold text-white">
            Payment Proof
          </Text>

          {image ? (
            <View>
              <Image
                source={{ uri: image.uri }}
                className="h-40 w-full rounded-xl"
                resizeMode="contain"
              />

              <TouchableOpacity
                onPress={() => setImage(null)}
                className="mt-2 rounded-lg bg-red-600 py-2"
              >
                <Text className="text-center font-semibold text-white">
                  Remove Selected Image
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePickImage}
              className="items-center rounded-xl border border-dashed border-[#46546A] bg-[#111827] p-4"
            >
              <Text className="font-semibold text-emerald-400">
                + Replace Payment Image
              </Text>
            </TouchableOpacity>
          )}

          {/* Update / Cancel */}
          <View className="mt-5 flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancelEdit}
              disabled={loading}
              className="flex-1 items-center rounded-xl bg-gray-600 py-3"
            >
              <Text className="font-bold text-white">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={loading}
              className="flex-1 items-center rounded-xl bg-emerald-600 py-3"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-bold text-white">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit / Delete Buttons */}
      {!isEditing && (
        <View className="mt-4 flex-row gap-3 border-t border-[#293548] pt-3">
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            disabled={loading}
            className="flex-1 items-center rounded-lg bg-[#293548] py-2.5"
          >
            <Text className="font-semibold text-white">
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={loading}
            className="flex-1 items-center rounded-lg bg-red-600 py-2.5"
          >
            <Text className="font-semibold text-white">
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
