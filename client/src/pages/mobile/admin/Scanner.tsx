import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileAdminScanner({ params }: { params: { communityId: string } }) {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(true);
  const [scannedData, setScannedData] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLocation("/app/admin/login");
      return;
    }
  }, [user, setLocation]);

  useEffect(() => {
    if (scanning && user) {
      const timer = setTimeout(() => {
        setScanning(false);
        setScannedData("MEMBER-2024-8892");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanning, user]);

  const handleReset = () => {
    setScannedData(null);
    setScanning(true);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex justify-center" data-testid="mobile-admin-scanner-page">
      <div className="w-full max-w-md bg-black min-h-screen relative flex flex-col">
        
        <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-center">
          <Link href={`/app/${params.communityId}/admin`}>
             <Button variant="ghost" size="icon" className="text-white rounded-full bg-black/20 backdrop-blur-md">
               <ArrowLeft />
             </Button>
          </Link>
          <div className="text-white font-bold text-shadow">Scanner Entrée</div>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
           {scanning ? (
             <>
               <div className="absolute inset-0 bg-gray-900">
                 <div className="w-full h-full opacity-20" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
               </div>
               
               <div className="relative z-10 w-64 h-64 border-2 border-white/50 rounded-3xl flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-[scan_2s_infinite_linear]"></div>
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white rounded-br-lg"></div>
               </div>
               <p className="relative z-10 text-white/80 mt-8 text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                 Visez le QR Code de l'adhérent
               </p>
             </>
           ) : (
             <div className="bg-white w-[90%] rounded-3xl p-8 flex flex-col items-center animate-in zoom-in-95 duration-200">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Validé !</h2>
                <p className="text-gray-500 mb-6">Membre vérifié</p>
                
                <div className="w-full bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Statut</span>
                    <span className="font-bold text-green-600">À Jour</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Code</span>
                    <span className="font-medium font-mono">{scannedData}</span>
                  </div>
                </div>

                <Button className="w-full h-12 text-lg" onClick={handleReset} data-testid="button-scan-next">
                  Scanner le suivant
                </Button>
             </div>
           )}
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
