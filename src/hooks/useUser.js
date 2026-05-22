import { useEffect, useState } from "react";
import { account } from "../appwrite/config";

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await account.get();
      setUser(userData);
      setUserId(userData.$id);
    } catch (error) {
      setUser(null);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, userId, loading, refetch: fetchUser };
};