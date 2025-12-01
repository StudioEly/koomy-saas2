import { useState } from "react";
import { useLocation } from "wouter";
import { Building2, Eye, EyeOff, Lock, Mail, ArrowRight, User, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import koomyLogo from "@assets/koomy-logo.png";

const COMMUNITY_TYPES = [
  { value: "union", label: "Syndicat" },
  { value: "association", label: "Association" },
  { value: "club", label: "Club sportif ou loisirs" },
  { value: "nonprofit", label: "Organisation à but non lucratif" },
  { value: "other", label: "Autre" }
];

export default function AdminRegister() {
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { setUser, selectCommunity } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    communityName: "",
    communityType: "",
    communityDescription: ""
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.communityName || !formData.communityType) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          communityName: formData.communityName,
          communityType: formData.communityType,
          communityDescription: formData.communityDescription
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }
      
      const userWithMemberships = {
        ...data.user,
        memberships: data.memberships
      };
      setUser(userWithMemberships);
      
      if (data.memberships.length > 0) {
        selectCommunity(data.memberships[0].communityId);
      }
      
      toast.success("Compte créé avec succès! Bienvenue sur Koomy.");
      
      setTimeout(() => {
        setLocation("/admin/dashboard");
      }, 100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="admin-register-page">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      }}>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20" style={{
            background: "radial-gradient(circle, rgba(68, 168, 255, 0.4) 0%, transparent 70%)"
          }} />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-15" style={{
            background: "radial-gradient(circle, rgba(68, 168, 255, 0.3) 0%, transparent 70%)"
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{
            background: "radial-gradient(circle, rgba(68, 168, 255, 0.5) 0%, transparent 60%)"
          }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <img 
            src={koomyLogo} 
            alt="Koomy" 
            className="w-72 mb-6 drop-shadow-2xl"
            style={{ filter: "drop-shadow(0 0 30px rgba(68, 168, 255, 0.5))" }}
          />
          <h1 className="text-4xl font-bold mb-4 text-center font-nunito">
            Rejoignez Koomy
          </h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            Créez votre espace communautaire en quelques minutes et commencez à fédérer vos adhérents.
          </p>
          
          <div className="mt-12 space-y-4 text-left max-w-sm">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center text-lg font-bold">1</div>
              <div>
                <div className="font-semibold">Créez votre compte</div>
                <div className="text-sm text-white/70">Vos informations personnelles</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center text-lg font-bold">2</div>
              <div>
                <div className="font-semibold">Configurez votre communauté</div>
                <div className="text-sm text-white/70">Nom, type et description</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center text-lg font-bold">3</div>
              <div>
                <div className="font-semibold">Invitez vos adhérents</div>
                <div className="text-sm text-white/70">Commencez à gérer votre communauté</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-6">
            <img 
              src={koomyLogo} 
              alt="Koomy" 
              className="w-48"
            />
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center gap-2 mb-4">
                <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
                <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
              </div>
              <CardTitle className="text-2xl font-bold">
                {step === 1 ? "Créer votre compte" : "Votre communauté"}
              </CardTitle>
              <CardDescription>
                {step === 1 
                  ? "Commencez par vos informations personnelles" 
                  : "Configurez votre espace communautaire"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        Prénom *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => updateField("firstName", e.target.value)}
                          placeholder="Jean"
                          className="pl-11 h-12 rounded-xl border-gray-200"
                          required
                          data-testid="input-register-firstname"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Nom *
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        placeholder="Dupont"
                        className="h-12 rounded-xl border-gray-200"
                        required
                        data-testid="input-register-lastname"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email professionnel *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="jean.dupont@organisation.fr"
                        className="pl-11 h-12 rounded-xl border-gray-200"
                        required
                        data-testid="input-register-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Téléphone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="06 12 34 56 78"
                        className="pl-11 h-12 rounded-xl border-gray-200"
                        data-testid="input-register-phone"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mot de passe *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        placeholder="Minimum 8 caractères"
                        className="pl-11 pr-11 h-12 rounded-xl border-gray-200"
                        required
                        data-testid="input-register-password"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirmer le mot de passe *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => updateField("confirmPassword", e.target.value)}
                        placeholder="Confirmez votre mot de passe"
                        className="pl-11 h-12 rounded-xl border-gray-200"
                        required
                        data-testid="input-register-confirm-password"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30 transition-all mt-4"
                    data-testid="button-register-next"
                  >
                    <div className="flex items-center gap-2">
                      Continuer
                      <ArrowRight size={18} />
                    </div>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="communityName" className="text-sm font-medium text-gray-700">
                      Nom de votre communauté *
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="communityName"
                        type="text"
                        value={formData.communityName}
                        onChange={(e) => updateField("communityName", e.target.value)}
                        placeholder="Ex: Club de Tennis de Lyon"
                        className="pl-11 h-12 rounded-xl border-gray-200"
                        required
                        data-testid="input-register-community-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communityType" className="text-sm font-medium text-gray-700">
                      Type de communauté *
                    </Label>
                    <Select 
                      value={formData.communityType} 
                      onValueChange={(value) => updateField("communityType", value)}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-gray-200" data-testid="select-register-community-type">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMUNITY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communityDescription" className="text-sm font-medium text-gray-700">
                      Description (optionnel)
                    </Label>
                    <Textarea
                      id="communityDescription"
                      value={formData.communityDescription}
                      onChange={(e) => updateField("communityDescription", e.target.value)}
                      placeholder="Décrivez brièvement votre communauté..."
                      className="min-h-[100px] rounded-xl border-gray-200 resize-none"
                      data-testid="input-register-community-description"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-xl"
                      data-testid="button-register-back"
                    >
                      <ArrowLeft size={18} className="mr-2" />
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30 transition-all"
                      data-testid="button-register-submit"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Création...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Créer
                          <ArrowRight size={18} />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Déjà un compte ?{" "}
                  <button 
                    onClick={() => setLocation("/admin/login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Se connecter
                  </button>
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
