import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, MoreVertical, Paperclip, Check, MessageSquare, Loader2, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { UserCommunityMembership, Message } from "@shared/schema";

interface ConversationPreview {
  memberId: string;
  memberName: string;
  memberAvatar?: string | null;
  section?: string | null;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

interface MessageWithSender extends Message {
  sender?: {
    displayName?: string;
    role?: string;
  };
}

export default function AdminMessages() {
  const { currentMembership } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId || "community_unsa";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: members = [], isLoading: membersLoading } = useQuery<UserCommunityMembership[]>({
    queryKey: [`/api/communities/${communityId}/members`],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: [`/api/communities/${communityId}/messages/${selectedMemberId}`],
    enabled: !!selectedMemberId && !!communityId,
  });

  const membersWithConversations = members.filter(m => m.role === "member" || !m.role);

  const filteredMembers = membersWithConversations.filter(m => {
    const name = m.displayName || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          conversationId: selectedMemberId,
          senderMembershipId: currentMembership?.id,
          content,
          senderType: "admin"
        })
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/messages/${selectedMemberId}`] });
      setReplyText("");
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi du message");
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMemberId) return;
    sendMessageMutation.mutate(replyText);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (membersLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 flex overflow-hidden" data-testid="messages-container">
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-lg mb-3">Messagerie</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Rechercher un adhérent..." 
                className="pl-9 bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-conversations"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filteredMembers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Aucun adhérent trouvé</p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div 
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMemberId === member.id ? "bg-blue-50/50 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                  }`}
                  data-testid={`conversation-${member.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {(member.displayName || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{member.displayName}</div>
                      <div className="text-xs text-primary">{member.section || 'Non affecté'}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col bg-gray-50/30">
          {selectedMember ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(selectedMember.displayName || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-gray-900">{selectedMember.displayName}</div>
                    <div className="text-xs text-gray-500">Adhérent • {selectedMember.section || 'Non affecté'}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical size={20} className="text-gray-400" />
                </Button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare size={48} className="mb-4" />
                    <p className="text-sm">Aucun message</p>
                    <p className="text-xs mt-1">Commencez la conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderType === "admin";
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                          isAdmin 
                            ? "bg-primary text-white rounded-br-none" 
                            : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isAdmin ? "text-blue-100" : "text-gray-400"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {isAdmin && msg.read && <Check size={12} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="flex gap-3 items-end">
                  <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                    <Paperclip size={20} />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Écrire un message..."
                      className="pr-12 bg-gray-50 border-gray-200 focus:ring-primary"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      data-testid="input-message"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="icon"
                    className="bg-primary hover:bg-primary/90"
                    disabled={!replyText.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={64} className="mb-4" />
              <p className="text-lg font-medium">Sélectionnez une conversation</p>
              <p className="text-sm mt-1">Choisissez un adhérent pour démarrer</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
