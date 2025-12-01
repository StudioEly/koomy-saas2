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
| **Dashboard.tsx** | Statistiques | Valeurs en dur (12,389 adhérents, 24 actualités, etc.) |
| **Dashboard.tsx** | "Nouvel Adhérent" (modal) | Formulaire affiché mais soumission non implémentée |
| **Dashboard.tsx** | "Rapport Mensuel" | Bouton sans action |
| **Dashboard.tsx** | Graphiques | Données mock statiques |
| **News.tsx** | Éditeur de texte riche | Placeholder "Éditeur de texte riche (WYSIWYG)" - pas d'éditeur réel |
| **News.tsx** | Création d'actualité | Modal avec formulaire mais pas de sauvegarde en base |
| **News.tsx** | Boutons Aperçu/Edit/Supprimer | Affichés mais non fonctionnels |
| **Events.tsx** | Création d'événement | Modal avec formulaire mais pas de sauvegarde en base |
| **Events.tsx** | Bouton "Scanner" sur les cartes | Navigation vers scanner mobile, pas adapté au desktop |
| **Members.tsx** | Actions sur les membres | Selon implémentation |
| **Messages.tsx** | Messagerie admin | Selon implémentation |
| **Admins.tsx** | Gestion des administrateurs | Selon implémentation |
| **Sections.tsx** | Gestion des sections | Selon implémentation |
| **Support.tsx** | Gestion des tickets | Selon implémentation |
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
| **Pricing.tsx** | Boutons "Commencer" | Redirigent vers `/website/signup` qui redirige vers admin |
| **Layout.tsx** | Liens réseaux sociaux (Twitter, LinkedIn, Instagram) | Liens `#` sans URL réelle |

---

## 6. Données Mock à Remplacer par des Vraies Données

### Fichiers concernés

| Fichier | Données mock | Impact |
|---------|--------------|--------|
| `client/src/lib/mockData.ts` | MOCK_USER, MOCK_NEWS, MOCK_EVENTS, MOCK_MESSAGES, MOCK_MEMBERS, SECTIONS, MOCK_COMMUNITIES, MOCK_PLANS | Utilisées dans tout le back-office et certaines pages mobile |
| `client/src/lib/mockSupportData.ts` | MOCK_FAQS, MOCK_TICKETS | Support mobile et admin |

---

## 7. Priorités Recommandées

### Haute priorité (Fonctionnalités essentielles)

1. **Page de détail d'article** (`/app/:communityId/news/:articleId`) - Les utilisateurs ne peuvent pas lire les actualités
2. **Création réelle d'actualités** - Le back-office ne sauvegarde pas les articles
3. **Création réelle d'événements** - Le back-office ne sauvegarde pas les événements
4. **Scanner QR réel** - Fonctionnalité clé pour les délégués

### Moyenne priorité (Amélioration UX)

5. **Messagerie connectée au backend** - Actuellement mock
6. **Page événements mobile** - Navigation complète
7. **Modification du profil utilisateur** - Paramètres personnels

### Basse priorité (Pages institutionnelles)

8. **Pages légales du site web** - CGU, Mentions légales, Confidentialité
9. **Blog et Centre d'aide** - Contenu marketing
10. **Liens réseaux sociaux** - URLs à définir

---

## 8. Routes Définies mais Non Implémentées dans App.tsx

Toutes les routes listées dans `client/src/App.tsx` existent et sont routées vers des composants. Cependant, les pages suivantes ne sont pas liées depuis d'autres pages :

- Aucune page ne redirige vers `/app/:communityId/events`
- Les détails d'articles ne sont pas accessibles car la route n'existe pas

---

*Document généré le 1er décembre 2025*
