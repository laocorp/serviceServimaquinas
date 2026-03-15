"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, registerAction } from "@/actions/auth";
import { toast } from "sonner";

export default function LoginPage() {
    const searchParams = useSearchParams();
    const [isRegister, setIsRegister] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (searchParams.get("tab") === "register") setIsRegister(true);
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            if (isRegister) {
                const res = await registerAction(formData);
                if (res?.error) toast.error(res.error);
                else if (res?.success) {
                    toast.success(res.success);
                    setIsRegister(false);
                    (e.target as HTMLFormElement).reset();
                }
            } else {
                const res = await loginAction(formData);
                if (res?.error) toast.error(res.error);
                else toast.success("¡Bienvenido!");
            }
        });
    };

    return (
        <div className="min-h-screen flex font-sans antialiased" style={{ backgroundColor: "#06111F" }}>

            {/* ─── IZQUIERDA — Branding ───────────────────────────── */}
            <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col justify-between p-14"
                style={{ backgroundColor: "#0A1A2E", borderRight: "1px solid rgba(0,115,207,0.18)" }}>

                {/* Dot-matrix pattern */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: "radial-gradient(circle, rgba(0,115,207,0.07) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }} />
                {/* Blue glow top-right */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none"
                    style={{ backgroundColor: "#0073CF" }} />
                {/* Blue glow bottom-left */}
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-[100px] opacity-12 pointer-events-none"
                    style={{ backgroundColor: "#0073CF" }} />

                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ border: "1px solid rgba(0,115,207,0.45)", backgroundColor: "rgba(0,115,207,0.15)" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl text-white/88 tracking-tight">Servimaquinas</span>
                    </Link>
                </div>

                {/* Main content */}
                <div className="relative z-10 flex flex-col gap-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full"
                        style={{ border: "1px solid rgba(0,115,207,0.35)", backgroundColor: "rgba(0,115,207,0.10)" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#0073CF" }} />
                        <span className="text-[11px] uppercase tracking-[0.16em] font-medium" style={{ color: "rgba(147,197,253,0.88)" }}>
                            Servicio Técnico Autorizado Bosch
                        </span>
                    </div>

                    <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[0.93] tracking-tighter">
                        Gestión técnica<br />
                        <span style={{ color: "rgba(147,197,253,0.60)" }}>de alto nivel.</span>
                    </h2>

                    <p className="text-base leading-relaxed max-w-sm" style={{ color: "rgba(147,197,253,0.80)" }}>
                        Plataforma exclusiva para el control de inventario, órdenes de reparación y atención al cliente en marcas premium.
                    </p>

                    {/* Feature list */}
                    <div className="flex flex-col gap-3">
                        {[
                            "Rastreo de equipos en tiempo real",
                            "Gestión de repuestos originales",
                            "CRM y atención al cliente",
                        ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: "rgba(0,115,207,0.20)", border: "1px solid rgba(0,115,207,0.40)" }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0073CF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span className="text-sm" style={{ color: "rgba(147,197,253,0.82)" }}>{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer left */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="text-xs" style={{ color: "rgba(147,197,253,0.60)" }}>
                        Solo personal y clientes autorizados.
                    </div>
                </div>
            </div>

            {/* ─── DERECHA — Formulario ──────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">

                {/* Mobile logo */}
                <Link href="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ border: "1px solid rgba(0,115,207,0.40)", backgroundColor: "rgba(0,115,207,0.12)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                    </div>
                    <span className="font-bold text-white/85 text-sm">Servimaquinas</span>
                </Link>

                <motion.div
                    key={isRegister ? "register" : "login"}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="w-full max-w-md"
                >
                    {/* Card */}
                    <div className="rounded-3xl p-8 sm:p-10"
                        style={{
                            backgroundColor: "#0A1A2E",
                            border: "1px solid rgba(0,115,207,0.22)",
                            boxShadow: "0 24px 80px rgba(0,115,207,0.08)",
                        }}>

                        {/* Tab switcher */}
                        <div className="flex items-center gap-1 p-1 rounded-xl mb-8"
                            style={{ backgroundColor: "rgba(0,115,207,0.08)", border: "1px solid rgba(0,115,207,0.14)" }}>
                            {["Iniciar Sesión", "Registrarse"].map((tab, i) => {
                                const active = isRegister === !!i;
                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setIsRegister(!!i)}
                                        className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                                        style={{
                                            backgroundColor: active ? "#0073CF" : "transparent",
                                            color: active ? "white" : "rgba(147,197,253,0.50)",
                                        }}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Heading */}
                        <div className="mb-7">
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                {isRegister ? "Crear cuenta" : "Bienvenido de vuelta"}
                            </h1>
                            <p className="text-sm mt-1" style={{ color: "rgba(147,197,253,0.72)" }}>
                                {isRegister
                                    ? "Completa los datos para acceder al sistema."
                                    : "Ingresa tus credenciales para continuar."}
                            </p>
                        </div>

                        {/* Form */}
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

                            {/* Nombre (solo registro) */}
                            {isRegister && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-col gap-1.5"
                                >
                                    <label className="text-xs font-semibold uppercase tracking-widest"
                                        style={{ color: "rgba(147,197,253,0.55)" }}>
                                        Nombre completo
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Juan Pérez"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-blue-200/20 focus:outline-none transition-all"
                                            style={{
                                                backgroundColor: "rgba(0,115,207,0.08)",
                                                border: "1px solid rgba(0,115,207,0.22)",
                                            }}
                                            onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,115,207,0.60)")}
                                            onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,115,207,0.22)")}
                                        />
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,115,207,0.60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                </motion.div>
                            )}

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest"
                                    style={{ color: "rgba(147,197,253,0.55)" }}>
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="tu@correo.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-blue-200/20 focus:outline-none transition-all"
                                        style={{
                                            backgroundColor: "rgba(0,115,207,0.08)",
                                            border: "1px solid rgba(0,115,207,0.22)",
                                        }}
                                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,115,207,0.60)")}
                                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,115,207,0.22)")}
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,115,207,0.60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                            </div>

                            {/* Contraseña */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-widest"
                                        style={{ color: "rgba(147,197,253,0.55)" }}>
                                        Contraseña
                                    </label>
                                    {!isRegister && (
                                        <Link href="#" className="text-xs transition-colors"
                                            style={{ color: "rgba(0,115,207,0.70)" }}
                                            onMouseEnter={e => (e.currentTarget.style.color = "#0073CF")}
                                            onMouseLeave={e => (e.currentTarget.style.color = "rgba(0,115,207,0.70)")}>
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-blue-200/20 focus:outline-none transition-all"
                                        style={{
                                            backgroundColor: "rgba(0,115,207,0.08)",
                                            border: "1px solid rgba(0,115,207,0.22)",
                                        }}
                                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,115,207,0.60)")}
                                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,115,207,0.22)")}
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,115,207,0.60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isPending}
                                className="mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 group"
                                style={{
                                    backgroundColor: isPending ? "rgba(0,115,207,0.55)" : "#0073CF",
                                    cursor: isPending ? "not-allowed" : "pointer",
                                }}
                                onMouseEnter={e => { if (!isPending) e.currentTarget.style.backgroundColor = "#0060B0"; }}
                                onMouseLeave={e => { if (!isPending) e.currentTarget.style.backgroundColor = "#0073CF"; }}
                            >
                                {isPending ? (
                                    <>
                                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                        </svg>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        {isRegister ? "Crear cuenta" : "Ingresar al sistema"}
                                        <svg className="group-hover:translate-x-1 transition-transform" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Legal */}
                        <p className="mt-7 text-center text-xs" style={{ color: "rgba(147,197,253,0.55)" }}>
                            Al continuar aceptas nuestros{" "}
                            <Link href="#" className="underline underline-offset-2 hover:text-blue-300 transition-colors">
                                Términos de Servicio
                            </Link>{" "}
                            y{" "}
                            <Link href="#" className="underline underline-offset-2 hover:text-blue-300 transition-colors">
                                Política de Privacidad
                            </Link>
                            .
                        </p>
                    </div>

                    {/* Back to landing */}
                    <div className="mt-5 text-center">
                        <Link href="/" className="inline-flex items-center gap-1.5 text-xs transition-colors"
                            style={{ color: "rgba(147,197,253,0.62)" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "rgba(147,197,253,0.70)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "rgba(147,197,253,0.38)")}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                            </svg>
                            Volver al inicio
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
