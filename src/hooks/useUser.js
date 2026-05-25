import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { account } from "../appwrite/config";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await account.get();
      setUser(userData);
    } catch (error) {
      console.error("Auth Error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error(error);
    }

    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        userId: user ? user.$id : null,
        loading,
        refetch: fetchUser,
        logout,
      },
    },
    children
  );
};

export const useUser = () => useContext(AuthContext);