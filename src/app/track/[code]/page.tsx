import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrderStatus } from "@prisma/client";

// Mapeo Visual
const statusConfig: Record<OrderStatus, { label: string, color: string, description: string, step: number }> = {
    PENDIENTE: { label: "Recibido", color: "bg-slate-200 text-slate-800", description: "Tu equipo ha sido ingresado al sistema y está a la espera de un técnico.", step: 1 },
    EN_REVISION: { label: "En Revisión", color: "bg-amber-200 text-amber-800", description: "Un técnico especializado está diagnosticando la falla actual del equipo.", step: 2 },
    EN_REPARACION: { label: "En Reparación", color: "bg-blue-200 text-blue-800", description: "Se están aplicando los correctivos y/o repuestos necesarios.", step: 3 },
    REPARADO: { label: "Reparado", color: "bg-emerald-200 text-emerald-800", description: "El equipo ha sido reparado con éxito y está listo para ser retirado.", step: 4 },
    ENTREGADO: { label: "Entregado", color: "bg-indigo-200 text-indigo-800", description: "El equipo ya fue devuelto al cliente. Gracias por preferirnos.", step: 5 },
    CANCELADO: { label: "Cancelado", color: "bg-red-200 text-red-800", description: "La orden fue cancelada o el equipo fue devuelto sin reparación.", step: 0 },
};

export default async function PublicTrackingPage(props: { params: Promise<{ code: string }> }) {
    const params = await props.params;
    const trackingCode = params.code;

    const order = await prisma.workOrder.findUnique({
        where: { trackingCode },
        include: {
            customer: { select: { firstName: true, lastName: true, isVIP: true } },
            report: true
        }
    });

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col items-center pt-24 px-6 pb-12">

            {/* Botón Volver */}
            <div className="w-full max-w-2xl mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-slate-900 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Volver a la página principal
                </Link>
            </div>

            <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-2xl">
                {/* Header Ticket */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-zinc-100 pb-8 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-mono font-bold tracking-widest">
                                {trackingCode}
                            </div>
                            {order?.customer.isVIP && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold uppercase">
                                    Cliente VIP
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Rastreo de Reparación</h1>
                        {order && (
                            <p className="text-zinc-500 mt-2 font-medium">
                                Para: {order.customer.firstName} {order.customer.lastName}
                            </p>
                        )}
                    </div>

                    {order && (
                        <div className="text-right">
                            <p className="text-sm font-semibold text-zinc-400">FECHA DE INGRESO</p>
                            <p className="font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
                        </div>
                    )}
                </div>

                {!order ? (
                    // NOT FOUND
                    <div className="text-center py-12 flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Código No Encontrado</h2>
                        <p className="text-zinc-500 max-w-md">El código <strong>{trackingCode}</strong> no existe en nuestro sistema. Verifica en el recibo entregado por recepción e inténtalo nuevamente.</p>
                    </div>
                ) : (
                    // FOUND
                    <div className="flex flex-col gap-10">

                        {/* Datos del Equipo */}
                        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Equipo</p>
                                <p className="font-bold text-slate-900 text-lg">{order.deviceBrand} {order.deviceModel}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estado</p>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase ${statusConfig[order.status].color}`}>
                                    {statusConfig[order.status].label}
                                </div>
                            </div>
                        </div>

                        {/* Status Tracker */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Progreso del Servicio</h3>

                            {order.status === "CANCELADO" ? (
                                <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                                    <p className="font-bold text-red-900">Servicio Cancelado</p>
                                    <p className="text-sm text-red-700 mt-1">{statusConfig.CANCELADO.description}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
                                    {["PENDIENTE", "EN_REVISION", "EN_REPARACION", "REPARADO", "ENTREGADO"].map((statusKey, index) => {
                                        const stepConfig = statusConfig[statusKey as OrderStatus];
                                        const currentStep = statusConfig[order.status].step;
                                        const isCompleted = stepConfig.step <= currentStep;
                                        const isCurrent = stepConfig.step === currentStep;

                                        return (
                                            <div key={statusKey} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                {/* Icon / Node */}
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isCompleted ? 'bg-slate-900 shadow-md' : 'bg-slate-300'}`}>
                                                    {isCompleted && (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Text Content */}
                                                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl transition-colors">
                                                    <h4 className={`font-bold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {stepConfig.label}
                                                    </h4>
                                                    <p className={`text-sm mt-1 ${isCurrent ? 'text-blue-800/70' : isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        {stepConfig.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Informe Técnico si existe */}
                        {order.report && (
                            <div className="mt-4 pt-8 border-t border-zinc-100">
                                <div className="flex items-center gap-3 text-slate-900 mb-6">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                    <h3 className="text-xl font-bold">Informe Técnico Oficial</h3>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Diagnóstico Definitivo</p>
                                        <p className="text-sm font-medium text-slate-800">{order.report.diagnosis}</p>
                                    </div>
                                    {order.report.recommendations && (
                                        <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Sugerencias y Recomendaciones</p>
                                            <p className="text-sm font-medium text-slate-800">{order.report.recommendations}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
