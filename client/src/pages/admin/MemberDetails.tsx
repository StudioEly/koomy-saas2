import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { MOCK_MEMBERS, SECTIONS, User } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User as UserIcon, Mail, Phone, MapPin, Calendar, Shield, CreditCard, 
  AlertTriangle, CheckCircle2, Download, History, ArrowLeft 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";

export default function AdminMemberDetails({ params }: { params: { id: string } }) {
  const [location, setLocation] = useLocation();
  const member = MOCK_MEMBERS.find(m => m.id === params.id) || MOCK_MEMBERS[0];
  const [isEditing, setIsEditing] = useState(false);

  const handleRenew = () => {
    toast({
      title: "Renouvellement initié",
      description: "Un email de paiement a été envoyé à l'adhérent.",
    });
  };

  const handleReminder = () => {
    toast({
      title: "Rappel envoyé",
      description: "L'adhérent a reçu une notification de rappel de cotisation.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2 text-gray-500 hover:text-gray-900 pl-0" onClick={() => setLocation("/admin/members")}>
          <ArrowLeft size={16} /> Retour à la liste
        </Button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden shadow-inner">
              {member.avatar ? (
                <img src={member.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
                  {member.firstName[0]}{member.lastName[0]}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{member.firstName} {member.lastName}</h1>
                <Badge 
                   variant="outline" 
                   className={
                     member.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                     member.status === "expired" ? "bg-red-50 text-red-700 border-red-200" :
                     "bg-yellow-50 text-yellow-700 border-yellow-200"
                   }
                 >
                   {member.status === "active" ? "Actif" : member.status === "expired" ? "Expiré" : "Suspendu"}
                 </Badge>
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield size={14} /> {member.memberId} • Adhérent depuis {new Date(member.joinDate).getFullYear()}
                </div>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <MapPin size={14} /> {member.section}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Annuler" : "Modifier"}
            </Button>
            {isEditing && <Button>Enregistrer</Button>}
            {!isEditing && (
               <Button variant="destructive">Suspendre</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-500">Email</Label>
                    {isEditing ? <Input defaultValue={member.email} /> : (
                      <div className="flex items-center gap-2 font-medium">
                        <Mail size={16} className="text-gray-400" /> {member.email}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Téléphone</Label>
                    {isEditing ? <Input defaultValue={member.phone} /> : (
                      <div className="flex items-center gap-2 font-medium">
                        <Phone size={16} className="text-gray-400" /> {member.phone}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Date de naissance</Label>
                    {isEditing ? <Input type="date" /> : (
                      <div className="flex items-center gap-2 font-medium">
                        <Calendar size={16} className="text-gray-400" /> 15/04/1985
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Adresse</Label>
                    {isEditing ? <Input defaultValue="12 Rue de la Paix, 75000 Paris" /> : (
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin size={16} className="text-gray-400" /> 12 Rue de la Paix, 75000 Paris
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
               <CardHeader>
                 <CardTitle className="text-lg">Historique des Cotisations</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="rounded-md border border-gray-100 overflow-hidden">
                   <table className="w-full text-sm">
                     <thead className="bg-gray-50">
                       <tr className="border-b border-gray-200">
                         <th className="py-3 px-4 text-left font-medium text-gray-500">Année</th>
                         <th className="py-3 px-4 text-left font-medium text-gray-500">Date</th>
                         <th className="py-3 px-4 text-left font-medium text-gray-500">Moyen</th>
                         <th className="py-3 px-4 text-right font-medium text-gray-500">Montant</th>
                         <th className="py-3 px-4 text-right font-medium text-gray-500">Statut</th>
                         <th className="py-3 px-4 text-right font-medium text-gray-500">Reçu</th>
                       </tr>
                     </thead>
                     <tbody>
                       {member.history?.map((payment) => (
                         <tr key={payment.id} className="border-b border-gray-100 last:border-0">
                           <td className="py-3 px-4 font-medium">{payment.year}</td>
                           <td className="py-3 px-4 text-gray-600">{new Date(payment.date).toLocaleDateString()}</td>
                           <td className="py-3 px-4 text-gray-600">{payment.method}</td>
                           <td className="py-3 px-4 text-right font-medium">{payment.amount} €</td>
                           <td className="py-3 px-4 text-right">
                             <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Payé</Badge>
                           </td>
                           <td className="py-3 px-4 text-right">
                             <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-primary">
                               <Download size={14} />
                             </Button>
                           </td>
                         </tr>
                       ))}
                       {!member.history && (
                         <tr>
                           <td colSpan={6} className="py-8 text-center text-gray-400">Aucun historique disponible</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               </CardContent>
            </Card>
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            <Card className={member.contributionStatus === "expired" ? "border-red-200 bg-red-50/30" : "border-green-200 bg-green-50/30"}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className={member.contributionStatus === "expired" ? "text-red-600" : "text-green-600"} />
                  État des Cotisations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                  <span className="text-sm text-gray-600">Statut Actuel</span>
                  {member.contributionStatus === "up_to_date" ? (
                    <Badge className="bg-green-600 hover:bg-green-700">À Jour</Badge>
                  ) : (
                    <Badge variant="destructive" className="animate-pulse">Expiré</Badge>
                  )}
                </div>
                <div className="space-y-1">
                   <p className="text-xs text-gray-500 uppercase font-bold">Prochaine Échéance</p>
                   <p className="text-xl font-bold text-gray-900">
                     {member.nextDueDate ? new Date(member.nextDueDate).toLocaleDateString() : "N/A"}
                   </p>
                   {member.contributionStatus === "expired" && (
                     <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                       <AlertTriangle size={12} /> Retard de paiement détecté
                     </p>
                   )}
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  {member.contributionStatus === "expired" ? (
                    <>
                      <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleReminder}>
                        Envoyer un rappel
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleRenew}>
                        Renouvellement manuel
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Aucune action requise
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Code</CardTitle>
                <CardDescription>Utilisé pour le pointage aux événements</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
                  {/* Placeholder for QR - could use real component if needed but image is fine for mock */}
                  <div className="w-32 h-32 bg-gray-900 rounded-md flex items-center justify-center text-white text-xs">
                    QR CODE
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-gray-500">
                  <Download size={14} className="mr-2" /> Télécharger
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
