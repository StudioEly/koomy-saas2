import { useEffect } from "react";
import { useLocation } from "wouter";

const FAVICON_KOOMY = "/favicon-koomy.png";
const FAVICON_PRO = "/favicon-pro.png";

export default function FaviconManager() {
  const [location] = useLocation();

  useEffect(() => {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    
    let faviconUrl = FAVICON_KOOMY;
    
    if (
      hostname === "app-pro.koomy.app" ||
      hostname === "backoffice.koomy.app" ||
      hostname === "lorpesikoomyadmin.koomy.app" ||
      location.startsWith("/app-pro") ||
      location.startsWith("/admin") ||
      location.startsWith("/platform")
    ) {
      faviconUrl = FAVICON_PRO;
    }

    const existingFavicon = document.querySelector('link[rel="icon"]');
    const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');

    if (existingFavicon) {
      existingFavicon.setAttribute("href", faviconUrl);
    }
    if (existingAppleIcon) {
      existingAppleIcon.setAttribute("href", faviconUrl);
    }
  }, [location]);

  return null;
}
