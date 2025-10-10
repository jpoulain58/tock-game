# Tock 2v2 Online

Jeu de plateau Tock (aussi connu sous le nom de Toc ou Tock) en ligne avec les règles complètes 2v2.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20+ 
- npm ou yarn

### Installation

```bash
# Installer les dépendances du client
npm install

# Installer les dépendances du serveur
cd server
npm install
cd ..
```

### Lancer l'application

**Option 1 : Tout lancer en une commande (recommandé)**
```bash
npm run dev:all
```

**Option 2 : Lancer séparément**

Terminal 1 (Client Next.js) :
```bash
npm run dev
```

Terminal 2 (Serveur Socket.IO) :
```bash
npm run dev:server
```

### Accès

- **Client** : http://localhost:3000 (ou port disponible)
- **Serveur Socket.IO** : http://localhost:3001

## 🎮 Comment jouer

### 1. Créer une partie
1. Allez sur http://localhost:3000
2. Cliquez sur "Créer ou rejoindre une partie"
3. Cliquez sur "Créer une nouvelle partie"
4. Entrez votre nom
5. Vous recevrez un ID de partie unique

### 2. Rejoindre une partie
1. Ouvrez 3 autres fenêtres/onglets
2. Collez l'URL du lobby (contient l'ID)
3. Chaque joueur entre son nom
4. Une fois 4 joueurs présents, l'hôte peut démarrer

### 3. Jouer
- Chaque joueur reçoit 5 cartes
- Cliquez sur une carte pour la jouer
- Le jeu se déroule tour par tour
- L'équipe qui finit tous ses pions (8 au total) gagne

## 📚 Fonctionnalités visuelles

- ✅ Animations pas à pas des déplacements
- ✅ Compteur de pas au-dessus des pions en mouvement
- ✅ Affichage de la carte jouée au centre du plateau
- ✅ Tooltips informatifs sur les cartes spéciales
- ✅ Interface moderne et responsive

## 🎯 Fonctionnalités

### ✅ Implémenté

#### Infrastructure
- [x] Serveur Socket.IO temps réel
- [x] Client Next.js 15 avec App Router
- [x] Communication WebSocket bidirectionnelle
- [x] Gestion d'état avec Zustand
- [x] UI moderne avec Tailwind CSS

#### Jeu
- [x] Plateau 64 cases circulaire
- [x] 4 joueurs, 2 équipes
- [x] Distribution de 5 cartes par joueur
- [x] Tour par tour (server-authoritative)
- [x] Toutes les cartes implémentées (A, 2-10, J, Q, K)

#### Règles complètes
- [x] Sortie avec As ou Roi
- [x] Mouvements avant (2, 3, 5, 6, 8, 9, 10, Q, K)
- [x] Recul avec le 4
- [x] Carte 7 avec captures au passage (mouvement de 7 cases)
- [x] Swap avec le Valet (J)
- [x] Blocage (impossible de passer par-dessus sauf le 7)
- [x] Captures automatiques
- [x] Entrée en maison (HOME)
- [x] Atterrissage exact sur HOME[3]
- [x] Détection de victoire

#### Interface & UX
- [x] Animations pas à pas des mouvements (300ms par pas)
- [x] Compteur visuel au-dessus des pions
- [x] Affichage de la carte jouée en grand au centre
- [x] Tooltips sur cartes spéciales (ex: carte 7)
- [x] Workflow en 3 étapes : carte → pion → destination

#### Social
- [x] Chat en temps réel
- [x] Log des événements
- [x] Lobby avec gestion des équipes
- [x] Système de "prêt" avant démarrage

### 📋 Roadmap

#### Phase 2 : Authentification
- [ ] Inscription (nom, prénom, email, username, password)
- [ ] Vérification par email (MJML)
- [ ] Connexion / Déconnexion
- [ ] JWT ou sessions

#### Phase 3 : Persistance
- [ ] Base de données PostgreSQL
- [ ] Prisma ORM
- [ ] Historique des parties
- [ ] Tableau des scores

#### Phase 4 : Déploiement
- [ ] Frontend sur Vercel
- [ ] Socket.IO sur Render/Railway
- [ ] Base de données sur Neon/Supabase
- [ ] CI/CD avec GitHub Actions

## 🏗️ Architecture

### Stack technique

**Frontend**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Socket.IO Client

**Backend**
- Node.js
- Socket.IO Server
- TypeScript

**À venir**
- PostgreSQL + Prisma
- Nodemailer + MJML
- JWT authentication

### Structure du projet

```
toc/
├── src/                          # Client Next.js
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── dashboard/           # Dashboard
│   │   ├── lobby/
│   │   │   ├── new/             # Créer une partie
│   │   │   └── [gameId]/        # Lobby d'attente
│   │   └── game/
│   │       └── [gameId]/        # Jeu en cours
│   ├── components/
│   │   ├── Board.tsx            # Plateau de jeu
│   │   └── Hand.tsx             # Main du joueur
│   └── store/
│       └── gameStore.ts         # Store Zustand
│
└── server/                       # Serveur Socket.IO
    ├── src/
    │   ├── game/
    │   │   └── TockGame.ts      # Moteur de jeu
    │   └── socket/
    │       └── server.ts        # Serveur WebSocket
    └── package.json
```

## 🎴 Règles du jeu (résumé)

### Objectif
L'équipe qui met tous ses 8 pions (4 pions × 2 joueurs) dans leur maison gagne.

### Cartes
- **A** : Sortir OU avancer de 1
- **2-3, 5-6, 8-10** : Avancer du nombre indiqué
- **4** : Reculer de 4
- **7** : Avancer de 7 (fractionnable, capture au passage)
- **J** : Swap 2 pions
- **Q** : Avancer de 12
- **K** : Sortir OU avancer de 13

### Spécificités
- **Animations** : Déplacement pas à pas avec compteur visuel
- **Carte 7** : Capture tous les pions sur le passage (💀)
- **Blocage** : Impossible de passer par-dessus (sauf 7)
- **Captures** : Atterrir sur un pion le renvoie en base
- **HOME** : Atterrissage exact sur HOME[3] requis

## 🧪 Tests

Pour tester le jeu :

1. Ouvrez 4 fenêtres de navigateur
2. Créez une partie dans la première
3. Rejoignez avec les 3 autres
4. Choisissez vos équipes (2v2)
5. Cliquez sur "Prêt" et démarrez !

Testez les animations en jouant des cartes - vous verrez les pions se déplacer pas à pas avec un compteur !

## 🤝 Contribution

Ce projet est un projet étudiant. Les contributions sont les bienvenues !

## 📝 License

MIT

## 👥 Équipe

Développé par Jérémy Poulain dans le cadre d'un projet scolaire.

---

**Bon jeu ! 🎲**
