import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_CONVERSATIONS } from "@/lib/mockData";

export default function MobileAdminMessages({ params }: { params: { communityId: string } }) {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const [conversations] = useState(MOCK_CONVERSATIONS);
  
  useEffect(() => {
    if (!user) {
      setLocation("/app/admin/login");
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="mobile-admin-messages-page">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center gap-3">
            <Link href={`/app/${params.communityId}/admin`}>
              <Button variant="ghost" size="icon" className="-ml-2 text-gray-500">
                <ArrowLeft />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">Messagerie</h1>
          </div>
          <div className="px-4 pb-3">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <Input placeholder="Rechercher..." className="pl-9 bg-gray-50 border-gray-200 rounded-xl h-10" data-testid="input-search-messages" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div 
              key={conv.id}
              className="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
              data-testid={`conversation-${conv.id}`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conv.memberAvatar} />
                  <AvatarFallback>{conv.memberName[0]}</AvatarFallback>
                </Avatar>
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{conv.memberName}</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(conv.lastMessageDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">Aucune conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
