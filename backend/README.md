# Backend API - L'Économe Pitmaster

Backend REST API Node.js/Express avec PostgreSQL pour l'application L'Économe Pitmaster.

## 🚀 Démarrage rapide

### Prérequis

- Node.js ≥ 16.0.0
- npm ≥ 8.0.0
- PostgreSQL ≥ 15
- Base de données configurée (voir `/database/README.md`)

### Installation

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Puis éditer .env avec vos valeurs

# 4. Démarrer le serveur
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

## 📋 Variables d'environnement

Créez un fichier `.env` à la racine du dossier `backend/` :

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

## 🛣️ Routes API

### Produits (`/api/products`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/products` | Liste tous les produits |
| GET | `/api/products/low-stock` | Produits sous le seuil minimum |
| GET | `/api/products/:id` | Détail d'un produit |
| POST | `/api/products` | Créer un produit |
| PUT | `/api/products/:id` | Modifier un produit |
| PATCH | `/api/products/:id/stock` | Mettre à jour le stock |
| DELETE | `/api/products/:id` | Supprimer un produit |
| POST | `/api/products/update-stock-from-sales` | Mettre à jour depuis ventes |

**Exemple GET** :
```bash
curl http://localhost:3001/api/products
```

**Exemple POST** :
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "id": "p8",
    "name": "Thon rouge",
    "family": "Poisson",
    "unit": "kg",
    "currentStock": 5,
    "minStock": 3,
    "averageCost": 45
  }'
```

**Exemple PATCH (mise à jour stock)** :
```bash
curl -X PATCH http://localhost:3001/api/products/p1/stock \
  -H "Content-Type: application/json" \
  -d '{"newStock": 10}'
```

### Fournisseurs (`/api/suppliers`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/suppliers` | Liste tous les fournisseurs avec produits |
| GET | `/api/suppliers/:id` | Détail d'un fournisseur |
| POST | `/api/suppliers` | Créer un fournisseur |
| PUT | `/api/suppliers/:id` | Modifier un fournisseur |
| DELETE | `/api/suppliers/:id` | Supprimer un fournisseur |
| GET | `/api/suppliers/catalog/compare/:productId` | Comparer les prix d'un produit |

**Exemple GET** :
```bash
curl http://localhost:3001/api/suppliers
```

**Exemple POST** :
```bash
curl -X POST http://localhost:3001/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "s5",
    "name": "Nouveau Fournisseur",
    "deliveryDays": "Lundi, Mercredi",
    "minOrder": 75,
    "products": [
      {
        "internalProductId": "p1",
        "supplierSku": "NF-SAL-01",
        "price": 24
      }
    ]
  }'
```

### Commandes (`/api/orders`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/orders` | Liste toutes les commandes |
| GET | `/api/orders?status=Envoyée` | Filtrer par statut |
| GET | `/api/orders/:id` | Détail d'une commande |
| POST | `/api/orders` | Créer une commande |
| PATCH | `/api/orders/:id/status` | Changer le statut |
| POST | `/api/orders/:id/receive` | Réceptionner des articles |
| DELETE | `/api/orders/:id` | Supprimer une commande |
| GET | `/api/orders/stats/monthly-spending` | Statistiques mensuelles |

**Statuts possibles** : `Brouillon`, `Envoyée`, `Confirmée`, `Reçue partiellement`, `Reçue totalement`, `Annulée`

**Exemple GET** :
```bash
curl http://localhost:3001/api/orders
```

**Exemple POST** :
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ord100",
    "supplierId": "s1",
    "supplierName": "Le Pêcheur Local",
    "status": "Brouillon",
    "items": [
      {
        "productId": "p1",
        "productName": "Saumon Frais",
        "quantity": 5,
        "unit": "kg",
        "pricePerUnit": 25
      }
    ]
  }'
```

**Exemple PATCH (changer statut)** :
```bash
curl -X PATCH http://localhost:3001/api/orders/ord100/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Envoyée"}'
```

**Exemple POST (réception)** :
```bash
curl -X POST http://localhost:3001/api/orders/ord100/receive \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "p1",
        "receivedQuantity": 5
      }
    ]
  }'
```

### Utilisateurs (`/api/users`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/users` | Liste tous les utilisateurs |
| GET | `/api/users/:id` | Détail d'un utilisateur |
| POST | `/api/users` | Créer un utilisateur |
| PUT | `/api/users/:id` | Modifier un utilisateur |
| DELETE | `/api/users/:id` | Supprimer un utilisateur |
| POST | `/api/users/login` | Connexion (simple) |

**Rôles disponibles** : `Gérant`, `Chef`, `Commis`

**Exemple GET** :
```bash
curl http://localhost:3001/api/users
```

**Exemple POST** :
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "u4",
    "name": "Sophie Dubois",
    "email": "sophie@example.com",
    "role": "Chef",
    "password": "motdepasse123"
  }'
```

**Exemple POST (login)** :
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "motdepasse123"
  }'
```

### Paramètres (`/api/settings`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/settings` | Récupérer les paramètres |
| PUT | `/api/settings` | Mettre à jour les paramètres |
| GET | `/api/settings/dashboard-stats` | Statistiques du dashboard |

**Exemple GET** :
```bash
curl http://localhost:3001/api/settings
```

**Exemple PUT** :
```bash
curl -X PUT http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "aiModel": "gpt-4o",
    "openaiApiKey": "sk-..."
  }'
```

**Exemple GET (stats dashboard)** :
```bash
curl http://localhost:3001/api/settings/dashboard-stats
```

Retourne :
```json
{
  "lowStockCount": 3,
  "activeOrders": 2,
  "activeSuppliers": 4,
  "monthlySpending": 1250.50,
  "totalStockValue": 5432.75
}
```

## 🏥 Health Check

```bash
curl http://localhost:3001/health
```

Retourne :
```json
{
  "status": "healthy",
  "timestamp": "2025-11-13T10:30:00.000Z",
  "database": "connected"
}
```

## 📦 Scripts npm

```bash
# Démarrer en mode développement (avec nodemon)
npm run dev

# Démarrer en mode production
npm start

# (À venir) Exécuter les tests
npm test
```

## 🏗️ Structure du projet

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # Configuration PostgreSQL
│   ├── middleware/
│   │   └── errorHandler.js     # Gestion des erreurs
│   ├── routes/
│   │   ├── products.js         # Routes produits
│   │   ├── suppliers.js        # Routes fournisseurs
│   │   ├── orders.js           # Routes commandes
│   │   ├── users.js            # Routes utilisateurs
│   │   └── settings.js         # Routes paramètres
│   └── index.js                # Point d'entrée de l'application
├── .env.example                # Exemple de configuration
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Technologies utilisées

- **Express 4.18** - Framework web
- **pg 8.11** - Client PostgreSQL
- **bcrypt 5.1** - Hash de mots de passe
- **jsonwebtoken 9.0** - Authentification JWT (futur)
- **express-validator 7.0** - Validation des données
- **cors 2.8** - Cross-Origin Resource Sharing
- **helmet 7.1** - Sécurité HTTP
- **morgan 1.10** - Logging HTTP
- **dotenv 16.3** - Variables d'environnement
- **nodemon 3.0** - Redémarrage automatique (dev)

## 🔒 Sécurité

### Mots de passe

Les mots de passe sont hashés avec bcrypt (10 rounds) avant stockage.

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 10);
```

### Headers de sécurité

Helmet est utilisé pour définir automatiquement les headers de sécurité :
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security

### Validation des données

Toutes les entrées utilisateur sont validées avec `express-validator`.

### Protection SQL Injection

Toutes les requêtes utilisent des requêtes paramétrées ($1, $2, etc.).

## 🔄 Migration depuis le frontend

Pour migrer l'application frontend qui utilise `apiService.ts` :

### 1. Mettre à jour les imports

```javascript
// Avant (frontend simulé)
import { getProducts } from '../services/apiService';

// Après (appel API réel)
const getProducts = async () => {
  const response = await fetch('http://localhost:3001/api/products');
  return response.json();
};
```

### 2. Configuration de l'URL de base

Créer un fichier `src/config/api.ts` :

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  // ... autres méthodes
};
```

### 3. Remplacer apiService.ts

```typescript
// src/services/apiService.ts
import { apiClient } from '../config/api';

export const getProducts = () => apiClient.get('/api/products');
export const saveProduct = (product: Product) => apiClient.post('/api/products', product);
// etc.
```

### 4. Mettre à jour .env du frontend

```env
REACT_APP_API_URL=http://localhost:3001
```

## 🐛 Dépannage

### Erreur : "Cannot connect to database"

```bash
# Vérifier que PostgreSQL est lancé
sudo systemctl status postgresql

# Vérifier les credentials dans .env
DB_PASSWORD=votre_mot_de_passe
```

### Erreur : "Port 3001 already in use"

```bash
# Trouver et tuer le processus
lsof -ti:3001 | xargs kill -9

# Ou changer le port dans .env
PORT=3002
```

### Erreur CORS

Assurez-vous que `CORS_ORIGIN` dans `.env` correspond à l'URL de votre frontend :

```env
CORS_ORIGIN=http://localhost:3000
```

## 📚 Ressources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Node.js Tutorial](https://node-postgres.com/)
- [REST API Best Practices](https://restfulapi.net/)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

**Créé pour L'Économe Pitmaster** - Backend API v1.0.0
