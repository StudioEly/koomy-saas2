import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import MobileLayout from "@/components/layouts/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import type { NewsArticle } from "@shared/schema";

export default function MobileNews({ params }: { params: { communityId: string } }) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "National", "Local", "Legal", "Events"];
  const { communityId } = params;
  const { selectCommunity, currentMembership } = useAuth();

  if (currentMembership?.communityId !== communityId) {
    selectCommunity(communityId);
  }

  const { data: newsList = [] } = useQuery<NewsArticle[]>({
    queryKey: [`/api/communities/${communityId}/news`],
    enabled: !!communityId
  });

  const filteredNews = filter === "All" 
    ? newsList 
    : newsList.filter(n => n.category === filter || n.scope === filter.toLowerCase());

  return (
    <MobileLayout communityId={communityId}>
      <div className="p-6 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Actualités</h1>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat 
                  ? "bg-primary text-white shadow-md shadow-primary/30" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat === "All" ? "Tout" : cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="space-y-6">
          {filteredNews.length > 0 ? filteredNews.map((news) => (
            <Link key={news.id} href={`/app/${communityId}/news/${news.id}`}>
              <Card className="overflow-hidden border-0 shadow-lg rounded-2xl group cursor-pointer" data-testid={`card-news-${news.id}`}>
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={news.image || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400"} 
                    alt={news.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <Badge className="absolute top-4 left-4 bg-primary text-white border-0">
                    {news.category || "Actualité"}
                  </Badge>
                </div>
                <CardContent className="p-5 relative">
                  <div className="absolute -top-6 right-5 bg-white rounded-lg px-3 py-1 shadow-sm text-xs font-bold text-gray-500">
                     {new Date(news.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 leading-tight mb-3">{news.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{news.summary}</p>
                  <div className="h-1 w-12 bg-secondary rounded-full"></div>
                </CardContent>
              </Card>
            </Link>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <p>Aucune actualité disponible</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
