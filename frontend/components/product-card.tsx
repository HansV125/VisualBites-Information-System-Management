'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { addToCartSchema, type AddToCartFormData } from '@/lib/data';
import { Header } from './header';
import { useProducts } from '@/hooks';
import { PurchaseModal } from './purchase-modal';
import { Footer } from './footer';
import { MobileReceipt } from './mobile-receipt';
import { MobilePurchaseModal } from './mobile-purchase-modal';

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        zIndex: 0,
        opacity: 1
    }),
    center: {
        x: 0,
        zIndex: 1,
        opacity: 1
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        zIndex: 0,
        opacity: 1
    })
};

export function ProductCard() {
    const { addToCart, getRemainingStock } = useStore();
    const { activeProducts: products, isLoading } = useProducts();

    const [productIndex, setProductIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [addedFeedback, setAddedFeedback] = useState(false);

    const product = products[productIndex];
    // Safe defaults in case product is undefined (during loading)
    const defaultFlavor = product?.flavors?.[0] || '';
    const productPrice = product?.price || 0;

    // START FIX: Hooks moved ABOVE the loading check
    const { handleSubmit, watch, setValue, reset, formState: { errors }, register } = useForm<AddToCartFormData>({
        resolver: zodResolver(addToCartSchema),
        defaultValues: { flavor: defaultFlavor, quantity: 1 }
    });

    useEffect(() => {
        if (product) {
            reset({ flavor: product.flavors[0], quantity: 1 });
        }
    }, [product, reset]);
    // END FIX

    if (isLoading || products.length === 0) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-paper font-mono text-xl animate-pulse">
                LOADING KITCHEN DATA...
            </div>
        );
    }

    // Verify product exists before rendering (though isLoading check should catch empty array)
    if (!product) return null;

    // Calculate estimated stock from recipe ingredients
    const estimatedStock = (product.recipe && product.recipe.length > 0)
        ? Math.max(0, Math.min(...product.recipe.map((r: any) => Math.floor((r.availableStock || 0) / r.quantity))))
        : product.stock;

    // Use estimatedStock for actual stock availability
    const actualStock = estimatedStock;

    // Get remaining stock considering what's already in cart for this product
    const remainingStock = getRemainingStock(product.id, actualStock);

    const quantity = watch('quantity');
    const selectedFlavor = watch('flavor');

    const onSubmit = (data: AddToCartFormData) => {
        if (remainingStock <= 0) return;

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            flavor: data.flavor,
            quantity: Math.min(data.quantity, remainingStock),
            image: product.image,
            stock: actualStock
        });
        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 1000);
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        if (newDirection === 1) {
            setProductIndex((prev) => (prev + 1) % products.length);
        } else {
            setProductIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
        }
    };

    return (
        <div className="h-full lg:h-screen flex flex-col bg-paper lg:pl-72 relative overflow-hidden bg-noise">
            <div className="hidden lg:block">
                <PurchaseModal />
            </div>
            <div className="lg:hidden">
                <MobilePurchaseModal />
            </div>

            <main className="flex-grow relative w-full overflow-hidden min-h-0">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={product.id}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "tween", ease: "easeInOut", duration: 0.3 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(_, { offset }) => {
                            const swipeThreshold = 50;
                            if (offset.x < -swipeThreshold) {
                                paginate(1);
                            } else if (offset.x > swipeThreshold) {
                                paginate(-1);
                            }
                        }}
                        className="absolute inset-0 w-full h-full grid grid-cols-1 lg:grid-cols-12 bg-paper touch-pan-y cursor-grab active:cursor-grabbing transform-gpu"
                    >
                        {/* Info Panel */}
                        <div className="lg:col-span-5 h-full relative bg-cream receipt-texture z-10 min-h-0 flex flex-col">
                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full min-h-0">
                                {/* Fixed Top Section: Title, Tags, Flavors */}
                                <div className="shrink-0 p-4 lg:p-10 pb-0 lg:pb-0 z-20">
                                    <div className="flex justify-between items-start mb-2 lg:mb-4 pt-2 lg:pt-0">
                                        <span className="bg-black text-white px-2 py-0.5 lg:px-3 lg:py-1 font-mono text-[10px] lg:text-xs uppercase font-bold tracking-wider border-2 border-black">
                                            {product.badge}
                                        </span>
                                        <span className="font-mono text-xs lg:text-sm text-gray-800 tracking-widest">{product.tag}</span>
                                    </div>

                                    <h1 className="font-marker text-4xl lg:text-6xl mb-4 lg:mb-6 leading-[0.9] break-words">
                                        {product.name}
                                    </h1>

                                    <div className="flex flex-row gap-4 items-start mb-4">
                                        {/* Flavor Selector */}
                                        <div className="flex-1">
                                            <h3 className="font-mono text-xs uppercase tracking-widest text-gray-800 mb-2">Pilih Varian</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {product.flavors.map((flavorLabel) => {
                                                    const isSelected = selectedFlavor === flavorLabel;
                                                    return (
                                                        <label
                                                            key={flavorLabel}
                                                            className={`truncate cursor-pointer px-4 py-2 border-2 border-black font-mono text-xs sm:text-sm font-bold ${isSelected ? 'bg-black text-white' : 'bg-paper btn-invert'}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                value={flavorLabel}
                                                                {...register('flavor')}
                                                                className="hidden"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                {isSelected && <Check size={14} />}
                                                                {flavorLabel}
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Mobile Image (Square, Rotated) */}
                                        <div className="w-24 shrink-0 lg:hidden relative aspect-square border-2 border-black brutalist-shadow-sm rotate-3 bg-white">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                sizes="96px"
                                                className="object-cover"
                                                priority
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable Description - Critical Fix: touch-action: pan-y */}
                                <div className="flex-grow overflow-y-auto min-h-0 px-4 lg:px-10 py-1 scrollbar-hide z-10 touch-pan-y">
                                    <div className="font-hand text-sm sm:text-xl leading-relaxed text-gray-900 whitespace-pre-line pl-2 lg:pl-4 select-none">
                                        {product.description}
                                    </div>
                                </div>

                                {/* Fixed Bottom Section: Controls */}
                                <div className="shrink-0 p-4 lg:p-10 pt-4 lg:pt-6 mt-auto z-20 bg-cream">
                                    <div className="flex items-end justify-between border-border-black/30 pb-4">
                                        <div>
                                            {errors.flavor && <span className="text-red-800 text-sm font-mono block mb-1">{errors.flavor.message}</span>}
                                            <div className="font-mono text-xs text-gray-800 mb-1 uppercase">Harga</div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-display text-2xl sm:text-4xl font-bold">Rp{product.price.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                        {/* Swipe Indicator */}
                                        <div className="lg:hidden bg-paper border border-black px-2 py-0.5 shadow-sm self-start">
                                            <span className="font-marker text-xs text-black whitespace-nowrap block">GESER MENU &lt;&gt;</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 lg:gap-4 h-8 lg:h-14 mb-2 sm:mb-0">
                                        <div className="flex border-2 border-black w-28 lg:w-36 bg-cream">
                                            <button
                                                type="button"
                                                onClick={() => setValue('quantity', Math.max(1, quantity - 1))}
                                                className="w-8 lg:w-12 flex items-center justify-center border-r-2 border-black bg-paper btn-invert"
                                            >
                                                <Minus size={14} className="lg:hidden" />
                                                <Minus size={18} className="hidden lg:block" />
                                            </button>
                                            <div className="flex-grow flex items-center justify-center font-hand font-bold text-xl lg:text-3xl bg-cream">
                                                {quantity}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setValue('quantity', Math.min(remainingStock, quantity + 1))}
                                                className="w-8 lg:w-12 flex items-center justify-center border-l-2 border-black bg-paper btn-invert"
                                                disabled={quantity >= remainingStock}
                                            >
                                                <Plus size={14} className="lg:hidden" />
                                                <Plus size={18} className="hidden lg:block" />
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={remainingStock === 0}
                                            className="relative flex-grow bg-black text-white border-2 border-black font-display text-sm lg:text-xl uppercase tracking-wider flex items-center justify-center gap-2 lg:gap-3 btn-invert-dark overflow-visible disabled:bg-gray-400 disabled:cursor-not-allowed disabled:border-gray-400 active:scale-95 transition-transform"
                                        >
                                            {remainingStock > 0 ? (
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {addedFeedback ? 'Ditambahkan!' : `Tambah (${remainingStock} tersisa)`}
                                                    <ShoppingCart size={16} className="lg:hidden" />
                                                    <ShoppingCart size={22} className="hidden lg:block" />
                                                </span>
                                            ) : (
                                                <span className="relative z-10 flex items-center gap-2">HABIS</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Desktop Right Panel (Image) */}
                        <div className="hidden lg:block lg:col-span-7 relative h-full w-full bg-cream overflow-hidden cursor-grab active:cursor-grabbing">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="(min-width: 1024px) 58vw, 100vw"
                                className="object-cover z-0 pointer-events-none"
                                priority
                            />
                            <div className="absolute inset-0 mix-blend-multiply opacity-10 pointer-events-none bg-noise z-10" />
                            <div className="absolute top-8 right-8 z-30 pointer-events-none font-mono text-xs font-bold bg-paper px-3 py-2 border-2 border-black brutalist-shadow-sm uppercase">
                                Geser untuk lihat menu lain &lt; &gt;
                            </div>
                            <div className="absolute bottom-12 right-12 z-30 bg-black text-white border-t-2 border-black px-4 py-2 rotate-6 pointer-events-none">
                                <span className="font-marker text-3xl">{product.sticker}</span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
}
