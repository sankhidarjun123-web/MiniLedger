import { api } from "../config/axios";

export const getLoans = async () => {
  const response = await api.get("/records/loans");
  return response.data.loans;
};

export const getRepayments = async () => {
  const response = await api.get("/records/repayments");
  return response.data.repayments;
};