import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  registerUser,
  verifyOTP,
  getCurrentUser,
  deleteAccount as deleteAccountRequest,
} from "../services/auth.service";

import {
  saveToken,
  getToken,
  removeToken,
} from "../utils/authStorage";

type User = {
  id: string;
  mobileNumber: string;
  isVerified: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  register: (mobileNumber: string) => Promise<void>;
  verify: (mobileNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication whenever the app initializes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await getToken();

        if (!token) return;

        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error: any) {
        if (
          error.response?.status === 401 ||
          error.response?.status === 404
        ) {
          await removeToken();
        } else {
          console.error("Authentication check failed:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  // Register user and request OTP
  const register = async (mobileNumber: string) => {
    await registerUser(mobileNumber);
  };

  // Verify OTP and save JWT
  const verify = async (mobileNumber: string, otp: string) => {
    const data = await verifyOTP(mobileNumber, otp);

    await saveToken(data.token);
    setUser(data.user);
  };

  // Logout
  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  // Delete account
  const deleteAccount = async () => {
    await deleteAccountRequest();

    await removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        register,
        verify,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
