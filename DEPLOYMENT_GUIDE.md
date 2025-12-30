# 🚀 Guide de Déploiement

## Vue d'ensemble

Ce guide explique comment déployer le projet Tock Game en production avec :
- **Frontend** : Vercel (gratuit)
- **Backend** : Railway ou Render (gratuit avec limites)
- **Base de données** : Neon PostgreSQL (déjà configuré)

---

## 🗄️ Partie 1 : Base de Données (Neon) - ✅ Déjà fait

Si tu as suivi le `SETUP_GUIDE.md`, ta base de données Neon est déjà prête !

Vérifie juste que :
- ✅ Tu as créé un projet sur Neon
- ✅ Tu as la `DATABASE_URL` dans `server/.env`
- ✅ Tu as run `npm run prisma:migrate` avec succès

---

## 🎨 Partie 2 : Déploiement Frontend sur Vercel

### Étape 1 : Créer un compte Vercel

1. Va sur [vercel.com](https://vercel.com/)
2. Clique sur "Sign Up"
3. Connecte-toi avec GitHub (recommandé)

### Étape 2 : Importer le projet

1. Sur Vercel, clique sur "Add New..." → "Project"
2. Sélectionne ton repo GitHub `tock-game`
3. Vercel détectera automatiquement Next.js

### Étape 3 : Configuration

**Framework Preset** : Next.js (auto-détecté)

**Root Directory** : `.` (racine du projet)

**Build Command** : `npm run build` (par défaut)

**Output Directory** : `.next` (par défaut)

**Environment Variables** :

Ajoute ces variables d'environnement :

```env
NEXT_PUBLIC_API_URL=https://TON-BACKEND-URL
NEXT_PUBLIC_SOCKET_URL=https://TON-BACKEND-URL  
```

⚠️ **IMPORTANT** : Tu devras revenir ici après avoir déployé le backend pour mettre la vraie URL !

### Étape 4 : Déployer

1. Clique sur "Deploy"
2. Attends 2-3 minutes
3. 🎉 Ton frontend est en ligne ! Tu auras une URL comme `tock-game-xxxx.vercel.app`

---

## ⚙️ Partie 3 : Déploiement Backend sur Railway

### Pourquoi Railway ?
- Gratuit avec 500h/mois
- Support Socket.IO natif
- Configuration simple
- Meilleur pour le WebSocket

### Étape 1 : Créer un compte Railway

1. Va sur [railway.app](https://railway.app/)
2. Clique sur "Login" → "Login with GitHub"
3. Autorise Railway

### Étape 2 : Créer un nouveau projet

1. Clique sur "New Project"
2. Sélectionne "Deploy from GitHub repo"
3. Choisis ton repo `tock-game`
4. Clique sur "Deploy Now"

### Étape 3 : Configuration du service

Railway va détecter le monorepo. Tu dois configurer le service :

1. Clique sur ton service déployé
2. Va dans "Settings"
3. **Root Directory** : Change de `.` vers `server`
4. **Start Command** : `npm run start` (ou `npm run dev` pour du hot-reload)

### Étape 4 : Variables d'environnement

Va dans l'onglet "Variables" et ajoute :

```env
DATABASE_URL=postgresql://...  (ta connection string Neon)
JWT_SECRET=super-secret-production-key-change-me
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ton-email@gmail.com
EMAIL_PASSWORD=ton-mot-de-passe-app-gmail
EMAIL_FROM=Tock Game <no-reply@tockgame.com>
CLIENT_URL=https://tock-game-xxxx.vercel.app
SERVER_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
PORT=3001
```

⚠️ **`CLIENT_URL`** : Mets l'URL Vercel de ton frontend
⚠️ **`${{RAILWAY_PUBLIC_DOMAIN}}`** : Variable spéciale Railway qui se remplit automatiquement

### Étape 5 : Exposer le service publiquement

1. Va dans "Settings"
2. Section "Networking"
3. Clique sur "Generate Domain"
4. Railway va te donner une URL comme `tock-game-production-xxx.up.railway.app`

### Étape 6 : Mettre à jour Vercel

1. Retourne sur Vercel
2. Va dans ton projet → "Settings" → "Environment Variables"
3. Mets à jour :
```env
NEXT_PUBLIC_API_URL=https://tock-game-production-xxx.up.railway.app
NEXT_PUBLIC_SOCKET_URL=https://tock-game-production-xxx.up.railway.app
```
4. Va dans "Deployments" → Clique sur le dernier déploiement → "Redeploy"

---

## 🔄 Alternative : Déploiement Backend sur Render

### Pourquoi Render ?
- Gratuit (750h/mois)
- Plus stable que Railway
- Moins bon pour WebSocket (peut déconnecter après inactivité)

### Étapes Render

1. Va sur [render.com](https://render.com/)
2. Connecte-toi avec GitHub
3. Clique sur "New +" → "Web Service"
4. Sélectionne ton repo `tock-game`
5. Configuration :
   - **Name** : `tock-game-api`
   - **Root Directory** : `server`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm run start`
   - **Instance Type** : Free

6. Ajoute les variables d'environnement (même liste que Railway)

7. Clique sur "Create Web Service"

⚠️ **Note Render** : Les services gratuits se mettent en veille après 15min d'inactivité et peuvent prendre 30s-1min à redémarrer

---

## 🧪 Tester le déploiement

### Test Backend

```bash
curl https://TON-BACKEND-URL/health
```

Devrait retourner :
```json
{"status":"ok","timestamp":"2025-..."}
```

### Test Frontend

1. Ouvre `https://TON-FRONTEND-VERCEL.vercel.app`
2. Clique sur "S'inscrire"
3. Crée un compte
4. Vérifie ton email
5. Connecte-toi
6. Crée une partie

---

## 🔧 Maintenance et Mises à jour

### Déployer une nouvelle version

1. **Commit tes changements** :
```bash
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main
```

2. **Vercel** : Se redéploie automatiquement à chaque push sur `main`

3. **Railway/Render** : Se redéploient automatiquement aussi

---

## 📊 Monitoring

### Vercel

- Dashboard : https://vercel.com/dashboard
- Voir les déploiements, logs, analytics

### Railway

- Dashboard : https://railway.app/dashboard
- Voir les logs en temps réel
- Metrics de CPU/RAM

### Neon

- Dashboard : https://console.neon.tech
- Voir l'utilisation de la BDD
- Limites du plan gratuit : 0.5 GB storage, 1 projet

---

## 💰 Coûts et Limites (Plans Gratuits)

| Service | Limite Gratuite | Upgrade |
|---------|----------------|---------|
| **Vercel** | 100 GB bandwidth/mois | $20/mois (Pro) |
| **Railway** | 500h/mois (~$5 credit) | Pay as you go |
| **Render** | 750h/mois | $7/mois par service |
| **Neon** | 0.5 GB, 1 projet | $19/mois (Pro) |

💡 **Astuce** : Pour un projet étudiant, le plan gratuit est largement suffisant !

---

## 🐛 Problèmes courants

### "Application Error" sur Vercel

- Vérifie que `NEXT_PUBLIC_API_URL` est bien défini
- Vérifie les logs : Vercel Dashboard → ton projet → "Logs"

### Socket.IO ne se connecte pas

- Vérifie que le backend est bien démarré (teste `/health`)
- Vérifie le CORS dans `server/src/socket/server.ts`
- Change l'origin pour accepter ton domaine Vercel :
```typescript
cors: {
  origin: ["http://localhost:3000", "https://ton-frontend.vercel.app"],
  methods: ["GET", "POST"],
}
```

### Erreur Prisma en production

- Vérifie que `DATABASE_URL` est bien défini sur Railway/Render
- Run les migrations :
```bash
cd server
npx prisma migrate deploy
```

---

## ✅ Checklist finale

Avant de présenter ton projet :

- [ ] Frontend déployé sur Vercel et accessible
- [ ] Backend déployé sur Railway/Render
- [ ] Base de données Neon connectée
- [ ] Inscription fonctionnelle
- [ ] Email de vérification reçu
- [ ] Connexion fonctionnelle
- [ ] Création de partie fonctionne
- [ ] Socket.IO connecte les 4 joueurs
- [ ] Jeu complet fonctionne
- [ ] Dark mode fonctionne
- [ ] README à jour avec les URLs de production

---

**Félicitations ! 🎉 Ton projet est en ligne !**

N'hésite pas à partager l'URL avec tes amis pour tester ! 🚀

