import { useEffect } from "react";
import MobileLayout from "@/components/layouts/MobileLayout";
import { Button } from "@/components/ui/button";
import { User, Settings, Bell, ChevronRight, HelpCircle, Shield, ArrowLeft, CreditCard } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileProfile({ params }: { params: { communityId: string } }) {
  const { communityId } = params;
  const { user, account, currentMembership, currentCommunity, selectCommunity, selectMembership } = useAuth();
  const [_, setLocation] = useLocation();

  const currentUser = account || user;
  const accountMembership = account?.memberships?.find(m => m.communityId === communityId);
  const activeMembership = currentMembership || accountMembership;

  useEffect(() => {
    if (currentCommunity?.id !== communityId) {
      selectCommunity(communityId);
    }
    if (accountMembership && currentMembership?.id !== accountMembership.id) {
      selectMembership(accountMembership.id);
    }
  }, [communityId, accountMembership, currentMembership, currentCommunity, selectMembership, selectCommunity]);

  const handleLogout = () => {
    setLocation("/app/hub");
  };

  if (!currentUser) {
    return (
      <MobileLayout communityId={communityId}>
        <div className="p-6 pt-10 text-center text-gray-500">
          Chargement...
        </div>
      </MobileLayout>
    );
  }

  const pendingPayments = activeMembership?.contributionStatus !== "up_to_date";

  return (
    <MobileLayout communityId={communityId}>
      <div className="p-6 pt-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon Compte</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg mb-4 relative">
             <img 
               src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.firstName || 'user'}`} 
               alt="Profile" 
               className="w-full h-full rounded-full object-cover" 
             />
             <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors">
               <Settings size={14} />
             </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{activeMembership?.displayName || currentUser.firstName || "Membre"}</h2>
          <p className="text-gray-500">{currentUser.email}</p>
        </div>

        <div className="space-y-4">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-primary"><User size={18} /></div>
                  <span className="text-sm font-medium text-gray-700">Informations personnelles</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
             </div>
             <div className="p-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-primary"><Bell size={18} /></div>
                  <span className="text-sm font-medium text-gray-700">Notifications</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
             </div>
             <div className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-primary"><Shield size={18} /></div>
                  <span className="text-sm font-medium text-gray-700">Sécurité et confidentialité</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
             </div>
           </div>

           <div className={`bg-white rounded-xl shadow-sm border ${pendingPayments ? "border-orange-200" : "border-gray-100"} overflow-hidden`}>
             <Link href={`/app/${communityId}/payment`}>
               <div className={`p-4 flex justify-between items-center ${pendingPayments ? "hover:bg-orange-50" : "hover:bg-gray-50"} cursor-pointer transition-colors`} data-testid="link-payments">
                  <div className="flex items-center gap-3">
                    <div className={`${pendingPayments ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-primary"} p-2 rounded-lg`}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Mes Cotisations</span>
                      {pendingPayments && (
                        <p className="text-xs text-orange-600">Paiement en attente</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className={pendingPayments ? "text-orange-400" : "text-gray-400"} />
               </div>
             </Link>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <Link href={`/app/${communityId}/support`}>
               <div className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg text-gray-600"><HelpCircle size={18} /></div>
                    <span className="text-sm font-medium text-gray-700">Aide & Support</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
               </div>
             </Link>
           </div>

           <Button 
             variant="outline" 
             className="w-full h-12 rounded-xl mt-4 text-gray-500 border-gray-200"
             onClick={handleLogout}
           >
             <ArrowLeft className="mr-2 h-4 w-4" /> Changer de communauté
           </Button>
           
           <p className="text-center text-xs text-gray-400 mt-6">
             Version 2.0.0 • Koomy SaaS
           </p>
        </div>
      </div>
    </MobileLayout>
  );
}
