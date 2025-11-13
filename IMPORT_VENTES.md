# Guide d'Utilisation - Import des Ventes

## Vue d'ensemble

La fonctionnalité "Importer Ventes (Sortie de Stock)" permet d'importer un fichier CSV contenant les ventes de produits et de mettre à jour automatiquement les stocks en conséquence.

## Accès à la fonctionnalité

1. Naviguez vers la section **Gestion des Stocks**
2. Cliquez sur le bouton **"Importer Ventes (Sortie de Stock)"** (bouton bleu avec icône de tendance descendante)

## Format du fichier CSV

### Colonnes requises

Le fichier CSV doit contenir les colonnes suivantes (plusieurs noms de colonnes sont acceptés) :

#### Nom du produit
- `productName` ou `ProductName`
- `nom` ou `Nom`
- `produit` ou `Produit`
- `product` ou `Product`
- `Nom du produit` ou `Product Name`

#### Quantité vendue
- `quantitySold` ou `QuantitySold`
- `quantité` ou `Quantité`
- `quantity` ou `Quantity`
- `qty` ou `Qty`
- `Quantité vendue` ou `Quantity Sold`

### Exemple de fichier CSV

```csv
productName,quantitySold
Saumon Frais Label Rouge,2.5
Côte de Boeuf,4
Huile d'olive vierge extra,1
Filet de Poulet Fermier,3
Tomates Cerises Bio,2.3
```

Ou en français :

```csv
nom,quantité
Saumon Frais Label Rouge,2.5
Côte de Boeuf,4
Huile d'olive vierge extra,1
```

**Note :** Un fichier exemple est disponible à la racine du projet : `exemple-import-ventes.csv`

## Utilisation

### Option 1 : Drag & Drop
1. Ouvrez le modal "Importer les Ventes"
2. Glissez-déposez votre fichier CSV dans la zone prévue à cet effet

### Option 2 : Sélection manuelle
1. Ouvrez le modal "Importer les Ventes"
2. Cliquez sur la zone de téléchargement
3. Sélectionnez votre fichier CSV dans l'explorateur de fichiers

### Option 3 : Données de démonstration
1. Cliquez sur le bouton "Utiliser les données de démo" pour tester avec des données factices

## Processus d'import

1. **Sélection du fichier** : Choisissez un fichier CSV contenant vos ventes
2. **Parsing automatique** : Le système lit et analyse le fichier
3. **Validation** : Les données sont validées (noms de produits, quantités positives)
4. **Aperçu** : Un tableau affiche les données importées
5. **Confirmation** : Cliquez sur "Mettre à jour les stocks" pour appliquer les changements

## Validation des données

Le système effectue les validations suivantes :

- ✅ Le fichier doit être au format CSV
- ✅ Les colonnes requises doivent être présentes (nom de produit + quantité)
- ✅ Les quantités doivent être des nombres positifs ou nuls
- ✅ Les lignes avec des données invalides sont ignorées (avec avertissement dans la console)

## Gestion des erreurs

### Messages d'erreur possibles

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Veuillez sélectionner un fichier CSV" | Format de fichier incorrect | Utilisez uniquement des fichiers .csv |
| "Aucune donnée valide trouvée dans le fichier" | Colonnes incorrectes ou données manquantes | Vérifiez que votre CSV contient les colonnes requises |
| "Erreur lors du parsing" | Fichier CSV mal formaté | Vérifiez le format de votre fichier (encodage UTF-8, séparateurs corrects) |

## Comportement du système

### Mise à jour des stocks
- Les quantités vendues sont **déduites** du stock actuel
- Le stock ne peut pas devenir négatif (minimum = 0)
- Chaque vente est enregistrée comme un mouvement de stock de type "SALE"

### Correspondance des produits
- Le système recherche les produits par leur **nom exact**
- Les espaces en début/fin de nom sont automatiquement supprimés
- Si un produit du CSV n'existe pas dans le système, il est ignoré

## Backend

L'import utilise l'endpoint : `POST /api/products/update-stock-from-sales`

Le backend :
- Utilise des transactions pour garantir l'intégrité des données
- Enregistre chaque mouvement dans la table `stock_movements`
- Retourne la liste des produits mis à jour

## Conseils d'utilisation

1. **Format de fichier** : Exportez vos ventes depuis votre système de caisse au format CSV
2. **Vérification** : Vérifiez toujours l'aperçu avant de confirmer l'import
3. **Noms de produits** : Assurez-vous que les noms de produits correspondent exactement à ceux dans votre système
4. **Encodage** : Utilisez l'encodage UTF-8 pour les caractères accentués

## Support

En cas de problème :
1. Vérifiez le format de votre fichier CSV
2. Consultez la console du navigateur pour les avertissements détaillés
3. Utilisez le fichier exemple comme référence
