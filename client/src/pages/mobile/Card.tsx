import { useState } from "react";
import MobileLayout from "@/components/layouts/MobileLayout";
import { MOCK_USER } from "@/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import logo from "@assets/generated_images/modern_minimalist_union_logo_with_letter_u_or_abstract_knot_symbol_in_blue_and_red.png";

export default function MobileCard({ params }: { params: { communityId: string } }) {
  const { communityId } = params;
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const user = MOCK_USER;
  const membership = user.communities.find(c => c.communityId === communityId);

  if (!membership) return null;

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
            <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-primary to-blue-800 text-white p-6 flex flex-col justify-between">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full -ml-10 -mb-10 blur-xl"></div>

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md">
                    <img src={logo} alt="Logo" className="w-8 h-8 brightness-200 grayscale" />
                  </div>
                  <span className="font-bold text-lg tracking-wide">UNSA</span>
                </div>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                  2025
                </span>
              </div>

              <div className="relative z-10 text-center my-4">
                 <div className="w-24 h-24 bg-white rounded-full mx-auto p-1 shadow-inner mb-3">
                   <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="User" />
                 </div>
                 <h2 className="text-xl font-bold shadow-black drop-shadow-md">{user.firstName} {user.lastName}</h2>
                 <p className="text-blue-200 text-sm">{membership.section || "Membre"}</p>
              </div>

              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-blue-200 uppercase tracking-wider">N° Adhérent</p>
                  <p className="font-mono text-lg tracking-widest">{membership.memberId}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-blue-200 uppercase tracking-wider">Depuis</p>
                   <p className="text-sm font-medium">{new Date(membership.joinDate).getFullYear()}</p>
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
                   <QRCode value={membership.memberId} size={120} />
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
            <h3 className="text-xl font-bold text-center mb-2">{user.firstName} {user.lastName}</h3>
            <p className="text-gray-500 text-sm mb-6">{membership.memberId}</p>
            <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100">
              <QRCode value={membership.memberId} size={250} />
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
