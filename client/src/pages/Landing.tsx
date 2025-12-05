import { Smartphone, LayoutDashboard, Shield, QrCode, BarChart, Globe, Crown } from "lucide-react";
import koomyLogo from "@assets/Koomy-communitieslogo_1764495780161.png";

const apps = [
  {
    id: "website",
    name: "Site Public",
    icon: Globe,
    href: "/website",
    color: "bg-slate-900",
    iconColor: "text-blue-400",
    badge: "NEW",
    badgeColor: "bg-green-500"
  },
  {
    id: "member",
    name: "App Membre",
    icon: Smartphone,
    href: "/app/login",
    color: "bg-blue-600",
    iconColor: "text-white"
  },
  {
    id: "admin",
    name: "Backoffice",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    color: "bg-purple-600",
    iconColor: "text-white"
  },
  {
    id: "mobile-admin",
    name: "App Pro",
    icon: QrCode,
    href: "/app/c_unsa/admin",
    color: "bg-slate-700",
    iconColor: "text-white"
  },
  {
    id: "platform",
    name: "Plateforme",
    icon: BarChart,
    href: "/platform/dashboard",
    color: "bg-orange-500",
    iconColor: "text-white",
    badge: "OWNER",
    badgeColor: "bg-orange-700"
  },
  {
    id: "whitelabel",
    name: "UNSA Lidl",
    icon: Crown,
    href: "https://unsalidlfrance.koomy.app",
    external: true,
    color: "bg-[#009de1]",
    iconColor: "text-white",
    badge: "WL",
    badgeColor: "bg-purple-500"
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <img src={koomyLogo} alt="Koomy" className="h-14 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Koomy Prototype Portal</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Sélectionnez une application pour explorer la plateforme
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {apps.map((app) => {
            const Icon = app.icon;
            const content = (
              <div
                key={app.id}
                className="group flex flex-col items-center gap-3 cursor-pointer"
                data-testid={`app-card-${app.id}`}
              >
                <div className={`relative w-16 h-16 ${app.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200`}>
                  <Icon className={app.iconColor} size={28} />
                  {app.badge && (
                    <span className={`absolute -top-1 -right-1 ${app.badgeColor} text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full`}>
                      {app.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors text-center">
                  {app.name}
                </span>
              </div>
            );

            if (app.external) {
              return (
                <a key={app.id} href={app.href} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              );
            }

            return (
              <a key={app.id} href={app.href}>
                {content}
              </a>
            );
          })}
        </div>

        <div className="text-center text-slate-400 text-xs pt-8">
          Koomy SaaS Platform v2.1
        </div>
      </div>
    </div>
  );
}
