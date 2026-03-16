"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateInventoryItem, deleteInventoryItem } from "@/actions/inventory";
import { useRouter } from "next/navigation";

export default function EditInventoryItemPage({
    item,
    role = "TECNICO"
}: {
    item: any; // Using any to quickly scaffold, ideally typed with Prisma
    role?: string;
}) {
    const canEdit = role !== "TECNICO";
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await updateInventoryItem(item.id, formData);

            if (result && 'error' in result) {
                toast.error(result.error);
            } else {
                toast.success("Artículo actualizado exitosamente.");
            }
        });
    };

    const handleDelete = () => {
        if (!confirm("¿Estás seguro de eliminar este repuesto?")) return;

        startDeleteTransition(async () => {
            const result = await deleteInventoryItem(item.id);

            if (result && 'error' in result) {
                toast.error(result.error);
            } else {
                toast.success("Artículo eliminado.");
                router.push("/dashboard/inventory");
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/inventory" className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Editar Artículo</h1>
                        <p className="text-zinc-500 mt-1">Actualiza inventario o corrige datos.</p>
                    </div>
                </div>

                {canEdit && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
                        title="Eliminar artículo"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                    </button>
                )}
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
                                disabled={!canEdit}
                                defaultValue={item.code}
                                placeholder="Ej. B0SCH-R123"
                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white ${!canEdit && "opacity-70 cursor-not-allowed"}`}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Nombre del Artículo</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                disabled={!canEdit}
                                defaultValue={item.name}
                                placeholder="Ej. Resistencia Térmica 1200W"
                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white ${!canEdit && "opacity-70 cursor-not-allowed"}`}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Descripción (Opcional)</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            disabled={!canEdit}
                            defaultValue={item.description || ""}
                            placeholder="Detalles sobre compatibilidad o proveedor..."
                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white resize-none ${!canEdit && "opacity-70 cursor-not-allowed"}`}
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
                                    disabled={!canEdit}
                                    required
                                    defaultValue={item.price}
                                    placeholder="0.00"
                                    className={`w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white ${!canEdit && "opacity-70 cursor-not-allowed"}`}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="stock" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Stock Actual</label>
                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                disabled={!canEdit}
                                required
                                defaultValue={item.stock}
                                min="0"
                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white ${!canEdit && "opacity-70 cursor-not-allowed"}`}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="minStock" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Stock Mínimo</label>
                            <input
                                id="minStock"
                                name="minStock"
                                type="number"
                                disabled={!canEdit}
                                required
                                defaultValue={item.minStock}
                                min="0"
                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white ${!canEdit && "opacity-70 cursor-not-allowed"}`}
                            />
                        </div>
                    </div>

                    {canEdit && (
                        <div className="pt-4 flex items-center justify-end gap-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-8 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
