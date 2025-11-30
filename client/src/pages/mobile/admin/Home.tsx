import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MOCK_COMMUNITIES, MOCK_USER } from "@/lib/mockData";
import { ArrowLeft, QrCode, MessageSquare, Users, Calendar, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function MobileAdminHome({ params }: { params: { communityId: string } }) {
  const [_, setLocation] = useLocation();
  const communityId = params.communityId;
  const community = MOCK_COMMUNITIES.find(c => c.id === communityId);

  if (!community) return <div>Communauté introuvable</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        
        {/* Admin Header */}
        <header className="bg-gray-900 text-white px-4 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/app/${communityId}/home`}>
              <a className="text-gray-300 hover:text-white flex items-center gap-1 text-sm">
                <ArrowLeft size={16} /> Retour App
              </a>
            </Link>
            <Badge className="bg-purple-500 text-white border-0">Mode Admin</Badge>
          </div>
          <h1 className="text-xl font-bold">{community.name}</h1>
          <p className="text-sm text-gray-400">Gestion locale</p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-6">
             <div className="bg-gray-800 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">12</div>
                <div className="text-[10px] text-gray-400 uppercase">Messages</div>
             </div>
             <div className="bg-gray-800 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">150</div>
                <div className="text-[10px] text-gray-400 uppercase">Inscrits</div>
             </div>
             <div className="bg-gray-800 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">85%</div>
                <div className="text-[10px] text-gray-400 uppercase">Présence</div>
             </div>
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Actions Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/app/${communityId}/admin/scanner`}>
              <div className="bg-purple-50 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer active:scale-95 transition-transform border border-purple-100">
                 <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                   <QrCode size={24} />
                 </div>
                 <span className="font-bold text-gray-900 text-sm">Scanner</span>
              </div>
            </Link>
            <Link href={`/app/${communityId}/admin/messages`}>
              <div className="bg-blue-50 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer active:scale-95 transition-transform border border-blue-100">
                 <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                   <MessageSquare size={24} />
                 </div>
                 <span className="font-bold text-gray-900 text-sm">Messages</span>
              </div>
            </Link>
          </div>

          {/* Recent Activity / Quick Tasks */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Prochain Événement</h3>
            </div>
            <div className="p-4">
              <div className="flex gap-3">
                <div className="bg-red-100 text-red-600 rounded-lg w-12 h-12 flex flex-col items-center justify-center leading-none flex-shrink-0">
                   <span className="text-xs font-bold">DEC</span>
                   <span className="text-lg font-bold">20</span>
                </div>
                <div>
                   <h4 className="font-bold text-sm">Tournoi de Noël</h4>
                   <p className="text-xs text-gray-500 mb-2">Club House • 14:00</p>
                   <Button size="sm" className="h-8 text-xs w-full bg-gray-900">Voir les inscrits</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Derniers Messages</h3>
              <Badge variant="secondary" className="text-[10px]">3 non-lus</Badge>
            </div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 flex gap-3 hover:bg-gray-50 cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-200 text-xs">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between mb-0.5">
                       <span className="font-bold text-xs">Jean Dupont</span>
                       <span className="text-[10px] text-gray-400">14:20</span>
                     </div>
                     <p className="text-xs text-gray-500 truncate">Bonjour, je serai en retard pour le tournoi...</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 text-center border-t border-gray-100">
               <Link href={`/app/${communityId}/admin/messages`}>
                 <a className="text-xs font-bold text-primary">Voir tout</a>
               </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
