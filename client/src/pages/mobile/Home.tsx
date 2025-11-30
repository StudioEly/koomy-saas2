import { Link } from "wouter";
import MobileLayout from "@/components/layouts/MobileLayout";
import { Bell, CreditCard, ChevronRight } from "lucide-react";
import { MOCK_USER, MOCK_NEWS } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MobileHome({ params }: { params: { communityId: string } }) {
  const { communityId } = params;
  const user = MOCK_USER;
  const membership = user.communities.find(c => c.communityId === communityId);
  
  // Get news for this community
  const newsList = communityId === "c_unsa" ? MOCK_NEWS : [];
  const recentNews = newsList.slice(0, 2);

  if (!membership) return <div className="p-8 text-center">Accès refusé</div>;

  return (
    <MobileLayout communityId={communityId}>
      <div className="p-6 pt-8 bg-white relative">
        {/* Welcome Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-gray-500 font-medium">Bonjour,</p>
            <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={`
                ${membership.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} 
                hover:bg-opacity-80 px-3 py-1 rounded-full text-xs font-semibold border-0
              `}>
                {membership.status === "active" ? "Membre Actif" : "Expiré"}
              </Badge>
              {membership.section && <span className="text-xs text-gray-400">{membership.section}</span>}
            </div>
          </div>
          <div className="relative">
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
            />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
        </div>

        {/* Quick Access Card */}
        <Link href={`/app/${communityId}/card`}>
          <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20 mb-8 transform transition-transform active:scale-98 cursor-pointer relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Carte d'adhérent</p>
                <p className="text-2xl font-mono tracking-wider font-bold text-white/90">{membership.memberId}</p>
              </div>
              <CreditCard className="text-white/80" size={28} />
            </div>
            
            <div className="mt-6 flex justify-between items-end relative z-10">
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wide">Année</p>
                <p className="text-lg font-semibold">{new Date().getFullYear()}</p>
              </div>
              <div className="bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-2 px-3 backdrop-blur-sm text-xs font-medium flex items-center gap-1">
                Afficher <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </Link>

        {/* News Section */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Actualités</h2>
          <Link href={`/app/${communityId}/news`}>
            <a className="text-sm text-primary font-medium hover:underline">Tout voir</a>
          </Link>
        </div>

        <div className="space-y-4">
          {recentNews.length > 0 ? recentNews.map((news) => (
            <Card key={news.id} className="overflow-hidden border-0 shadow-md rounded-xl">
              <div className="h-32 overflow-hidden relative">
                <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 hover:bg-white backdrop-blur-sm shadow-sm border-0">
                  {news.category}
                </Badge>
              </div>
              <CardContent className="p-4">
                <p className="text-xs text-gray-400 mb-1">{new Date(news.date).toLocaleDateString('fr-FR')}</p>
                <h3 className="font-bold text-gray-900 leading-tight mb-2">{news.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{news.summary}</p>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
              Aucune actualité récente
            </div>
          )}
        </div>


        {/* Events Teaser */}
        <div className="mt-8 mb-20">
           <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-2">Prochain Événement</h3>
             <div className="flex gap-3 items-center">
               <div className="bg-red-100 text-red-600 rounded-lg w-12 h-12 flex flex-col items-center justify-center leading-none">
                 <span className="text-xs font-bold">DEC</span>
                 <span className="text-lg font-bold">15</span>
               </div>
               <div>
                 <p className="font-semibold text-sm">Assemblée Générale</p>
                 <p className="text-xs text-gray-500">Salle Wagram, Paris • 09:00</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </MobileLayout>
  );
}
