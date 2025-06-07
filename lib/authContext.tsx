import { createContext, useContext, useEffect, useState } from "react";
import Auth from "./appwrite";
import { Models } from "react-native-appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  SignIN: (email: string, passwd: string) => Promise<string | null>;
  SignUP: (email: string, passwd: string, confPasswd: string) => Promise<string | null>;
  loadingUser: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  const SignUP = async (email: string, passwd: string, confPasswd: string) => {
    const error = await Auth.signUp({ email, passwd, confPasswd });
    if (error) return error;
    const user = await Auth.account.get();
    setUser(user);
    return null;
  };

  const SignIN = async (email: string, passwd: string) => {
    const error = await Auth.login({ email, passwd });
    if (error) return error;
    const user = await Auth.account.get();
    setUser(user);
    return null;
  };

  const getUser = async () => {
    try {
      const session = await Auth.account.get();
      setUser(session);
    } catch (error) {
      console.error("Get user error:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const signOut = async () => {
    await Auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, SignIN, SignUP, loadingUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
