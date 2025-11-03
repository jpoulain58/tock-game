# 🚀 Guide de Configuration Complet

## 📦 Étape 1 : Configuration de la Base de Données (Neon)

### 1.1 Créer un compte sur Neon

1. Va sur [neon.tech](https://neon.tech/)
2. Clique sur "Sign Up" (gratuit, pas besoin de carte bancaire)
3. Connecte-toi avec GitHub ou email

### 1.2 Créer un projet

1. Clique sur "Create Project"
2. Nom du projet : `tock-game`
3. Région : `Europe (Frankfurt)` ou la plus proche de toi
4. PostgreSQL version : `16` (la plus récente)
5. Clique sur "Create Project"

### 1.3 Récupérer la connection string

1. Une fois le projet créé, tu verras une **Connection String** qui ressemble à :
```
postgresql://username:password@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```
2. **COPIE CETTE URL** - tu en auras besoin !

### 1.4 Configurer le serveur

1. Crée un fichier `.env` dans le dossier `server/` :
```bash
cd server
touch .env
```

2. Ouvre `server/.env` et ajoute :
```env
DATABASE_URL="postgresql://username:password@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"

JWT_SECRET="super-secret-change-me-in-production-123456789"
JWT_EXPIRES_IN="7d"

EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="ton-email@gmail.com"
EMAIL_PASSWORD="ton-mot-de-passe-app-gmail"
EMAIL_FROM="Tock Game <no-reply@tockgame.com>"

CLIENT_URL="http://localhost:3000"
SERVER_URL="http://localhost:3001"

NODE_ENV="development"
```

⚠️ **Remplace** :
- `DATABASE_URL` par ta connection string Neon
- `EMAIL_USER` et `EMAIL_PASSWORD` par tes identifiants Gmail (voir ci-dessous)

### 1.5 Configurer Gmail pour l'envoi d'emails

1. Va sur [myaccount.google.com/security](https://myaccount.google.com/security)
2. Active la "Validation en deux étapes" si ce n'est pas déjà fait
3. Va dans "Mots de passe d'application"
4. Crée un mot de passe pour "Autre (nom personnalisé)"
5. Nom : `Tock Game`
6. Copie le mot de passe généré (16 caractères sans espaces)
7. Colle-le dans `EMAIL_PASSWORD` dans ton `.env`

### 1.6 Initialiser Prisma

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

✅ Cela va créer toutes les tables dans ta base de données Neon !

---

## 🎨 Étape 2 : Configuration du Client (Frontend)

### 2.1 Variables d'environnement

1. Crée un fichier `.env.local` à la racine du projet :
```bash
touch .env.local
```

2. Ajoute :
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## 🚀 Étape 3 : Lancer l'application

### Option 1 : Tout en une commande (recommandé)

```bash
npm run dev:all
```

### Option 2 : Séparément

**Terminal 1 - Serveur :**
```bash
cd server
npm run dev
```

**Terminal 2 - Client :**
```bash
npm run dev
```

---

## 🧪 Étape 4 : Tester l'authentification

### 4.1 Inscription

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "username": "jeandupont",
    "email": "jean.dupont@example.com",
    "password": "motdepasse123"
  }'
```

Tu devrais recevoir un email de vérification !

### 4.2 Vérifier l'email

Clique sur le lien dans l'email ou :

```bash
curl http://localhost:3001/api/auth/verify-email?token=TON_TOKEN
```

### 4.3 Connexion

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "jeandupont",
    "password": "motdepasse123"
  }'
```

Tu devrais recevoir un **token JWT** !

---

## 📊 Étape 5 : Visualiser la base de données

Prisma Studio te permet de voir toutes tes données :

```bash
cd server
npm run prisma:studio
```

Ouvre [http://localhost:5555](http://localhost:5555) dans ton navigateur !

---

## 🐛 Problèmes courants

### "Error: P1001 Can't reach database"
- Vérifie que ta `DATABASE_URL` est correcte
- Vérifie que ton projet Neon est actif (ils se mettent en pause après inactivité)

### "SMTP Error" lors de l'envoi d'email
- Vérifie que tu as activé la validation en 2 étapes sur Gmail
- Vérifie que tu utilises un "Mot de passe d'application" (pas ton mot de passe Gmail normal)

### Port déjà utilisé
- Change le port dans `server/src/socket/server.ts` (ligne `const PORT`)
- Change aussi dans `.env.local` (`NEXT_PUBLIC_API_URL`)

---

## ✅ Prochaines étapes

Une fois que tout fonctionne :

1. ✅ Authentification backend : **FAIT**
2. ✅ Validation d'email : **FAIT**  
3. 🔄 Pages frontend (connexion/inscription) : **EN COURS**
4. ⏳ Navbar dynamique
5. ⏳ Persistance des parties en BDD
6. ⏳ Tableau des scores
7. ⏳ Dark mode
8. ⏳ Déploiement (Vercel + Railway/Render)

---

**Bon courage ! 🎮✨**

