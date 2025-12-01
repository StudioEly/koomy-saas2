import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Building2, Eye, EyeOff, Lock, Mail, ArrowRight, User, Phone, ArrowLeft,
  MapPin, Globe, CreditCard, Calendar, MessageSquare, ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LogoUploader } from "@/components/ui/LogoUploader";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import koomyLogo from "@assets/koomy-logo.png";
import { COMMUNITY_TYPES } from "@shared/schema";

const CATEGORIES = [
  { value: "sport", label: "Sport" },
  { value: "culture", label: "Culture" },
  { value: "education", label: "Éducation" },
  { value: "social", label: "Social" },
  { value: "professionnel", label: "Professionnel" },
  { value: "loisirs", label: "Loisirs" },
  { value: "environnement", label: "Environnement" },
  { value: "sante", label: "Santé" },
  { value: "autre", label: "Autre" }
];

const CURRENCIES = [
  { value: "EUR", label: "Euro (€)" },
  { value: "USD", label: "Dollar ($)" },
  { value: "GBP", label: "Livre (£)" },
  { value: "CHF", label: "Franc suisse (CHF)" }
];

const BILLING_PERIODS = [
  { value: "one_time", label: "Paiement unique" },
  { value: "monthly", label: "Mensuel" },
  { value: "yearly", label: "Annuel" }
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
    communityTypeOther: "",
    category: "",
    description: "",
    logo: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    contactEmail: "",
    contactPhone: "",
    welcomeMessage: "",
    membershipFeeEnabled: false,
    membershipFeeAmount: "",
    currency: "EUR",
    billingPeriod: "yearly"
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (logoUrl: string) => {
    updateField("logo", logoUrl);
    toast.success("Logo téléchargé avec succès");
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

  const validateStep2 = () => {
    if (!formData.communityName || !formData.communityType) {
      toast.error("Veuillez remplir le nom et le type de votre communauté");
      return false;
    }
    if (formData.communityType === "other" && !formData.communityTypeOther) {
      toast.error("Veuillez préciser le type de votre communauté");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          communityTypeOther: formData.communityTypeOther || null,
          category: formData.category || null,
          description: formData.description || null,
          address: formData.address || null,
          city: formData.city || null,
          postalCode: formData.postalCode || null,
          country: formData.country,
          contactEmail: formData.contactEmail || formData.email,
          contactPhone: formData.contactPhone || formData.phone,
          logo: formData.logo || null,
          welcomeMessage: formData.welcomeMessage || null,
          membershipFeeEnabled: formData.membershipFeeEnabled,
          membershipFeeAmount: formData.membershipFeeAmount ? parseInt(formData.membershipFeeAmount) * 100 : null,
          currency: formData.currency,
          billingPeriod: formData.billingPeriod
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

  const getCommunityTypeLabel = () => {
    if (formData.communityType === "other") return formData.communityTypeOther || "communauté";
    const type = COMMUNITY_TYPES.find(t => t.value === formData.communityType);
    return type?.label.toLowerCase() || "communauté";
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
            <div className={`flex items-center gap-4 ${step === 1 ? 'bg-white/20' : 'bg-white/10'} backdrop-blur-sm rounded-xl p-4 transition-all`}>
              <div className={`h-10 w-10 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-white/20'} flex items-center justify-center text-lg font-bold`}>1</div>
              <div>
                <div className="font-semibold">Créez votre compte</div>
                <div className="text-sm text-white/70">Vos informations personnelles</div>
              </div>
            </div>
            <div className={`flex items-center gap-4 ${step === 2 ? 'bg-white/20' : 'bg-white/10'} backdrop-blur-sm rounded-xl p-4 transition-all`}>
              <div className={`h-10 w-10 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-white/20'} flex items-center justify-center text-lg font-bold`}>2</div>
              <div>
                <div className="font-semibold">Identité de votre communauté</div>
                <div className="text-sm text-white/70">Nom, type et coordonnées</div>
              </div>
            </div>
            <div className={`flex items-center gap-4 ${step === 3 ? 'bg-white/20' : 'bg-white/10'} backdrop-blur-sm rounded-xl p-4 transition-all`}>
              <div className={`h-10 w-10 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-white/20'} flex items-center justify-center text-lg font-bold`}>3</div>
              <div>
                <div className="font-semibold">Paramètres d'adhésion</div>
                <div className="text-sm text-white/70">Cotisation et accueil des membres</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-lg">
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
                <div className={`h-2 w-12 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
              </div>
              <CardTitle className="text-2xl font-bold">
                {step === 1 ? "Créer votre compte" : step === 2 ? "Votre communauté" : "Paramètres d'adhésion"}
              </CardTitle>
              <CardDescription>
                {step === 1 
                  ? "Commencez par vos informations personnelles" 
                  : step === 2 
                    ? "Configurez l'identité de votre espace" 
                    : "Définissez les paramètres de cotisation"}
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
              ) : step === 2 ? (
                <div className="space-y-4">
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

                  {formData.communityType === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="communityTypeOther" className="text-sm font-medium text-gray-700">
                        Précisez le type *
                      </Label>
                      <Input
                        id="communityTypeOther"
                        type="text"
                        value={formData.communityTypeOther}
                        onChange={(e) => updateField("communityTypeOther", e.target.value)}
                        placeholder="Ex: Collectif d'artistes"
                        className="h-12 rounded-xl border-gray-200"
                        data-testid="input-register-community-type-other"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                      Catégorie
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => updateField("category", value)}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-gray-200" data-testid="select-register-category">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Décrivez brièvement votre communauté..."
                      className="min-h-[80px] rounded-xl border-gray-200 resize-none"
                      data-testid="input-register-community-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Logo de la communauté
                    </Label>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <LogoUploader
                        currentLogo={formData.logo}
                        communityName={formData.communityName}
                        onUploadComplete={handleLogoUpload}
                        disabled={false}
                        size="md"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          Téléchargez le logo de votre {getCommunityTypeLabel() || "communauté"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Format JPG, PNG ou GIF. Taille max 5 Mo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        Ville
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          placeholder="Lyon"
                          className="pl-11 h-12 rounded-xl border-gray-200"
                          data-testid="input-register-city"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                        Code postal
                      </Label>
                      <Input
                        id="postalCode"
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => updateField("postalCode", e.target.value)}
                        placeholder="69001"
                        className="h-12 rounded-xl border-gray-200"
                        data-testid="input-register-postal-code"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Adresse
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="12 rue de la République"
                      className="h-12 rounded-xl border-gray-200"
                      data-testid="input-register-address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Pays
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="country"
                        type="text"
                        value={formData.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        placeholder="France"
                        className="pl-11 h-12 rounded-xl border-gray-200"
                        data-testid="input-register-country"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">
                        Email de contact
                      </Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => updateField("contactEmail", e.target.value)}
                        placeholder="contact@..."
                        className="h-12 rounded-xl border-gray-200"
                        data-testid="input-register-contact-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">
                        Téléphone
                      </Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => updateField("contactPhone", e.target.value)}
                        placeholder="04 XX XX XX XX"
                        className="h-12 rounded-xl border-gray-200"
                        data-testid="input-register-contact-phone"
                      />
                    </div>
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
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30 transition-all"
                      data-testid="button-register-next-step2"
                    >
                      <div className="flex items-center gap-2">
                        Continuer
                        <ArrowRight size={18} />
                      </div>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage" className="text-sm font-medium text-gray-700">
                      Message d'accueil
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Textarea
                        id="welcomeMessage"
                        value={formData.welcomeMessage}
                        onChange={(e) => updateField("welcomeMessage", e.target.value)}
                        placeholder={`Bienvenue dans notre ${getCommunityTypeLabel()}! Nous sommes ravis de vous accueillir.`}
                        className="pl-11 min-h-[100px] rounded-xl border-gray-200 resize-none"
                        data-testid="input-register-welcome-message"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Ce message sera affiché aux nouveaux membres</p>
                  </div>

                  <div className="border rounded-xl p-4 space-y-4 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Activer les cotisations
                          </Label>
                          <p className="text-xs text-gray-500">Collectez les cotisations par carte bancaire</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.membershipFeeEnabled}
                        onCheckedChange={(checked) => updateField("membershipFeeEnabled", checked)}
                        data-testid="switch-register-membership-fee"
                      />
                    </div>

                    {formData.membershipFeeEnabled && (
                      <div className="space-y-4 pt-2 border-t">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="membershipFeeAmount" className="text-sm font-medium text-gray-700">
                              Montant
                            </Label>
                            <div className="relative">
                              <Input
                                id="membershipFeeAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.membershipFeeAmount}
                                onChange={(e) => updateField("membershipFeeAmount", e.target.value)}
                                placeholder="50"
                                className="h-12 rounded-xl border-gray-200 pr-12"
                                data-testid="input-register-membership-amount"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                {formData.currency === "EUR" ? "€" : formData.currency === "USD" ? "$" : formData.currency === "GBP" ? "£" : "CHF"}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                              Devise
                            </Label>
                            <Select 
                              value={formData.currency} 
                              onValueChange={(value) => updateField("currency", value)}
                            >
                              <SelectTrigger className="h-12 rounded-xl border-gray-200" data-testid="select-register-currency">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CURRENCIES.map(cur => (
                                  <SelectItem key={cur.value} value={cur.value}>
                                    {cur.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="billingPeriod" className="text-sm font-medium text-gray-700">
                            Période de facturation
                          </Label>
                          <Select 
                            value={formData.billingPeriod} 
                            onValueChange={(value) => updateField("billingPeriod", value)}
                          >
                            <SelectTrigger className="h-12 rounded-xl border-gray-200" data-testid="select-register-billing-period">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BILLING_PERIODS.map(period => (
                                <SelectItem key={period.value} value={period.value}>
                                  {period.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 h-12 rounded-xl"
                      data-testid="button-register-back-step3"
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
                          Créer ma communauté
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
