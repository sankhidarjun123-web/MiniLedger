import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Loan, RootStackParamList } from "../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api } from "../../config/axios";

interface Props {
  loan: Loan;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onChanged: () => void;
}

export default function LoanCard({
  loan,
  navigation,
  onChanged,
}: Props) {
  const amount = Number(loan.amount);
  const totalRepaid = Number(loan.total_repaid);
  const remainingAmount = Number(loan.remaining_amount);

  const isOverdue =
    remainingAmount > 0 &&
    new Date(loan.due_date) <
    new Date(new Date().toDateString());

  const status =
    remainingAmount <= 0
      ? "Repaid"
      : isOverdue
        ? "Overdue"
        : totalRepaid > 0
          ? "Partially Paid"
          : "Pending";

  const statusColor =
    status === "Repaid"
      ? "text-green-400"
      : status === "Overdue"
        ? "text-red-400"
        : status === "Partially Paid"
          ? "text-yellow-400"
          : "text-gray-400";

  // Receipt is already returned as Base64 by getAllLoans.
  const receiptUri = loan.receipt_image
    ? `data:image/jpeg;base64,${loan.receipt_image}`
    : null;

  const handleEdit = () => {
    navigation.navigate("AddLoan", { loan });
  };

  const handleAddRepayment = () => {
    navigation.navigate("AddRepayment", {
      loanId: loan.id,
      remainingAmount: remainingAmount,
      friendName: loan.friend_name,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Loan",
      `Are you sure you want to delete the loan for ${loan.friend_name}? Its repayment history will also be deleted.`,
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
              await api.delete(`/loans/remove/${loan.id}`);

              Alert.alert(
                "Success",
                "Loan deleted successfully."
              );

              onChanged();
            } catch (error: any) {
              console.error(
                "Delete loan error:",
                error.response?.data || error.message
              );

              Alert.alert(
                "Error",
                error.response?.data?.message ||
                "Failed to delete loan."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View className="mb-4 rounded-2xl border border-[#293548] bg-[#1B2432] p-4">
      {/* Friend name and status */}
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-white">
          {loan.friend_name}
        </Text>

        <Text className={`text-xs font-semibold ${statusColor}`}>
          {status}
        </Text>
      </View>

      {/* Loan amount */}
      <Text className="mt-3 text-2xl font-bold text-white">
        ₹{amount.toLocaleString("en-IN")}
      </Text>

      {/* Repayment details */}
      <View className="mt-3 flex-row justify-between">
        <View>
          <Text className="text-xs text-gray-400">
            Repaid
          </Text>
          <Text className="mt-1 font-semibold text-green-400">
            ₹{totalRepaid.toLocaleString("en-IN")}
          </Text>
        </View>

        <View>
          <Text className="text-xs text-gray-400">
            Remaining
          </Text>
          <Text className="mt-1 font-semibold text-white">
            ₹{remainingAmount.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* Due date */}
      <Text className="mt-3 text-xs text-gray-500">
        Due: {new Date(loan.due_date).toLocaleDateString("en-IN")}
      </Text>

      {/* Notes */}
      {loan.notes ? (
        <Text className="mt-3 text-sm text-gray-400">
          {loan.notes}
        </Text>
      ) : null}

      {/* Receipt preview */}
      <View className="mt-4">
        <Text className="mb-2 text-sm font-semibold text-white">
          Loan Receipt
        </Text>

        {receiptUri ? (
          <Image
            source={{ uri: receiptUri }}
            className="h-44 w-full rounded-xl bg-[#222E3F]"
            resizeMode="contain"
          />
        ) : (
          <View className="items-center justify-center rounded-xl border border-dashed border-[#46546A] bg-[#222E3F] p-5">
            <Text className="text-sm text-gray-400">
              No image preview available
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="mt-5 gap-3">

        {/* Record Repayment - Top */}
        <TouchableOpacity
          onPress={handleAddRepayment}
          disabled={remainingAmount <= 0}
          activeOpacity={0.8}
          className={`items-center justify-center rounded-xl py-3.5 ${remainingAmount <= 0
              ? "bg-gray-600"
              : "bg-emerald-600"
            }`}
        >
          <Text className="font-bold text-white">
            {remainingAmount <= 0
              ? "Fully Repaid"
              : "＋ Record Repayment"}
          </Text>
        </TouchableOpacity>

        {/* Edit and Delete - Bottom */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleEdit}
            activeOpacity={0.8}
            className="flex-1 items-center justify-center rounded-xl border border-blue-500 bg-blue-600 py-3"
          >
            <Text className="font-semibold text-white">
              Edit Loan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.8}
            className="flex-1 items-center justify-center rounded-xl border border-red-500 bg-red-600 py-3"
          >
            <Text className="font-semibold text-white">
              Delete
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}