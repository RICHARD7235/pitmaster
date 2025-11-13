import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import Modal from '../common/Modal';
import { Icons } from '../common/Icons';
import { SaleItem } from '../../types';

interface ImportSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (sales: SaleItem[]) => void;
}

// Mock data to simulate what would be extracted from an Excel/CSV file
const MOCK_SALES_DATA: SaleItem[] = [
    { productName: 'Saumon Frais Label Rouge', quantitySold: 2.5 },
    { productName: 'Côte de Boeuf', quantitySold: 4 },
    { productName: 'Huile d\'olive vierge extra', quantitySold: 1 },
];

const ImportSalesModal: React.FC<ImportSalesModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [salesData, setSalesData] = useState<SaleItem[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleConfirm = () => {
        const dataToSend = salesData.length > 0 ? salesData : MOCK_SALES_DATA;
        onConfirm(dataToSend);
        // Reset state after confirmation
        setSalesData([]);
        setFileName('');
        setError('');
    };

    const handleFileSelect = (file: File) => {
        setError('');
        setFileName(file.name);

        // Check file extension
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension !== 'csv') {
            setError('Veuillez sélectionner un fichier CSV');
            return;
        }

        // Parse CSV file
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const parsedSales: SaleItem[] = [];

                    // Expected columns: productName (or nom/produit), quantitySold (or quantité/quantity)
                    results.data.forEach((row: any, index: number) => {
                        // Try to find product name column (case insensitive)
                        const productName =
                            row.productName ||
                            row.ProductName ||
                            row.nom ||
                            row.Nom ||
                            row.produit ||
                            row.Produit ||
                            row.product ||
                            row.Product ||
                            row['Nom du produit'] ||
                            row['Product Name'];

                        // Try to find quantity column (case insensitive)
                        const quantityStr =
                            row.quantitySold ||
                            row.QuantitySold ||
                            row.quantité ||
                            row.Quantité ||
                            row.quantity ||
                            row.Quantity ||
                            row.qty ||
                            row.Qty ||
                            row['Quantité vendue'] ||
                            row['Quantity Sold'];

                        if (!productName || !quantityStr) {
                            console.warn(`Ligne ${index + 1} ignorée: données manquantes`, row);
                            return;
                        }

                        const quantitySold = parseFloat(String(quantityStr).replace(',', '.'));

                        if (isNaN(quantitySold) || quantitySold < 0) {
                            console.warn(`Ligne ${index + 1} ignorée: quantité invalide`, row);
                            return;
                        }

                        parsedSales.push({
                            productName: String(productName).trim(),
                            quantitySold
                        });
                    });

                    if (parsedSales.length === 0) {
                        setError('Aucune donnée valide trouvée dans le fichier. Assurez-vous que le CSV contient les colonnes "productName" et "quantitySold" (ou équivalents en français).');
                        return;
                    }

                    setSalesData(parsedSales);
                    setError('');
                } catch (err) {
                    setError(`Erreur lors du parsing: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
                }
            },
            error: (err) => {
                setError(`Erreur lors de la lecture du fichier: ${err.message}`);
            }
        });
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleClickUploadArea = () => {
        fileInputRef.current?.click();
    };

    const handleUseMockData = () => {
        setSalesData(MOCK_SALES_DATA);
        setFileName('Données de démonstration');
        setError('');
    };

    const displayData = salesData.length > 0 ? salesData : MOCK_SALES_DATA;
    const isRealData = salesData.length > 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Importer les Ventes (Sortie de Stock)">
            <div className="space-y-6">
                <div
                    className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
                        isDragging
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClickUploadArea}
                >
                    <Icons name="upload" className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <p className="font-semibold">Glissez-déposez le récapitulatif des ventes ici</p>
                    <p className="text-sm text-gray-400">ou cliquez pour sélectionner un fichier CSV</p>
                    {fileName && (
                        <p className="text-sm text-green-400 mt-2">📄 {fileName}</p>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-400 text-sm">
                        <div className="flex items-start gap-2">
                            <Icons name="alert-circle" className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-orange-400">
                            {isRealData ? 'Données importées' : 'Aperçu des données (Exemple)'}
                        </h4>
                        {!isRealData && (
                            <button
                                onClick={handleUseMockData}
                                className="text-xs bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded"
                            >
                                Utiliser les données de démo
                            </button>
                        )}
                    </div>
                    <div className="bg-gray-900 p-4 rounded-md max-h-48 overflow-y-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="p-2 text-sm font-semibold text-gray-300">Produit Vendu</th>
                                    <th className="p-2 text-sm font-semibold text-gray-300 text-right">Quantité</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.map((sale, index) => (
                                    <tr key={index} className="border-t border-gray-700">
                                        <td className="p-2">{sale.productName}</td>
                                        <td className="p-2 font-mono text-right">{sale.quantitySold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!isRealData && (
                        <div className="flex items-start gap-2 mt-2 text-xs text-gray-500">
                            <Icons name="info" className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <p>
                                Exemple de données. Importez un fichier CSV avec les colonnes "productName" et "quantitySold"
                                (ou "nom"/"produit" et "quantité" en français).
                            </p>
                        </div>
                    )}
                    {isRealData && (
                        <p className="text-xs text-green-400 mt-2 flex items-center gap-2">
                            <Icons name="check-circle" className="h-4 w-4" />
                            {displayData.length} vente(s) importée(s) avec succès
                        </p>
                    )}
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                    >
                        <Icons name="trending-down" className="h-5 w-5 mr-2" />
                        Mettre à jour les stocks
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportSalesModal;
