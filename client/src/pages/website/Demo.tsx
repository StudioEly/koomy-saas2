import { useEffect } from "react";
import { useLocation } from "wouter";

export default function WebsiteDemo() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/website/contact?type=demo");
  }, [setLocation]);

  return null;
}
