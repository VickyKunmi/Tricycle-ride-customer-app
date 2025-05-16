import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINT } from "@/apiConfig";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextData>({
  user: null,
  token: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  //     try {
  //       const response = await axios.post(`${API_ENDPOINT}/api/customer/login`, {
  //         phone,
  //         password,
  //       });

  //       // Destructure token and user details from response
  //       const { token: jwtToken, user: userData, message } = response.data;
  //       if (jwtToken && userData) {
  //         await AsyncStorage.setItem("jwtToken", jwtToken);
  //         setUser(userData);
  //         setToken(jwtToken);
  //       }
  //       console.log("Login successful:", message);
  //     } catch (error: any) {
  //       console.error("Login error:", error.response?.data || error.message);
  //       throw new Error(error.response?.data?.message || "Login failed.");
  //     }
  //   };

  // const signIn = async (phone: string, password: string) => {
  //     const { token: jwtToken, user: userData } = (await axios.post(
  //       `${API_ENDPOINT}/api/customer/login`,
  //       { phone, password }
  //     )).data;

  //     // Persist both
  //     await AsyncStorage.multiSet([
  //       ["jwtToken", jwtToken],
  //       ["userData", JSON.stringify(userData)],
  //     ]);

  //     setToken(jwtToken);
  //     setUser(userData);
  //   };

  // AuthProvider.tsx
  const signIn = async (phone: string, password: string) => {
    const { token: jwtToken, user: userData } = (
      await axios.post(`${API_ENDPOINT}/api/customer/login`, {
        phone,
        password,
      })
    ).data;

    await AsyncStorage.multiSet([
      ["jwtToken", jwtToken],
      ["userData", JSON.stringify(userData)],
    ]);

    setToken(jwtToken);
    setUser(userData);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(["jwtToken", "userData"]);
    setUser(null);
    setToken(null);
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const [storedToken, storedUserJson] = await Promise.all([
        AsyncStorage.getItem("jwtToken"),
        AsyncStorage.getItem("userData"),
      ]);
      if (storedToken && storedUserJson) {
        setToken(storedToken);
        setUser(JSON.parse(storedUserJson));
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
