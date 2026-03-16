"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/store";
import { toast } from "sonner";

export function ProductForm({ categories, initialData }: { categories: any[], initialData?: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [imageUrl, setImageUrl] = useState(initialData?.image || "");
    const [isPromotion, setIsPromotion] = useState(initialData?.isPromotion || false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("image", imageUrl);
        formData.append("isPromotion", isPromotion.toString());

        startTransition(async () => {
            const res = initialData
                ? await updateProduct(initialData.id, formData)
                : await createProduct(formData);

            if (res.error) toast.error(res.error);
            else {
                toast.success(res.success);
                router.push("/dashboard/store");
                router.refresh();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Info Básica */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-5">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#0073CF]">Información General</h2>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight">Nombre del Producto</label>
                        <input name="name" defaultValue={initialData?.name} required placeholder="Ej: Rotomartillo Bosch GBH 2-24 D" className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-[#0073CF] outline-none transition-all" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight">Descripción Detallada</label>
                        <textarea name="description" defaultValue={initialData?.description} rows={5} required placeholder="Especificaciones técnicas, potencia, qué incluye, etc." className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-[#0073CF] outline-none transition-all resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight">Categoría</label>
                            <select name="categoryId" defaultValue={initialData?.categoryId || ""} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-[#0073CF] outline-none transition-all">
                                <option value="">Seleccionar categoría...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight">Stock Inicial</label>
                            <input name="stock" type="number" defaultValue={initialData?.stock || 0} required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-[#0073CF] outline-none transition-all" />
                        </div>
                    </div>
                </div>

                {/* Precios y Promo */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-5">
                    <h2 className="text-sm font-black uppercase tracking-widest text-red-600">Precios y Oferta</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-tight">Precio Normal ($)</label>
                            <input name="price" type="number" step="0.01" defaultValue={initialData?.price} required className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-lg font-bold" />
                        </div>

                        <div className="flex flex-col gap-4 border-l border-zinc-100 dark:border-zinc-800 pl-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={isPromotion} onChange={e => setIsPromotion(e.target.checked)} className="w-5 h-5 rounded-md border-zinc-300 text-red-600 focus:ring-red-500" />
                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-red-600 transition-colors">Activar Promoción / Oferta</span>
                            </label>

                            {isPromotion && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-red-500 uppercase tracking-tight">Precio de Oferta ($)</label>
                                    <input name="promoPrice" type="number" step="0.01" defaultValue={initialData?.promoPrice} className="w-full px-4 py-3 rounded-xl border-2 border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20 text-red-600 text-xl font-black" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar — Imagen y Acción */}
            <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4 text-center">
                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Imagen del Producto</h2>

                    <div className="aspect-square rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden relative group">
                        {imageUrl ? (
                            <>
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setImageUrl("")} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold">Quitar Imagen</button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-zinc-300">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Sin Imagen</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {/* Aquí integraríamos el UploadButton similar al de reportes */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const formData = new FormData();
                                formData.append("file", file);
                                const res = await fetch("/api/upload", { method: "POST", body: formData });
                                const data = await res.json();
                                if (data.url) setImageUrl(data.url);
                                else toast.error("Error al subir imagen");
                            }}
                            className="hidden"
                            id="product-image"
                        />
                        <label htmlFor="product-image" className="cursor-pointer py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                            {imageUrl ? "Cambiar Imagen" : "Subir Imagen"}
                        </label>
                        <p className="text-[10px] text-zinc-400">Recomendado: Fondo blanco, 1000x1000px</p>
                    </div>
                </div>

                <button type="submit" disabled={isPending} className="w-full py-5 rounded-3xl bg-[#0073CF] text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 transition-all flex items-center justify-center gap-3">
                    {isPending ? "Procesando..." : initialData ? "Guardar Cambios" : "Publicar Producto"}
                    {!isPending && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    )}
                </button>
                <button type="button" onClick={() => router.back()} className="text-zinc-400 text-sm font-bold hover:text-zinc-600 transition-colors">Cancelar</button>
            </div>
        </form>
    );
}
