import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import koomyLogo from "@assets/ChatGPT Image 30 nov. 2025, 05_54_45_1764590118748.png";

export default function PlatformLogin() {
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/platform/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }
      
      setUser({
        ...data.user,
        memberships: [],
        isPlatformAdmin: true
      });
      
      toast.success("Bienvenue sur Koomy Platform!");
      
      setTimeout(() => {
        setLocation("/platform/dashboard");
      }, 100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="platform-login-page">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            background: "radial-gradient(circle at 30% 50%, rgba(68, 168, 255, 0.15) 0%, transparent 50%)"
          }} />
          <div className="absolute top-0 right-0 w-full h-full" style={{
            background: "radial-gradient(circle at 70% 80%, rgba(138, 43, 226, 0.1) 0%, transparent 40%)"
          }} />
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src={koomyLogo} 
              alt="Koomy" 
              className="h-16 drop-shadow-xl"
            />
            <div className="h-8 w-px bg-white/20" />
            <span className="text-blue-400 font-semibold text-xl">Platform</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-center">
            Super Admin Console
          </h1>
          <p className="text-xl text-gray-400 text-center max-w-md">
            Pilotez l'ensemble de la plateforme Koomy depuis un seul tableau de bord.
          </p>
          
          <div className="mt-12 space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="font-medium">Contrôle total</div>
                <div className="text-sm text-gray-400">Gestion multi-tenant centralisée</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="font-medium">Analytics avancés</div>
                <div className="text-sm text-gray-400">MRR, churn, croissance en temps réel</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <img 
                src={koomyLogo} 
                alt="Koomy" 
                className="h-12"
              />
              <span className="text-blue-500 font-semibold">Platform</span>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gray-900 flex items-center justify-center">
                <Shield className="h-7 w-7 text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Super Admin</CardTitle>
              <CardDescription>
                Accès restreint aux propriétaires de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email administrateur
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@koomy.app"
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      data-testid="input-platform-email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-11 pr-11 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      data-testid="input-platform-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-lg transition-all"
                  data-testid="button-platform-submit"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authentification...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Accéder à la console
                      <ArrowRight size={18} />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield size={14} />
                  Connexion sécurisée et auditée
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setLocation("/")}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
