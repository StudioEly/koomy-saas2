import WebsiteLayout from "./Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, MessageCircle, Video, FileText, ChevronRight, Mail, Phone } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const HELP_CATEGORIES = [
  {
    icon: BookOpen,
    title: "Premiers pas",
    desc: "Création de compte, configuration initiale",
    articles: 12,
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: MessageCircle,
    title: "Gestion des membres",
    desc: "Adhésions, cotisations, cartes digitales",
    articles: 18,
    color: "bg-green-100 text-green-600"
  },
  {
    icon: Video,
    title: "Communication",
    desc: "Actualités, messagerie, notifications",
    articles: 9,
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: FileText,
    title: "Facturation",
    desc: "Plans, paiements, factures",
    articles: 7,
    color: "bg-orange-100 text-orange-600"
  }
];

const POPULAR_ARTICLES = [
  "Comment créer ma première communauté ?",
  "Importer une liste de membres existants",
  "Configurer les cotisations annuelles",
  "Personnaliser l'application mobile",
  "Envoyer une notification push aux membres",
  "Exporter les données de ma communauté"
];

export default function WebsiteSupport() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <WebsiteLayout>
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Centre d'aide Koomy</h1>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Trouvez des réponses à vos questions et apprenez à tirer le meilleur parti de Koomy.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="search"
              placeholder="Rechercher dans l'aide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl text-slate-900 border-0 shadow-xl"
              data-testid="input-search-help"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Parcourir par catégorie</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {HELP_CATEGORIES.map((category, i) => (
            <div 
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-4`}>
                <category.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {category.title}
              </h3>
              <p className="text-slate-500 text-sm mb-4">{category.desc}</p>
              <span className="text-xs text-slate-400">{category.articles} articles</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Articles populaires</h2>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {POPULAR_ARTICLES.map((article, i) => (
                <a 
                  key={i}
                  href="#"
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-slate-700 group-hover:text-blue-600 transition-colors">{article}</span>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </a>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/website/faq">
                <Button variant="outline" className="w-full h-12">
                  Voir toutes les questions fréquentes
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
              <h3 className="font-bold text-blue-900 mb-4">Besoin d'aide personnalisée ?</h3>
              <p className="text-blue-700 text-sm mb-6">
                Notre équipe support est disponible du lundi au vendredi, de 9h à 18h.
              </p>
              <div className="space-y-3">
                <a 
                  href="mailto:support@koomy.app"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Par email</p>
                    <p className="text-xs text-slate-500">support@koomy.app</p>
                  </div>
                </a>
                <a 
                  href="tel:+33123456789"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Par téléphone</p>
                    <p className="text-xs text-slate-500">+33 1 23 45 67 89</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-2">Vous préférez un accompagnement ?</h3>
              <p className="text-slate-400 text-sm mb-4">
                Demandez une démonstration personnalisée avec un membre de notre équipe.
              </p>
              <Link href="/website/contact?type=demo">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">
                  Demander une démo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-16 border-t border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Vous ne trouvez pas ce que vous cherchez ?</h2>
          <p className="text-slate-600 mb-6">
            Contactez notre équipe directement, nous sommes là pour vous aider.
          </p>
          <Link href="/website/contact">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Nous contacter
            </Button>
          </Link>
        </div>
      </div>
    </WebsiteLayout>
  );
}
