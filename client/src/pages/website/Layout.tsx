import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Smartphone, LayoutDashboard, ChevronRight } from "lucide-react";
import { useState } from "react";
import logo from "@assets/generated_images/modern_minimalist_union_logo_with_letter_u_or_abstract_knot_symbol_in_blue_and_red.png";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { label: "Fonctionnalités", path: "/website" },
    { label: "Tarifs", path: "/website/pricing" },
    { label: "FAQ", path: "/website/faq" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/website">
            <a className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Koomy</span>
            </a>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location === item.path ? "text-blue-600" : "text-slate-600"
                }`}>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="text-slate-700 hover:text-blue-600 hover:bg-blue-50">
                Connexion
              </Button>
            </Link>
            <Link href="/website/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                Créer mon club
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 p-4 shadow-lg animate-in slide-in-from-top-5">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a className="text-base font-medium text-slate-700 py-2 block" onClick={() => setIsMenuOpen(false)}>
                    {item.label}
                  </a>
                </Link>
              ))}
              <hr className="border-slate-100 my-2" />
              <Link href="/admin/dashboard">
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                  Se connecter
                </Button>
              </Link>
              <Link href="/website/signup">
                <Button className="w-full bg-blue-600 text-white" onClick={() => setIsMenuOpen(false)}>
                  Créer mon club
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">K</div>
                <span className="text-xl font-bold tracking-tight">Koomy</span>
              </div>
              <p className="text-sm text-slate-400">
                La plateforme tout-en-un pour gérer votre communauté, vos membres et vos événements.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/website"><a className="hover:text-white">Fonctionnalités</a></Link></li>
                <li><Link href="/website/pricing"><a className="hover:text-white">Tarifs</a></Link></li>
                <li><Link href="/website/download"><a className="hover:text-white">Application Mobile</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/website/faq"><a className="hover:text-white">FAQ</a></Link></li>
                <li><Link href="/website/support"><a className="hover:text-white">Centre d'aide</a></Link></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white">CGU</a></li>
                <li><a href="#" className="hover:text-white">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© 2025 Koomy. Tous droits réservés.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">LinkedIn</a>
              <a href="#" className="hover:text-white">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
