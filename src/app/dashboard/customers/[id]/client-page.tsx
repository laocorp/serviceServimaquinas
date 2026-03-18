"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCustomer, deleteCustomer, registerTool, performMaintenance } from "@/actions/customers";
import { useRouter } from "next/navigation";

export default function EditCustomerPage({
    customer
}: {
    customer: any;
}) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<"info" | "tools">("info");
    const [selectedTool, setSelectedTool] = useState<any>(null);
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

    const handleAddTool = async (formData: FormData) => {
        startTransition(async () => {
            const result = await registerTool(customer.id, formData);
            if (result && 'error' in result) {
                toast.error(result.error);
            } else {
                toast.success("Herramienta registrada y vinculada.");
                (document.getElementById("add-tool-form") as HTMLFormElement)?.reset();
            }
        });
    };

    const handleMaintenance = async (formData: FormData) => {
        if (!selectedTool) return;
        startTransition(async () => {
            const result = await performMaintenance(selectedTool.id, formData);
            if (result && 'error' in result) {
                toast.error(result.error);
            } else {
                toast.success("Mantenimiento registrado y calendario actualizado.");
                setSelectedTool(null);
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
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {/* Header / Top Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/customers" className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{customer.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-zinc-500 rounded-lg uppercase tracking-tighter">ID: {customer.dni || 'S/N'}</span>
                            {customer.isVIP && <span className="text-[10px] font-black bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">🌟 CLIENTE VIP</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-4 py-2 rounded-2xl flex flex-col items-end">
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Puntos Acumulados</span>
                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 -mt-1">{customer.loyaltyPoints} <small className="text-xs font-bold opacity-50">PTS</small></span>
                    </div>

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all disabled:opacity-50"
                        title="Eliminar cliente"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("info")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "info" ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                >
                    Información Personal
                </button>
                <button
                    onClick={() => setActiveTab("tools")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "tools" ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                >
                    Herramientas ({customer.tools?.length || 0})
                </button>
            </div>

            {/* TAB: INFORMACIÓN */}
            {activeTab === "info" && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm animate-in fade-in duration-300">
                    <form action={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Nombre Completo</label>
                                <input name="name" type="text" required defaultValue={customer.name} className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-medium" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">DNI / RUC</label>
                                <input name="dni" type="text" defaultValue={customer.dni || ""} className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-mono" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Correo Electrónico</label>
                                <input name="email" type="email" defaultValue={customer.email || ""} className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Teléfono</label>
                                <input name="phone" type="tel" defaultValue={customer.phone || ""} className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Dirección</label>
                            <input name="address" type="text" defaultValue={customer.address || ""} className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white" />
                        </div>

                        <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl flex items-center gap-3">
                            <input id="isVIP" name="isVIP" type="checkbox" defaultChecked={customer.isVIP} className="w-5 h-5 text-amber-500 rounded-lg border-gray-300 focus:ring-amber-500 cursor-pointer" />
                            <label htmlFor="isVIP" className="text-sm font-black text-amber-800 dark:text-amber-400 cursor-pointer">Activar Estatus VIP (Marca Exclusiva)</label>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/50">
                            <button type="submit" disabled={isPending} className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-8 py-3.5 rounded-2xl text-sm font-black shadow-sm hover:shadow-md transition-all hover:scale-[1.02] disabled:opacity-50">
                                {isPending ? "Guardando..." : "Actualizar Perfil"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB: HERRAMIENTAS */}
            {activeTab === "tools" && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-300">
                    {/* Add Tool Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                        <h2 className="text-lg font-black text-slate-800 dark:text-zinc-200 mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 1-2.83-2.83l-3.94 3.6z" /><path d="m21 14-8.5-8.5-4 4 1 1-2 2-2-2-1 1 3 3-1 1-1-1-1 1 3 3-1 1-1-1-1 1 5 5 1-1-1-1 1-1 3 3 1-1-2-2 2-2 1 1 4-4" /><circle cx="4.5" cy="19.5" r="2.5" /></svg>
                            </div>
                            Vincular Equipo o Registrar Venta
                        </h2>
                        <form id="add-tool-form" action={handleAddTool} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nombre del Equipo</label>
                                <input name="name" required placeholder="Ej: Amoladora, Taladro" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Marca</label>
                                <input name="brand" required placeholder="Ej: Bosch, Makita" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Serial Number</label>
                                <input name="serialNumber" required placeholder="XXXXXXXXXX" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white font-mono" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Condición</label>
                                <select name="condition" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white font-bold">
                                    <option value="USADA">USADA (En Reparación)</option>
                                    <option value="NUEVA">NUEVA (Vendido aquí)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Modelo (Opcional)</label>
                                <input name="model" placeholder="Ej: GWS 750" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                                    Registrar Equipo
                                </button>
                            </div>
                        </form>
                        <p className="mt-4 text-[10px] text-zinc-400 font-medium italic">Nota: Si es marca **BOSCH** y condición **NUEVA**, se activará automáticamente el programa de mantenimiento preventivo.</p>
                    </div>

                    {/* Tools Detailed List */}
                    <div className="flex flex-col gap-4">
                        {(!customer.tools || customer.tools.length === 0) ? (
                            <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 italic">No hay equipos registrados.</div>
                        ) : (
                            customer.tools.map((tool: any) => (
                                <div key={tool.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4 group hover:border-blue-500/30 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 1-2.83-2.83l-3.94 3.6z" /><path d="m21 14-8.5-8.5-4 4 1 1-2 2-2-2-1 1 3 3-1 1-1-1-1 1 3 3-1 1-1-1-1 1 5 5 1-1-1-1 1-1 3 3 1-1-2-2 2-2 1 1 4-4" /><circle cx="4.5" cy="19.5" r="2.5" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 dark:text-white leading-tight">{tool.name}</h3>
                                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{tool.brand} {tool.model}</p>
                                                <p className="text-[10px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">S/N: {tool.serialNumber}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {tool.nextMaintenance && (
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Próximo Service</p>
                                                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                                        {new Date(tool.nextMaintenance).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setSelectedTool(tool)}
                                                className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-slate-900/10"
                                            >
                                                Registrar Mantenimiento
                                            </button>
                                        </div>
                                    </div>

                                    {/* History Mini Timeline */}
                                    {tool.maintenanceLogs?.length > 0 && (
                                        <div className="mt-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Historial Preventivo (Intervenciones)</p>
                                            <div className="flex flex-col gap-2">
                                                {tool.maintenanceLogs.map((log: any) => (
                                                    <div key={log.id} className="flex gap-4 text-[11px] items-start p-3 bg-slate-50/50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 hover:bg-white dark:hover:bg-zinc-800 transition-all">
                                                        <span className="font-black text-zinc-400 whitespace-nowrap bg-white dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800">{new Date(log.serviceDate).toLocaleDateString()}</span>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-slate-800 dark:text-zinc-200">{log.description}</p>
                                                            {log.observations && <p className="text-zinc-500 italic mt-1 font-medium">{log.observations}</p>}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 whitespace-nowrap">Service OK</span>
                                                            <span className="text-[8px] font-bold text-zinc-400">Próximo: {new Date(log.nextDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* MAINTENANCE MODAL */}
            {selectedTool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
                                    </div>
                                    Registrar Servicio Técnico
                                </h3>
                                <button onClick={() => setSelectedTool(null)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 italic">Equipo Identificado</p>
                                <p className="font-bold text-slate-800 dark:text-zinc-200">{selectedTool.brand} {selectedTool.model} <small className="text-zinc-400 font-normal ml-2">S/N: {selectedTool.serialNumber}</small></p>
                            </div>
                        </div>

                        <form action={handleMaintenance} className="p-8 flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Descripción del Trabajo *</label>
                                <textarea name="description" required rows={2} placeholder="Ej: Limpieza pro, cambio de carbones, ajuste mecánico..." className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white font-medium" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Observaciones Técnicas</label>
                                <input name="observations" placeholder="Estado de rodamientos, desgaste de inducido..." className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Próximo Mantenimiento *</label>
                                <input
                                    name="nextDate"
                                    type="date"
                                    required
                                    defaultValue={new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white font-black"
                                />
                                <p className="text-[9px] text-zinc-400 italic">Sugerencia: 3 meses para equipos industriales / Bosch.</p>
                            </div>

                            <button type="submit" disabled={isPending} className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50">
                                {isPending ? "Registrando en Historial..." : "Confirmar Service y Agendar Próximo"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
