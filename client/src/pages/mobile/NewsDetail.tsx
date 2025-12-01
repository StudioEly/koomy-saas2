import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Calendar, User, Globe, MapPin, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { NewsArticle } from "@shared/schema";

export default function MobileNewsDetail({ params }: { params: { communityId: string; articleId: string } }) {
  const { communityId, articleId } = params;
  const { selectCommunity, currentMembership } = useAuth();

  if (currentMembership?.communityId !== communityId) {
    selectCommunity(communityId);
  }

  const { data: article, isLoading, isError } = useQuery<NewsArticle>({
    queryKey: [`/api/news/${articleId}`],
    enabled: !!articleId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="news-detail-loading">
        <div className="w-full max-w-md bg-white min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="news-detail-error">
        <div className="w-full max-w-md bg-white min-h-screen flex flex-col items-center justify-center p-6">
          <p className="text-gray-500 mb-4">Article introuvable</p>
          <Link href={`/app/${communityId}/news`}>
            <Button variant="outline">Retour aux actualités</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="news-detail-page">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl">
        <div className="relative h-72 overflow-hidden">
          <img 
            src={article.image || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800"} 
            alt={article.title}
            className="w-full h-full object-cover"
            data-testid="img-article-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            <Link href={`/app/${communityId}/news`}>
              <button 
                className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"
                data-testid="button-back"
              >
                <ArrowLeft size={20} />
              </button>
            </Link>
            <button 
              onClick={handleShare}
              className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors"
              data-testid="button-share"
            >
              <Share2 size={20} />
            </button>
          </header>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex gap-2 mb-3">
              <Badge className="bg-primary text-white border-0">
                {article.category || "Actualité"}
              </Badge>
              {article.scope === "local" && (
                <Badge className="bg-green-600 text-white border-0">
                  <MapPin size={10} className="mr-1" />
                  {article.section || "Local"}
                </Badge>
              )}
              {article.scope === "national" && (
                <Badge className="bg-blue-600 text-white border-0">
                  <Globe size={10} className="mr-1" />
                  National
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight" data-testid="text-article-title">
              {article.title}
            </h1>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span data-testid="text-article-date">
                {new Date(article.publishedAt).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} />
              <span data-testid="text-article-author">{article.author}</span>
            </div>
          </div>

          <p className="text-lg text-gray-700 font-medium leading-relaxed mb-6" data-testid="text-article-summary">
            {article.summary}
          </p>

          <div 
            className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
            data-testid="text-article-content"
          >
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="p-6 pt-0 pb-8">
          <Link href={`/app/${communityId}/news`}>
            <Button variant="outline" className="w-full h-12 rounded-xl" data-testid="button-back-to-news">
              <ArrowLeft size={18} className="mr-2" />
              Retour aux actualités
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
