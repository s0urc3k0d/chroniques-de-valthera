# 🚀 Améliorations Proposées - Chroniques de Valthera

## 📊 État d'avancement

| Catégorie | Terminées | En cours | À faire |
|-----------|-----------|----------|---------|
| Quick Wins | 5/5 | 0 | 0 |
| Priorité Haute | 4/4 | 0 | 0 |
| UX | 4/5 | 0 | 1 |
| Contenu | 6/6 | 0 | 0 |
| Valthera | 3/4 | 0 | 1 |
| Technique | 3/6 | 0 | 3 |
| Bonus JDR | 0/5 | 0 | 5 |

---

## ⚡ Quick Wins (Rapides à implémenter)

- [x] **1. Renommer "Hors-Univers" → "Hors-Série"** ✅
- [x] **2. Compteur de sessions total sur la page d'accueil** ✅
- [x] **3. Badge statut plus visible sur les cards campagnes** ✅
- [x] **4. Date de dernière session affichée sur chaque campagne** ✅
- [x] **5. Bouton "Copier le lien" pour partager une campagne** ✅

---

## 🎯 Priorité Haute - Fonctionnalités Essentielles

- [x] **Backend & Base de données** - Supabase PostgreSQL avec tables campaigns, characters, chapters ✅
- [x] **Authentification sécurisée** - Auth0 SPA avec OAuth ✅
- [x] **Galerie d'images intégrée** - Upload d'images pour campagnes/personnages ✅
- [x] **Mode lecture publique** - URL partageable pour chaque campagne ✅

---

## 🎨 Expérience Utilisateur

- [x] **Routing URL propre** - React Router pour vraies URLs (`/univers/valthera`, `/campagne/id`, `/admin`) ✅
- [ ] **Mode sombre/clair** - Toggle thème
- [x] **Recherche & Filtres** - Chercher par titre, personnage, date, statut ✅
- [ ] **Pagination chapitres** - Pour les longues campagnes
- [x] **Lecture audio/podcast** - Player YouTube intégré dans les chapitres ✅

---

## 📖 Contenu & Narration

- [x] **Éditeur Markdown** - Éditeur riche pour les résumés ✅
- [x] **Timeline visuelle** - Frise chronologique interactive ✅
- [x] **Galerie de PNJs** - Section personnages non-joueurs ✅
- [x] **Carte interactive** - Carte avec marqueurs, zoom, pan, plein écran ✅
- [ ] **Système de tags** - Catégoriser les chapitres (#combat, #exploration, #roleplay)
- [x] **Relations personnages** - Visualiser les liens entre personnages ✅

---

## 🏰 Spécifique à Valthera

- [x] **Wiki/Lore intégré** - Pages dédiées à l'univers ✅
- [x] **Bestiaire** - Catalogue des créatures rencontrées avec fiches détaillées ✅
- [x] **Chronologie monde** - Timeline globale de l'histoire ✅
- [ ] **Distinction visuelle** - Thèmes couleurs différents Valthera vs Hors-Série

---

## 📱 Technique

- [ ] **PWA (Progressive Web App)** - Installation mobile, mode hors-ligne
- [x] **SEO & Meta tags** - Open Graph pour partage Discord/réseaux ✅
- [x] **Export PDF** - Générer PDF du récit complet ✅
- [x] **RSS Feed** - Flux pour suivre les nouvelles sessions ✅
- [ ] **Mode impression** - CSS optimisé pour imprimer
- [ ] **Tests unitaires** - Jest/Vitest

---

## 🎲 Fonctionnalités Bonus JDR

- [ ] **Tracker XP/Niveau** - Évolution des personnages
- [ ] **Inventaire partagé** - Liste du loot cumulé
- [ ] **Statistiques** - Nombre de sessions, heures jouées
- [ ] **Système de "quotes"** - Moments mémorables
- [ ] **Intégration Discord** - Webhook nouvelles sessions

---

## 📝 Journal des Implémentations

### 2025-11-27

#### ✅ Quick Win 1 : Renommer "Hors-Univers" → "Hors-Série"
- Modifié le type `UniverseType` dans `types.ts`
- Mis à jour les menus dans `Layout.tsx` (desktop + mobile)
- Modifié les labels dans `CampaignList.tsx`, `CampaignDetail.tsx`, `Home.tsx`
- Mis à jour le formulaire admin dans `AdminCampaignForm.tsx`
- Corrigé les données mock dans `storageService.ts`

#### ✅ Quick Win 2 : Compteur de sessions total sur la page d'accueil
- Ajouté une section "Stats" sur `Home.tsx` avec 4 compteurs :
  - Nombre de campagnes
  - Sessions jouées (total des chapitres)
  - Personnages créés
  - Campagnes en cours

#### ✅ Quick Win 3 : Badge statut plus visible
- Refonte du design des badges de statut dans `CampaignList.tsx`
- Couleurs distinctives : vert (en cours), bleu (terminée), orange (en pause)
- Style glass morphism avec bordures colorées

#### ✅ Quick Win 4 : Date de dernière session
- Ajouté fonction helper `getLastSessionDate()` dans `CampaignList.tsx`
- Affichage de la date formatée en français sur chaque card campagne
- Icône calendrier ajoutée

#### ✅ Quick Win 5 : Bouton "Copier le lien"
- Ajouté icônes `Share2` et `Check` dans `Icons.tsx`
- Nouveau bouton "Partager" dans `CampaignDetail.tsx`
- Copie le lien au format `/campagne/{id}` dans le presse-papier
- Feedback visuel "Lien copié !" pendant 2 secondes

#### ✅ Priorité Haute : Routing URL propre (React Router)
- Installé `react-router-dom`
- Refactorisé `App.tsx` avec `BrowserRouter`, `Routes`, `Route`
- Créé un `AppContext` pour partager l'état global (campaigns, isAdmin)
- Implémenté `ProtectedRoute` pour sécuriser les routes admin
- URLs implémentées :
  - `/` - Accueil
  - `/univers/valthera` - Liste campagnes Valthera
  - `/univers/hors-serie` - Liste campagnes Hors-Série
  - `/campagne/:id` - Détail d'une campagne (partageable!)
  - `/admin/login` - Connexion admin
  - `/admin` - Dashboard admin
  - `/admin/campagne/nouvelle` - Créer campagne
  - `/admin/campagne/:id` - Éditer campagne
  - `/admin/campagne/:campaignId/chapitre/nouveau` - Créer chapitre
  - `/admin/campagne/:campaignId/chapitre/:chapterId` - Éditer chapitre
- Mis à jour tous les composants pour utiliser `Link` et `useNavigate`
- Supprimé l'ancien système `ViewState` / `setView`

#### ✅ Priorité Haute : Mode lecture publique
- Les URLs de campagne sont maintenant partagables directement
- Accès sans authentification aux pages publiques
- Le bouton "Partager" copie maintenant une vraie URL fonctionnelle

#### ✅ Priorité Haute : Backend Supabase
- Installé `@supabase/supabase-js`
- Créé `services/supabaseClient.ts` avec la config et types DB
- Créé `services/supabaseService.ts` avec les fonctions CRUD async
- Créé `supabase-schema.sql` avec :
  - Tables `campaigns`, `characters`, `chapters`
  - Row Level Security (RLS) pour lecture publique
  - Triggers pour `updated_at` automatique
  - Données de démonstration
- L'ancienne `storageService.ts` (localStorage) reste disponible en fallback

#### ✅ Priorité Haute : Authentification Auth0
- Installé `@auth0/auth0-react`
- Créé `services/auth0Config.ts` avec domain, clientId, scopes
- Refactorisé `App.tsx` :
  - Ajouté `Auth0Provider` comme wrapper racine
  - Créé hook `useIsAdmin()` pour vérifier les droits
  - `ProtectedRoute` utilise maintenant `useAuth0()` pour rediriger vers Auth0
  - Suppression du state `isAdmin` manuel
- Mis à jour `Layout.tsx` :
  - Bouton de connexion appelle `loginWithRedirect()`
  - Affiche l'avatar utilisateur Auth0
  - Déconnexion via `logout()` Auth0
- Supprimé `pages/AdminLogin.tsx` (obsolète)
- Configuration requise dans Auth0 :
  - Allowed Callback URLs: `http://localhost:3000`
  - Allowed Logout URLs: `http://localhost:3000`
  - Allowed Web Origins: `http://localhost:3000`

#### ✅ Priorité Haute : Galerie d'images (Supabase Storage)
- Créé `supabase-storage.sql` pour le bucket "images"
- Créé `services/imageService.ts` avec upload/delete
- Créé `components/ImageUpload.tsx` - composant drag & drop
- Intégré dans `AdminCampaignForm.tsx` pour campagnes et personnages

#### ✅ UX : Recherche & Filtres
- Ajouté barre de recherche dans `CampaignList.tsx`
- Recherche par titre, pitch, nom de personnage, joueur
- Filtre par statut (En cours, Terminée, En pause)
- Bouton réinitialiser les filtres
- Ajouté icônes `Search` et `Filter` dans `Icons.tsx`

#### ✅ UX : Player YouTube intégré
- Créé `components/YouTubePlayer.tsx`
- Extraction automatique de l'ID YouTube depuis différents formats d'URL
- Embed iframe responsive dans les chapitres
- Lien "Ouvrir sur YouTube" en fallback

#### ✅ Contenu : Éditeur Markdown
- Créé `components/MarkdownEditor.tsx`
- Toolbar avec boutons Gras, Italique, Titre, Liste
- Toggle Éditer / Aperçu
- Parser Markdown basique intégré
- Intégré dans `AdminChapterForm.tsx`

#### ✅ Contenu : Timeline visuelle
- Créé `components/Timeline.tsx`
- Affichage chronologique des sessions
- Points colorés sur la ligne du temps
- Indicateur de session enregistrée (YouTube)
- Preview des highlights
- Clic pour naviguer vers le chapitre

#### ✅ Contenu : Galerie de PNJs
- Créé `components/CharacterGallery.tsx`
- Filtres PJ / PNJ / Tous
- Badges distinctifs pour les PNJs
- Affichage des relations
- Mis à jour `types.ts` avec `isNPC` et `relations`
- Section PNJ séparée dans `AdminCampaignForm.tsx`

#### ✅ Contenu : Relations personnages
- Créé `components/RelationGraph.tsx`
- Visualisation des liens entre personnages
- Types de relations : Allié, Ennemi, Famille, Romance, Rival, Mentor, Neutre
- Couleurs distinctives par type
- Ajout de relations dans le formulaire admin
- Nouvel onglet "Relations" dans `CampaignDetail.tsx`

#### 📐 Refactoring CampaignDetail.tsx
- Nouveaux onglets : Chapitres, Timeline, Personnages, Relations
- Intégration de tous les nouveaux composants
- Dates formatées en français
- Mise en évidence du chapitre sélectionné depuis la timeline

#### ✅ Contenu : Carte Interactive
- Créé `components/InteractiveMap.tsx`
- Import d'image JPEG/PNG de carte générée
- Zoom (molette + boutons), pan (drag), plein écran
- Marqueurs cliquables avec 8 types : Ville, Donjon, Lieu notable, Campement, Combat, Quête, Trésor, Danger
- Popup détaillé avec description et lien vers chapitre
- Légende intégrée et indicateur de zoom
- Mode édition dans l'admin pour placer les marqueurs
- Section "Carte de la Campagne" dans `AdminCampaignForm.tsx`
- Nouvel onglet "Carte" dans `CampaignDetail.tsx`

#### ✅ Valthera : Bestiaire
- Créé `components/Bestiary.tsx`
- Types de créatures : Bête, Humanoïde, Mort-vivant, Dragon, Démon, Élémentaire, Créature artificielle, Aberration, Céleste, Fée, Géant, Vase, Plante, Monstruosité
- Niveaux de danger : Insignifiant → Facile → Moyen → Difficile → Mortel → Légendaire
- Filtres par type, niveau de danger, texte
- Toggle "Vaincus uniquement"
- Fiche détaillée avec : Description, Habitat, Capacités, Butin possible, Chapitre de rencontre, Notes MJ
- Marquage "Vaincu" avec compteur
- Formulaire d'ajout/édition de créature dans l'admin
- Nouvel onglet "Bestiaire" dans `CampaignDetail.tsx`
- Types `MapMarker` et `BestiaryCreature` ajoutés dans `types.ts`
- Colonnes `map_image_url`, `map_markers`, `bestiary` ajoutées à Supabase

#### ✅ Valthera : Wiki/Lore Intégré
- Créé `types/lore.ts` avec types `LoreArticle`, `WorldEvent`, catégories et ères
- Créé `services/loreService.ts` pour CRUD des articles et événements
- Créé `components/WikiLore.tsx` - Encyclopédie avec :
  - Recherche textuelle et filtres par catégorie
  - 9 catégories : Géographie, Histoire, Factions, Personnages, Magie, Religion, Créatures, Culture, Divers
  - Vue grille avec images et tags
  - Vue détail avec articles liés et métadonnées
  - Mode édition admin
- Créé `components/WorldTimeline.tsx` - Chronologie avec :
  - 5 ères historiques : Âge de l'Aube, des Empires, des Ombres, du Renouveau, Actuel
  - 7 types d'événements : Guerre, Découverte, Fondation, Catastrophe, Politique, Magie, Divin
  - 3 niveaux d'importance : Mineur, Majeur, Légendaire
  - Affichage timeline verticale avec années
  - Filtres par ère
  - Modal détail avec image
- Créé `pages/LorePage.tsx` avec onglets Wiki/Chronologie et modales d'édition
- Créé `supabase-lore.sql` avec tables et données de démonstration
- Ajouté routes `/lore` et `/lore/:tab` dans `App.tsx`
- Ajouté lien "Lore" dans la navigation

#### ✅ Technique : SEO & Meta Tags
- Créé `components/SEOHead.tsx` - Gestion dynamique des meta tags
- Open Graph (og:title, og:description, og:image, og:url)
- Twitter Cards (summary_large_image)
- Meta description et robots
- Canonical URL
- Données structurées JSON-LD (schema.org Article)
- Intégré dans `CampaignDetail.tsx`

#### ✅ Technique : RSS Feed
- Créé `services/feedService.ts` avec `generateRSSFeed()`
- Flux RSS 2.0 avec Atom namespace
- Collecte toutes les sessions de toutes les campagnes
- Tri par date, limite 50 dernières
- Catégories (Valthera / Hors-Série)
- Créé `pages/RSSFeedPage.tsx` avec :
  - Aperçu du flux XML
  - Bouton téléchargement fichier RSS
  - Instructions d'utilisation
- Ajouté route `/rss` dans `App.tsx`
- Ajouté lien RSS dans le footer

#### ✅ Technique : Export PDF
- Créé `generateCampaignPDFContent()` dans `feedService.ts`
- Document HTML complet avec styles CSS print-ready
- Sections : Couverture, Métadonnées, Personnages, Chapitres
- Mise en page A4 avec @page CSS
- Gestion des sauts de page
- Créé `printCampaignPDF()` ouvre nouvelle fenêtre et déclenche impression
- Ajouté bouton "PDF" dans header de `CampaignDetail.tsx`
