import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, MessageCirclePlus, X, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MobileAdminLayout from "@/components/MobileAdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MOCK_CONVERSATIONS } from "@/lib/mockData";
import { API_BASE_URL as API_URL } from "@/api/config";
import type { UserCommunityMembership, DelegatePermissions } from "@shared/schema";
import { extractPermissions } from "@shared/schema";

export default function MobileAdminMessages({ params }: { params: { communityId: string } }) {
  const communityId = params.communityId;
  const [_, setLocation] = useLocation();
  const { user, currentCommunity, currentMembership } = useAuth();
  const queryClient = useQueryClient();
  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedMember, setSelectedMember] = useState<UserCommunityMembership | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const permissions = useMemo<DelegatePermissions | undefined>(() => {
    if (currentMembership) {
      return extractPermissions(currentMembership as any);
    }
    return undefined;
  }, [currentMembership]);

  useEffect(() => {
    if (!user) {
      setLocation("/app/admin/login");
    }
  }, [user, setLocation]);

  useEffect(() => {
    if (permissions && !permissions.canManageMessages) {
      toast.error("Vous n'avez pas la permission de gérer les messages");
      setLocation(`/app/${communityId}/admin`);
    }
  }, [permissions, communityId, setLocation]);

  const { data: members = [] } = useQuery<UserCommunityMembership[]>({
    queryKey: [`/api/communities/${communityId}/memberships`],
    enabled: !!communityId && showNewMessage
  });

  const filteredMembers = useMemo(() => {
    if (!memberSearch) return members.filter(m => m.role === "member");
    const query = memberSearch.toLowerCase();
    return members.filter(m => 
      m.role === "member" && (
        m.displayName?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query)
      )
    );
  }, [members, memberSearch]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.memberName.toLowerCase().includes(query) ||
      conv.lastMessage.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  if (!user) {
    return null;
  }

  const handleSendMessage = async () => {
    if (!selectedMember || !messageContent.trim()) {
      toast.error("Veuillez sélectionner un membre et écrire un message");
      return;
    }
    
    setIsSending(true);
    try {
      const conversationId = `conv_${currentMembership?.id}_${selectedMember.id}`;
      
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          conversationId,
          senderMembershipId: currentMembership?.id,
          senderType: "admin",
          content: messageContent.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }
      
      toast.success(`Message envoyé à ${selectedMember.displayName || "ce membre"}`);
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/messages`] });
      setShowNewMessage(false);
      setSelectedMember(null);
      setMessageContent("");
      setMemberSearch("");
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsSending(false);
    }
  };

  if (showNewMessage) {
    return (
      <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Nouveau message</h2>
            <button 
              onClick={() => {
                setShowNewMessage(false);
                setSelectedMember(null);
                setMessageContent("");
                setMemberSearch("");
              }} 
              className="text-gray-400 hover:text-white p-2"
              data-testid="button-close-new-message"
            >
              <X size={20} />
            </button>
          </div>

          {!selectedMember ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Rechercher un membre..."
                  className="h-11 pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  data-testid="input-search-member-message"
                />
              </div>

              <p className="text-gray-400 text-sm mb-3">Sélectionnez un destinataire</p>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredMembers.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                    data-testid={`select-member-${member.id}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-500/20 text-purple-400">
                        {member.displayName?.[0]?.toUpperCase() || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{member.displayName || "Membre"}</h4>
                      <p className="text-gray-400 text-sm truncate">{member.email || member.memberId}</p>
                    </div>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Users size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun membre trouvé</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-purple-500/20 text-purple-400">
                      {selectedMember.displayName?.[0]?.toUpperCase() || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{selectedMember.displayName || "Membre"}</h4>
                    <p className="text-gray-400 text-sm">{selectedMember.email || selectedMember.memberId}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-white"
                    data-testid="button-change-recipient"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Écrivez votre message..."
                className="min-h-[150px] rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500 resize-none mb-4"
                data-testid="textarea-message-content"
              />

              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || isSending}
                className="w-full h-12 rounded-xl font-bold"
                style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}
                data-testid="button-send-message"
              >
                <Send size={18} className="mr-2" />
                {isSending ? "Envoi en cours..." : "Envoyer le message"}
              </Button>
            </>
          )}
        </div>
      </MobileAdminLayout>
    );
  }

  return (
    <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Messagerie</h2>
          <Button
            size="sm"
            onClick={() => setShowNewMessage(true)}
            className="h-9 px-3 rounded-xl font-medium"
            style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}
            data-testid="button-new-message"
          >
            <MessageCirclePlus size={16} className="mr-1" />
            Nouveau
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="h-11 pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            data-testid="input-search-messages"
          />
        </div>

        <div className="space-y-2">
          {filteredConversations.map((conv) => (
            <div 
              key={conv.id}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              data-testid={`conversation-${conv.id}`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conv.memberAvatar} />
                  <AvatarFallback className="bg-purple-500/20 text-purple-400">{conv.memberName[0]}</AvatarFallback>
                </Avatar>
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1a1a2e]">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-white truncate">{conv.memberName}</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(conv.lastMessageDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-semibold text-gray-200" : "text-gray-400"}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))}
          {filteredConversations.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <MessageCirclePlus size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucune conversation</p>
              <Button
                variant="link"
                onClick={() => setShowNewMessage(true)}
                className="text-purple-400 mt-2"
              >
                Démarrer une conversation
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileAdminLayout>
  );
}
