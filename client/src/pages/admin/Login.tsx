import { useState } from "react";
import { useLocation } from "wouter";
import { Building2, Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import koomyLogo from "@assets/ChatGPT Image 30 nov. 2025, 05_54_45_1764590118748.png";

export default function AdminLogin() {
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, selectCommunity } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
      
      toast.success("Connexion réussie!");
      
      if (data.memberships.length === 0) {
        toast.error("Aucune communauté associée à ce compte");
        return;
      } else if (data.memberships.length === 1) {
        selectCommunity(data.memberships[0].communityId);
        setTimeout(() => {
          setLocation("/admin/dashboard");
        }, 100);
      } else {
        setTimeout(() => {
          setLocation("/admin/select-community");
        }, 100);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="admin-login-page">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #44A8FF 0%, #2B9AFF 50%, #1E88E5 100%)"
      }}>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20" style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)"
          }} />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-15" style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)"
          }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <img 
            src={koomyLogo} 
            alt="Koomy" 
            className="h-20 mb-8 drop-shadow-xl"
          />
          <h1 className="text-4xl font-bold mb-4 text-center">
            Espace Back-Office
          </h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            Gérez votre communauté depuis une interface simple et puissante.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold mb-1">12K+</div>
              <div className="text-sm text-white/70">Adhérents gérés</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-sm text-white/70">Communautés actives</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <img 
              src={koomyLogo} 
              alt="Koomy" 
              className="h-16"
            />
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Connexion Administrateur</CardTitle>
              <CardDescription>
                Accédez à votre espace de gestion communautaire
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email professionnel
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@organisation.fr"
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                      required
                      data-testid="input-admin-email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mot de passe
                    </Label>
                    <button type="button" className="text-xs text-primary hover:underline">
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-11 pr-11 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                      required
                      data-testid="input-admin-password"
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
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30 transition-all"
                  data-testid="button-admin-submit"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connexion...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Se connecter
                      <ArrowRight size={18} />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Accès réservé aux administrateurs autorisés
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setLocation("/")}
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
