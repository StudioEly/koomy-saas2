import { useState } from "react";
import MobileLayout from "@/components/layouts/MobileLayout";
import { MOCK_NEWS } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

export default function MobileNews({ params }: { params: { communityId: string } }) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "National", "Local", "Legal", "Events"];
  const { communityId } = params;

  const newsList = communityId === "c_unsa" ? MOCK_NEWS : [];

  const filteredNews = filter === "All" 
    ? newsList 
    : newsList.filter(n => n.category === filter);

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
          {filteredNews.map((news) => (
            <Card key={news.id} className="overflow-hidden border-0 shadow-lg rounded-2xl group cursor-pointer">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={news.image} 
                  alt={news.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <Badge className="absolute top-4 left-4 bg-primary text-white border-0">
                  {news.category}
                </Badge>
              </div>
              <CardContent className="p-5 relative">
                <div className="absolute -top-6 right-5 bg-white rounded-lg px-3 py-1 shadow-sm text-xs font-bold text-gray-500">
                   {new Date(news.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
                <h3 className="font-bold text-xl text-gray-900 leading-tight mb-3">{news.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{news.summary}</p>
                <div className="h-1 w-12 bg-secondary rounded-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
