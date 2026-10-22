import { View, Text } from "react-native";

interface Props {
  title: string;
  amount: number;
  color: string;
}

export default function SummaryCard({ title, amount, color }: Props) {
  return (
    <View className="flex-1 rounded-2xl bg-[#1B2432] p-4">
      <Text className="text-sm text-gray-400">{title}</Text>

      <Text
        className="mt-3 text-xl font-bold"
        style={{ color }}
      >
        ₹{amount.toLocaleString("en-IN")}
      </Text>
    </View>
  );
}