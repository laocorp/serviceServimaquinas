"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { createOrder } from "@/actions/orders";
import { createCustomerInline } from "@/actions/customers";

// ─── Tipos ────────────────────────────────────────────────────────────────
type Customer = {
    id: string;
    firstName: string;
    lastName: string;
    isVIP: boolean;
    phone: string | null;
    email: string | null;
};

// ─── CustomerCombobox ─────────────────────────────────────────────────────
function CustomerCombobox({
    customers,
    selectedId,
    onChange,
    onCreateNew,
}: {
    customers: Customer[];
    selectedId: string;
    onChange: (id: string) => void;
    onCreateNew: () => void;
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Cerrar al click fuera
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = customers.filter(c => {
        const full = `${c.firstName} ${c.lastName} ${c.phone ?? ""} ${c.email ?? ""}`.toLowerCase();
        return full.includes(query.toLowerCase());
    });

    const selected = customers.find(c => c.id === selectedId);

    const handleSelect = (c: Customer) => {
        onChange(c.id);
        setQuery("");
        setOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Campo de búsqueda */}
            <div
                className={`w-full flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-zinc-950 border rounded-xl transition-all cursor-text ${open ? "border-blue-500 ring-2 ring-blue-500/20" : "border-zinc-200 dark:border-zinc-800"
                    }`}
                onClick={() => setOpen(true)}
            >
                {/* Ícono de búsqueda */}
                <svg className="text-zinc-400 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                {/* Input de búsqueda / cliente seleccionado */}
                {selected && !open ? (
                    <div className="flex-1 flex items-center gap-2">
                        {selected.isVIP && <span className="text-amber-500 text-xs">🌟</span>}
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {selected.firstName} {selected.lastName}
                        </span>
                        {(selected.phone || selected.email) && (
                            <span className="text-xs text-zinc-400">
                                · {selected.phone ?? selected.email}
                            </span>
                        )}
                    </div>
                ) : (
                    <input
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        placeholder={selected ? `${selected.firstName} ${selected.lastName}` : "Busca por nombre, teléfono o email..."}
                        className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-zinc-400"
                        autoComplete="off"
                    />
                )}

                {/* Clear / Chevron */}
                {selected ? (
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onChange(""); setQuery(""); }}
                        className="text-zinc-400 hover:text-zinc-600 flex-shrink-0"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                ) : (
                    <svg className="text-zinc-400 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                )}
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-40 overflow-hidden">
                    {/* Lista de clientes filtrados */}
                    <div className="max-h-56 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-zinc-400 text-center">
                                No se encontró "{query}"
                            </div>
                        ) : (
                            filtered.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleSelect(c)}
                                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${c.id === selectedId ? "bg-blue-50 dark:bg-blue-900/20" : ""
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-300 flex-shrink-0">
                                        {c.firstName[0]}{c.lastName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                            {c.isVIP && <span className="text-amber-400 mr-1">🌟</span>}
                                            {c.firstName} {c.lastName}
                                        </p>
                                        <p className="text-xs text-zinc-400 truncate">
                                            {c.phone ?? c.email ?? "Sin contacto"}
                                        </p>
                                    </div>
                                    {c.id === selectedId && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Acción: Crear cliente nuevo */}
                    <div className="border-t border-zinc-100 dark:border-zinc-800 p-2">
                        <button
                            type="button"
                            onClick={() => { setOpen(false); onCreateNew(); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </div>
                            {query ? `Crear "${query}" como nuevo cliente` : "Añadir nuevo cliente..."}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Modal de Cliente Rápido ──────────────────────────────────────────────
function QuickCustomerModal({
    open,
    initialName,
    onClose,
    onCreated,
}: {
    open: boolean;
    initialName: string;
    onClose: () => void;
    onCreated: (customer: Customer) => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    // Pre-llenar si venía de la búsqueda
    useEffect(() => {
        if (open && initialName) {
            const parts = initialName.trim().split(" ");
            setFirstName(parts[0] ?? "");
            setLastName(parts.slice(1).join(" ") ?? "");
        }
    }, [open, initialName]);

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await createCustomerInline(fd);
            if (res && 'error' in res) {
                toast.error(res.error as string);
            } else {
                const created = res as Customer;
                toast.success(`Cliente ${created.firstName} ${created.lastName} creado ✓`);
                onCreated(created);
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Nuevo Cliente</h3>
                        <p className="text-sm text-zinc-500 mt-0.5">Se guardará en el CRM automáticamente</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nombre *</label>
                            <input
                                name="firstName"
                                type="text"
                                required
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                placeholder="Juan"
                                className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Apellido *</label>
                            <input
                                name="lastName"
                                type="text"
                                required
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                placeholder="Pérez"
                                className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">RUC / CI</label>
                        <input
                            name="documentId"
                            type="text"
                            placeholder="Ej. 123456789-0"
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Teléfono</label>
                        <input
                            name="phone"
                            type="tel"
                            placeholder="0999 000 000"
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="cliente@email.com"
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isPending}
                            className="flex-1 px-4 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50">
                            {isPending ? "Guardando..." : "Guardar cliente"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Formulario principal ─────────────────────────────────────────────────
export default function NewOrderClient({
    customers: initialCustomers,
    currentUserId,
}: {
    customers: Customer[];
    currentUserId: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleCustomerCreated = (newCustomer: Customer) => {
        setCustomers(prev => [newCustomer, ...prev]);
        setSelectedCustomerId(newCustomer.id);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedCustomerId) {
            toast.error("Selecciona o crea un cliente primero.");
            return;
        }
        const formData = new FormData(e.currentTarget);
        formData.append("createdById", currentUserId);
        formData.append("customerId", selectedCustomerId);

        startTransition(async () => {
            const result = await createOrder(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Orden de trabajo creada. Código de rastreo generado automáticamente.");
            }
        });
    };

    return (
        <>
            {/* Modal de cliente rápido */}
            <QuickCustomerModal
                open={modalOpen}
                initialName={searchQuery}
                onClose={() => setModalOpen(false)}
                onCreated={handleCustomerCreated}
            />

            <div className="max-w-3xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/orders" className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Recepción de Equipo</h1>
                        <p className="text-zinc-500 mt-1">Abre una nueva orden de servicio técnico para un cliente.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                        {/* SECCIÓN 1: CLIENTE con Combobox */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                                1. Selección de Cliente
                            </h3>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-zinc-200">
                                        Cliente *
                                    </label>
                                    <span className="text-xs text-zinc-400">{customers.length} clientes en el CRM</span>
                                </div>
                                <CustomerCombobox
                                    customers={customers}
                                    selectedId={selectedCustomerId}
                                    onChange={setSelectedCustomerId}
                                    onCreateNew={() => { setSearchQuery(""); setModalOpen(true); }}
                                />
                                {/* Info del cliente seleccionado */}
                                {selectedCustomerId && (() => {
                                    const c = customers.find(x => x.id === selectedCustomerId);
                                    if (!c) return null;
                                    return (
                                        <div className="flex items-center gap-3 mt-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/15 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                            <svg className="text-blue-500 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                <span className="font-semibold">{c.firstName} {c.lastName}</span>
                                                {c.isVIP && " · Cliente VIP 🌟"}
                                                {c.phone && ` · ${c.phone}`}
                                                {c.email && ` · ${c.email}`}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* SECCIÓN 2: EQUIPO */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">2. Datos del Dispositivo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="deviceBrand" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Marca *</label>
                                    <input id="deviceBrand" name="deviceBrand" type="text" required
                                        placeholder="Ej. Bosch, Makita, DeWalt"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="deviceModel" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Modelo *</label>
                                    <input id="deviceModel" name="deviceModel" type="text" required
                                        placeholder="Ej. GSB 18V-50"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-6">
                                <label htmlFor="deviceSerial" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Número de Serie (Opcional/Recomendado)</label>
                                <input id="deviceSerial" name="deviceSerial" type="text"
                                    placeholder="S/N del equipo para garantías..."
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white font-mono" />
                            </div>
                        </div>

                        {/* SECCIÓN 3: PROBLEMA */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">3. Recepción y Diagnóstico Inicial</h3>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="reportedIssue" className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Falla Reportada por el Cliente *</label>
                                <textarea id="reportedIssue" name="reportedIssue" rows={4} required
                                    placeholder="El cliente indica que al encender la máquina hace un ruido metálico y pierde potencia a los 5 minutos..."
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white resize-none" />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
                            <p className="text-xs text-zinc-400 max-w-[50%]">Se generará automáticamente un <strong className="text-slate-900 dark:text-white">Código de Rastreo</strong> web para que el cliente siga el progreso.</p>
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard/orders" className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    Cancelar
                                </Link>
                                <button type="submit" disabled={isPending || !selectedCustomerId}
                                    className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-8 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isPending ? "Generando..." : "Ingresar Orden"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
