import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, Conversation, Message } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, MoreVertical, Paperclip, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminMessages() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(MOCK_CONVERSATIONS[0]?.id || null);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [replyText, setReplyText] = useState("");

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const currentMessages = messages.filter(m => m.conversationId === selectedConversationId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversationId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversationId,
      sender: "Admin",
      senderRole: "admin",
      content: replyText,
      timestamp: new Date().toISOString(),
      read: true
    };

    setMessages([...messages, newMessage]);
    setReplyText("");
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 flex overflow-hidden">
        {/* Sidebar List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Rechercher un adhérent..." className="pl-9 bg-gray-50" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversationId === conv.id ? "bg-blue-50/50 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-gray-900">{conv.memberName}</div>
                  {conv.unreadCount > 0 && (
                    <Badge className="bg-red-500 h-5 min-w-[20px] p-0 flex items-center justify-center rounded-full text-[10px]">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-primary mb-2">{conv.section}</div>
                <p className="text-sm text-gray-500 line-clamp-1">{conv.lastMessage}</p>
                <span className="text-xs text-gray-400 mt-2 block">
                  {new Date(conv.lastMessageDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50/30">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.memberAvatar} />
                    <AvatarFallback>{selectedConversation.memberName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-gray-900">{selectedConversation.memberName}</div>
                    <div className="text-xs text-gray-500">Adhérent • {selectedConversation.section}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical size={20} className="text-gray-400" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {currentMessages.map((msg) => {
                  const isAdmin = msg.senderRole === "admin";
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                        isAdmin 
                          ? "bg-primary text-white rounded-br-none" 
                          : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isAdmin ? "text-blue-100" : "text-gray-400"}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {isAdmin && msg.read && <Check size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="flex gap-3 items-end">
                  <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                    <Paperclip size={20} />
                  </Button>
                  <div className="flex-1 relative">
                    <Input 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Écrivez votre réponse..." 
                      className="min-h-[45px] py-3 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-primary"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!replyText.trim()}
                    className="h-[45px] px-6 rounded-xl bg-primary hover:bg-primary/90"
                  >
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
