import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import RepaymentCard from "../components/repayments/RepaymentCard";
import { getRepayments } from "../services/loan.service";
import { Repayment } from "../types";

export default function RepaymentsScreen() {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRepayments = async () => {
    try {
      setRepayments(await getRepayments());
    } catch (error) {
      console.error("Repayments fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRepayments();
    }, [])
  );

  return (
    <ScrollView className="flex-1 bg-[#111827] p-5">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-white">
          Repayments
        </Text>
        <Text className="mt-1 text-sm text-gray-400">
          Every payment received, in one place.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#34D399" size="large" />
      ) : repayments.length === 0 ? (
        <Text className="rounded-2xl bg-[#1B2432] p-5 text-center text-gray-400">
          No repayments recorded yet.
        </Text>
      ) : (
        repayments.map((repayment) => (
          <RepaymentCard
            key={repayment.id}
            repayment={repayment}
            onChanged={fetchRepayments}
        />
        ))
      )}
    </ScrollView>
  );
}