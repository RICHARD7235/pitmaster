
import React from 'react';
import Modal from '../common/Modal';
import { Icons } from '../common/Icons';

interface ImportCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ImportCatalogModal: React.FC<ImportCatalogModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Importer un Catalogue Fournisseur">
            <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-10 text-center">
                    <Icons name="upload" className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <p className="font-semibold">Glissez-déposez un fichier Excel/CSV ici</p>
                    <p className="text-sm text-gray-400">ou cliquez pour sélectionner un fichier</p>
                    <button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer">
                        Sélectionner un fichier
                    </button>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Instructions de formatage</h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                        <li>Le fichier doit contenir les colonnes : `Code Article Fournisseur`, `Libellé Fournisseur`, `Prix`, `Unité`.</li>
                        <li>La première ligne doit être l'en-tête.</li>
                        <li>Le mapping avec vos produits internes se fera à l'étape suivante.</li>
                    </ul>
                </div>
                 <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Annuler</button>
                    <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg opacity-50 cursor-not-allowed" disabled>
                        Importer et Mapper
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportCatalogModal;
