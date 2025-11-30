import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User, UserCommunityMembership, Community } from "@shared/schema";

interface AuthUser extends Omit<User, "password"> {
  memberships: UserCommunityMembership[];
}

interface AuthContextType {
  user: AuthUser | null;
  currentMembership: UserCommunityMembership | null;
  currentCommunity: Community | null;
  allCommunities: Community[];
  setUser: (user: AuthUser | null) => void;
  selectCommunity: (communityId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentMembership, setCurrentMembership] = useState<UserCommunityMembership | null>(null);
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);

  const { data: allCommunities = [] } = useQuery<Community[]>({
    queryKey: ["/api/communities"],
    enabled: !!user
  });

  const selectCommunity = (communityId: string) => {
    if (!user) return;
    
    const membership = user.memberships.find(m => m.communityId === communityId);
    if (membership) {
      setCurrentMembership(membership);
      const community = allCommunities.find(c => c.id === communityId);
      if (community) {
        setCurrentCommunity(community);
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
    setUser(null);
    setCurrentMembership(null);
    setCurrentCommunity(null);
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        currentMembership, 
        currentCommunity, 
        allCommunities,
        setUser, 
        selectCommunity, 
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
