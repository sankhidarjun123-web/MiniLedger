import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import SummaryCard from "../components/dasboard/SummaryCard";
import LoanCard from "../components/loans/LoanCard";
import RepaymentCard from "../components/repayments/RepaymentCard";

import { getLoans, getRepayments } from "../services/loan.service";
import { Loan, Repayment } from "../types";

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [loanData, repaymentData] = await Promise.all([
        getLoans(),
        getRepayments(),
      ]);

      setLoans(loanData);
      setRepayments(repaymentData);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const totalLent = loans.reduce(
    (sum, loan) => sum + Number(loan.amount),
    0
  );

  const totalRepaid = repayments.reduce(
    (sum, repayment) => sum + Number(repayment.amount),
    0
  );

  const outstanding = totalLent - totalRepaid;

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#111827]">
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#111827]"
      contentContainerStyle={{ padding: 20, paddingBottom: 35 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-white">
            MiniLedger
          </Text>
          <Text className="mt-1 text-sm text-gray-400">
            Your money, organized.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate("AddLoan")}
          className="h-11 w-11 items-center justify-center rounded-full bg-emerald-400"
        >
          <Ionicons name="add" size={27} color="#111827" />
        </TouchableOpacity>
      </View>

      <Text className="mb-3 text-lg font-semibold text-white">
        Overview
      </Text>

      <View className="mb-3 flex-row gap-3">
        <SummaryCard
          title="Total Lent"
          amount={totalLent}
          color="#FFFFFF"
        />
        <SummaryCard
          title="Total Repaid"
          amount={totalRepaid}
          color="#34D399"
        />
      </View>

      <View className="mb-6">
        <SummaryCard
          title="Outstanding Balance"
          amount={outstanding}
          color="#FBBF24"
        />
      </View>

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-white">
          Recent Loans
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Loans")}
        >
          <Text className="text-sm font-medium text-emerald-400">
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {loans.length === 0 ? (
        <Text className="mb-5 rounded-2xl bg-[#1B2432] p-5 text-center text-gray-400">
          No loans yet. Add your first loan!
        </Text>
      ) : (
        loans.slice(0, 3).map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
        ))
      )}

      <View className="mb-3 mt-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-white">
          Recent Repayments
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Repayments")}
        >
          <Text className="text-sm font-medium text-emerald-400">
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {repayments.length === 0 ? (
        <Text className="rounded-2xl bg-[#1B2432] p-5 text-center text-gray-400">
          No repayments recorded yet.
        </Text>
      ) : (
        repayments.slice(0, 3).map((repayment) => (
          <RepaymentCard
            key={repayment.id}
            repayment={repayment}
          />
        ))
      )}
    </ScrollView>
  );
}