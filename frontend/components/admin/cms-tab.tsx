'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Upload, X, AlertTriangle, Package } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage, Product } from '@/lib/api';
import { AdminModal } from '../ui/admin-modals';
import { useForm, Controller } from 'react-hook-form';
import { CustomDropdown } from '../ui/custom-dropdown';
import { toast } from 'sonner';
import { LoadingState } from '../ui/loading-state';
import { ErrorState } from '../ui/error-state';
import { EmptyProducts } from '../ui/empty-state';
import { PRODUCT_STATUS_LABELS } from '@/lib/constants';
import { RecipeEditor } from './recipe-editor';

export function CMSTab() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Delete States
    const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
    const [confirmName, setConfirmName] = useState('');
    const [step, setStep] = useState<0 | 1 | 2>(0);

    // Recipe Editor State
    const [recipeProduct, setRecipeProduct] = useState<Product | null>(null);

    const { data: products, isLoading, error, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsModalOpen(false);
            toast.success('Produk berhasil ditambahkan');
        },
        onError: () => toast.error('Gagal menambahkan produk')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setEditingProduct(null);
            setIsModalOpen(false);
            toast.success('Produk berhasil diperbarui');
        },
        onError: () => toast.error('Gagal memperbarui produk')
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setDeleteProductTarget(null);
            setStep(0);
            setConfirmName('');
            toast.success('Produk berhasil dihapus');
        },
        onError: () => toast.error('Gagal menghapus produk')
    });

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setDeleteProductTarget(product);
        setStep(1);
    };

    const handleFinalDelete = () => {
        if (deleteProductTarget && confirmName === deleteProductTarget.name) {
            deleteMutation.mutate(deleteProductTarget.id);
        }
    };

    const handleInlineUpdate = (id: string, field: string, value: any) => {
        updateMutation.mutate({ id, data: { [field]: value } });
    };

    if (isLoading) return <LoadingState text="Memuat produk..." />;
    if (error) return <ErrorState type="error" onRetry={() => refetch()} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="hidden sm:block text-2xl sm:text-4xl font-black uppercase italic tracking-tighter">Kelola Produk</h2>
                <button
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto h-9 sm:h-12 text-xs sm:text-base bg-black text-white px-3 sm:px-6 font-bold uppercase hover:bg-white hover:text-black border-4 border-transparent hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2"
                >
                    <Plus size={16} className="sm:hidden" />
                    <Plus size={20} className="hidden sm:block" />
                    Tambah Produk
                </button>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:snap-none md:pb-0 scrollbar-hide">
                {products?.map((product) => (
                    <div key={product.id} className="snap-center min-w-[300px] w-[85vw] flex-shrink-0 md:w-auto md:min-w-0">
                        <ProductCard
                            product={product}
                            onEdit={() => handleEdit(product)}
                            onDelete={() => handleDeleteClick(product)}
                            onInlineUpdate={handleInlineUpdate}
                            onRecipe={() => setRecipeProduct(product)}
                        />
                    </div>
                ))}
            </div>

            {/* RECIPE EDITOR MODAL */}
            <RecipeEditor
                isOpen={!!recipeProduct}
                onClose={() => setRecipeProduct(null)}
                productId={recipeProduct?.id || ''}
                productName={recipeProduct?.name || ''}
                currentRecipe={recipeProduct?.recipe}
            />

            {/* CREATE / EDIT MODAL */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? "Edit Produk" : "Tambah Produk"}
            >
                <div className="max-h-[70vh] overflow-y-auto p-1">
                    <ProductForm
                        initialData={editingProduct}
                        onSubmit={(data) => {
                            if (editingProduct) updateMutation.mutate({ id: editingProduct.id, data });
                            else createMutation.mutate(data);
                        }}
                    />
                </div>
            </AdminModal>

            {/* DELETE MODAL 1 */}
            <AdminModal
                isOpen={step === 1}
                onClose={() => { setStep(0); setDeleteProductTarget(null); }}
                title="Konfirmasi Hapus"
            >
                <div className="space-y-6 text-center">
                    <div className="flex justify-center text-yellow-500">
                        <AlertTriangle size={64} />
                    </div>
                    <h3 className="text-xl font-bold uppercase">Yakin ingin menghapus <br /><span className="text-red-600">"{deleteProductTarget?.name}"</span>?</h3>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => setStep(0)} className="px-6 py-3 border-2 border-black font-bold uppercase hover:bg-gray-100">
                            Batal
                        </button>
                        <button onClick={() => setStep(2)} className="px-6 py-3 bg-black text-white border-2 border-black font-bold uppercase hover:bg-gray-800">
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </AdminModal>

            {/* DELETE MODAL 2 (HARD) */}
            <AdminModal
                isOpen={step === 2}
                onClose={() => { setStep(0); setDeleteProductTarget(null); setConfirmName(''); }}
                title="Peringatan Akhir"
            >
                <div className="space-y-6">
                    <div className="bg-red-50 border-l-4 border-red-600 p-4">
                        <p className="font-bold text-red-800 uppercase flex items-center gap-2">
                            <AlertTriangle size={20} />
                            Tindakan ini tidak dapat dibatalkan!
                        </p>
                    </div>
                    <p className="font-mono text-sm text-gray-600">
                        Untuk konfirmasi, ketik <span className="font-bold bg-gray-200 px-1">"{deleteProductTarget?.name}"</span> di bawah.
                    </p>
                    <input
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        className="w-full border-2 border-black p-3 font-mono text-center uppercase font-bold"
                        placeholder="Ketik nama produk"
                    />
                    <button
                        disabled={confirmName !== deleteProductTarget?.name}
                        onClick={handleFinalDelete}
                        className="w-full px-6 py-3 bg-red-600 text-white border-2 border-black font-bold uppercase hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Hapus Produk Permanen
                    </button>
                </div>
            </AdminModal>
        </div>
    );
}

function ProductCard({ product, onEdit, onDelete, onInlineUpdate, onRecipe }: { product: any, onEdit: () => void, onDelete: () => void, onInlineUpdate: (id: string, field: string, val: any) => void, onRecipe: () => void }) {
    // Calculate estimated producible packages based on recipe ingredients
    const estimatedStock = product.recipe?.length > 0
        ? Math.min(...product.recipe.map((r: any) => Math.floor((r.availableStock || 0) / r.quantity)))
        : null;

    const hasLowIngredients = product.hasOutOfStock || (estimatedStock !== null && estimatedStock <= 0);

    return (
        <div className={`bg-white border-4 ${hasLowIngredients ? 'border-red-500' : 'border-black'} flex flex-col shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-300 group h-full`}>
            <div className={`w-full bg-gray-100 border-b-4 ${hasLowIngredients ? 'border-red-500' : 'border-black'} relative overflow-hidden group-hover:bg-gray-200 transition-colors`}>
                <div className="relative w-full h-full bg-white flex items-center justify-center p-2">
                    <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain aspect-square grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button onClick={onEdit} className="bg-white text-black px-4 py-2 font-bold uppercase border-2 border-black hover:bg-black hover:text-white transition-colors">
                        Ganti Gambar
                    </button>
                </div>
                <span className={`absolute top-2 right-2 px-3 py-1 text-xs font-black border-2 border-black uppercase bg-white text-black`}>
                    {product.status}
                </span>
                {hasLowIngredients && (
                    <span className="absolute top-2 left-2 px-2 py-1 text-[10px] font-black border-2 border-red-600 uppercase bg-red-600 text-white animate-pulse">
                        BAHAN HABIS
                    </span>
                )}
            </div>

            <div className="p-5 flex-grow space-y-4">
                <div>
                    <EditableText
                        value={product.name}
                        className="font-black text-lg sm:text-2xl uppercase leading-tight"
                        onSave={(val) => onInlineUpdate(product.id, 'name', val)}
                    />
                    <EditableText
                        value={product.tag}
                        className="font-mono text-sm sm:text-base text-gray-700 font-bold mt-1"
                        onSave={(val) => onInlineUpdate(product.id, 'tag', val)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 border-y-2 border-dashed border-gray-300 py-4">
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-500 block">Harga</span>
                        <EditableNumber
                            value={product.price}
                            className="font-mono font-bold text-lg sm:text-xl"
                            format={(v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)}
                            onSave={(val) => onInlineUpdate(product.id, 'price', val)}
                        />
                    </div>
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-500 block">
                            Est. Stok
                        </span>
                        <div className={`font-mono font-bold text-lg sm:text-xl ${estimatedStock !== null && estimatedStock <= 0 ? 'text-red-600' : ''}`}>
                            {estimatedStock !== null ? `${estimatedStock} pak` : '-'}
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black text-black p-2 text-center font-mono text-sm">
                    TERJUAL: <span className="font-bold">{product.soldCount}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <button onClick={onEdit} className="border-2 border-black font-bold py-2 uppercase text-xs sm:text-base hover:bg-gray-100 flex items-center justify-center gap-1">
                        <Edit size={14} /> Ubah
                    </button>
                    <button onClick={onRecipe} className="border-2 border-black font-bold py-2 uppercase text-xs sm:text-base hover:bg-blue-50 flex items-center justify-center gap-1">
                        <Package size={14} /> Resep
                    </button>
                    <button onClick={onDelete} className="bg-black border-2 border-black font-bold py-2 uppercase text-xs sm:text-base text-white hover:opacity-80 flex items-center justify-center gap-1">
                        <Trash2 size={14} /> Hapus
                    </button>
                </div>

                <div className="text-sm text-gray-400 font-mono text-center">
                    Diperbarui: {new Date(product.updatedAt || Date.now()).toLocaleDateString('id-ID')}
                </div>
            </div>
        </div>
    );
}

function EditableText({ value, className, onSave }: { value: string, className?: string, onSave: (val: string) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    // If blur happens, we should probably revert or save. User said "revert" logic previously.
    // So onBlur -> setIsEditing(false) without calling onSave.

    if (isEditing) {
        return (
            <div className="flex gap-2">
                <input
                    autoFocus
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => { setIsEditing(false); setTempValue(value); }} // Revert logic
                    className="w-full border-2 border-black p-1 font-mono uppercase text-lg"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') { onSave(tempValue); setIsEditing(false); }
                        if (e.key === 'Escape') { setIsEditing(false); setTempValue(value); }
                    }}
                />
            </div>
        );
    }
    return <div onClick={() => { setTempValue(value); setIsEditing(true); }} className={`${className} cursor-pointer hover:bg-gray-200 transition-colors border border-transparent hover:border-dashed hover:border-black`}>{value}</div>;
}

function EditableNumber({ value, className, format, onSave }: { value: number, className?: string, format?: (v: number) => string, onSave: (val: number) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    if (isEditing) {
        return (
            <div className="flex gap-2">
                <input
                    type="number"
                    autoFocus
                    value={tempValue}
                    onChange={(e) => setTempValue(Number(e.target.value))}
                    onBlur={() => { setIsEditing(false); setTempValue(value); }}
                    className="w-full border-2 border-black p-1 font-mono text-lg"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') { onSave(tempValue); setIsEditing(false); }
                        if (e.key === 'Escape') { setIsEditing(false); setTempValue(value); }
                    }}
                />
            </div>
        );
    }
    return <div onClick={() => { setTempValue(value); setIsEditing(true); }} className={`${className} cursor-pointer hover:bg-gray-200 transition-colors border border-transparent hover:border-dashed hover:border-black`}>{format ? format(value) : value}</div>;
}

function ProductForm({ initialData, onSubmit }: { initialData?: Product | null, onSubmit: (data: any) => void }) {
    const { register, control, handleSubmit, setValue, watch, reset, formState: { isSubmitSuccessful } } = useForm({
        defaultValues: {
            name: initialData?.name || '',
            tag: initialData?.tag || '',
            price: initialData?.price || 0,
            status: initialData?.status || 'ACTIVE',
            badge: initialData?.badge || '',
            description: initialData?.description || '',
            sticker: initialData?.sticker || '',
            flavors: initialData?.flavors || [],
            image: initialData?.image || ''
        }
    });

    // Local state for flavors for simplicity
    const [flavors, setFlavors] = useState<string[]>(initialData?.flavors || []);
    const [newFlavor, setNewFlavor] = useState('');

    useEffect(() => {
        if (isSubmitSuccessful && !initialData) {
            reset();
            setFlavors([]);
            setNewFlavor('');
        }
    }, [isSubmitSuccessful, reset, initialData]);

    const addFlavor = () => {
        if (newFlavor.trim()) {
            setFlavors([...flavors, newFlavor.trim()]);
            setNewFlavor('');
        }
    };

    const removeFlavor = (index: number) => {
        setFlavors(flavors.filter((_, i) => i !== index));
    };

    const [uploading, setUploading] = useState(false);
    const imageUrl = watch('image');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const { url } = await uploadImage(e.target.files[0]);
                setValue('image', url);
            } catch (err) {
                console.error(err);
                alert('Upload failed');
            } finally {
                setUploading(false);
            }
        }
    };

    const submitHandler = (data: any) => {
        onSubmit({ ...data, flavors });
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
            <div>
                <label className="block font-bold uppercase mb-1">Nama</label>
                <input {...register('name')} className="w-full border-2 border-black p-2 font-mono" placeholder="Nama Produk" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block font-bold uppercase mb-1">Tag (Kategori)</label>
                    <input {...register('tag')} className="w-full border-2 border-black p-2 font-mono" placeholder="cth. SNACK" required />
                </div>
                <div>
                    <label className="block font-bold uppercase mb-1">Badge</label>
                    <input {...register('badge')} className="w-full border-2 border-black p-2 font-mono" placeholder="cth. BEST SELLER" />
                </div>
            </div>

            <div>
                <label className="block font-bold uppercase mb-1">Deskripsi</label>
                <textarea {...register('description')} className="w-full border-2 border-black p-2 font-mono" rows={3} placeholder="Deskripsi produk..." />
            </div>

            <div>
                <label className="block font-bold uppercase mb-1">Harga (Rp)</label>
                <input type="number" {...register('price', { valueAsNumber: true })} className="w-full border-2 border-black p-2 font-mono" required />
                <p className="text-xs text-gray-500 mt-1 font-mono">Stock dihitung otomatis berdasarkan bahan baku.</p>
            </div>

            <div>
                <label className="block font-bold uppercase mb-1">Status</label>
                <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                        <CustomDropdown
                            value={field.value}
                            onChange={field.onChange}
                            options={[
                                { value: 'ACTIVE', label: 'ACTIVE' },
                                { value: 'DRAFT', label: 'DRAFT' },
                                { value: 'ARCHIVED', label: 'ARCHIVED' }
                            ]}
                            className="w-full"
                        />
                    )}
                />
            </div>

            <div>
                <label className="block font-bold uppercase mb-1">Teks Stiker</label>
                <input {...register('sticker')} className="w-full border-2 border-black p-2 font-mono" placeholder="Teks stiker (opsional)" />
            </div>

            {/* FLAVORS */}
            <div className="border-2 border-black p-4 bg-gray-50 border-dashed">
                <label className="block font-bold uppercase mb-2">Flavors</label>
                <div className="flex gap-2 mb-2">
                    <input
                        value={newFlavor}
                        onChange={(e) => setNewFlavor(e.target.value)}
                        className="flex-1 border-2 border-black p-2 font-mono"
                        placeholder="Tambah rasa..."
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFlavor(); } }}
                    />
                    <button type="button" onClick={addFlavor} className="bg-black text-white px-4 font-bold border-2 border-black hover:bg-gray-800">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {flavors.map((f, i) => (
                        <span key={i} className="bg-white border-2 border-black px-2 py-1 text-sm font-bold flex items-center gap-2">
                            {f}
                            <button type="button" onClick={() => removeFlavor(i)} className="hover:text-red-500"><X size={14} /></button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 pt-4">
                <label className="block font-bold uppercase mb-2">Gambar Produk</label>
                <div className="flex gap-4 items-center">
                    {imageUrl && (
                        <div className="relative">
                            <img src={imageUrl} alt="Preview" className="w-20 h-20 object-cover border-2 border-black" />
                        </div>
                    )}
                    <div className="flex-1">
                        <label className="cursor-pointer bg-white border-2 border-black px-4 py-2 font-bold uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
                            <Upload size={18} /> {uploading ? 'Mengunggah...' : 'Unggah Gambar Baru'}
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                        <input {...register('image')} type="hidden" />
                    </div>
                </div>
            </div>

            <button type="submit" disabled={uploading} className="w-full bg-black text-white font-bold uppercase py-3 mt-4 hover:bg-gray-800 transition-colors disabled:opacity-50">
                {initialData ? 'Simpan Perubahan' : 'Buat Produk'}
            </button>
        </form>
    );
}
