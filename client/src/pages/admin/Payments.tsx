import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Filter, Plus, Euro, CheckCircle, Clock, AlertCircle, Send, 
  Users, Calendar, Download, TrendingUp
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PaymentRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "expired" | "cancelled";
  dueDate: string;
  createdAt: string;
  message?: string;
  feeName: string;
}

interface MembershipFee {
  id: string;
  name: string;
  amount: number;
  currency: string;
  period: string;
}

export default function AdminPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const membershipFees: MembershipFee[] = [
    { id: "fee_1", name: "Cotisation Annuelle", amount: 12000, currency: "EUR", period: "annual" },
    { id: "fee_2", name: "Cotisation Semestrielle", amount: 7000, currency: "EUR", period: "semi-annual" },
  ];

  const paymentRequests: PaymentRequest[] = [
    {
      id: "req_1",
      memberId: "user_1",
      memberName: "Jean Dupont",
      memberEmail: "jean.dupont@email.com",
      amount: 12000,
      currency: "EUR",
      status: "pending",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      message: "Cotisation annuelle 2025",
      feeName: "Cotisation Annuelle"
    },
    {
      id: "req_2",
      memberId: "user_2",
      memberName: "Marie Martin",
      memberEmail: "marie.martin@email.com",
      amount: 12000,
      currency: "EUR",
      status: "paid",
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      feeName: "Cotisation Annuelle"
    },
    {
      id: "req_3",
      memberId: "user_3",
      memberName: "Pierre Durand",
      memberEmail: "pierre.durand@email.com",
      amount: 7000,
      currency: "EUR",
      status: "expired",
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      feeName: "Cotisation Semestrielle"
    }
  ];

  const formatAmount = (cents: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency 
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock size={12} /> En attente</span>;
      case "paid":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={12} /> Payé</span>;
      case "expired":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertCircle size={12} /> Expiré</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Annulé</span>;
      default:
        return null;
    }
  };

  const filteredRequests = paymentRequests.filter(req => {
    const matchesSearch = req.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.memberEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: paymentRequests.length,
    pending: paymentRequests.filter(r => r.status === "pending").length,
    paid: paymentRequests.filter(r => r.status === "paid").length,
    expired: paymentRequests.filter(r => r.status === "expired").length,
    totalAmount: paymentRequests.filter(r => r.status === "paid").reduce((sum, r) => sum + r.amount, 0),
    pendingAmount: paymentRequests.filter(r => r.status === "pending").reduce((sum, r) => sum + r.amount, 0)
  };

  const handleCreateRequest = () => {
    if (!selectedFee) {
      toast.error("Veuillez sélectionner un type de cotisation");
      return;
    }
    toast.success("Demande de paiement envoyée avec succès");
    setIsCreateOpen(false);
    setSelectedFee("");
    setCustomMessage("");
  };

  const handleBulkRequest = () => {
    if (!selectedFee) {
      toast.error("Veuillez sélectionner un type de cotisation");
      return;
    }
    toast.success(`Demandes de paiement envoyées à ${selectedMembers.length || "tous les"} membres`);
    setIsBulkOpen(false);
    setSelectedFee("");
    setCustomMessage("");
  };

  const handleSendReminder = (requestId: string) => {
    toast.success("Rappel envoyé avec succès");
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
            <p className="text-gray-500">Gérer les cotisations et demandes de paiement</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setIsBulkOpen(true)}
              data-testid="button-bulk-request"
            >
              <Users size={18} className="mr-2" />
              Appel de cotisation
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsCreateOpen(true)}
              data-testid="button-new-request"
            >
              <Plus size={18} className="mr-2" />
              Nouvelle demande
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total collecté</p>
                <p className="text-xl font-bold text-gray-900">{formatAmount(stats.totalAmount, "EUR")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-xl font-bold text-gray-900">{formatAmount(stats.pendingAmount, "EUR")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Paiements réussis</p>
                <p className="text-xl font-bold text-gray-900">{stats.paid}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Demandes expirées</p>
                <p className="text-xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                placeholder="Rechercher par nom ou email..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-payments"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Payment Requests Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Membre</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Échéance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Statut</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`row-payment-${request.id}`}>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{request.memberName}</p>
                      <p className="text-sm text-gray-500">{request.memberEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{request.feeName}</td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">{formatAmount(request.amount, request.currency)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={14} />
                      {formatDate(request.dueDate)}
                    </div>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
                  <td className="py-4 px-4 text-right">
                    {request.status === "pending" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSendReminder(request.id)}
                        data-testid={`button-reminder-${request.id}`}
                      >
                        <Send size={16} className="mr-1" />
                        Rappel
                      </Button>
                    )}
                    {request.status === "expired" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSendReminder(request.id)}
                      >
                        <Send size={16} className="mr-1" />
                        Relancer
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucune demande de paiement trouvée
            </div>
          )}
        </div>

        {/* Create Single Request Modal */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle demande de paiement</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Membre</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un membre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user_1">Jean Dupont</SelectItem>
                    <SelectItem value="user_2">Marie Martin</SelectItem>
                    <SelectItem value="user_3">Pierre Durand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type de cotisation</label>
                <Select value={selectedFee} onValueChange={setSelectedFee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipFees.map(fee => (
                      <SelectItem key={fee.id} value={fee.id}>
                        {fee.name} - {formatAmount(fee.amount, fee.currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message personnalisé (optionnel)</label>
                <Textarea 
                  placeholder="Ajoutez un message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateRequest}>Envoyer la demande</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Request Modal */}
        <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Appel de cotisation</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium">Envoi groupé</p>
                <p>Cette action enverra une demande de paiement à tous les membres sélectionnés ou à l'ensemble de la communauté.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type de cotisation</label>
                <Select value={selectedFee} onValueChange={setSelectedFee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipFees.map(fee => (
                      <SelectItem key={fee.id} value={fee.id}>
                        {fee.name} - {formatAmount(fee.amount, fee.currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Destinataires</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les membres (247)</SelectItem>
                    <SelectItem value="pending">Membres avec cotisation en retard (23)</SelectItem>
                    <SelectItem value="expired">Membres avec cotisation expirée (8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Échéance</label>
                <Input type="date" defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message personnalisé (optionnel)</label>
                <Textarea 
                  placeholder="Ajoutez un message pour accompagner la demande..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkOpen(false)}>Annuler</Button>
              <Button onClick={handleBulkRequest} className="bg-primary hover:bg-primary/90">
                <Send size={16} className="mr-2" />
                Envoyer l'appel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
