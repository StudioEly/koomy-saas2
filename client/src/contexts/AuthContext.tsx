import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Account, User, UserCommunityMembership, Community } from "@shared/schema";
import { API_BASE_URL as API_URL } from "@/api/config";

interface AuthAccount extends Omit<Account, "passwordHash"> {
  memberships: (UserCommunityMembership & { community?: Community })[];
}

interface AuthUser extends Omit<User, "password"> {
  memberships: (UserCommunityMembership & { community?: Community })[];
  isPlatformAdmin?: boolean;
}

interface AuthContextType {
  account: AuthAccount | null;
  user: AuthUser | null;
  currentMembership: (UserCommunityMembership & { community?: Community }) | null;
  currentCommunity: Community | null;
  allCommunities: Community[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPlatformAdmin: boolean;
  authReady: boolean;
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

function hydrateFromStorage() {
  const storedAccount = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  const storedMembership = localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
  return {
    account: storedAccount ? JSON.parse(storedAccount) : null,
    user: storedUser ? JSON.parse(storedUser) : null,
    membership: storedMembership ? JSON.parse(storedMembership) : null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialState = hydrateFromStorage();
  const [authReady, setAuthReady] = useState(true);
  const [account, setAccountState] = useState<AuthAccount | null>(initialState.account);
  const [user, setUserState] = useState<AuthUser | null>(initialState.user);
  const [previousUserId, setPreviousUserId] = useState<string | null>(initialState.user?.id || null);
  
  const [currentMembership, setCurrentMembership] = useState<(UserCommunityMembership & { community?: Community }) | null>(initialState.membership);
  
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
    const currentUserId = user?.id || previousUserId;
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      if (currentUserId && currentUserId !== newUser.id) {
        setCurrentMembership(null);
        setCurrentCommunity(null);
        localStorage.removeItem(MEMBERSHIP_STORAGE_KEY);
      } else if (!newUser.memberships || newUser.memberships.length === 0) {
        setCurrentMembership(null);
        setCurrentCommunity(null);
        localStorage.removeItem(MEMBERSHIP_STORAGE_KEY);
      }
      setPreviousUserId(newUser.id);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      setCurrentMembership(null);
      setCurrentCommunity(null);
      localStorage.removeItem(MEMBERSHIP_STORAGE_KEY);
      setPreviousUserId(null);
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

  useEffect(() => {
    if (user && user.memberships && user.memberships.length > 0 && !currentMembership) {
      const storedMembership = localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
      if (storedMembership) {
        const parsed = JSON.parse(storedMembership);
        const validMembership = user.memberships.find(m => m.id === parsed.id || m.communityId === parsed.communityId);
        if (validMembership) {
          setCurrentMembership(validMembership);
          if (validMembership.community) {
            setCurrentCommunity(validMembership.community as Community);
          }
        }
      } else if (user.memberships.length === 1) {
        const membership = user.memberships[0];
        setCurrentMembership(membership);
        localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(membership));
        if (membership.community) {
          setCurrentCommunity(membership.community as Community);
        }
      }
    }
  }, [user, currentMembership]);

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
  const isPlatformAdmin = !!(user && user.globalRole === 'platform_super_admin');

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
        isPlatformAdmin,
        authReady,
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
