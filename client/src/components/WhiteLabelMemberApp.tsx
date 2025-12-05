import { useWhiteLabel } from "@/contexts/WhiteLabelContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import MobileContainer from "@/components/MobileContainer";
import MobileLogin from "@/pages/mobile/Login";
import MobileHome from "@/pages/mobile/Home";
import MobileCard from "@/pages/mobile/Card";
import MobileNews from "@/pages/mobile/News";
import MobileNewsDetail from "@/pages/mobile/NewsDetail";
import MobileEvents from "@/pages/mobile/Events";
import MobileEventDetail from "@/pages/mobile/EventDetail";
import MobileMessages from "@/pages/mobile/Messages";
import MobileProfile from "@/pages/mobile/Profile";
import MobilePayment from "@/pages/mobile/Payment";
import MobileSupport from "@/pages/mobile/Support";
import { Loader2 } from "lucide-react";

export default function WhiteLabelMemberApp() {
  const { isWhiteLabel, isLoading, communityId } = useWhiteLabel();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isWhiteLabel && communityId) {
      if (location === "/" || location === "/app/login") {
        setLocation(`/app/${communityId}/home`);
      }
    }
  }, [isLoading, isWhiteLabel, communityId, location, setLocation]);

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileContainer>
    );
  }

  if (!isWhiteLabel) {
    return null;
  }

  return (
    <MobileContainer>
      <MobileLogin />
    </MobileContainer>
  );
}
