'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Package } from 'lucide-react';
import { getInventoryFlat, setProductRecipe, Ingredient } from '@/lib/api';
import { AdminModal } from '../ui/admin-modals';
import { toast } from 'sonner';
import { CustomDropdown } from '../ui/custom-dropdown';

interface RecipeItem {
    ingredientId: string;
    ingredientName?: string;
    quantity: number;
    unit?: string;
}

interface RecipeEditorProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    currentRecipe?: any[];
}

export function RecipeEditor({ isOpen, onClose, productId, productName, currentRecipe = [] }: RecipeEditorProps) {
    const queryClient = useQueryClient();

    const { data: ingredients = [] } = useQuery({
        queryKey: ['inventory-flat'],
        queryFn: getInventoryFlat,
    });

    const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);

    // Initialize from current recipe
    useEffect(() => {
        if (isOpen && currentRecipe?.length > 0) {
            setRecipeItems(currentRecipe.map((r: any) => ({
                ingredientId: r.ingredient?.id || r.ingredientId || '',
                ingredientName: r.ingredient?.name || '',
                quantity: r.quantity || 0,
                unit: r.ingredient?.unit || ''
            })));
        } else if (isOpen) {
            setRecipeItems([]);
        }
    }, [isOpen, currentRecipe]);

    const saveMutation = useMutation({
        mutationFn: () => setProductRecipe(productId, recipeItems.filter(r => r.ingredientId && r.quantity > 0)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Resep berhasil disimpan');
            onClose();
        },
        onError: () => toast.error('Gagal menyimpan resep')
    });

    const addItem = () => {
        setRecipeItems([...recipeItems, { ingredientId: '', quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        setRecipeItems(recipeItems.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: 'ingredientId' | 'quantity', value: string | number) => {
        const updated = [...recipeItems];
        if (field === 'ingredientId') {
            const ing = ingredients.find((i: Ingredient) => i.id === value);
            updated[index] = {
                ...updated[index],
                ingredientId: value as string,
                ingredientName: ing?.name,
                unit: ing?.unit
            };
        } else {
            updated[index] = { ...updated[index], quantity: Number(value) };
        }
        setRecipeItems(updated);
    };

    // Group ingredients by name for dropdown
    const ingredientOptions = Array.from(new Set(ingredients.map((i: Ingredient) => i.name)))
        .map(name => {
            const ing = ingredients.find((i: Ingredient) => i.name === name);
            return {
                value: ing?.id || '',
                label: `${name} (${ing?.unit || ''})`
            };
        });

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Resep: ${productName}`}
        >
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm font-mono">
                    <Package size={16} className="inline mr-2" />
                    Tentukan bahan dan jumlah yang dibutuhkan untuk 1 produk.
                </div>

                {recipeItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500 font-mono text-sm">
                        Belum ada bahan. Klik "Tambah Bahan" untuk memulai.
                    </div>
                )}

                {recipeItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center border-2 border-black p-3 bg-white">
                        <div className="flex-grow">
                            <CustomDropdown
                                value={item.ingredientId}
                                onChange={(val) => updateItem(idx, 'ingredientId', val)}
                                options={ingredientOptions}
                                className="w-full"
                            />
                        </div>
                        <div className="w-24">
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={item.quantity}
                                onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                className="w-full border-2 border-black p-2 font-mono text-center"
                            />
                        </div>
                        <span className="text-gray-500 font-mono text-sm w-12">{item.unit || ''}</span>
                        <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-2 hover:text-red-600 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addItem}
                    className="w-full border-2 border-dashed border-gray-400 p-3 font-mono uppercase text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Tambah Bahan
                </button>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t-2 border-dashed border-gray-300">
                <button
                    onClick={onClose}
                    className="flex-1 border-2 border-black py-3 font-bold uppercase hover:bg-gray-100"
                >
                    Batal
                </button>
                <button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="flex-1 bg-black text-white py-3 font-bold uppercase hover:bg-gray-800 disabled:opacity-50"
                >
                    {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Resep'}
                </button>
            </div>
        </AdminModal>
    );
}
