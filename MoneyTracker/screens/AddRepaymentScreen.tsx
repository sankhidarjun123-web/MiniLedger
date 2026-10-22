
import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../types/navigation";
import { api } from "../config/axios";

type Props = NativeStackScreenProps<
    RootStackParamList,
    "AddRepayment"
>;

export default function AddRepaymentScreen({
    route,
    navigation,
}: Props) {
    const { loanId, remainingAmount, friendName } = route.params;

    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [repaymentDate, setRepaymentDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [image, setImage] =
        useState<ImagePicker.ImagePickerAsset | null>(null);
    const [loading, setLoading] = useState(false);

    // Select repayment proof image
    const handlePickImage = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    "Permission Required",
                    "Please allow gallery access to upload repayment proof."
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

    // Submit repayment to backend
    const handleSubmit = async () => {
        Keyboard.dismiss();

        const parsedAmount = Number(amount);

        if (
            !amount.trim() ||
            !Number.isFinite(parsedAmount) ||
            parsedAmount <= 0
        ) {
            Alert.alert(
                "Invalid Amount",
                "Please enter a valid repayment amount."
            );
            return;
        }

        if (!/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
            Alert.alert(
                "Invalid Amount",
                "Please enter an amount with up to 2 decimal places."
            );
            return;
        }

        if (parsedAmount > remainingAmount) {
            Alert.alert(
                "Invalid Amount",
                `The remaining balance is ₹${remainingAmount.toLocaleString("en-IN")}.`
            );
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("loanId", loanId);
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

            const response = await api.post(
                "/repayments/add",
                formData
            );

            if (response.data.success) {
                Alert.alert(
                    "Success",
                    "Repayment recorded successfully.",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            } else {
                Alert.alert(
                    "Error",
                    response.data.message || "Failed to record repayment."
                );
            }
        } catch (error: any) {
            console.error(
                "Add repayment error:",
                error.response?.data || error.message
            );

            Alert.alert(
                "Error",
                error.response?.data?.message ||
                "Failed to record repayment."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView
            className="flex-1 bg-[#111827]"
            edges={["top", "bottom"]}
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                <View className="flex-1 bg-[#111827]">

                    {/* Scrollable Form */}
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{
                            paddingHorizontal: 20,
                            paddingTop: 20,
                            paddingBottom: 24,
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <Text className="text-2xl font-bold text-white">
                            Record Repayment
                        </Text>

                        <Text className="mt-2 text-sm text-gray-400">
                            Record money received from {friendName}.
                        </Text>

                        {/* Remaining Balance */}
                        <View className="mt-6 rounded-2xl border border-[#293548] bg-[#1B2432] p-4">
                            <Text className="text-sm text-gray-400">
                                Outstanding Balance
                            </Text>

                            <Text className="mt-2 text-2xl font-bold text-emerald-400">
                                ₹{remainingAmount.toLocaleString("en-IN")}
                            </Text>
                        </View>

                        {/* Amount */}
                        <Text className="mb-2 mt-6 font-semibold text-white">
                            Repayment Amount (₹)
                        </Text>

                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="Enter amount"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="decimal-pad"
                            className="rounded-xl border border-[#293548] bg-[#1B2432] px-4 py-4 text-white"
                        />

                        {/* Repayment Date */}
                        <Text className="mb-2 mt-5 font-semibold text-white">
                            Repayment Date
                        </Text>

                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                setShowDatePicker(true);
                            }}
                            className="rounded-xl border border-[#293548] bg-[#1B2432] px-4 py-4"
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
                        <Text className="mb-2 mt-5 font-semibold text-white">
                            Notes (Optional)
                        </Text>

                        <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Add repayment details..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className="min-h-28 rounded-xl border border-[#293548] bg-[#1B2432] px-4 py-4 text-white"
                        />

                        {/* Payment Proof */}
                        <Text className="mb-2 mt-5 font-semibold text-white">
                            Payment Proof (Optional)
                        </Text>

                        {image ? (
                            <View className="rounded-xl border border-[#293548] bg-[#1B2432] p-3">
                                <Image
                                    source={{ uri: image.uri }}
                                    className="h-48 w-full rounded-lg"
                                    resizeMode="contain"
                                />

                                <TouchableOpacity
                                    onPress={() => setImage(null)}
                                    className="mt-3 items-center rounded-lg bg-red-600 py-3"
                                >
                                    <Text className="font-semibold text-white">
                                        Remove Image
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handlePickImage}
                                className="items-center rounded-xl border border-dashed border-[#46546A] bg-[#1B2432] p-6"
                            >
                                <Text className="text-3xl text-emerald-400">
                                    ＋
                                </Text>

                                <Text className="mt-2 font-semibold text-white">
                                    Upload Payment Screenshot
                                </Text>

                                <Text className="mt-1 text-xs text-gray-400">
                                    Select an image from your gallery
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                    {/* Fixed Bottom Save Button */}
                    <View
                        className="border-t border-[#293548] bg-[#111827] px-5 pt-4"
                        style={{
                            paddingBottom: 12,
                            elevation: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: -3 },
                            shadowOpacity: 0.2,
                            shadowRadius: 6,
                        }}
                    >
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                            style={{
                                minHeight: 56,
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: loading ? "#047857" : "#059669",
                                borderRadius: 12,
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text
                                    style={{
                                        color: "#FFFFFF",
                                        fontSize: 16,
                                        fontWeight: "700",
                                    }}
                                >
                                    Save Repayment
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
