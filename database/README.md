# Base de Données - L'Économe Pitmaster

Documentation complète pour la configuration et l'utilisation de la base de données PostgreSQL.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Installation rapide](#installation-rapide)
- [Schéma de base de données](#schéma-de-base-de-données)
- [Configuration manuelle](#configuration-manuelle)
- [Connexion depuis le backend](#connexion-depuis-le-backend)
- [Requêtes utiles](#requêtes-utiles)
- [Maintenance](#maintenance)

## 🎯 Vue d'ensemble

Cette base de données PostgreSQL est conçue pour l'application L'Économe Pitmaster, un système de gestion de restaurant incluant :

- **Gestion des stocks** avec alertes de niveau bas
- **Gestion des fournisseurs** avec catalogues de produits
- **Gestion des commandes** avec suivi d'état
- **Suggestions d'achat par IA** (Gemini, OpenAI, Anthropic)
- **Gestion des utilisateurs** avec contrôle d'accès par rôle
- **Historique des mouvements de stock** pour audit

## 📦 Prérequis

### PostgreSQL

Vous devez avoir PostgreSQL installé sur votre système :

**Ubuntu/Debian :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (avec Homebrew) :**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows :**
Téléchargez depuis [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

### Vérification de l'installation

```bash
psql --version
# Devrait afficher : psql (PostgreSQL) 15.x ou supérieur
```

## 🚀 Installation rapide

### Méthode 1 : Script automatique (Recommandé)

```bash
# 1. Définir le mot de passe PostgreSQL
export DB_PASSWORD='votre_mot_de_passe'

# 2. Exécuter le script de setup
cd database
./setup.sh
```

Le script va :
- ✅ Vérifier l'installation de PostgreSQL
- ✅ Tester la connexion
- ✅ Créer la base de données `pitmaster`
- ✅ Appliquer le schéma complet
- ✅ Charger les données initiales

### Méthode 2 : Installation manuelle

Voir la section [Configuration manuelle](#configuration-manuelle) ci-dessous.

## 📊 Schéma de base de données

### Tables principales

#### `products` - Catalogue de produits
```sql
id              VARCHAR(255) PRIMARY KEY
name            VARCHAR(255) NOT NULL
family          VARCHAR(100)           -- Catégorie (Poisson, Épicerie, etc.)
unit            VARCHAR(50) NOT NULL   -- Unité (kg, L, etc.)
current_stock   DECIMAL(10,2)         -- Stock actuel
min_stock       DECIMAL(10,2)         -- Seuil minimum
average_cost    DECIMAL(10,2)         -- Coût moyen
```

**7 produits par défaut** : Saumon, Huile d'olive, Maquereau, Bois de hêtre, Sel, Poivre, Côte de bœuf

#### `suppliers` - Fournisseurs
```sql
id              VARCHAR(255) PRIMARY KEY
name            VARCHAR(255) NOT NULL
delivery_days   VARCHAR(255)           -- Ex: "Mardi, Vendredi"
min_order       DECIMAL(10,2)         -- Montant minimum de commande
```

**4 fournisseurs par défaut** : Le Pêcheur Local, Metro, Épices du Monde, Fumoir & Co

#### `supplier_products` - Catalogue fournisseurs (Many-to-Many)
```sql
supplier_id         VARCHAR(255) FK -> suppliers(id)
internal_product_id VARCHAR(255) FK -> products(id)
supplier_sku        VARCHAR(100)      -- Référence fournisseur
price               DECIMAL(10,2)    -- Prix chez ce fournisseur
```

#### `orders` - Commandes
```sql
id              VARCHAR(255) PRIMARY KEY
supplier_id     VARCHAR(255) FK -> suppliers(id)
date            TIMESTAMP
status          VARCHAR(50)           -- Brouillon, Envoyée, Reçue, etc.
total           DECIMAL(10,2)
```

**Statuts possibles** : `Brouillon`, `Envoyée`, `Confirmée`, `Reçue partiellement`, `Reçue totalement`, `Annulée`

#### `order_items` - Lignes de commande
```sql
order_id          VARCHAR(255) FK -> orders(id)
product_id        VARCHAR(255) FK -> products(id)
quantity          DECIMAL(10,2)
received_quantity DECIMAL(10,2)      -- Suivi réception partielle
price_per_unit    DECIMAL(10,2)
```

#### `users` - Utilisateurs
```sql
id              VARCHAR(255) PRIMARY KEY
name            VARCHAR(255) NOT NULL
email           VARCHAR(255) UNIQUE
role            VARCHAR(50)           -- Gérant, Chef, Commis
password_hash   VARCHAR(255)
```

**3 utilisateurs par défaut** :
- Jean Dupont (Gérant) - `jean.dupont@example.com`
- Marie Curie (Chef) - `marie.curie@example.com`
- Pierre Martin (Commis) - `pierre.martin@example.com`

#### `stock_movements` - Historique des mouvements
```sql
product_id      VARCHAR(255) FK -> products(id)
movement_type   VARCHAR(50)           -- SALE, PURCHASE, ADJUSTMENT, etc.
quantity        DECIMAL(10,2)
previous_stock  DECIMAL(10,2)
new_stock       DECIMAL(10,2)
reference_id    VARCHAR(255)          -- ID commande/import associé
```

#### `app_settings` - Configuration de l'application
```sql
provider            VARCHAR(50)       -- gemini, openai, anthropic
ai_model            VARCHAR(100)
api_key             TEXT
openai_api_key      TEXT
anthropic_api_key   TEXT
gemini_api_key      TEXT
```

### Vues SQL

#### `low_stock_products` - Produits sous le seuil
```sql
SELECT * FROM low_stock_products;
-- Retourne les produits où current_stock < min_stock
```

#### `monthly_spending` - Dépenses mensuelles
```sql
SELECT * FROM monthly_spending;
-- Agrégation des commandes par mois
```

#### `supplier_product_catalog` - Meilleurs prix par produit
```sql
SELECT * FROM supplier_product_catalog WHERE price_rank = 1;
-- Compare les prix entre fournisseurs
```

## ⚙️ Configuration manuelle

Si vous ne pouvez pas utiliser le script automatique :

### 1. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Dans psql :
CREATE DATABASE pitmaster;
\c pitmaster
```

### 2. Appliquer le schéma

```bash
psql -U postgres -d pitmaster -f schema.sql
```

### 3. Charger les données initiales (optionnel)

```bash
psql -U postgres -d pitmaster -f seed.sql
```

### 4. Vérifier l'installation

```bash
psql -U postgres -d pitmaster -c "SELECT COUNT(*) FROM products;"
# Devrait retourner : 7
```

## 🔌 Connexion depuis le backend

### Variables d'environnement (.env)

Créez un fichier `.env` à la racine de votre backend :

```env
# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/pitmaster

# Ou séparément :
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pitmaster
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# AI API Keys (optionnel - peuvent être stockées en base)
GEMINI_API_KEY=votre_clé_gemini
OPENAI_API_KEY=votre_clé_openai
ANTHROPIC_API_KEY=votre_clé_anthropic
```

### Node.js avec pg (PostgreSQL client)

```bash
npm install pg dotenv
```

```javascript
// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Ou :
  // host: process.env.DB_HOST,
  // port: process.env.DB_PORT,
  // database: process.env.DB_NAME,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
});

module.exports = pool;
```

### Exemple de requête

```javascript
const pool = require('./db');

// Récupérer tous les produits
async function getProducts() {
  const result = await pool.query('SELECT * FROM products ORDER BY name');
  return result.rows;
}

// Récupérer les produits en stock bas
async function getLowStockProducts() {
  const result = await pool.query('SELECT * FROM low_stock_products');
  return result.rows;
}

// Créer une commande
async function createOrder(orderData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insérer la commande
    const orderResult = await client.query(
      'INSERT INTO orders (id, supplier_id, supplier_name, date, status, total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [orderData.id, orderData.supplierId, orderData.supplierName, new Date(), 'Brouillon', orderData.total]
    );

    // Insérer les items
    for (const item of orderData.items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit, price_per_unit) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderData.id, item.productId, item.productName, item.quantity, item.unit, item.pricePerUnit]
      );
    }

    await client.query('COMMIT');
    return orderResult.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
```

### ORM avec Prisma (Alternative)

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

Puis importez le schéma depuis la base existante :
```bash
npx prisma db pull
npx prisma generate
```

## 🔍 Requêtes utiles

### Produits

```sql
-- Tous les produits
SELECT * FROM products ORDER BY name;

-- Produits en stock bas
SELECT * FROM low_stock_products;

-- Valeur totale du stock
SELECT SUM(current_stock * average_cost) as total_stock_value FROM products;

-- Produits par famille
SELECT family, COUNT(*) as count FROM products GROUP BY family;
```

### Fournisseurs

```sql
-- Tous les fournisseurs avec nombre de produits
SELECT s.name, COUNT(sp.id) as product_count
FROM suppliers s
LEFT JOIN supplier_products sp ON s.id = sp.supplier_id
GROUP BY s.id, s.name;

-- Meilleurs prix par produit
SELECT * FROM supplier_product_catalog WHERE price_rank = 1;

-- Comparer les prix d'un produit
SELECT p.name, s.name as supplier, sp.price
FROM products p
JOIN supplier_products sp ON p.id = sp.internal_product_id
JOIN suppliers s ON sp.supplier_id = s.id
WHERE p.id = 'p1'
ORDER BY sp.price;
```

### Commandes

```sql
-- Commandes récentes
SELECT * FROM orders ORDER BY date DESC LIMIT 10;

-- Commandes par statut
SELECT status, COUNT(*) as count, SUM(total) as total_amount
FROM orders
GROUP BY status;

-- Détail d'une commande
SELECT o.*, oi.product_name, oi.quantity, oi.received_quantity, oi.price_per_unit
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'ord1';

-- Dépenses mensuelles
SELECT * FROM monthly_spending;
```

### Statistiques du dashboard

```sql
-- Stats complètes pour le dashboard
SELECT
  (SELECT COUNT(*) FROM low_stock_products) as low_stock_count,
  (SELECT COUNT(*) FROM orders WHERE status IN ('Envoyée', 'Confirmée')) as active_orders,
  (SELECT COUNT(*) FROM suppliers) as active_suppliers,
  (SELECT SUM(total) FROM orders
   WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
   AND status NOT IN ('Annulée', 'Brouillon')) as monthly_spending,
  (SELECT SUM(current_stock * average_cost) FROM products) as total_stock_value;
```

### Mouvements de stock

```sql
-- Historique pour un produit
SELECT * FROM stock_movements
WHERE product_id = 'p1'
ORDER BY created_at DESC;

-- Mouvements du jour
SELECT sm.*, p.name as product_name
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
WHERE DATE(sm.created_at) = CURRENT_DATE
ORDER BY sm.created_at DESC;
```

## 🛠️ Maintenance

### Sauvegarde

```bash
# Sauvegarde complète
pg_dump -U postgres pitmaster > backup_$(date +%Y%m%d).sql

# Sauvegarde avec compression
pg_dump -U postgres pitmaster | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restauration

```bash
# Restaurer depuis une sauvegarde
psql -U postgres pitmaster < backup_20251113.sql

# Restaurer depuis une sauvegarde compressée
gunzip -c backup_20251113.sql.gz | psql -U postgres pitmaster
```

### Réinitialisation

```bash
# ATTENTION : Supprime toutes les données !
psql -U postgres -c "DROP DATABASE pitmaster;"
psql -U postgres -c "CREATE DATABASE pitmaster;"
psql -U postgres -d pitmaster -f schema.sql
psql -U postgres -d pitmaster -f seed.sql
```

### Mise à jour du schéma

Pour ajouter des colonnes ou tables sans perdre les données :

```sql
-- Exemple : Ajouter une colonne
ALTER TABLE products ADD COLUMN description TEXT;

-- Exemple : Créer une nouvelle table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
```

## 🔒 Sécurité

### Bonnes pratiques

1. **Mots de passe** : Utilisez des mots de passe forts pour PostgreSQL
2. **Variables d'environnement** : Ne commitez JAMAIS le fichier `.env`
3. **Authentification** : Implémentez JWT ou sessions pour les utilisateurs
4. **API Keys** : Stockez les clés d'API chiffrées en base, pas dans le code
5. **Injections SQL** : Utilisez toujours des requêtes paramétrées ($1, $2, etc.)

### Hash des mots de passe

```javascript
const bcrypt = require('bcrypt');

// Créer un hash
const passwordHash = await bcrypt.hash('password123', 10);

// Vérifier
const isValid = await bcrypt.compare('password123', passwordHash);
```

## 📚 Ressources

- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [node-postgres (pg)](https://node-postgres.com/)
- [Prisma ORM](https://www.prisma.io/)
- [pgAdmin](https://www.pgadmin.org/) - Interface graphique pour PostgreSQL

## 🆘 Dépannage

### Erreur : "role does not exist"

```bash
# Créer l'utilisateur PostgreSQL
sudo -u postgres createuser --superuser votre_user
```

### Erreur : "password authentication failed"

```bash
# Modifier le mot de passe
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nouveau_mot_de_passe';
```

### Erreur : "could not connect to server"

```bash
# Vérifier que PostgreSQL est lancé
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Démarrer PostgreSQL
sudo systemctl start postgresql   # Linux
brew services start postgresql@15 # macOS
```

### Port déjà utilisé

```bash
# Vérifier quel processus utilise le port 5432
lsof -i :5432

# Changer le port dans postgresql.conf (puis redémarrer)
port = 5433
```

---

**Créé pour L'Économe Pitmaster** - Système de gestion de restaurant avec suggestions d'achat par IA
