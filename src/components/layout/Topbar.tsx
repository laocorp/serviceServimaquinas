"use client";

import { signOut } from "next-auth/react";
import { type Session } from "next-auth";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useNavbar } from "./NavbarContext";
import { Menu, X } from "lucide-react";

// Tipo de notificación
interface Notification {
    id: string;
    title: string;
    body: string;
    time: string;
    read: boolean;
    type: "order" | "inventory" | "info";
}

// En producción, estas vendrían de la DB. Aquí usamos un sistema local
// que lee alertas de inventario y órdenes recientes via API.
function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Carga notificaciones al montar
        fetch("/api/notifications")
            .then(r => r.json())
            .then(data => setNotifications(data))
            .catch(() => {
                // Fallback offline
                setNotifications([
                    {
                        id: "1",
                        title: "Sistema listo",
                        body: "Servimaquinas está operativo.",
                        time: "ahora",
                        read: false,
                        type: "info",
                    }
                ]);
            });
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () =>
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    return { notifications, unreadCount, markAllRead };
}

export function Topbar({ session }: { session: Session | null }) {
    const [bellOpen, setBellOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAllRead } = useNotifications();
    const { isOpen, toggle } = useNavbar();

    const roleColors: Record<string, string> = {
        ADMIN: "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
        RECEPCION: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        TECNICO: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        CLIENTE: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
    };

    const typeColors: Record<string, string> = {
        order: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
        inventory: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
        info: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
    };

    const userRole = session?.user?.role || "CLIENTE";
    const badgeClass = roleColors[userRole] || roleColors.CLIENTE;

    // Cerrar panel al hacer click fuera
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleBellOpen = () => {
        setBellOpen(prev => !prev);
        if (!bellOpen && unreadCount > 0) markAllRead();
    };

    return (
        <header className="h-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-30">

            <button
                onClick={toggle}
                className="lg:hidden p-2 text-slate-900 dark:text-white mr-2"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Panel de Control</h2>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 border-r border-zinc-200 dark:border-zinc-800 pr-6">

                    {/* ─── CAMPANITA ─── */}
                    <div className="relative" ref={bellRef}>
                        <button
                            onClick={handleBellOpen}
                            className="text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors relative"
                            title="Notificaciones"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            {/* Badge de conteo */}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-950 animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* ─── PANEL DE NOTIFICACIONES ─── */}
                        {bellOpen && (
                            <div className="absolute top-8 right-0 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                                {/* Header del panel */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Notificaciones</p>
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                                    >
                                        Marcar todas leídas
                                    </button>
                                </div>

                                {/* Lista de notificaciones */}
                                <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <p className="text-xs text-zinc-400">Sin notificaciones por ahora.</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`px-4 py-3 flex gap-3 transition-colors ${n.read ? "" : "bg-blue-50/40 dark:bg-blue-900/10"}`}>
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[n.type]}`}>
                                                    {n.type === "order" && (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        </svg>
                                                    )}
                                                    {n.type === "inventory" && (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                                            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                                        </svg>
                                                    )}
                                                    {n.type === "info" && (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{n.title}</p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.body}</p>
                                                    <p className="text-[10px] text-zinc-400 mt-1">{n.time}</p>
                                                </div>
                                                {!n.read && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800">
                                    <Link href="/dashboard/orders" onClick={() => setBellOpen(false)}
                                        className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                                        Ver todas las órdenes →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Perfil de usuario */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-none mb-1">
                            {session?.user?.name || "Usuario"}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeClass}`}>
                            {userRole}
                        </span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-slate-500 overflow-hidden relative group cursor-pointer"
                        onClick={() => signOut({ callbackUrl: "/login" })}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:opacity-0 transition-opacity">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <div className="absolute inset-0 bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
