import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CustomersPage() {
    const session = await auth();
    if (!session || session.user.role === "TECNICO") {
        redirect("/dashboard");
    }
    const customers = await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Directorio de Clientes</h1>
                    <p className="text-zinc-500 mt-1">Gestiona los perfiles del CRM y fidelización VIP.</p>
                </div>

                <Link href="/dashboard/customers/new" className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    Nuevo Cliente
                </Link>
            </div>

            {/* Tabla de Clientes */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Cliente</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Identificación</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Contacto</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Puntos VIP</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Estado</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        Aún no hay clientes registrados en el directorio.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer: any) => (
                                    <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 dark:text-zinc-200">
                                                {customer.firstName} {customer.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            {customer.documentId || "---"}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            <div>{customer.email || "Sin email"}</div>
                                            <div className="text-xs">{customer.phone || "Sin teléfono"}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                                            {customer.loyaltyPoints} pts
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.isVIP ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                                                    🌟 VIP Exclusive
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                                                    Estándar
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/customers/${customer.id}`} className="text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors p-2 font-medium">
                                                Ver Perfil
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
