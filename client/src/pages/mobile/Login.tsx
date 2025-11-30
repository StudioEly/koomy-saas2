import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin } from "@/hooks/useApi";
import { toast } from "sonner";
import logo from "@assets/generated_images/modern_minimalist_union_logo_with_letter_u_or_abstract_knot_symbol_in_blue_and_red.png";
import bgImage from "@assets/generated_images/abstract_professional_blue_and_white_geometric_background_for_app_header.png";

export default function MobileLogin() {
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const loginMutation = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      
      setUser({
        ...result.user,
        memberships: result.memberships
      });
      
      toast.success("Connexion réussie!");
      setLocation("/app/hub");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden" data-testid="mobile-login-page">
      <div className="absolute top-0 left-0 w-full h-1/3 bg-primary overflow-hidden">
        <img src={bgImage} className="w-full h-full object-cover opacity-20 mix-blend-overlay" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-8 pt-20">
        <div className="flex flex-col items-center mb-12">
          <div className="bg-white p-4 rounded-2xl shadow-xl mb-6">
            <img src={logo} alt="KOMY Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md text-center">KOMY App</h1>
          <p className="text-blue-100 text-center mt-2 font-medium">Votre syndicat, dans votre poche.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 -mt-4 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Connexion</h2>
          
          <form onSubmit={handleLogin} className="space-y-5 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email ou Identifiant</label>
              <Input 
                type="email" 
                placeholder="admin@unsa.org" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                required
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Mot de passe</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all pr-10"
                  required
                  data-testid="input-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <a href="#" className="text-xs font-medium text-primary hover:underline">Mot de passe oublié ?</a>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/30 mt-4 group"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? "Connexion..." : (
                <span className="flex items-center gap-2">
                  Se connecter <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </span>
              )}
            </Button>

            <div className="text-center text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              <strong>Demo:</strong> admin@unsa.org / member@unsa.org (password: any)
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              En cas de problème, contactez votre délégué syndical ou le support technique.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <a href="/admin/dashboard" className="text-xs text-gray-300 hover:text-primary transition-colors flex items-center gap-1">
                <Lock size={10} /> Accès Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
