import { Loan } from ".";

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