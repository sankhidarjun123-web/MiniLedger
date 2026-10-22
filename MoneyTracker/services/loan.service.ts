import { api } from "../config/axios";
import { Loan, Repayment } from "../types";

export const getLoans = async (): Promise<Loan[]> => {
  const response = await api.get("records/loans");
  return response.data.loans;
};

export const getRepayments = async (): Promise<Repayment[]> => {
  const response = await api.get("records/repayments");
  return response.data.repayments;
};