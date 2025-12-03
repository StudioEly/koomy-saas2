import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ManifestManager() {
  const [location] = useLocation();

  useEffect(() => {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    
    let manifestUrl = "/manifest.json";
    
    if (
      hostname === "app-pro.koomy.app" ||
      location.startsWith("/app-pro") ||
      location.startsWith("/admin")
    ) {
      manifestUrl = "/manifest-pro.json";
    }

    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.setAttribute("href", manifestUrl);
    }
  }, [location]);

  return null;
}
