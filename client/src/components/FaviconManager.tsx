import { useEffect } from "react";
import { useLocation } from "wouter";

const FAVICON_KOOMY = "/favicon-koomy.png";
const FAVICON_APP_PRO = "/icons/koomy-icon-512.png";

export default function FaviconManager() {
  const [location] = useLocation();

  useEffect(() => {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    
    let faviconUrl = FAVICON_APP_PRO;
    let appleIconUrl = FAVICON_APP_PRO;
    
    if (
      hostname === "koomy.app" ||
      hostname === "app.koomy.app" ||
      location.startsWith("/website") ||
      location.startsWith("/app/") ||
      location === "/app"
    ) {
      faviconUrl = FAVICON_KOOMY;
      appleIconUrl = FAVICON_KOOMY;
    }

    const existingFavicon = document.querySelector('link[rel="icon"]');
    const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');

    if (existingFavicon) {
      existingFavicon.setAttribute("href", faviconUrl);
    }
    if (existingAppleIcon) {
      existingAppleIcon.setAttribute("href", appleIconUrl);
    }
  }, [location]);

  return null;
}
