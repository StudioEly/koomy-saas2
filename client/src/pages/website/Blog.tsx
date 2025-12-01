import WebsiteLayout from "./Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { Link } from "wouter";

const BLOG_POSTS = [
  {
    id: 1,
    title: "5 conseils pour digitaliser votre association en 2025",
    excerpt: "Découvrez les meilleures pratiques pour moderniser la gestion de votre communauté et offrir une expérience numérique à vos membres.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    category: "Guide",
    author: "Équipe Koomy",
    date: "28 nov. 2025",
    readTime: "5 min"
  },
  {
    id: 2,
    title: "Comment augmenter l'engagement de vos membres ?",
    excerpt: "L'engagement des membres est crucial pour la pérennité de votre organisation. Voici nos stratégies éprouvées.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    category: "Conseils",
    author: "Marie Dupont",
    date: "22 nov. 2025",
    readTime: "7 min"
  },
  {
    id: 3,
    title: "Nouveau : l'application mobile Koomy 2.0",
    excerpt: "Découvrez toutes les nouveautés de notre dernière mise à jour : nouveau design, fonctionnalités améliorées et plus encore.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
    category: "Nouveauté",
    author: "Équipe Koomy",
    date: "15 nov. 2025",
    readTime: "3 min"
  },
  {
    id: 4,
    title: "Étude de cas : L'UNSA modernise sa gestion des adhérents",
    excerpt: "Comment l'UNSA a transformé sa relation avec ses 200 000 membres grâce à Koomy.",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
    category: "Étude de cas",
    author: "Thomas Martin",
    date: "8 nov. 2025",
    readTime: "10 min"
  },
  {
    id: 5,
    title: "RGPD et associations : ce que vous devez savoir",
    excerpt: "Un guide complet sur la conformité RGPD pour les associations et organisations à but non lucratif.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    category: "Juridique",
    author: "Claire Dubois",
    date: "1 nov. 2025",
    readTime: "8 min"
  },
  {
    id: 6,
    title: "Webinaire : Optimiser vos campagnes de cotisation",
    excerpt: "Replay de notre webinaire sur les meilleures techniques pour maximiser le renouvellement des adhésions.",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800",
    category: "Webinaire",
    author: "Équipe Koomy",
    date: "25 oct. 2025",
    readTime: "45 min"
  }
];

const CATEGORIES = ["Tous", "Guide", "Conseils", "Nouveauté", "Étude de cas", "Juridique", "Webinaire"];

export default function WebsiteBlog() {
  return (
    <WebsiteLayout>
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Blog Koomy</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Actualités, conseils et ressources pour mieux gérer votre communauté.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                cat === "Tous"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article 
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 text-slate-700 backdrop-blur-sm border-0">
                  {post.category}
                </Badge>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.readTime}
                  </span>
                </div>
                <h2 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs text-slate-600">{post.author}</span>
                  </div>
                  <button className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    Lire <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" className="h-12 px-8">
            Charger plus d'articles
          </Button>
        </div>
      </div>

      <div className="bg-blue-600 py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Restez informé des dernières actualités
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Inscrivez-vous à notre newsletter pour recevoir nos conseils et actualités directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 h-12 px-4 rounded-lg border-0 focus:ring-2 focus:ring-white"
            />
            <Button className="h-12 bg-white text-blue-600 hover:bg-blue-50 font-semibold">
              S'inscrire
            </Button>
          </div>
        </div>
      </div>
    </WebsiteLayout>
  );
}
