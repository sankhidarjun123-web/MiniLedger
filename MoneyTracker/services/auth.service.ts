import { api } from "../config/axios";

export const registerUser = async (mobileNumber: string) => {
  const response = await api.post("/auth/user", {
    mobileNumber,
  });

  return response.data;
};

export const verifyOTP = async (
  mobileNumber: string,
  otp: string
) => {
  const response = await api.post("/auth/verifyOTP", {
    mobileNumber,
    otp,
  });

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/check-user");

  return response.data.user;
};