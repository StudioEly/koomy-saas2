import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Plus, ChevronRight, LogOut, Shield } from "lucide-react";
import { MOCK_USER, MOCK_COMMUNITIES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import koomyLogo from "@assets/Koomy-communitieslogo_1764495780161.png";

export default function CommunityHub() {
  const [location, setLocation] = useLocation();
  const [joinCode, setJoinCode] = useState("");
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const userCommunities = MOCK_USER.communities.map(membership => {
    const community = MOCK_COMMUNITIES.find(c => c.id === membership.communityId);
    return { ...membership, community };
  }).filter(item => item.community);

  const handleJoin = () => {
    if (joinCode.length < 4) {
      toast({ title: "Code invalide", description: "Le code doit contenir au moins 4 caractères.", variant: "destructive" });
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setIsJoinOpen(false);
      setJoinCode("");
      toast({ title: "Succès", description: "Vous avez rejoint la communauté !" });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        
        {/* Koomy Header */}
        <div className="bg-white p-6 pt-12 pb-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <img src={koomyLogo} alt="Koomy" className="h-10" />
          <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold">
            {MOCK_USER.firstName[0]}
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Communautés</h1>
            <p className="text-gray-500 text-sm">Retrouvez toutes vos organisations au même endroit.</p>
          </div>

          {/* Community List */}
          <div className="space-y-4">
            {userCommunities.map((item) => (
              <div 
                key={item.communityId}
                onClick={() => {
                  // If admin, ask where to go? No, default to app, switch to admin inside app
                  setLocation(`/app/${item.communityId}/home`);
                }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group active:scale-98"
              >
                <div className="h-16 w-16 rounded-xl bg-gray-50 p-1 border border-gray-100 flex-shrink-0">
                  <img src={item.community?.logo} alt={item.community?.name} className="w-full h-full object-contain rounded-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{item.community?.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{item.community?.description}</p>
                  <div className="flex gap-2 mt-2">
                    {item.role === "admin" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                        <Shield size={10} /> Admin
                      </span>
                    )}
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${
                      item.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {item.status === "active" ? "Actif" : "Expiré"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-primary" />
              </div>
            ))}

            {/* Add New Button */}
            <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
              <DialogTrigger asChild>
                <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary hover:bg-blue-50/50 transition-all group">
                  <div className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center">
                    <Plus className="text-gray-500 group-hover:text-primary" size={18} />
                  </div>
                  <span className="font-medium">Rejoindre une communauté</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter une communauté</DialogTitle>
                </DialogHeader>
                <div className="py-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Plus className="text-primary h-8 w-8" />
                  </div>
                  <p className="text-gray-500 text-sm mb-6">
                    Entrez le code d'invitation reçu par SMS ou email pour rejoindre votre organisation.
                  </p>
                  <Input 
                    placeholder="Ex: UNSA-8821" 
                    className="text-center text-lg tracking-widest uppercase font-mono h-14"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleJoin} className="w-full h-12 text-lg">Rejoindre</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 text-center">
          <Link href="/">
            <a className="text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-2">
              <LogOut size={14} /> Se déconnecter
            </a>
          </Link>
          <p className="text-[10px] text-gray-300 mt-4">Koomy Platform v2.0 • Powered by Replit</p>
        </div>

      </div>
    </div>
  );
}
