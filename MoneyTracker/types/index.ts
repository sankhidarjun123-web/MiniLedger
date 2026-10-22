export interface Loan {
  id: string;
  friend_name: string;
  amount: number;
  due_date: string;
  notes?: string;
  created_at: string;
  total_repaid: number;
  remaining_amount: number;
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
  AddLoan: undefined;
  AddRepayment: { loanId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Loans: undefined;
  Repayments: undefined;
};