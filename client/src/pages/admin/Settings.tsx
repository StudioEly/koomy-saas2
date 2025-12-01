import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, MapPin, Mail, Phone, Globe, CreditCard, MessageSquare, 
  Save, Loader2, CheckCircle, Palette, Landmark, Share2, FileText,
  Facebook, Twitter, Instagram, Linkedin, Link2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { COMMUNITY_TYPES, type Community } from "@shared/schema";

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

export default function AdminSettings() {
  const { currentMembership, currentCommunity } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId;

  const { data: community, isLoading } = useQuery<Community>({
    queryKey: [`/api/communities/${communityId}`],
    enabled: !!communityId
  });

  const [formData, setFormData] = useState({
    name: "",
    communityType: "",
    communityTypeOther: "",
    category: "",
    description: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    contactEmail: "",
    contactPhone: "",
    siret: "",
    iban: "",
    bic: "",
    website: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    welcomeMessage: "",
    primaryColor: "",
    membershipFeeEnabled: false,
    membershipFeeAmount: "",
    currency: "EUR",
    billingPeriod: "yearly"
  });

  useEffect(() => {
    if (community) {
      setFormData({
        name: community.name || "",
        communityType: community.communityType || "",
        communityTypeOther: community.communityTypeOther || "",
        category: community.category || "",
        description: community.description || "",
        address: community.address || "",
        city: community.city || "",
        postalCode: community.postalCode || "",
        country: community.country || "France",
        contactEmail: community.contactEmail || "",
        contactPhone: community.contactPhone || "",
        siret: community.siret || "",
        iban: community.iban || "",
        bic: community.bic || "",
        website: community.website || "",
        facebook: community.facebook || "",
        twitter: community.twitter || "",
        instagram: community.instagram || "",
        linkedin: community.linkedin || "",
        welcomeMessage: community.welcomeMessage || "",
        primaryColor: community.primaryColor || "207 100% 63%",
        membershipFeeEnabled: community.membershipFeeEnabled || false,
        membershipFeeAmount: community.membershipFeeAmount ? String(community.membershipFeeAmount / 100) : "",
        currency: community.currency || "EUR",
        billingPeriod: community.billingPeriod || "yearly"
      });
    }
  }, [community]);

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await fetch(`/api/communities/${communityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      toast.success("Paramètres enregistrés avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (section: string) => {
    let updates: Record<string, any> = {};
    
    switch (section) {
      case "identity":
        updates = {
          name: formData.name,
          communityType: formData.communityType,
          communityTypeOther: formData.communityTypeOther || null,
          category: formData.category || null,
          description: formData.description || null
        };
        break;
      case "contact":
        updates = {
          address: formData.address || null,
          city: formData.city || null,
          postalCode: formData.postalCode || null,
          country: formData.country || "France",
          contactEmail: formData.contactEmail || null,
          contactPhone: formData.contactPhone || null
        };
        break;
      case "legal":
        updates = {
          siret: formData.siret || null,
          iban: formData.iban || null,
          bic: formData.bic || null
        };
        break;
      case "social":
        updates = {
          website: formData.website || null,
          facebook: formData.facebook || null,
          twitter: formData.twitter || null,
          instagram: formData.instagram || null,
          linkedin: formData.linkedin || null
        };
        break;
      case "appearance":
        updates = {
          welcomeMessage: formData.welcomeMessage || null,
          primaryColor: formData.primaryColor || "207 100% 63%"
        };
        break;
      case "payment":
        updates = {
          membershipFeeEnabled: formData.membershipFeeEnabled,
          membershipFeeAmount: formData.membershipFeeAmount ? parseInt(formData.membershipFeeAmount) * 100 : null,
          currency: formData.currency,
          billingPeriod: formData.billingPeriod
        };
        break;
    }
    
    updateMutation.mutate(updates);
  };

  const getCommunityTypeLabel = () => {
    if (formData.communityType === "other") return formData.communityTypeOther || "communauté";
    const type = COMMUNITY_TYPES.find(t => t.value === formData.communityType);
    return type?.label || "communauté";
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-settings-title">
            Paramètres de la communauté
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les informations et les paramètres de votre {getCommunityTypeLabel().toLowerCase()}
          </p>
        </div>

        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="bg-white border shadow-sm flex-wrap h-auto p-1">
            <TabsTrigger value="identity" className="gap-2" data-testid="tab-identity">
              <Building2 className="h-4 w-4" />
              Identité
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2" data-testid="tab-contact">
              <MapPin className="h-4 w-4" />
              Coordonnées
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-2" data-testid="tab-legal">
              <FileText className="h-4 w-4" />
              Légal / Bancaire
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2" data-testid="tab-social">
              <Share2 className="h-4 w-4" />
              Réseaux sociaux
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2" data-testid="tab-appearance">
              <Palette className="h-4 w-4" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2" data-testid="tab-payment">
              <CreditCard className="h-4 w-4" />
              Paiement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Identité de votre communauté
                </CardTitle>
                <CardDescription>
                  Informations de base sur votre organisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la communauté *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Ex: Club de Tennis de Lyon"
                      data-testid="input-settings-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="communityType">Type de communauté *</Label>
                    <Select 
                      value={formData.communityType} 
                      onValueChange={(value) => updateField("communityType", value)}
                    >
                      <SelectTrigger data-testid="select-settings-type">
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
                </div>

                {formData.communityType === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="communityTypeOther">Précisez le type</Label>
                    <Input
                      id="communityTypeOther"
                      value={formData.communityTypeOther}
                      onChange={(e) => updateField("communityTypeOther", e.target.value)}
                      placeholder="Ex: Collectif d'artistes"
                      data-testid="input-settings-type-other"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => updateField("category", value)}
                  >
                    <SelectTrigger data-testid="select-settings-category">
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Décrivez votre communauté..."
                    className="min-h-[120px]"
                    data-testid="input-settings-description"
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave("identity")}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                    data-testid="button-save-identity"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Coordonnées
                </CardTitle>
                <CardDescription>
                  Adresse et informations de contact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="12 rue de la République"
                    data-testid="input-settings-address"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Lyon"
                      data-testid="input-settings-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      placeholder="69001"
                      data-testid="input-settings-postal-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      placeholder="France"
                      data-testid="input-settings-country"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de contact</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => updateField("contactEmail", e.target.value)}
                        placeholder="contact@votrecommunaute.fr"
                        className="pl-10"
                        data-testid="input-settings-contact-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => updateField("contactPhone", e.target.value)}
                        placeholder="04 XX XX XX XX"
                        className="pl-10"
                        data-testid="input-settings-contact-phone"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave("contact")}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                    data-testid="button-save-contact"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Informations légales et bancaires
                </CardTitle>
                <CardDescription>
                  Identifiants légaux et coordonnées bancaires de votre organisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siret">Numéro SIRET</Label>
                  <Input
                    id="siret"
                    value={formData.siret}
                    onChange={(e) => updateField("siret", e.target.value)}
                    placeholder="123 456 789 00012"
                    maxLength={17}
                    data-testid="input-settings-siret"
                  />
                  <p className="text-xs text-gray-500">14 chiffres (SIREN + NIC)</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-start gap-3">
                    <Landmark className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Informations bancaires
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        Ces informations sont nécessaires pour recevoir les paiements de vos adhérents via virement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={formData.iban}
                    onChange={(e) => updateField("iban", e.target.value.toUpperCase())}
                    placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                    data-testid="input-settings-iban"
                  />
                  <p className="text-xs text-gray-500">International Bank Account Number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bic">BIC / SWIFT</Label>
                  <Input
                    id="bic"
                    value={formData.bic}
                    onChange={(e) => updateField("bic", e.target.value.toUpperCase())}
                    placeholder="BNPAFRPP"
                    maxLength={11}
                    data-testid="input-settings-bic"
                  />
                  <p className="text-xs text-gray-500">Bank Identifier Code (8 ou 11 caractères)</p>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave("legal")}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                    data-testid="button-save-legal"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Réseaux sociaux et site web
                </CardTitle>
                <CardDescription>
                  Liens vers vos présences en ligne
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="https://www.votrecommunaute.fr"
                      className="pl-10"
                      data-testid="input-settings-website"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="facebook"
                        value={formData.facebook}
                        onChange={(e) => updateField("facebook", e.target.value)}
                        placeholder="https://facebook.com/votrepage"
                        className="pl-10"
                        data-testid="input-settings-facebook"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={(e) => updateField("twitter", e.target.value)}
                        placeholder="https://x.com/votrecompte"
                        className="pl-10"
                        data-testid="input-settings-twitter"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => updateField("instagram", e.target.value)}
                        placeholder="https://instagram.com/votrecompte"
                        className="pl-10"
                        data-testid="input-settings-instagram"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => updateField("linkedin", e.target.value)}
                        placeholder="https://linkedin.com/company/votrepage"
                        className="pl-10"
                        data-testid="input-settings-linkedin"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave("social")}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                    data-testid="button-save-social"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Apparence et accueil
                </CardTitle>
                <CardDescription>
                  Personnalisez l'apparence et le message d'accueil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Message d'accueil</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={formData.welcomeMessage}
                    onChange={(e) => updateField("welcomeMessage", e.target.value)}
                    placeholder={`Bienvenue dans notre ${getCommunityTypeLabel().toLowerCase()}! Nous sommes ravis de vous accueillir.`}
                    className="min-h-[150px]"
                    data-testid="input-settings-welcome-message"
                  />
                  <p className="text-sm text-gray-500">
                    Ce message sera affiché aux nouveaux membres lors de leur première connexion
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Couleur principale (HSL)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) => updateField("primaryColor", e.target.value)}
                      placeholder="207 100% 63%"
                      className="flex-1"
                      data-testid="input-settings-primary-color"
                    />
                    <div 
                      className="h-10 w-20 rounded-lg border shadow-sm"
                      style={{ backgroundColor: `hsl(${formData.primaryColor})` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Format HSL (ex: 207 100% 63% pour le bleu Koomy)
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave("appearance")}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                    data-testid="button-save-appearance"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Paramètres de paiement
                </CardTitle>
                <CardDescription>
                  Configurez les cotisations et les options de paiement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Activer les cotisations</Label>
                    <p className="text-sm text-gray-500">
                      Permettez à vos membres de payer leur cotisation en ligne
                    </p>
                  </div>
                  <Switch
                    checked={formData.membershipFeeEnabled}
                    onCheckedChange={(checked) => updateField("membershipFeeEnabled", checked)}
                    data-testid="switch-settings-membership-fee"
                  />
                </div>

                {formData.membershipFeeEnabled && (
                  <div className="space-y-6 pt-4 border-t">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="membershipFeeAmount">Montant de la cotisation</Label>
                        <div className="relative">
                          <Input
                            id="membershipFeeAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.membershipFeeAmount}
                            onChange={(e) => updateField("membershipFeeAmount", e.target.value)}
                            placeholder="50"
                            className="pr-12"
                            data-testid="input-settings-fee-amount"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {formData.currency === "EUR" ? "€" : formData.currency === "USD" ? "$" : formData.currency === "GBP" ? "£" : "CHF"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Devise</Label>
                        <Select 
                          value={formData.currency} 
                          onValueChange={(value) => updateField("currency", value)}
                        >
                          <SelectTrigger data-testid="select-settings-currency">
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
                      <Label htmlFor="billingPeriod">Période de facturation</Label>
                      <Select 
                        value={formData.billingPeriod} 
                        onValueChange={(value) => updateField("billingPeriod", value)}
                      >
                        <SelectTrigger data-testid="select-settings-billing-period">
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

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Intégration Stripe
                          </p>
                          <p className="text-sm text-blue-600">
                            Les paiements seront traités de manière sécurisée via Stripe. 
                            L'intégration complète sera disponible prochainement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave("payment")}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                    data-testid="button-save-payment"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
