import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Account, User, UserCommunityMembership, Community } from "@shared/schema";
import { API_BASE_URL as API_URL } from "@/api/config";

interface AuthAccount extends Omit<Account, "passwordHash"> {
  memberships: (UserCommunityMembership & { community?: Community })[];
}

interface AuthUser extends Omit<User, "password"> {
  memberships: (UserCommunityMembership & { community?: Community })[];
}

interface AuthContextType {
  account: AuthAccount | null;
  user: AuthUser | null;
  currentMembership: (UserCommunityMembership & { community?: Community }) | null;
  currentCommunity: Community | null;
  allCommunities: Community[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAccount: (account: AuthAccount | null) => void;
  setUser: (user: AuthUser | null) => void;
  selectMembership: (membershipId: string) => void;
  selectCommunity: (communityId: string) => void;
  refreshMemberships: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCOUNT_STORAGE_KEY = "koomy_account";
const USER_STORAGE_KEY = "koomy_user";
const MEMBERSHIP_STORAGE_KEY = "koomy_current_membership";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccountState] = useState<AuthAccount | null>(() => {
    const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  
  const [currentMembership, setCurrentMembership] = useState<(UserCommunityMembership & { community?: Community }) | null>(() => {
    const stored = localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);

  const { data: allCommunities = [] } = useQuery<Community[]>({
    queryKey: ["/api/communities"],
    enabled: !!(account || user)
  });

  const setAccount = (newAccount: AuthAccount | null) => {
    setAccountState(newAccount);
    if (newAccount) {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(newAccount));
    } else {
      localStorage.removeItem(ACCOUNT_STORAGE_KEY);
    }
  };

  const setUser = (newUser: AuthUser | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const selectMembership = (membershipId: string) => {
    if (account) {
      const membership = account.memberships.find(m => m.id === membershipId);
      if (membership) {
        setCurrentMembership(membership);
        localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(membership));
        if (membership.community) {
          setCurrentCommunity(membership.community);
        } else if (membership.communityId) {
          const community = allCommunities.find(c => c.id === membership.communityId);
          if (community) setCurrentCommunity(community);
        }
      }
    }
  };

  const selectCommunity = (communityId: string) => {
    if (user) {
      const membership = user.memberships.find(m => m.communityId === communityId);
      if (membership) {
        setCurrentMembership(membership);
        localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(membership));
        if (membership.community) {
          setCurrentCommunity(membership.community as Community);
        } else {
          const community = allCommunities.find(c => c.id === communityId);
          if (community) {
            setCurrentCommunity(community);
          }
        }
      }
    } else if (account) {
      const membership = account.memberships.find(m => m.communityId === communityId);
      if (membership) {
        setCurrentMembership(membership);
        localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(membership));
        if (membership.community) {
          setCurrentCommunity(membership.community);
        }
      }
    }
  };

  const refreshMemberships = async () => {
    if (account) {
      try {
        const response = await fetch(`${API_URL}/api/accounts/${account.id}/memberships`);
        if (response.ok) {
          const memberships = await response.json();
          const updatedAccount = { ...account, memberships };
          setAccount(updatedAccount);
        }
      } catch (error) {
        console.error("Failed to refresh memberships:", error);
      }
    }
  };

  useEffect(() => {
    if (currentMembership && allCommunities.length > 0 && !currentCommunity) {
      const community = allCommunities.find(c => c.id === currentMembership.communityId);
      if (community) {
        setCurrentCommunity(community);
      }
    }
  }, [currentMembership, allCommunities, currentCommunity]);

  const logout = () => {
    setAccountState(null);
    setUserState(null);
    setCurrentMembership(null);
    setCurrentCommunity(null);
    localStorage.removeItem(ACCOUNT_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(MEMBERSHIP_STORAGE_KEY);
  };

  const isAuthenticated = !!(account || user);
  const isAdmin = !!(user && currentMembership && currentMembership.role === "admin");

  return (
    <AuthContext.Provider
      value={{ 
        account,
        user, 
        currentMembership, 
        currentCommunity, 
        allCommunities,
        isAuthenticated,
        isAdmin,
        setAccount,
        setUser, 
        selectMembership,
        selectCommunity,
        refreshMemberships,
        logout 
      }}
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
