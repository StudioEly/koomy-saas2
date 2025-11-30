import MobileLayout from "@/components/layouts/MobileLayout";
import { MOCK_USER } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { User, Settings, Bell, LogOut, ChevronRight, HelpCircle, Shield, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function MobileProfile({ params }: { params: { communityId: string } }) {
  const { communityId } = params;
  const user = MOCK_USER;
  const [_, setLocation] = useLocation();

  const handleLogout = () => {
    setLocation("/app/hub"); // Go back to Hub instead of Login
  };

  return (
    <MobileLayout communityId={communityId}>
      <div className="p-6 pt-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon Compte</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg mb-4 relative">
             <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
             <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors">
               <Settings size={14} />
             </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
          <p className="text-gray-500">{user.email}</p>
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

           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg text-gray-600"><HelpCircle size={18} /></div>
                  <span className="text-sm font-medium text-gray-700">Aide & Support</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
             </div>
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
