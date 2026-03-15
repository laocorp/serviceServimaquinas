import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ReportsPage() {
    const reports = await prisma.workReport.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            technician: {
                select: { name: true }
            },
            workOrder: {
                include: {
                    customer: {
                        select: { firstName: true, lastName: true }
                    }
                }
            }
        }
    });

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Informes Técnicos</h1>
                    <p className="text-zinc-500 mt-1">Historial de diagnósticos y reparaciones completadas.</p>
                </div>
            </div>

            {/* Lista de Informes */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Orden</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Fecha</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Cliente / Equipo</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Técnico</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300">Diagnóstico</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-zinc-300 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        No hay informes técnicos registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-medium text-slate-900 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded text-xs">
                                                {report.workOrder.trackingCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                            {new Date(report.createdAt).toLocaleDateString('es-CO')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 dark:text-zinc-200">
                                                {report.workOrder.customer.firstName} {report.workOrder.customer.lastName}
                                            </div>
                                            <div className="text-xs text-zinc-500">
                                                {report.workOrder.deviceBrand} {report.workOrder.deviceModel}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                                            {report.technician.name}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            <div className="text-xs truncate max-w-[200px]" title={report.diagnosis}>
                                                {report.diagnosis}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/orders/${report.workOrderId}`} className="text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors">
                                                Ver Detalle →
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
