"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateSettings } from "@/actions/settings";
import { registerUser, deleteUser, updateUserRole } from "@/actions/users";

// ─── Tipos ────────────────────────────────────────────────────────────────
type Role = "ADMIN" | "TECNICO" | "RECEPCION";
type User = { id: string; name: string; email: string; role: Role; createdAt: Date };

const ROLE_CONFIG: Record<Role, { label: string; color: string }> = {
    ADMIN: { label: "Administrador", color: "bg-slate-900 text-white dark:bg-white dark:text-slate-900" },
    TECNICO: { label: "Técnico", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    RECEPCION: { label: "Recepción", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
};

// ─── Input reutilizable ───────────────────────────────────────────────────
function Field({ label, name, type = "text", placeholder, required }: {
    label: string; name: string; type?: string; placeholder?: string; required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={name} className="text-sm font-semibold text-slate-900 dark:text-zinc-200">{label}{required && " *"}</label>
            <input id={name} name={name} type={type} required={required} placeholder={placeholder}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm" />
        </div>
    );
}

// ─── Pestaña Empresa ──────────────────────────────────────────────────────
function CompanyTab({ settings }: { settings: any }) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const res = await updateSettings(formData);
            res?.error ? toast.error(res.error) : toast.success("Configuración guardada ✓");
        });
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
            <form action={handleSubmit} className="flex flex-col gap-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800">Información del Negocio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Nombre de la Empresa *</label>
                        <input name="companyName" type="text" required defaultValue={settings.companyName}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-900 dark:text-zinc-200">RUC / NIT de la Empresa</label>
                        <input name="documentId" type="text" defaultValue={settings.documentId || ""} placeholder="Ej. 123456789-0"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Moneda *</label>
                        <input name="currency" type="text" required defaultValue={settings.currency} placeholder="USD, COP, EUR..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Dirección del Taller</label>
                        <input name="address" type="text" defaultValue={settings.address || ""}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Teléfono Público</label>
                        <input name="phone" type="text" defaultValue={settings.phone || ""}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Email Público</label>
                        <input name="email" type="email" defaultValue={settings.email || ""}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Enlace Público del Sistema *</label>
                        <input name="publicUrl" type="url" required defaultValue={settings.publicUrl} placeholder="https://servimaquinas.com"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm" />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={isPending}
                        className="px-8 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50">
                        {isPending ? "Guardando..." : "Guardar Configuración"}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── Pestaña Equipo ───────────────────────────────────────────────────────
function TeamTab({ users: initialUsers, currentUserId }: { users: User[]; currentUserId: string }) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isPending, startTransition] = useTransition();
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const form = e.currentTarget;
        startTransition(async () => {
            const res = await registerUser(fd);
            if ("error" in res) {
                toast.error(res.error as string);
            } else {
                toast.success(`Usuario ${res.user!.name} creado ✓`);
                setUsers(prev => [res.user as User, ...prev]);
                setShowForm(false);
                form.reset();
            }
        });
    };

    const handleDelete = (userId: string) => {
        setDeleteTarget(null);
        startTransition(async () => {
            const res = await deleteUser(userId);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Usuario eliminado");
                setUsers(prev => prev.filter(u => u.id !== userId));
            }
        });
    };

    const handleRoleChange = (userId: string, newRole: Role) => {
        startTransition(async () => {
            const res = await updateUserRole(userId, newRole);
            if (res.error) toast.error(res.error);
            else {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
                toast.success("Rol actualizado ✓");
            }
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Lista de usuarios */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white">Usuarios del Sistema</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{users.length} usuario{users.length !== 1 ? "s" : ""} registrados</p>
                    </div>
                    <button onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nuevo Usuario
                    </button>
                </div>

                {/* Tabla de usuarios */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {users.length === 0 && (
                        <p className="text-center text-zinc-400 py-8 text-sm">No hay usuarios registrados.</p>
                    )}
                    {users.map(user => (
                        <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-zinc-300 flex-shrink-0">
                                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{user.name}</p>
                                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                            </div>

                            {/* Rol editable */}
                            <select
                                value={user.role}
                                disabled={user.id === currentUserId || isPending}
                                onChange={e => handleRoleChange(user.id, e.target.value as Role)}
                                className={`text-xs font-bold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer disabled:cursor-default disabled:opacity-60 ${ROLE_CONFIG[user.role].color}`}
                            >
                                <option value="ADMIN">Administrador</option>
                                <option value="TECNICO">Técnico</option>
                                <option value="RECEPCION">Recepción</option>
                            </select>

                            {/* Fecha */}
                            <span className="text-xs text-zinc-400 hidden sm:block">
                                {new Date(user.createdAt).toLocaleDateString("es-CO")}
                            </span>

                            {/* Eliminar */}
                            {user.id !== currentUserId && (
                                deleteTarget === user.id ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDelete(user.id)}
                                            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors">
                                            Confirmar
                                        </button>
                                        <button onClick={() => setDeleteTarget(null)}
                                            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setDeleteTarget(user.id)}
                                        className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        title="Eliminar usuario">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                                        </svg>
                                    </button>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Formulario de nuevo usuario */}
            {showForm && (
                <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800/40 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Registrar Nuevo Usuario</h3>
                    <form onSubmit={handleRegister} className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Nombre completo" name="name" placeholder="Juan Pérez" required />
                            <Field label="Correo electrónico" name="email" type="email" placeholder="tecnico@servimaquinas.com" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Contraseña inicial" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Rol *</label>
                                <select name="role" required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm">
                                    <option value="TECNICO">🔧 Técnico</option>
                                    <option value="RECEPCION">🗂️ Recepción</option>
                                    <option value="ADMIN">⚙️ Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                            <svg className="text-amber-500 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                El usuario podrá cambiar su contraseña después del primer inicio de sesión.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isPending}
                                className="px-7 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50">
                                {isPending ? "Registrando..." : "Registrar usuario"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────
export default function SettingsClient({
    settings,
    users,
    currentUserId,
}: {
    settings: any;
    users: User[];
    currentUserId: string;
}) {
    const [tab, setTab] = useState<"company" | "team">("company");

    const tabs = [
        {
            id: "company" as const, label: "Empresa", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        {
            id: "team" as const, label: "Equipo", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            )
        },
    ];

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Configuración</h1>
                <p className="text-zinc-500 mt-1">Gestiona la empresa y los usuarios del sistema.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl w-fit">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id
                            ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}>
                        {t.icon}
                        {t.label}
                        {t.id === "team" && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === "team" ? "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"}`}>
                                {users.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Contenido de tabs */}
            {tab === "company" && <CompanyTab settings={settings} />}
            {tab === "team" && <TeamTab users={users} currentUserId={currentUserId} />}
        </div>
    );
}
