
import { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

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

  const [amount, setAmount] = useState(
    String(repayment.amount)
  );

  const [notes, setNotes] = useState(
    repayment.notes || ""
  );

  const [repaymentDate, setRepaymentDate] = useState(
    new Date(repayment.repayment_date)
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update repayment.
  const handleUpdate = async () => {
    const parsedAmount = Number(amount.trim());

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

      const response = await api.put(
        `/repayments/change/${repayment.id}`,
        {
          amount: parsedAmount,
          repaymentDate: repaymentDate.toISOString(),
          notes: notes.trim(),
        }
      );

      if (response.data.success) {
        setIsEditing(false);

        Alert.alert(
          "Success",
          "Repayment updated successfully."
        );

        onChanged?.();
      } else {
        Alert.alert(
          "Error",
          response.data.message ||
            "Failed to update repayment."
        );
      }
    } catch (error: any) {
      console.error(
        "Update repayment error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to update repayment."
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete repayment.
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
                Alert.alert(
                  "Success",
                  "Repayment deleted successfully."
                );

                onChanged?.();
              } else {
                Alert.alert(
                  "Error",
                  response.data.message ||
                    "Failed to delete repayment."
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

  // Cancel editing and restore original values.
  const handleCancelEdit = () => {
    setAmount(String(repayment.amount));
    setNotes(repayment.notes || "");

    setRepaymentDate(
      new Date(repayment.repayment_date)
    );

    setShowDatePicker(false);
    setIsEditing(false);
  };

  return (
    <View className="mb-3 rounded-2xl border border-[#293548] bg-[#1B2432] p-4">

      {/* Repayment Information */}
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="font-semibold text-white">
            {repayment.friend_name}
          </Text>

          <Text className="mt-2 text-lg font-bold text-emerald-400">
            + ₹{Number(repayment.amount).toLocaleString("en-IN")}
          </Text>

          <Text className="mt-2 text-xs text-gray-400">
            {new Date(
              repayment.repayment_date
            ).toLocaleDateString("en-IN")}
          </Text>

          {repayment.notes ? (
            <Text className="mt-2 text-sm text-gray-400">
              {repayment.notes}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Edit Form */}
      {isEditing && (
        <View className="mt-5 border-t border-[#293548] pt-4">

          {/* Amount */}
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

          {/* Repayment Date */}
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

          {/* Notes */}
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
