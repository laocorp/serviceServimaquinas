"use client";

import Link from "next/link";
import { useTransition, useState, useRef } from "react";
import { toast } from "sonner";
import { updateOrderStatus, addInventoryItemToOrder, createWorkReport } from "@/actions/orders";
import { useReactToPrint } from "react-to-print";
import QRCode from "react-qr-code";
import ImageUpload from "@/components/forms/ImageUpload";

const STATUS_COLORS: any = {
    PENDIENTE: "bg-slate-100 text-slate-700",
    EN_REVISION: "bg-amber-100 text-amber-800",
    EN_REPARACION: "bg-blue-100 text-blue-800",
    REPARADO: "bg-emerald-100 text-emerald-800",
    ENTREGADO: "bg-indigo-100 text-indigo-800",
    CANCELADO: "bg-red-100 text-red-800",
};

export default function OrderDetailClient({
    role,
    order,
    inventoryItems,
    technicians,
    currentUserId,
    settings
}: {
    role: string;
    order: any;
    inventoryItems: any[];
    technicians: any[];
    currentUserId: string;
    settings: any;
}) {
    const [isPending, startTransition] = useTransition();

    // Selected State for Modals
    const [selectedStatus, setSelectedStatus] = useState(order.status);
    const [selectedTech, setSelectedTech] = useState(order.technicianId || "");

    // Selected Inventory Item
    const [selectedPart, setSelectedPart] = useState("");
    const [partQty, setPartQty] = useState(1);

    // Images for Report
    const [reportImages, setReportImages] = useState<string[]>([]);

    // Print Refs
    const orderPrintRef = useRef<HTMLDivElement>(null);
    const reportPrintRef = useRef<HTMLDivElement>(null);

    const handlePrintOrder = useReactToPrint({ contentRef: orderPrintRef });
    const handlePrintReport = useReactToPrint({ contentRef: reportPrintRef });

    // WhatsApp Message
    const getWaLink = () => {
        let phone = order.customer.phone || "";
        phone = phone.replace(/\D/g, '');
        if (!phone) return "#";
        // Usa la URL configurada globalmente
        const publicUrl = settings?.publicUrl || "https://servimaquinas.com";
        const message = `Hola ${order.customer.firstName}, te contactamos de ${settings?.companyName || "Servimaquinas"}.\nEste es el estado de tu equipo ${order.deviceBrand} ${order.deviceModel}.\n\nEstado actual: *${order.status}*.\n\nPuedes rastrear tu orden ingresando el código *${order.trackingCode}* en nuestro portal web: ${publicUrl}/rastreo`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    const handleUpdateStatus = () => {
        startTransition(async () => {
            const result = await updateOrderStatus(order.id, selectedStatus, selectedTech || undefined);
            if (result?.error) toast.error(result.error);
            else toast.success("Estado de la orden actualizado.");
        });
    };

    const handleAddPart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPart || partQty < 1) return;

        startTransition(async () => {
            const result = await addInventoryItemToOrder(order.id, selectedPart, partQty);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Repuesto agregado a la cuenta de la orden.");
                setSelectedPart("");
                setPartQty(1);
            }
        });
    };

    const handleReport = async (formData: FormData) => {
        // Adjuntar imágenes al FormData como string JSON
        formData.append("images", JSON.stringify(reportImages));

        startTransition(async () => {
            const result = await createWorkReport(order.id, currentUserId, formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Informe Técnico guardado y orden marcada como REPARADA.");
            }
        });
    };

    const totalPartsCost = order.items.reduce((acc: number, item: any) => acc + (item.quantity * item.priceAtTime), 0);

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/orders" className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Orden {order.trackingCode}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-zinc-500 mt-1">Recibida el {new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => handlePrintOrder()}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        PDF Ingreso
                    </button>
                    {order.report && (
                        <button
                            onClick={() => handlePrintReport()}
                            className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            PDF Técnico
                        </button>
                    )}
                    {order.customer.phone && (
                        <a
                            href={getWaLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#128C7E] px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                            Notificar al Cliente
                        </a>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Data & Report */}
                <div className="lg:col-span-2 flex flex-col gap-8">

                    {/* INFO PANEL */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">Información del Servicio</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Cliente</p>
                                <p className="font-semibold text-slate-900 dark:text-zinc-200">{order.customer.firstName} {order.customer.lastName}</p>
                                <p className="text-sm text-zinc-500">{order.customer.phone || order.customer.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Equipo</p>
                                <p className="font-semibold text-slate-900 dark:text-zinc-200">{order.deviceBrand} {order.deviceModel}</p>
                                <p className="text-sm font-mono text-zinc-500">S/N: {order.deviceSerial || "No registrado"}</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs font-bold text-slate-700 dark:text-zinc-400 mb-2">Falla Reportada Inicialmente:</p>
                            <p className="text-sm text-slate-900 dark:text-zinc-300 italic">"{order.reportedIssue}"</p>
                        </div>
                    </div>

                    {/* REPORT PANEL OR FORM */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">Informe Técnico</h3>

                        {order.report ? (
                            // MOSTRAR REPORTE
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-2">Diagnóstico Definitivo:</p>
                                    <p className="text-sm text-emerald-900 dark:text-emerald-100">{order.report.diagnosis}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-400 mb-2">Acciones Realizadas:</p>
                                    <p className="text-sm text-slate-900 dark:text-zinc-300 whitespace-pre-wrap">{order.report.actionsTaken}</p>
                                </div>
                                {order.report.recommendations && (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                        <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-2">Recomendaciones al Cliente:</p>
                                        <p className="text-sm text-amber-900 dark:text-emerald-100">{order.report.recommendations}</p>
                                    </div>
                                )}

                                {/* GALERÍA DE IMÁGENES */}
                                {order.report.images && order.report.images.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter mb-3">Evidencias Fotográficas</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {order.report.images.map((img: string, idx: number) => (
                                                <a key={idx} href={img} target="_blank" rel="noreferrer" className="aspect-video rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 hover:ring-2 hover:ring-blue-500 transition-all">
                                                    <img src={img} alt="Evidencia" className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-zinc-400 text-right mt-2">Firmado por: {order.report.technician.name}</p>
                            </div>
                        ) : role !== "RECEPCION" ? (
                            // FORMULARIO DE REPORTE (SOLO TÉCNICOS Y ADMIN)
                            <form action={handleReport} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="diagnosis" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Diagnóstico Técnico *</label>
                                    <textarea
                                        id="diagnosis" name="diagnosis" rows={2} required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                                        placeholder="¿Cuál fue el problema real encontrado?"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="actionsTaken" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Fijaciones / Procedimientos Realizados *</label>
                                    <textarea
                                        id="actionsTaken" name="actionsTaken" rows={3} required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                                        placeholder="Describe detalladamente el arreglo..."
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="recommendations" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Recomendaciones (Opcional)</label>
                                    <textarea
                                        id="recommendations" name="recommendations" rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                                        placeholder="Garantía, consejos de uso, etc."
                                    />
                                </div>

                                <div className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/30">
                                    <ImageUpload onImagesChange={(urls) => setReportImages(urls)} />
                                </div>

                                <div className="mt-2 flex justify-end">
                                    <button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow transition-colors disabled:opacity-50">
                                        Guardar Informe y Marcar como REPARADO
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-xs text-zinc-500 italic py-4">El técnico asignado aún no ha subido el informe de trabajo.</p>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Controls & Inventory */}
                <div className="flex flex-col gap-8">

                    {/* ESTADO Y ASIGNACIÓN */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">Control de Orden</h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 mb-1 block">Estado del Equipo</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm dark:text-white outline-none"
                                >
                                    {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 mb-1 block">Técnico Asignado</label>
                                <select
                                    value={selectedTech}
                                    onChange={(e) => setSelectedTech(e.target.value)}
                                    className="w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm dark:text-white outline-none"
                                >
                                    <option value="">-- Sin asignar --</option>
                                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handleUpdateStatus}
                                disabled={isPending || (selectedStatus === order.status && selectedTech === (order.technicianId || ""))}
                                className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {isPending ? "Aplicando..." : "Actualizar Orden"}
                            </button>
                        </div>
                    </div>

                    {/* REPUESTOS USADOS */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Repuestos Cargados</h3>
                            <span className="text-sm font-black text-slate-900 dark:text-zinc-100">${totalPartsCost.toLocaleString('es-CO')}</span>
                        </div>

                        {/* Lista de repuestos */}
                        <div className="flex flex-col gap-3 mb-6">
                            {order.items.length === 0 ? (
                                <p className="text-xs text-zinc-400 italic text-center py-2">No se han usado repuestos.</p>
                            ) : (
                                order.items.map((i: any) => (
                                    <div key={i.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-zinc-200">{i.inventoryItem.name}</p>
                                            <p className="text-xs text-zinc-500">{i.quantity} uds x ${i.priceAtTime.toLocaleString('es-CO')}</p>
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-zinc-300">${(i.quantity * i.priceAtTime).toLocaleString('es-CO')}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Añadir repuesto */}
                        {role !== "RECEPCION" && order.status !== "ENTREGADO" && order.status !== "CANCELADO" && !order.report && (
                            <form onSubmit={handleAddPart} className="flex flex-col gap-3 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                                <p className="text-xs font-bold text-slate-900 dark:text-zinc-300">Asignar Repuesto del Inventario</p>
                                <select
                                    required
                                    value={selectedPart}
                                    onChange={(e) => setSelectedPart(e.target.value)}
                                    className="w-full p-2 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm dark:text-white outline-none"
                                >
                                    <option value="" disabled>Seleccionar pieza (Stock)...</option>
                                    {inventoryItems.map(item => (
                                        <option key={item.id} value={item.id} disabled={item.stock === 0}>
                                            {item.name} (Quedan: {item.stock}) - ${item.price}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <input
                                        type="number" min="1" required
                                        value={partQty}
                                        onChange={(e) => setPartQty(parseInt(e.target.value))}
                                        className="w-20 p-2 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-center dark:text-white outline-none"
                                    />
                                    <button type="submit" disabled={isPending} className="flex-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 border border-blue-200 dark:border-blue-900 font-bold rounded-lg text-sm transition-colors hover:bg-blue-100 hover:dark:bg-blue-500/20">
                                        + Cargar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                </div>
            </div>

            {/* HIDDEN PRINTABLES */}
            <div style={{ display: 'none' }}>
                <div ref={orderPrintRef} className="p-10 font-sans bg-white text-black w-[800px] h-[1100px]">
                    <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900">{settings?.companyName || "Servimaquinas"}</h2>
                            {settings?.documentId && <p className="text-sm font-semibold text-gray-500 mt-1">RUC/NIT: {settings.documentId}</p>}
                            <p className="text-sm text-gray-500 mt-1">Orden de Trabajo (Ingreso)</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold bg-slate-100 px-3 py-1 rounded-lg">#{order.trackingCode}</p>
                            <p className="text-xs text-gray-500 mt-2">Fecha: {new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-sm uppercase font-bold text-gray-400 mb-2">Datos del Cliente</h3>
                            <p className="font-bold text-lg">{order.customer.firstName} {order.customer.lastName}</p>
                            {order.customer.documentId && <p className="text-sm">Doc: {order.customer.documentId}</p>}
                            <p className="text-sm text-gray-600">{order.customer.phone || 'Sin teléfono'}</p>
                            <p className="text-sm text-gray-600">{order.customer.email || 'Sin email'}</p>
                        </div>
                        <div>
                            <h3 className="text-sm uppercase font-bold text-gray-400 mb-2">Información del Equipo</h3>
                            <p className="font-bold text-lg">{order.deviceBrand} {order.deviceModel}</p>
                            <p className="text-sm text-gray-600">S/N: {order.deviceSerial || 'No especificado'}</p>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-sm uppercase font-bold text-gray-400 mb-2">Motivo de Ingreso / Falla Reportada</h3>
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl min-h-[100px]">
                            <p className="text-black italic">"{order.reportedIssue}"</p>
                        </div>
                    </div>

                    <div className="mt-auto flex justify-between items-end border-t border-gray-200 pt-8">
                        <div className="w-[300px]">
                            <div className="border-b border-black mb-2"></div>
                            <p className="text-xs font-bold text-center">Firma del Cliente (Acepta Condiciones)</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-xs font-bold text-gray-500">Escanea para rastrear tu orden:</p>
                            <QRCode value={`${settings?.publicUrl || "https://servimaquinas.com"}/track/${order.trackingCode}`} size={120} />
                            <p className="text-xs font-bold">{order.trackingCode}</p>
                        </div>
                    </div>
                </div>

                {order.report && (
                    <div ref={reportPrintRef} className="p-10 font-sans bg-white text-black w-[800px] h-[1100px]">
                        <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">{settings?.companyName || "Servimaquinas"}</h2>
                                {settings?.documentId && <p className="text-sm font-semibold text-gray-500 mt-1">RUC/NIT: {settings.documentId}</p>}
                                <p className="text-sm text-gray-500 mt-1">Informe Técnico de Mantenimiento</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold bg-slate-100 px-3 py-1 rounded-lg">#{order.trackingCode}</p>
                                <p className="text-xs text-gray-500 mt-2">Fecha Entrega: {new Date(order.report.createdAt).toLocaleDateString('es-CO')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-sm uppercase font-bold text-gray-400 mb-2">Cliente</h3>
                                <p className="font-bold text-lg">{order.customer.firstName} {order.customer.lastName}</p>
                                <p className="text-sm text-gray-600">{order.deviceBrand} {order.deviceModel}</p>
                            </div>
                            <div>
                                <h3 className="text-sm uppercase font-bold text-gray-400 mb-2">Técnico Responsable</h3>
                                <p className="font-bold text-lg">{order.report.technician.name}</p>
                            </div>
                        </div>

                        <div className="mb-6 flex flex-col gap-4">
                            <div>
                                <h3 className="text-sm uppercase font-bold text-gray-400 mb-2">Diagnóstico Definitivo</h3>
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                    <p className="text-black">{order.report.diagnosis}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm uppercase font-bold text-gray-400 mb-2">Acciones Realizadas</h3>
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                    <p className="text-black whitespace-pre-wrap">{order.report.actionsTaken}</p>
                                </div>
                            </div>
                            {order.report.recommendations && (
                                <div>
                                    <h3 className="text-sm uppercase font-bold text-gray-400 mb-2">Recomendaciones</h3>
                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                        <p className="text-black">{order.report.recommendations}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {order.items.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm uppercase font-bold text-gray-400 mb-2">Costos y Repuestos</h3>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="py-2 text-sm font-bold">Repuesto</th>
                                            <th className="py-2 text-sm font-bold text-center">Cant.</th>
                                            <th className="py-2 text-sm font-bold text-right">Precio Unit.</th>
                                            <th className="py-2 text-sm font-bold text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((i: any) => (
                                            <tr key={i.id} className="border-b border-gray-100">
                                                <td className="py-2 text-sm">{i.inventoryItem.name}</td>
                                                <td className="py-2 text-sm text-center">{i.quantity}</td>
                                                <td className="py-2 text-sm text-right">${i.priceAtTime.toLocaleString('es-CO')}</td>
                                                <td className="py-2 text-sm text-right font-bold">${(i.quantity * i.priceAtTime).toLocaleString('es-CO')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="py-3 text-right text-sm font-bold text-gray-500">TOTAL REPUESTOS:</td>
                                            <td className="py-3 text-right font-black text-lg">${totalPartsCost.toLocaleString('es-CO')}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        {order.report.images && order.report.images.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">Evidencias Fotográficas</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {order.report.images.map((img: string, idx: number) => (
                                        <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden aspect-video">
                                            <img src={img} alt="Evidencia" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-between items-end border-t border-gray-200 pt-8">
                            <div className="w-[300px]">
                                <div className="border-b border-black mb-2"></div>
                                <p className="text-xs font-bold text-center">Firma Conforme del Cliente</p>
                            </div>
                            <div className="w-[300px]">
                                <div className="border-b border-black mb-2"></div>
                                <p className="text-xs font-bold text-center">Firma del Técnico ({order.report.technician.name})</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
