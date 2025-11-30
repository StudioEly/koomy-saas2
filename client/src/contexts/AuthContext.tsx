import { createContext, useContext, useState, ReactNode } from "react";
import type { User, UserCommunityMembership } from "@shared/schema";

interface AuthUser extends Omit<User, "password"> {
  memberships: UserCommunityMembership[];
}

interface AuthContextType {
  user: AuthUser | null;
  currentCommunity: UserCommunityMembership | null;
  setUser: (user: AuthUser | null) => void;
  setCurrentCommunity: (membership: UserCommunityMembership | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentCommunity, setCurrentCommunity] = useState<UserCommunityMembership | null>(null);

  const logout = () => {
    setUser(null);
    setCurrentCommunity(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, currentCommunity, setUser, setCurrentCommunity, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
