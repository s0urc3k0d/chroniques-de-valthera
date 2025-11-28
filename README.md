<div align="center">

# 🏰 Chroniques de Valthera

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

**Une plateforme moderne pour immortaliser vos épopées de jeu de rôle**

[🎮 Démo](#) • [📖 Documentation](#-fonctionnalités) • [🚀 Installation](#-installation)

</div>

---

## 📋 Description

**Chroniques de Valthera** est une application web complète dédiée à la gestion et au partage de campagnes de jeu de rôle. Que vous soyez Maître du Jeu ou joueur, cette plateforme vous permet de :

- 📚 **Archiver** vos sessions de jeu avec résumés narratifs
- 🗺️ **Explorer** des cartes interactives de vos mondes
- 👥 **Gérer** vos personnages (PJ & PNJ) et leurs relations
- 🐉 **Cataloguer** les créatures rencontrées dans un bestiaire
- 📅 **Planifier** vos prochaines sessions avec notifications
- 🎬 **Diffuser** en direct sur Twitch et archiver sur YouTube

---

## ✨ Fonctionnalités

### 🎲 Gestion des Campagnes
- Multi-univers (Valthera fantasy, Hors-Série pour SF/Horreur/etc.)
- Chapitres/sessions avec support Markdown complet
- Timeline visuelle des aventures
- Export PDF du récit complet
- Flux RSS pour suivre les nouvelles sessions

### 👤 Personnages & Relations
- Fiches détaillées pour PJ et PNJ
- Upload d'images personnalisées
- Système de relations (Allié, Ennemi, Famille, Romance, Mentor...)
- Graphe de relations interactif

### 🗺️ Carte Interactive
- Import de cartes générées (JPEG/PNG)
- Marqueurs typés (Ville, Donjon, Trésor, Danger...)
- Zoom, pan, mode plein écran
- Lien vers les chapitres de l'histoire

### 🐲 Bestiaire
- Fiches créatures avec niveau de danger
- 14 types (Bête, Dragon, Mort-vivant, Démon...)
- Capacités, habitat, butin possible
- Suivi des créatures vaincues

### 📚 Wiki / Lore
- Encyclopédie par catégories (Géographie, Histoire, Magie...)
- Chronologie mondiale par ères
- Articles liés et tags
- Support Markdown

### 📅 Calendrier & Planification
- Vue calendrier des sessions passées et futures
- Planification avec notification aux joueurs
- Lien Twitch pour le live
- Pitch et notes de session

### 🔐 Administration
- Authentification sécurisée via Auth0
- Dashboard de gestion
- Upload d'images via Supabase Storage
- Contrôle d'accès par email

---

## 🛠️ Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| [React](https://react.dev/) | 19.2 | Framework UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.8 | Typage statique |
| [Vite](https://vitejs.dev/) | 6.2 | Build tool |
| [React Router](https://reactrouter.com/) | 7.x | Navigation SPA |
| [TailwindCSS](https://tailwindcss.com/) | 3.x | Styling |
| [Supabase](https://supabase.com/) | 2.x | Backend PostgreSQL + Storage |
| [Auth0](https://auth0.com/) | 2.x | Authentification OAuth |
| [Lucide](https://lucide.dev/) | 0.5 | Icônes |

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- Compte [Supabase](https://supabase.com/) (gratuit)
- Compte [Auth0](https://auth0.com/) (gratuit)

### 1. Cloner le projet

```bash
git clone https://github.com/s0urc3k0d/chroniques-de-valthera.git
cd chroniques-de-valthera
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com/)
2. Exécutez les scripts SQL dans l'ordre :
   - `supabase-schema.sql` (tables principales)
   - `supabase-update.sql` (colonnes additionnelles)
   - `supabase-lore.sql` (wiki & chronologie)
   - `supabase-sessions.sql` (calendrier)
   - `supabase-storage.sql` (bucket images)

3. Créez le fichier `.env.local` :

```env
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

### 4. Configurer Auth0

1. Créez une application SPA sur [Auth0](https://auth0.com/)
2. Configurez les URLs autorisées :
   - Allowed Callback URLs: `http://localhost:3000`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`

3. Mettez à jour `services/auth0Config.ts` avec vos identifiants

### 5. Lancer le projet

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du Projet

```
chroniques-de-valthera/
├── components/          # Composants React réutilisables
│   ├── Bestiary.tsx     # Catalogue des créatures
│   ├── Calendar.tsx     # Calendrier des sessions
│   ├── CharacterGallery.tsx
│   ├── InteractiveMap.tsx
│   ├── Layout.tsx       # Navbar & footer
│   ├── Timeline.tsx     # Frise chronologique
│   └── ...
├── pages/               # Pages de l'application
│   ├── Home.tsx
│   ├── CampaignDetail.tsx
│   ├── CalendarPage.tsx
│   ├── AdminDashboard.tsx
│   └── ...
├── services/            # Logique métier & API
│   ├── supabaseClient.ts
│   ├── supabaseService.ts
│   ├── sessionService.ts
│   └── ...
├── types/               # Définitions TypeScript
├── App.tsx              # Point d'entrée & routing
└── index.html
```

---

## 🎨 Captures d'écran

<details>
<summary>📸 Voir les captures</summary>

| Page d'accueil | Détail campagne |
|----------------|-----------------|
| Stats, campagnes featured | Onglets, timeline, personnages |

| Carte interactive | Bestiaire |
|-------------------|-----------|
| Zoom, marqueurs, plein écran | Fiches créatures, filtres |

| Wiki | Calendrier |
|------|------------|
| Articles, chronologie | Sessions passées & futures |

</details>

---

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Committez (`git commit -m 'Ajout de ma feature'`)
4. Pushez (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

---

## 📝 Roadmap

- [ ] Mode sombre/clair
- [ ] PWA (mode hors-ligne)
- [ ] Intégration Discord (webhook nouvelles sessions)
- [ ] Tracker XP/Niveau des personnages
- [ ] Inventaire partagé
- [ ] Système de quotes mémorables
- [ ] Export vers D&D Beyond / Roll20

---

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

**Fait avec ❤️ pour la communauté JDR**

[⬆ Retour en haut](#-chroniques-de-valthera)

</div>
