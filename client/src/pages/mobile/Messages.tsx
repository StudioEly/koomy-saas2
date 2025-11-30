import { useState } from "react";
import MobileLayout from "@/components/layouts/MobileLayout";
import { MOCK_MESSAGES, MOCK_USER } from "@/lib/mockData";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MobileMessages({ params }: { params: { communityId: string } }) {
  const { communityId } = params;
  const [messages, setMessages] = useState(MOCK_MESSAGES.filter(m => m.conversationId === "c1"));
  const [newMessage, setNewMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now().toString(),
      communityId,
      conversationId: "c1",
      sender: `${MOCK_USER.firstName} ${MOCK_USER.lastName}`,
      senderRole: "member" as const,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  return (
    <MobileLayout communityId={communityId}>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
        <div className="bg-white p-4 border-b sticky top-0 z-10 shadow-sm flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-white font-bold">DL</AvatarFallback>
          </Avatar>
          <div>
             <h2 className="font-bold text-gray-900 text-sm">Délégué Section IDF</h2>
             <div className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <p className="text-xs text-gray-500">En ligne</p>
             </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 pb-20">
          {messages.map((msg) => {
            const isMe = msg.senderRole === "member";
            return (
              <div 
                key={msg.id} 
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isMe 
                    ? "bg-primary text-white rounded-br-none shadow-md shadow-primary/20" 
                    : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-white border-t fixed bottom-16 w-full max-w-md">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..." 
              className="rounded-full bg-gray-100 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 rounded-full bg-primary text-white disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </MobileLayout>
  );
}
