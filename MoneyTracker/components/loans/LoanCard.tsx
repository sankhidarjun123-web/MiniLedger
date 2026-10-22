import { View, Text } from "react-native";
import { Loan } from "../../types";

interface Props {
  loan: Loan;
}

export default function LoanCard({ loan }: Props) {
  const isOverdue =
    loan.remaining_amount > 0 &&
    new Date(loan.due_date) < new Date(new Date().toDateString());

  const status =
    loan.remaining_amount === 0
      ? "Repaid"
      : isOverdue
        ? "Overdue"
        : loan.total_repaid > 0
          ? "Partially Paid"
          : "Pending";

  return (
    <View className="mb-3 rounded-2xl border border-[#293548] bg-[#1B2432] p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-white">
          {loan.friend_name}
        </Text>

        <Text className="text-xs text-gray-400">{status}</Text>
      </View>

      <Text className="mt-3 text-lg font-bold text-white">
        ₹{Number(loan.amount).toLocaleString("en-IN")}
      </Text>

      <View className="mt-3 flex-row justify-between">
        <Text className="text-xs text-gray-400">
          Repaid: ₹{Number(loan.total_repaid).toLocaleString("en-IN")}
        </Text>

        <Text className="text-xs text-gray-400">
          Remaining: ₹{Number(loan.remaining_amount).toLocaleString("en-IN")}
        </Text>
      </View>

      <Text className="mt-3 text-xs text-gray-500">
        Due: {new Date(loan.due_date).toLocaleDateString("en-IN")}
      </Text>
    </View>
  );
}