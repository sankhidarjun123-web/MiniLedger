import { View, Text, Image } from "react-native";
import { Repayment } from "../../types";

interface Props {
  repayment: Repayment;
}

export default function RepaymentCard({ repayment }: Props) {
  return (
    <View className="mb-3 flex-row rounded-2xl border border-[#293548] bg-[#1B2432] p-4">
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

      {repayment.image_url ? (
        <Image
          source={{ uri: repayment.image_url }}
          className="ml-3 h-16 w-16 rounded-xl"
        />
      ) : null}
    </View>
  );
}