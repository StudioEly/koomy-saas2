import { useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Calendar, Wallet, QrCode, Plus, Users, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MobileAdminLayout from "@/components/MobileAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import type { Community, NewsArticle, Event, MembershipFee, Message, DelegatePermissions } from "@shared/schema";
import { extractPermissions } from "@shared/schema";

export default function MobileAdminHome({ params }: { params: { communityId: string } }) {
  const [_, setLocation] = useLocation();
  const communityId = params.communityId;
  const { user, currentCommunity, currentMembership, selectCommunity } = useAuth();

  const permissions = useMemo<DelegatePermissions | undefined>(() => {
    if (currentMembership) {
      return extractPermissions(currentMembership as any);
    }
    return undefined;
  }, [currentMembership]);

  useEffect(() => {
    if (!user) {
      setLocation("/app/admin/login");
      return;
    }
    if (currentCommunity?.id !== communityId) {
      selectCommunity(communityId);
    }
  }, [user, communityId, currentCommunity, selectCommunity, setLocation]);

  const { data: community } = useQuery<Community>({
    queryKey: [`/api/communities/${communityId}`],
    enabled: !!communityId
  });

  const { data: members = [] } = useQuery<any[]>({
    queryKey: [`/api/communities/${communityId}/memberships`],
    enabled: !!communityId
  });

  const { data: articles = [] } = useQuery<NewsArticle[]>({
    queryKey: [`/api/communities/${communityId}/news`],
    enabled: !!communityId
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: [`/api/communities/${communityId}/events`],
    enabled: !!communityId
  });

  const { data: fees = [] } = useQuery<MembershipFee[]>({
    queryKey: [`/api/communities/${communityId}/fees`],
    enabled: !!communityId
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: [`/api/communities/${communityId}/messages`],
    enabled: !!communityId
  });

  if (!user) {
    return null;
  }

  const displayName = currentCommunity?.name || community?.name || "Communauté";
  const memberCount = members.filter(m => m.role === "member").length;
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const activeFees = fees.filter(f => f.isActive);
  const unreadMessages = messages.filter(m => !m.read && m.senderType === "member").length;
  const latestArticle = articles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )[0];
  const nextEvent = upcomingEvents.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];

  return (
    <MobileAdminLayout 
      communityId={communityId} 
      communityName={displayName}
      permissions={permissions}
    >
      <div className="p-4 space-y-6" data-testid="mobile-admin-home-page">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-purple-400" />
              <span className="text-gray-400 text-xs">Membres</span>
            </div>
            <div className="text-white text-2xl font-bold">{memberCount}</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-blue-400" />
              <span className="text-gray-400 text-xs">Événements</span>
            </div>
            <div className="text-white text-2xl font-bold">{upcomingEvents.length}</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-green-400" />
              <span className="text-gray-400 text-xs">Collectes</span>
            </div>
            <div className="text-white text-2xl font-bold">{activeFees.length}</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper size={16} className="text-yellow-400" />
              <span className="text-gray-400 text-xs">Articles</span>
            </div>
            <div className="text-white text-2xl font-bold">{articles.length}</div>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm mb-3">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/app/${communityId}/admin/articles`}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer" data-testid="quick-action-article">
                <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Plus size={18} className="text-yellow-400" />
                </div>
                <span className="text-white text-sm font-medium">Créer un article</span>
              </div>
            </Link>
            <Link href={`/app/${communityId}/admin/events`}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer" data-testid="quick-action-event">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Plus size={18} className="text-blue-400" />
                </div>
                <span className="text-white text-sm font-medium">Créer un événement</span>
              </div>
            </Link>
            <Link href={`/app/${communityId}/admin/collections`}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer" data-testid="quick-action-collection">
                <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Plus size={18} className="text-green-400" />
                </div>
                <span className="text-white text-sm font-medium">Créer une collecte</span>
              </div>
            </Link>
            <Link href={`/app/${communityId}/admin/scanner`}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer" data-testid="quick-action-scanner">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <QrCode size={18} className="text-purple-400" />
                </div>
                <span className="text-white text-sm font-medium">Scanner QR</span>
              </div>
            </Link>
          </div>
        </div>

        {nextEvent && (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-blue-400" />
              <span className="text-blue-400 text-xs font-medium uppercase">Prochain événement</span>
            </div>
            <h4 className="text-white font-semibold mb-1">{nextEvent.title}</h4>
            <p className="text-gray-400 text-sm">
              {new Date(nextEvent.date).toLocaleDateString("fr-FR", { 
                weekday: "long", 
                day: "numeric", 
                month: "long",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
            <Link href={`/app/${communityId}/admin/events`}>
              <button className="text-purple-400 text-sm font-medium mt-2 hover:text-purple-300" data-testid="link-view-events">
                Voir tous les événements →
              </button>
            </Link>
          </div>
        )}

        {latestArticle && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-yellow-400" />
              <span className="text-yellow-400 text-xs font-medium uppercase">Dernier article</span>
            </div>
            <h4 className="text-white font-semibold mb-1">{latestArticle.title}</h4>
            <p className="text-gray-400 text-sm line-clamp-2">{latestArticle.summary}</p>
            <Link href={`/app/${communityId}/admin/articles`}>
              <button className="text-purple-400 text-sm font-medium mt-2 hover:text-purple-300" data-testid="link-view-articles">
                Voir tous les articles →
              </button>
            </Link>
          </div>
        )}

        {unreadMessages > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Badge className="bg-orange-500 text-white text-xs h-6 w-6 flex items-center justify-center rounded-full p-0">
                    {unreadMessages}
                  </Badge>
                </div>
                <div>
                  <span className="text-white text-sm font-medium">Messages non lus</span>
                  <p className="text-gray-400 text-xs">De vos membres</p>
                </div>
              </div>
              <Link href={`/app/${communityId}/admin/messages`}>
                <button className="text-orange-400 text-sm font-medium hover:text-orange-300" data-testid="link-view-messages">
                  Voir →
                </button>
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-white font-semibold text-sm">Membres récents</span>
            <Link href={`/app/${communityId}/admin/members`}>
              <button className="text-purple-400 text-xs font-medium" data-testid="link-view-members">
                Voir tous
              </button>
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {members.filter(m => m.role === "member").slice(0, 4).map((member: any) => (
              <div key={member.id} className="p-3 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xs">
                    {member.displayName?.[0]?.toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium truncate block">{member.displayName || "Membre"}</span>
                  <span className="text-gray-500 text-xs truncate block">{member.memberId}</span>
                </div>
                <Badge className={`text-[9px] ${
                  member.status === "active" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                }`}>
                  {member.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </div>
            ))}
            {members.filter(m => m.role === "member").length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">
                Aucun membre pour le moment
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileAdminLayout>
  );
}
