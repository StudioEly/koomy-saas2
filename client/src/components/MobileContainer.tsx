import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-[430px] h-[100dvh] max-h-[932px] bg-white overflow-hidden shadow-2xl"
        style={{
          borderRadius: "clamp(0px, 2vw, 40px)",
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
