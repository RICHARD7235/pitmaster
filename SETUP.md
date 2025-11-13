# 🚀 Guide de démarrage complet - L'Économe Pitmaster

Guide étape par étape pour démarrer l'application complète avec frontend React, backend Node.js/Express et base de données PostgreSQL.

## 📋 Prérequis

- **Node.js** ≥ 16.0.0
- **npm** ≥ 8.0.0
- **PostgreSQL** ≥ 15
- **Git**

## 🗂️ Architecture du projet

```
pitmaster/
├── backend/           # API Node.js/Express
│   ├── src/
│   │   ├── routes/   # Routes API REST
│   │   ├── config/   # Configuration DB
│   │   └── index.js  # Serveur Express
│   └── package.json
├── database/         # Schéma PostgreSQL
│   ├── schema.sql   # Structure de la base
│   ├── seed.sql     # Données initiales
│   └── setup.sh     # Script d'installation
├── src/             # Frontend React
│   ├── components/
│   ├── services/
│   └── types/
└── package.json
```

## 📦 Installation complète (3 étapes)

### Étape 1 : Base de données PostgreSQL

#### 1.1 Installer PostgreSQL

**Ubuntu/Debian :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS (Homebrew) :**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows :**
Télécharger depuis [postgresql.org/download](https://www.postgresql.org/download/windows/)

#### 1.2 Créer la base de données

```bash
# Aller dans le dossier database
cd database

# Définir le mot de passe PostgreSQL
export DB_PASSWORD='votre_mot_de_passe'

# Exécuter le script de setup
./setup.sh
```

Le script va :
- ✅ Créer la base `pitmaster`
- ✅ Créer les tables (products, suppliers, orders, users, etc.)
- ✅ Insérer les données de démo

#### 1.3 Vérifier l'installation

```bash
psql -U postgres -d pitmaster -c "SELECT COUNT(*) FROM products;"
# Devrait retourner : 7
```

### Étape 2 : Backend API

#### 2.1 Installer les dépendances

```bash
# Retour à la racine
cd ..

# Aller dans le dossier backend
cd backend

# Installer les packages npm
npm install
```

#### 2.2 Configurer l'environnement

```bash
# Copier le template
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env
```

Contenu du `.env` :
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=pitmaster
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

CORS_ORIGIN=http://localhost:3000
```

#### 2.3 Démarrer le serveur

```bash
# Mode développement (avec auto-reload)
npm run dev

# Le serveur démarre sur http://localhost:3001
```

#### 2.4 Tester l'API

Dans un autre terminal :
```bash
# Health check
curl http://localhost:3001/health

# Récupérer les produits
curl http://localhost:3001/api/products

# Stats du dashboard
curl http://localhost:3001/api/settings/dashboard-stats
```

### Étape 3 : Frontend React

#### 3.1 Installer les dépendances

```bash
# Retour à la racine
cd ..

# Installer les packages npm
npm install
```

#### 3.2 Configurer l'environnement

```bash
# Copier le template
cp .env.example .env

# Éditer .env
nano .env
```

Contenu du `.env` :
```env
# Backend API URL
VITE_API_URL=http://localhost:3001

# Clés AI (optionnel - peuvent être configurées dans l'app)
VITE_GEMINI_API_KEY=votre_clé_gemini
VITE_OPENAI_API_KEY=votre_clé_openai
VITE_ANTHROPIC_API_KEY=votre_clé_anthropic
```

#### 3.3 Démarrer l'application

```bash
# Mode développement
npm run dev

# L'application démarre sur http://localhost:3000
```

## ✅ Vérification complète

À ce stade, vous devriez avoir :

1. **PostgreSQL** lancé sur le port `5432`
2. **Backend API** lancé sur `http://localhost:3001`
3. **Frontend React** lancé sur `http://localhost:3000`

### Tester la connexion complète

1. Ouvrez votre navigateur à `http://localhost:3000`
2. Vous devriez voir le dashboard avec les données de la base
3. Essayez de :
   - Modifier un produit dans l'onglet "Administration"
   - Créer une commande
   - Mettre à jour le stock

## 🔄 Démarrage rapide (après la première installation)

```bash
# Terminal 1 : Backend
cd backend
npm run dev

# Terminal 2 : Frontend
cd ..
npm run dev
```

## 📝 Notes importantes

### Structure des données

Le backend utilise des **transactions PostgreSQL** pour garantir l'intégrité :
- La réception d'une commande met automatiquement à jour le stock
- Les mouvements de stock sont enregistrés dans `stock_movements`
- Les suppressions de fournisseurs suppriment en cascade leurs produits

### CORS et Proxy

Le frontend est configuré avec un **proxy Vite** pour éviter les problèmes CORS en développement :
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  }
}
```

### Sécurité

⚠️ **En développement seulement** :
- Les mots de passe utilisateurs ne sont pas encore implémentés (NULL en base)
- Les clés API sont stockées en clair dans les paramètres
- Le CORS est ouvert

**Pour la production** :
- Implémenter JWT pour l'authentification
- Chiffrer les clés API en base
- Configurer CORS strictement
- Utiliser HTTPS

## 🐛 Dépannage

### Erreur : "Cannot connect to database"

```bash
# Vérifier que PostgreSQL est lancé
sudo systemctl status postgresql

# Vérifier le mot de passe dans backend/.env
DB_PASSWORD=votre_mot_de_passe
```

### Erreur : "Port 3001 already in use"

```bash
# Tuer le processus
lsof -ti:3001 | xargs kill -9
```

### Erreur : "Failed to fetch" dans le navigateur

1. Vérifier que le backend est lancé : `http://localhost:3001/health`
2. Vérifier les logs du backend pour les erreurs
3. Vérifier que `VITE_API_URL` dans `.env` est correct

### Les données ne s'affichent pas

1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs réseau (onglet Network)
3. Vérifier que la base contient des données :
   ```bash
   psql -U postgres -d pitmaster -c "SELECT * FROM products;"
   ```

## 📚 Documentation détaillée

- **Base de données** : Voir `database/README.md`
- **Backend API** : Voir `backend/README.md`
- **Frontend** : Voir le README principal

## 🎯 Prochaines étapes

Une fois l'application lancée, vous pouvez :

1. **Configurer l'IA** :
   - Aller dans "Administration" > "Préférences"
   - Choisir un provider (Gemini, OpenAI, Anthropic)
   - Entrer votre clé API
   - Tester les suggestions d'achat

2. **Importer vos données** :
   - Aller dans "Administration"
   - Utiliser les imports CSV pour les produits et catalogues

3. **Créer vos premières commandes** :
   - Aller dans "Suggestions d'achat"
   - Laisser l'IA suggérer les produits à commander
   - Valider et envoyer aux fournisseurs

## 💡 Conseils

- Utilisez **deux terminaux** pour lancer backend et frontend séparément
- Gardez un terminal ouvert avec `psql` pour inspecter la base
- Utilisez les **DevTools du navigateur** pour déboguer les appels API
- Consultez les logs du backend pour voir les requêtes SQL

---

**Besoin d'aide ?** Consultez les README individuels dans chaque dossier ou ouvrez une issue sur GitHub.
