export interface Loan {
    id: string;
    friend_name: string;
    amount: number;
    due_date: string;
    notes?: string | null;
    created_at: string;
    updated_at?: string;
    total_repaid: number;
    remaining_amount: number;
    status?: string;
    receipt_image?: string | null;
}

export interface Repayment {
    id: string;
    loan_id: string;
    friend_name: string;
    amount: number;
    image_url?: string | null;
    notes?: string;
    repayment_date: string;
}

export type RootStackParamList = {
    Login: undefined;
    VerifyOTP: { phone: string };
    MainTabs: undefined;
    AddLoan: { loan?: Loan } | undefined;
    AddRepayment: {
        loanId: string;
        remainingAmount: number;
        friendName: string;
    };
};

export type MainTabParamList = {
    Home: undefined;
    Loans: undefined;
    Repayments: undefined;
    Profile: undefined;
};