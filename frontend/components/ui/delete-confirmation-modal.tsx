'use client';

import { AdminModal } from './admin-modals';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    itemName: string;
    description?: string;
    warning?: string;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    itemName,
    description = "Are you sure you want to delete",
    warning,
    isDeleting = false
}: DeleteConfirmationModalProps) {
    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="space-y-6 text-center">
                <div className="flex justify-center text-yellow-500">
                    <AlertTriangle size={64} />
                </div>
                <div>
                    <h3 className="text-xl font-bold uppercase">{description}</h3>
                    <div className="text-red-600 font-black text-2xl mt-2">"{itemName}"?</div>
                </div>

                {warning && (
                    <div className="bg-red-50 border-l-4 border-red-600 p-3 text-sm font-mono text-red-800 text-left">
                        {warning}
                    </div>
                )}

                <div className="flex gap-4 justify-center mt-6">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 border-2 border-black font-bold uppercase hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 bg-red-600 text-white border-2 border-black font-bold uppercase hover:bg-red-700 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </AdminModal>
    );
}
