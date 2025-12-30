# Architecture du projet Tock Game

## Structure des dossiers

### `src/`
Dossier principal du code source côté client (Next.js).

#### `app/`
- Pages Next.js 13+ avec App Router
- `layout.tsx` : Layout principal
- `page.tsx` : Page d'accueil
- `game/[gameId]/page.tsx` : Page de jeu
- `lobby/[gameId]/page.tsx` : Page de lobby
- `login/`, `register/`, etc. : Pages d'authentification

#### `components/`
- Composants React réutilisables
- `Board.tsx` : Plateau de jeu (sans calibration)
- `Hand.tsx` : Main du joueur
- `Navbar.tsx` : Barre de navigation
- `ThemeProvider.tsx` & `ThemeToggle.tsx` : Gestion du thème

#### `hooks/`
- Stores Zustand (custom hooks)
- `authStore.ts` : État d'authentification
- `gameStore.ts` : État du jeu
- `themeStore.ts` : État du thème

#### `lib/`
- Utilitaires et bibliothèques
- `animationHelper.ts` : Fonctions d'animation

#### `services/`
- Logique métier et appels API
- `api.ts` : Client API pour les appels serveur

#### `types/`
- Types TypeScript partagés
- `auth.ts` : Types d'authentification
- `game.ts` : Types du jeu (pions, cartes, etc.)

#### `constants/`
- Constantes de l'application
- `game.ts` : Constantes du plateau (STARTS, RING_SIZE, etc.)

## Architecture côté serveur

### `server/src/`
Code source du serveur Node.js avec Socket.IO.

#### `api/`
- Routes API Express
- `auth.ts` : Authentification
- `game.ts` : Logique de jeu côté serveur

#### `game/`
- Logique métier du jeu
- `TockGame.ts` : Moteur du jeu Tock

#### `socket/`
- Gestion des WebSockets
- `server.ts` : Serveur Socket.IO principal
- `events/` : Gestionnaires d'événements Socket.IO
  - `gameHandlers.ts` : Événements de jeu
  - `lobbyHandlers.ts` : Événements de lobby
  - `miscHandlers.ts` : Événements divers
- `types.ts` : Types Socket.IO
- `utils.ts` : Utilitaires Socket.IO

#### `utils/`
- Utilitaires serveur
- `email.ts` : Envoi d'emails
- `jwt.ts` : Gestion JWT
- `prisma.ts` : Client Prisma

## Bonnes pratiques appliquées

### ✅ Séparation des responsabilités
- **Hooks** : État et logique d'état
- **Services** : Appels API et logique métier
- **Lib** : Utilitaires purs
- **Types** : Définition des types TypeScript
- **Constants** : Valeurs immuables

### ✅ Imports cohérents
- Utilisation d'alias `@/` pour les imports
- Imports absolus au lieu de relatifs
- Séparation claire entre types, hooks, services

### ✅ Code nettoyé
- Suppression des `console.log` de développement
- Suppression du code mort (calibration du plateau)
- Suppression des commentaires inutiles
- Noms de variables et fonctions explicites

### ✅ Structure maintenable
- Chaque dossier a une responsabilité claire
- Facilité d'ajout de nouvelles fonctionnalités
- Code facilement testable et modulaire

## Flux de données

1. **Client** → Socket.IO → **Serveur**
2. **Serveur** traite la logique → **TockGame**
3. **Serveur** → Socket.IO broadcasts → **Clients**
4. **Clients** mettent à jour leur état via **Zustand hooks**

Cette architecture assure une séparation claire entre l'interface utilisateur, la logique métier et la communication réseau.
