"use client";

import { useState, useTransition } from "react";
import { createStoreCategory } from "@/actions/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CategoryManager({ initialCategories }: { initialCategories: any[] }) {
    const [name, setName] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        startTransition(async () => {
            const res = await createStoreCategory(name);
            if (res && 'error' in res) {
                toast.error(res.error);
            } else if (res && 'success' in res) {
                toast.success(res.success);
                setName("");
                router.refresh();
            }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Formulario */}
            <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#0073CF]">Nueva Categoría</h2>
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Nombre</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ej: Maquinaria Industrial"
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-[#0073CF] outline-none transition-all"
                            />
                        </div>
                        <button disabled={isPending} type="submit" className="w-full py-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                            {isPending ? "Creando..." : "Crear Categoría"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Lista */}
            <div className="flex flex-col gap-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">Categorías Existentes</h2>
                <div className="flex flex-wrap gap-2">
                    {initialCategories.length === 0 ? (
                        <p className="text-zinc-500 italic text-sm text-center w-full py-8 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl">No hay categorías aún</p>
                    ) : (
                        initialCategories.map(cat => (
                            <span key={cat.id} className="px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-slate-700 dark:text-zinc-200 shadow-sm">
                                {cat.name}
                            </span>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
