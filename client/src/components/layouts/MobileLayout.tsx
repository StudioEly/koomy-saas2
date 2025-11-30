import { Link, useLocation } from "wouter";
import { Home, CreditCard, Mail, Newspaper, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Accueil", path: "/app/home" },
    { icon: CreditCard, label: "Carte", path: "/app/card" },
    { icon: Mail, label: "Messages", path: "/app/messages" },
    { icon: Newspaper, label: "Actus", path: "/app/news" },
    { icon: User, label: "Compte", path: "/app/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-screen shadow-2xl relative flex flex-col">
        {/* Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 pb-safe pt-2 px-2 z-50">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <a className={cn(
                    "flex flex-col items-center justify-center w-16 h-full transition-all duration-200",
                    isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                  )}>
                    <item.icon 
                      className={cn(
                        "h-6 w-6 mb-1 transition-transform duration-200",
                        isActive ? "scale-110 stroke-[2.5px]" : "stroke-2"
                      )} 
                    />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
