import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, ArrowRight, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL as API_URL } from "@/api/config";
import koomyLogo from "@assets/ChatGPT Image 30 nov. 2025, 05_54_45_1764590118748.png";

export default function MobileAdminLogin() {
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, selectCommunity } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }
      
      const userWithMemberships = {
        ...data.user,
        memberships: data.memberships
      };
      setUser(userWithMemberships);
      
      toast.success("Connexion admin réussie!");
      
      if (data.memberships.length === 0) {
        toast.error("Aucune communauté associée à ce compte");
        return;
      } else if (data.memberships.length === 1) {
        setTimeout(() => {
          setLocation(`/app/${data.memberships[0].communityId}/admin`);
        }, 100);
      } else {
        setTimeout(() => {
          setLocation("/app/admin/select-community");
        }, 100);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" data-testid="mobile-admin-login-page" style={{
      background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
    }}>
      <div className="absolute top-0 left-0 w-full h-80 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20" style={{
          background: "radial-gradient(circle, rgba(138, 43, 226, 0.4) 0%, transparent 70%)"
        }} />
        <div className="absolute -top-10 right-0 w-60 h-60 rounded-full opacity-15" style={{
          background: "radial-gradient(circle, rgba(68, 168, 255, 0.4) 0%, transparent 70%)"
        }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 pt-16 pb-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 blur-xl opacity-30" style={{
              background: "radial-gradient(circle, rgba(138, 43, 226, 0.5) 0%, transparent 70%)"
            }} />
            <img 
              src={koomyLogo} 
              alt="Koomy" 
              className="relative w-40 h-auto drop-shadow-lg"
            />
          </div>
          
          <div className="flex items-center gap-2 mt-2 mb-1">
            <Shield size={18} className="text-purple-400" />
            <span className="text-purple-300 text-sm font-bold uppercase tracking-wider">
              Espace Administrateur
            </span>
          </div>
          <p className="text-gray-400 text-xs">
            Connectez-vous pour gérer votre communauté
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Lock size={20} className="text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Connexion Admin</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Email</label>
              <Input 
                type="email" 
                placeholder="email@exemple.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 focus:ring-purple-400/20 text-white placeholder:text-gray-400"
                required
                data-testid="input-admin-email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Mot de passe</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 focus:ring-purple-400/20 pr-11 text-white"
                  required
                  data-testid="input-admin-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-bold mt-4 group transition-all"
              style={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                boxShadow: "0 4px 14px -2px rgba(139, 92, 246, 0.5)"
              }}
              disabled={isLoading}
              data-testid="button-admin-login"
            >
              {isLoading ? "Connexion..." : (
                <span className="flex items-center gap-2">
                  Se connecter <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </span>
              )}
            </Button>

            <div className="text-center pt-2">
              <a href="#" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                Mot de passe oublié ?
              </a>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setLocation("/app/admin/register")}
            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            data-testid="link-admin-signup"
          >
            Pas encore administrateur ? <span className="underline">Créez votre espace Koomy</span>
          </button>
        </div>

        <p className="text-gray-600 text-[10px] text-center mt-auto pt-6">
          Accès réservé aux administrateurs autorisés
        </p>
      </div>
    </div>
  );
}
