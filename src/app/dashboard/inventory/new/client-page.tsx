"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { createInventoryItem } from "@/actions/inventory";

export default function NewInventoryItemPage() {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await createInventoryItem(formData);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Artículo creado exitosamente.");
                // Redirect is handled in the server action if successful
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/inventory" className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Nuevo Artículo</h1>
                    <p className="text-zinc-500 mt-1">Ingresa los detalles del nuevo repuesto o insumo.</p>
                </div>
            </div>

            {/* Formulario */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                <form action={handleSubmit} className="flex flex-col gap-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="code" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Código (SKU)</label>
                            <input
                                id="code"
                                name="code"
                                type="text"
                                required
                                placeholder="Ej. B0SCH-R123"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Nombre del Artículo</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                placeholder="Ej. Resistencia Térmica 1200W"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Descripción (Opcional)</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Detalles sobre compatibilidad o proveedor..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="price" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Precio de Venta</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="stock" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Stock Inicial</label>
                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                required
                                defaultValue="0"
                                min="0"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="minStock" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Stock Mínimo (Alerta)</label>
                            <input
                                id="minStock"
                                name="minStock"
                                type="number"
                                required
                                defaultValue="5"
                                min="0"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
                        <Link
                            href="/dashboard/inventory"
                            className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-8 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                "Guardar Artículo"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
