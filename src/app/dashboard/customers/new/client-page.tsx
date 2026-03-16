"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { createCustomer } from "@/actions/customers";

export default function NewCustomerClient() {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await createCustomer(formData);

            if (result && 'error' in result) {
                toast.error(result.error);
            } else {
                toast.success("Cliente guardado en el CRM.");
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/customers" className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Registrar Cliente</h1>
                    <p className="text-zinc-500 mt-1">Crea un nuevo perfil para el directorio CRM.</p>
                </div>
            </div>

            {/* Formulario */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                <form action={handleSubmit} className="flex flex-col gap-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="firstName" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Nombre *</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="lastName" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Apellido *</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="documentId" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">RUC / CI</label>
                            <input
                                id="documentId"
                                name="documentId"
                                type="text"
                                placeholder="Ej. 123456789-0"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Correo Electrónico</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="cliente@correo.com"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="phone" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Teléfono</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl mt-2">
                        <input
                            id="isVIP"
                            name="isVIP"
                            type="checkbox"
                            className="w-5 h-5 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <div>
                            <label htmlFor="isVIP" className="text-sm font-bold text-amber-800 dark:text-amber-400 cursor-pointer">Cliente VIP (Marca Exclusiva)</label>
                            <p className="text-xs text-amber-700/70 dark:text-amber-500/70 mt-0.5">Asigna 100 puntos de lealtad automáticos y privilegios en órdenes.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <label htmlFor="notes" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Notas de Agente CRM</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            placeholder="Preferencias, historial de equipos, direcciones..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white resize-none"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
                        <Link
                            href="/dashboard/customers"
                            className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-8 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Guardando..." : "Registrar Cliente"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
