
import React from 'react';
import { Icons } from './Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 lg:p-8 w-full max-w-2xl text-white" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
                        <Icons name="close" className="h-6 w-6" />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
