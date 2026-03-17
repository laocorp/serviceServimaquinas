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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Directorio de Clientes</h1>
                    <p className="text-zinc-500 mt-1">Gestiona los perfiles del CRM y fidelización VIP.</p>
                </div>

                <Link href="/dashboard/customers/new" className="flex items-center justify-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100 w-full sm:w-auto">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                    <table className="w-full text-left text-sm min-w-[800px]">
                        <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Cliente</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Identificación</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Contacto</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300 text-center">Puntos VIP</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Estado</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                                        Aún no hay clientes registrados en el directorio.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer: any) => (
                                    <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-zinc-200">
                                                {customer.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                                            {customer.dni || "---"}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            <div className="font-medium">{customer.email || "Sin email"}</div>
                                            <div className="text-[11px] opacity-70">{customer.phone || "Sin teléfono"}</div>
                                        </td>
                                        <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400 text-center">
                                            {customer.loyaltyPoints} <span className="text-[9px] uppercase tracking-tighter">pts</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.isVIP ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                                                    🌟 VIP
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                                                    Standard
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/customers/${customer.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                                Perfil
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
