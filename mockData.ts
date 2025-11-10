
import { Product, Supplier, User } from '../types';

export const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Saumon Frais Label Rouge', family: 'Poisson', unit: 'kg', currentStock: 4, minStock: 5, averageCost: 26 },
    { id: 'p2', name: 'Huile d\'olive vierge extra', family: 'Épicerie', unit: 'L', currentStock: 1, minStock: 3, averageCost: 11.75 },
    { id: 'p3', name: 'Filet de maquereau', family: 'Poisson', unit: 'kg', currentStock: 8, minStock: 5, averageCost: 12 },
    { id: 'p4', name: 'Bois de Hêtre (fumage)', family: 'Fumage', unit: 'Sac de 10 kg', currentStock: 2, minStock: 2, averageCost: 20 },
    { id: 'p5', name: 'Sel de Guérande', family: 'Épicerie', unit: 'kg', currentStock: 12, minStock: 10, averageCost: 2.25 },
    { id: 'p6', name: 'Poivre noir en grains', family: 'Épicerie', unit: 'kg', currentStock: 0.8, minStock: 1, averageCost: 14.5 },
    { id: 'p7', name: 'Côte de Boeuf', family: 'Viande', unit: 'kg', currentStock: 15, minStock: 10, averageCost: 35 },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    {
        id: 's1',
        name: 'Le Pêcheur Local',
        deliveryDays: 'Mardi, Vendredi',
        minOrder: 50,
        products: [
            { internalProductId: 'p1', supplierSku: 'SAL-LR-01', price: 25 },
            { internalProductId: 'p3', supplierSku: 'MAQ-FIL-01', price: 12 },
        ]
    },
    {
        id: 's2',
        name: 'Metro',
        deliveryDays: 'Tous les jours sauf Dimanche',
        minOrder: 100,
        products: [
            { internalProductId: 'p1', supplierSku: 'MET-SAL-88', price: 27 },
            { internalProductId: 'p2', supplierSku: 'MET-HUI-12', price: 12 },
            { internalProductId: 'p5', supplierSku: 'MET-SEL-01', price: 2 },
            { internalProductId: 'p6', supplierSku: 'MET-POI-02', price: 15 },
            { internalProductId: 'p7', supplierSku: 'MET-BOEUF-45', price: 35 },
        ]
    },
    {
        id: 's3',
        name: 'Épices du Monde',
        deliveryDays: 'Mercredi',
        minOrder: 30,
        products: [
            { internalProductId: 'p2', supplierSku: 'EDM-OLIVE-IT', price: 11.50 },
            { internalProductId: 'p5', supplierSku: 'EDM-SEL-FR', price: 2.5 },
            { internalProductId: 'p6', supplierSku: 'EDM-POIVRE-VN', price: 14 },
        ]
    },
    {
        id: 's4',
        name: 'Fumoir & Co',
        deliveryDays: 'Lundi',
        minOrder: 0,
        products: [
            { internalProductId: 'p4', supplierSku: 'FUM-HETRE-10', price: 20 },
        ]
    }
];

export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'Gérant' },
    { id: 'u2', name: 'Marie Curie', email: 'marie.curie@example.com', role: 'Chef' },
    { id: 'u3', name: 'Pierre Martin', email: 'pierre.martin@example.com', role: 'Commis' },
];