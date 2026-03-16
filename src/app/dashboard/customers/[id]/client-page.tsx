"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateCustomer, deleteCustomer } from "@/actions/customers";
import { useRouter } from "next/navigation";

export default function EditCustomerPage({
    customer
}: {
    customer: any;
}) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await updateCustomer(customer.id, formData);

            if (result && 'error' in result) {
                toast.error(result.error);
            } else {
                toast.success("Perfil actualizado exitosamente.");
            }
        });
    };

    const handleDelete = () => {
        if (!confirm("¿Estás seguro de eliminar a este cliente? Esto no se puede deshacer y fallará si el cliente tiene órdenes previas.")) return;

        startDeleteTransition(async () => {
            const result = await deleteCustomer(customer.id);

            if (result && 'error' in result) {
                toast.error(result.error);
            } else {
                toast.success("Cliente eliminado.");
                router.push("/dashboard/customers");
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/customers" className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Detalles de Cliente</h1>
                        <p className="text-zinc-500 mt-1">Gestiona la información y nivel de lealtad.</p>
                    </div>
                </div>

                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
                    title="Eliminar cliente"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                </button>
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
                                defaultValue={customer.firstName}
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
                                defaultValue={customer.lastName}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Correo Electrónico</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={customer.email || ""}
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
                                defaultValue={customer.phone || ""}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    {/* KPI Mini-Dashboard for existing customer */}
                    <div className="flex gap-4 items-center">
                        <div className="flex bg-slate-100 dark:bg-zinc-800/50 rounded-xl px-5 py-3">
                            <div>
                                <p className="text-xs font-semibold text-zinc-500">Puntos Acumulados</p>
                                <p className="text-lg font-black text-slate-900 dark:text-zinc-100">{customer.loyaltyPoints} PTS</p>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl">
                            <input
                                id="isVIP"
                                name="isVIP"
                                type="checkbox"
                                defaultChecked={customer.isVIP}
                                className="w-5 h-5 text-amber-500 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
                            />
                            <label htmlFor="isVIP" className="text-sm font-bold text-amber-800 dark:text-amber-400 cursor-pointer">
                                Cliente VIP (Marca Exclusiva)
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="notes" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Notas de Agente CRM</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={4}
                            defaultValue={customer.notes || ""}
                            placeholder="Preferencias, historial de equipos, direcciones..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white resize-none"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-8 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
