# Koomy - Fonctionnalités Incomplètes et Pages Manquantes

Ce document recense l'ensemble des fonctionnalités créées mais non fonctionnelles, ainsi que les pages menant à des erreurs 404 dans les différentes applications de Koomy.

---

## 1. Application Mobile Membres (`/app/*`)

### Pages manquantes (404) - RÉSOLU ✅

| Route | Description | Statut |
|-------|-------------|--------|
| `/app/:communityId/news/:articleId` | Page de détail d'un article d'actualité | ✅ Créé - NewsDetail.tsx |
| `/app/:communityId/events` | Liste des événements | ✅ Créé - Events.tsx |
| `/app/:communityId/events/:eventId` | Détail d'un événement | ✅ Créé - EventDetail.tsx |

### Fonctionnalités UI créées mais non fonctionnelles

| Page | Élément | Problème |
|------|---------|----------|
| **News.tsx** | Cartes d'actualités | ✅ Résolu - Navigation vers le détail fonctionnelle |
| **Home.tsx** | Cartes d'actualités récentes | ✅ Résolu - Navigation vers le détail fonctionnelle |
| **Home.tsx** | Section "Prochain Événement" | ✅ Résolu - Lien vers le détail + lien "Tous les événements" |
| **Messages.tsx** | Messagerie | Utilise des données mock (`MOCK_MESSAGES`), pas connectée au backend |
| **Support.tsx** | Création de ticket | Toast de confirmation mais pas de sauvegarde réelle en base de données |
| **Support.tsx** | FAQ | Utilise des données mock (`MOCK_FAQS`) |
| **Profile.tsx** | "Informations personnelles" | Clic possible mais aucune page de modification |
| **Profile.tsx** | "Notifications" | Clic possible mais aucune page de paramètres |
| **Profile.tsx** | "Sécurité et confidentialité" | Clic possible mais aucune page de paramètres |
| **Profile.tsx** | Bouton édition photo profil | Bouton affiché mais non fonctionnel |

---

## 2. Application Mobile Admin (`/app/:communityId/admin/*`)

### Fonctionnalités UI créées mais non fonctionnelles

| Page | Élément | Problème |
|------|---------|----------|
| **Scanner.tsx** | Scanner QR Code | Simulation uniquement (timeout de 3s puis affichage mock). Pas de vraie caméra ni lecture QR |
| **Home.tsx** | Statistiques (Messages, Présence) | Affichage de valeurs en dur ("0", "--") |
| **Messages.tsx** | Messagerie admin | Utilise des données mock, pas connectée au backend |

---

## 3. Back-Office Web Admin (`/admin/*`)

### Pages manquantes (404)

| Route | Description | Action requise |
|-------|-------------|----------------|
| `/admin/news/:articleId` | Édition d'un article spécifique | À créer |
| `/admin/settings` | Paramètres de la communauté | À créer |

### Fonctionnalités UI créées mais non fonctionnelles

| Page | Élément | Problème |
|------|---------|----------|
| **Dashboard.tsx** | Statistiques | ✅ Résolu - Connecté à l'API avec données réelles via React Query |
| **Dashboard.tsx** | "Nouvel Adhérent" (modal) | Formulaire affiché mais soumission non implémentée |
| **Dashboard.tsx** | "Rapport Mensuel" | Bouton sans action |
| **Dashboard.tsx** | Graphiques | Données mock statiques |
| **News.tsx** | Éditeur de texte riche | Placeholder "Éditeur de texte riche (WYSIWYG)" - pas d'éditeur réel |
| **News.tsx** | Création d'actualité | ✅ Résolu - Connecté à l'API avec React Query |
| **News.tsx** | Boutons Aperçu/Edit/Supprimer | Affichés mais non fonctionnels |
| **Events.tsx** | Création d'événement | ✅ Résolu - Connecté à l'API avec React Query |
| **Events.tsx** | Bouton "Scanner" sur les cartes | Navigation vers scanner mobile, pas adapté au desktop |
| **Members.tsx** | Actions sur les membres | ✅ Résolu - Connecté à l'API avec données réelles |
| **Messages.tsx** | Messagerie admin | ✅ Résolu - Connecté à l'API avec endpoints corrects `/api/communities/{id}/messages/{conversationId}` |
| **Admins.tsx** | Gestion des administrateurs | ✅ Résolu - Connecté à l'API avec React Query |
| **Sections.tsx** | Gestion des sections | ✅ Résolu - Connecté à l'API avec React Query |
| **Support.tsx** | Gestion des tickets | ✅ Résolu - Connecté à l'API tickets + FAQs |
| **Payments.tsx** | Gestion des paiements | Selon implémentation |

---

## 4. Portail Super Admin SaaS (`/platform/*`)

### Fonctionnalités UI créées mais non fonctionnelles

| Page | Élément | Problème |
|------|---------|----------|
| **SuperDashboard.tsx** | Liste des communautés | Utilise `MOCK_COMMUNITIES` |
| **SuperDashboard.tsx** | Création de client | Toast de confirmation mais pas de sauvegarde réelle |
| **SuperDashboard.tsx** | Gestion des plans | Utilise `MOCK_PLANS` |
| **SuperDashboard.tsx** | Tickets support | Utilise `MOCK_TICKETS` |
| **SuperDashboard.tsx** | Création d'admin plateforme | Toast seulement |

---

## 5. Site Web Commercial (`/website/*`)

### Pages manquantes (404)

| Route | Description | Action requise |
|-------|-------------|----------------|
| `/website/support` | Centre d'aide | Lien présent dans le footer mais page inexistante |
| `/website/blog` | Blog | Lien présent dans le footer (# href) |
| `/website/privacy` | Confidentialité | Lien présent dans le footer (# href) |
| `/website/terms` | CGU | Lien présent dans le footer (# href) à creer avec du texte standard adaoté a l'europe|
| `/website/legal` | Mentions légales | Lien présent dans le footer (# href) |à creer avec du texte standard adaoté a l'europe|
| `/website/contact` | Contact | Page non créée | à créer avec un formulaire nom mail entité telephone avec choix du code pays, le formulaire créé un ticket  commercial, qui se retrouve dans les ticket support
| `/website/demo` | Demande de démo | Page non créée | la demande de démo mène au formulaire de contact

### Fonctionnalités UI créées mais non fonctionnelles

| Page | Élément | Problème |
|------|---------|----------|
| **Home.tsx** | Bouton "App Store" | Lien visuel mais pas de vraie URL |
| **Home.tsx** | Bouton "Google Play" | Lien visuel mais pas de vraie URL |
| **Home.tsx** | Liens imbriqués | ✅ Résolu - Erreur de nested links corrigée |
| **Pricing.tsx** | Boutons "Commencer" | Redirigent vers `/website/signup` qui redirige vers admin |
| **Layout.tsx** | Liens réseaux sociaux (Twitter, LinkedIn, Instagram) | Liens `#` sans URL réelle |

---

## 6. Données Mock à Remplacer par des Vraies Données

### Fichiers concernés

| Fichier | Données mock | Impact |
|---------|--------------|--------|
| `client/src/lib/mockData.ts` | MOCK_USER, MOCK_NEWS, MOCK_EVENTS, MOCK_MESSAGES, MOCK_MEMBERS, SECTIONS, MOCK_COMMUNITIES, MOCK_PLANS | ✅ Partiellement résolu - Back-office admin maintenant connecté aux vraies données |
| `client/src/lib/mockSupportData.ts` | MOCK_FAQS, MOCK_TICKETS | ✅ Résolu pour admin - Support.tsx connecté à l'API |

---

## 7. Priorités Recommandées

### Haute priorité (Fonctionnalités essentielles)

1. ~~**Page de détail d'article** (`/app/:communityId/news/:articleId`)~~ ✅ Résolu
2. ~~**Création réelle d'actualités**~~ ✅ Résolu - Back-office connecté
3. ~~**Création réelle d'événements**~~ ✅ Résolu - Back-office connecté
4. **Scanner QR réel** - Fonctionnalité clé pour les délégués

### Moyenne priorité (Amélioration UX)

5. ~~**Messagerie connectée au backend**~~ ✅ Résolu - Schema et endpoints mis à jour
6. ~~**Page événements mobile**~~ ✅ Résolu - Navigation complète
7. **Modification du profil utilisateur** - Paramètres personnels

### Basse priorité (Pages institutionnelles)

8. **Pages légales du site web** - CGU, Mentions légales, Confidentialité
9. **Blog et Centre d'aide** - Contenu marketing
10. **Liens réseaux sociaux** - URLs à définir

---

## 8. Routes Définies mais Non Implémentées dans App.tsx

~~Toutes les routes listées dans `client/src/App.tsx` existent et sont routées vers des composants. Cependant, les pages suivantes ne sont pas liées depuis d'autres pages :~~

- ~~Aucune page ne redirige vers `/app/:communityId/events`~~ ✅ Résolu
- ~~Les détails d'articles ne sont pas accessibles car la route n'existe pas~~ ✅ Résolu

---

## 9. Corrections Techniques Effectuées

| Élément | Correction |
|---------|------------|
| **Schema messages** | ✅ Renommé `timestamp` en `createdAt`, ajouté `senderMembershipId` avec FK, ajouté `senderType` |
| **Member status enum** | ✅ Corrigé pour utiliser `["active", "expired", "suspended"]` |
| **API endpoints** | ✅ Messages utilisent maintenant `/api/communities/{id}/messages/{conversationId}` |
| **React Query** | ✅ Toutes les pages admin utilisent le queryClient avec default queryFn |

---

*Document mis à jour le 1er décembre 2025*
