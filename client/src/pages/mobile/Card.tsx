import { useState, useEffect } from "react";
import MobileLayout from "@/components/layouts/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import logo from "@assets/generated_images/modern_minimalist_union_logo_with_letter_u_or_abstract_knot_symbol_in_blue_and_red.png";

export default function MobileCard({ params }: { params: { communityId: string } }) {
  const { communityId } = params;
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const { user, account, currentMembership, currentCommunity, selectCommunity, selectMembership } = useAuth();

  const currentUser = account || user;
  const accountMembership = account?.memberships?.find(m => m.communityId === communityId);
  const activeMembership = currentMembership || accountMembership;

  useEffect(() => {
    if (accountMembership && currentMembership?.communityId !== communityId) {
      selectMembership(accountMembership.id);
    } else if (!accountMembership && currentMembership?.communityId !== communityId) {
      selectCommunity(communityId);
    }
  }, [communityId, accountMembership, currentMembership, selectMembership, selectCommunity]);

  if (!currentUser || !activeMembership) {
    return (
      <MobileLayout communityId={communityId}>
        <div className="min-h-full flex items-center justify-center p-6">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout communityId={communityId}>
      <div className="min-h-full flex flex-col items-center p-6 pt-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Ma Carte Adhérent</h1>

        <div className="perspective-1000 w-full max-w-sm aspect-[1.586] relative group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <motion.div 
            className="w-full h-full relative transform-style-3d transition-all duration-700"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* FRONT SIDE */}
            <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-primary to-blue-800 text-white p-6 flex flex-col justify-between border border-white/10">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-lg shadow-sm">
                    <img 
                      src={currentCommunity?.logo || logo} 
                      alt="Logo" 
                      className="w-8 h-8 object-contain" 
                    />
                  </div>
                  <div>
                    <span className="font-bold text-lg tracking-wide block leading-none">
                      {currentCommunity?.name?.split(' ')[0] || "UNSA"}
                    </span>
                    <span className="text-[10px] opacity-80 uppercase tracking-wider">Carte de Membre</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                  activeMembership.status === "active" 
                    ? "bg-green-500/20 border-green-400/30 text-green-100" 
                    : "bg-red-500/20 border-red-400/30 text-red-100"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${activeMembership.status === "active" ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></div>
                  {activeMembership.status === "active" ? "ACTIF" : "EXPIRÉ"}
                </div>
              </div>

              <div className="relative z-10 mt-2">
                 <div className="flex items-center gap-4">
                   <div className="w-20 h-20 bg-white/10 rounded-full p-1 shadow-inner backdrop-blur-sm border border-white/20">
                     <img 
                       src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.firstName || 'user'}`} 
                       className="w-full h-full rounded-full object-cover" 
                       alt="User" 
                     />
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-white shadow-black drop-shadow-md tracking-tight">{activeMembership.displayName || currentUser.firstName || "Membre"}</h2>
                     <h2 className="text-xl font-bold text-white shadow-black drop-shadow-md tracking-tight uppercase">{currentUser.lastName || ""}</h2>
                     <p className="text-blue-200 text-xs mt-1 font-medium">{activeMembership.section || "Membre"}</p>
                   </div>
                 </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-y-2 gap-x-4 text-xs border-t border-white/10 pt-3 mt-1">
                <div>
                  <p className="text-blue-300 uppercase tracking-wider text-[9px] mb-0.5">N° Adhérent</p>
                  <p className="font-mono font-medium tracking-wider">{activeMembership.memberId}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-300 uppercase tracking-wider text-[9px] mb-0.5">Année</p>
                  <p className="font-medium">{new Date().getFullYear()}</p>
                </div>
                <div>
                   <p className="text-blue-300 uppercase tracking-wider text-[9px] mb-0.5">Adhésion</p>
                   <p className="font-medium">
                     {activeMembership.joinDate 
                       ? new Date(activeMembership.joinDate).toLocaleDateString('fr-FR')
                       : activeMembership.claimedAt
                         ? new Date(activeMembership.claimedAt).toLocaleDateString('fr-FR')
                         : "01/01/" + new Date().getFullYear()}
                   </p>
                </div>
                <div className="text-right">
                   <p className="text-blue-300 uppercase tracking-wider text-[9px] mb-0.5">Expiration</p>
                   <p className="font-medium text-white">
                     {activeMembership.nextDueDate 
                       ? new Date(activeMembership.nextDueDate).toLocaleDateString('fr-FR') 
                       : "31/12/" + new Date().getFullYear()}
                   </p>
                </div>
              </div>
            </div>

            {/* BACK SIDE */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl shadow-2xl overflow-hidden bg-white text-gray-800 p-6 flex flex-col items-center justify-center border border-gray-200">
               <div className="text-center w-full">
                 <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Code de validation</p>
                 
                 <div className="bg-white p-2 rounded-xl border-2 border-gray-100 shadow-inner inline-block mb-4" onClick={(e) => {
                   e.stopPropagation();
                   setShowQRModal(true);
                 }}>
                   <QRCode value={activeMembership.memberId || "MEMBER"} size={120} />
                 </div>
                 
                 <p className="text-xs text-gray-500 mb-6">Scannez ce code pour valider votre présence aux événements.</p>
                 
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setShowQRModal(true);
                   }}
                   className="flex items-center gap-2 mx-auto text-primary font-semibold text-sm hover:underline"
                 >
                   <ZoomIn size={16} /> Agrandir le QR Code
                 </button>
               </div>
            </div>
          </motion.div>
        </div>

        <p className="text-gray-400 text-sm mt-8 animate-pulse">
          Touchez la carte pour la retourner
        </p>

        {/* QR Modal */}
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="bg-white sm:max-w-md border-0 shadow-2xl p-8 flex flex-col items-center">
            <h3 className="text-xl font-bold text-center mb-2">{activeMembership.displayName || currentUser.firstName || "Membre"}</h3>
            <p className="text-gray-500 text-sm mb-6">{activeMembership.memberId}</p>
            <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100">
              <QRCode value={activeMembership.memberId || "MEMBER"} size={250} />
            </div>
            <p className="text-center text-gray-400 text-xs mt-6 max-w-[200px]">
              Présentez ce code à l'accueil de l'événement.
            </p>
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowQRModal(false)}
            >
              <X size={24} />
            </button>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
