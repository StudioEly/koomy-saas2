import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

type BrandConfig = {
  appName?: string;
  brandColor?: string;
  logoUrl?: string;
  appIconUrl?: string;
  emailFromName?: string;
  emailFromAddress?: string;
  replyTo?: string;
  showPoweredBy?: boolean;
};

type WhiteLabelConfig = {
  whiteLabel: boolean;
  communityId?: string;
  communityName?: string;
  communityLogo?: string | null;
  brandConfig?: BrandConfig;
  whiteLabelTier?: "basic" | "standard" | "premium" | null;
  whiteLabelIncludedMembers?: number | null;
  whiteLabelMaxMembersSoftLimit?: number | null;
  hostname?: string;
};

interface WhiteLabelContextType {
  isWhiteLabel: boolean;
  whiteLabelConfig: WhiteLabelConfig | null;
  communityId: string | null;
  brandConfig: BrandConfig | null;
  isLoading: boolean;
  appName: string;
  brandColor: string;
  logoUrl: string | null;
  showPoweredBy: boolean;
}

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined);

const DEFAULT_BRAND_COLOR = "#6366f1";
const DEFAULT_APP_NAME = "Koomy";

export function WhiteLabelProvider({ children }: { children: ReactNode }) {
  const [whiteLabelConfig, setWhiteLabelConfig] = useState<WhiteLabelConfig | null>(null);

  const { data, isLoading } = useQuery<WhiteLabelConfig>({
    queryKey: ["white-label-config"],
    queryFn: async () => {
      const response = await fetch("/api/white-label/config");
      if (!response.ok) throw new Error("Failed to fetch white-label config");
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setWhiteLabelConfig(data);
    }
  }, [data]);

  const isWhiteLabel = whiteLabelConfig?.whiteLabel ?? false;
  const communityId = isWhiteLabel ? (whiteLabelConfig?.communityId ?? null) : null;
  const brandConfig = isWhiteLabel ? (whiteLabelConfig?.brandConfig ?? null) : null;
  
  const appName = brandConfig?.appName || whiteLabelConfig?.communityName || DEFAULT_APP_NAME;
  const brandColor = brandConfig?.brandColor || DEFAULT_BRAND_COLOR;
  const logoUrl = brandConfig?.logoUrl || whiteLabelConfig?.communityLogo || null;
  const showPoweredBy = brandConfig?.showPoweredBy !== false;

  useEffect(() => {
    if (isWhiteLabel && brandColor) {
      document.documentElement.style.setProperty("--wl-brand-color", brandColor);
      const hsl = hexToHsl(brandColor);
      if (hsl) {
        document.documentElement.style.setProperty("--wl-brand-h", String(hsl.h));
        document.documentElement.style.setProperty("--wl-brand-s", `${hsl.s}%`);
        document.documentElement.style.setProperty("--wl-brand-l", `${hsl.l}%`);
      }
    }
  }, [isWhiteLabel, brandColor]);

  return (
    <WhiteLabelContext.Provider
      value={{
        isWhiteLabel,
        whiteLabelConfig,
        communityId,
        brandConfig,
        isLoading,
        appName,
        brandColor,
        logoUrl,
        showPoweredBy,
      }}
    >
      {children}
    </WhiteLabelContext.Provider>
  );
}

export function useWhiteLabel() {
  const context = useContext(WhiteLabelContext);
  if (context === undefined) {
    throw new Error("useWhiteLabel must be used within a WhiteLabelProvider");
  }
  return context;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
