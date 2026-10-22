import { useCallback, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import LoanCard from "../components/loans/LoanCard";
import { getLoans } from "../services/loan.service";
import { Loan } from "../types";

export default function LoansScreen() {
    const navigation = useNavigation<any>();

    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLoans = async () => {
        try {
            setLoans(await getLoans());
        } catch (error) {
            console.error("Loans fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchLoans();
        }, [])
    );

    return (
        <ScrollView className="flex-1 bg-[#111827] p-5">
            <View className="mb-6 flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-bold text-white">My Loans</Text>
                    <Text className="mt-1 text-sm text-gray-400">
                        Manage money you've lent.
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.getParent()?.navigate("AddLoan")}
                    className="rounded-xl bg-emerald-400 px-4 py-3"
                >
                    <Text className="font-bold text-[#111827]">+ Add Loan</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color="#34D399" size="large" />
            ) : loans.length === 0 ? (
                <Text className="rounded-2xl bg-[#1B2432] p-5 text-center text-gray-400">
                    You haven't added any loans yet.
                </Text>
            ) : (
                loans.map((loan) => (
                    <LoanCard
                        key={loan.id}
                        loan={loan}
                        navigation={navigation}
                        onChanged={fetchLoans}
                    />
                ))
            )}
        </ScrollView>
    );
}