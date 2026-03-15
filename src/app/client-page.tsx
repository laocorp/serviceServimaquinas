"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── Paleta Bosch / Servimaquinas ─────────────────────────────────────────
// bg-base:      #06111F  — Azul marino muy oscuro (fachada Bosch)
// bg-elevated:  #0A1A2E  — Ligeramente más claro para secciones alternas
// bg-card:      #0D2040  — Cards/nodos con algo más de azul
// accent:       #0073CF  — Azul Bosch corporativo
// accent-glow:  rgba(0,115,207,0.35) — Glow del estado activo
// text-primary: white
// border:       rgba(255,255,255,0.08) con tinte azul

const BRANDS = [
  // Marcas principales
  "Bosch", "Ducati", "Goodyear", "Echo", "Shindaiwa", "Espa", "Pentax",
  // Red Toolshop
  "Ingco", "Total", "Emtop", "Wadfow", "Decakila",
  "FTK", "Crown", "Worksite", "Nitro", "CMT", "Ixiar", "Dyllu",
  "Bellota", "Carioca", "Wivarsson", "Tonka", "Fluidi", "Pearl",
];

const STAGES = [
  {
    key: "RECIBIDO",
    label: "Recibido",
    sub: "Equipo en recepción",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
      </svg>
    ),
  },
  {
    key: "EN_REVISION",
    label: "En Revisión",
    sub: "Diagnóstico en curso",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: "REPARANDO",
    label: "Reparando",
    sub: "En manos del técnico",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    key: "ENTREGADO",
    label: "Entregado",
    sub: "¡Equipo listo!",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

const CHECK_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function LandingPageClient({ settings }: { settings: any }) {
  const [trackingCode, setTrackingCode] = useState("");
  const [demoState, setDemoState] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => setDemoState(p => (p + 1) % 4), 2400);
    return () => clearInterval(t);
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    router.push(`/track/${trackingCode.trim().toUpperCase()}`);
  };

  const companyName = settings?.companyName || "Servimaquinas";

  return (
    <div className="min-h-screen text-white font-sans antialiased selection:bg-blue-500/20"
      style={{ backgroundColor: "#06111F" }}>

      {/* ─── HEADER ─────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 border-b border-blue-900/60 backdrop-blur-xl"
        style={{ backgroundColor: "rgba(6,17,31,0.92)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 border border-blue-600/40 rounded-lg flex items-center justify-center group-hover:border-blue-400/60 transition-colors"
              style={{ backgroundColor: "rgba(0,115,207,0.12)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight text-white/88">{companyName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {["Servicios", "Marcas", "Rastreo"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm text-blue-200/65 hover:text-white transition-colors tracking-wide">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-blue-200/65 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/login?tab=register"
              className="px-4 py-[7px] text-sm font-semibold rounded-full transition-all duration-200 text-white"
              style={{ backgroundColor: "#0073CF", borderColor: "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0060B0")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0073CF")}>
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">

        {/* Dot-matrix con tono azulado */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(0,115,207,0.09) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }} />
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent, #06111F 90%)" }}
        />
        {/* Suave glow central azul */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[300px] rounded-full blur-[100px] opacity-25"
            style={{ backgroundColor: "#0073CF" }} />
        </div>

        <div className="relative max-w-3xl w-full mx-auto text-center flex flex-col items-center gap-10 pt-20 pb-6">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
            style={{ borderColor: "rgba(0,115,207,0.35)", backgroundColor: "rgba(0,115,207,0.10)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#0073CF" }} />
            <span className="text-[11px] uppercase tracking-[0.18em] text-blue-200/75 font-medium">Servicio Técnico Autorizado Bosch</span>
          </motion.div>

          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="flex flex-col items-center gap-3">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[0.92] tracking-tighter">
              Tu equipo,<br />
              <span style={{ color: "rgba(147,197,253,0.30)" }}>siempre a la vista.</span>
            </h1>
            <p className="text-blue-100/60 text-[17px] max-w-md leading-relaxed mt-1">
              Rastrea tu reparación en tiempo real. Diagnóstico transparente y repuestos originales garantizados.
            </p>
          </motion.div>

          {/* ─── TIMELINE ─── */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18 }}
            className="w-full">

            {/* DESKTOP */}
            <div className="hidden md:block w-full">
              <div className="relative flex items-start justify-between w-full">

                {/* Línea de track */}
                <div className="absolute top-[27px] left-[12.5%] right-[12.5%] h-px overflow-hidden">
                  <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "rgba(0,115,207,0.20)" }} />
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: "#0073CF" }}
                    animate={{ width: `${(demoState / 3) * 100}%` }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>

                {STAGES.map((stage, i) => {
                  const done = i < demoState;
                  const active = i === demoState;
                  const future = i > demoState;

                  return (
                    <div key={stage.key} className="flex flex-col items-center gap-3.5 w-1/4 relative z-10">

                      <div className="relative flex items-center justify-center">
                        {/* Pulse ring — activo = azul Bosch */}
                        {active && (
                          <motion.span
                            className="absolute w-[72px] h-[72px] rounded-full border"
                            style={{ borderColor: "rgba(0,115,207,0.45)" }}
                            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                          />
                        )}

                        <motion.div
                          animate={{
                            backgroundColor: active ? "rgba(0,115,207,0.18)" :
                              done ? "rgba(0,115,207,0.10)" :
                                "rgba(255,255,255,0.03)",
                            borderColor: active ? "#0073CF" :
                              done ? "rgba(0,150,220,0.60)" :
                                "rgba(0,115,207,0.18)",
                            boxShadow: active ? "0 0 24px 0 rgba(0,115,207,0.28)" : "none",
                          }}
                          transition={{ duration: 0.4 }}
                          className="w-[54px] h-[54px] rounded-full border-2 flex items-center justify-center"
                        >
                          <motion.div
                            animate={{
                              color: active ? "#ffffff" :
                                done ? "rgba(147,197,253,0.75)" :
                                  "rgba(255,255,255,0.18)",
                            }}
                            transition={{ duration: 0.35 }}
                          >
                            {done ? CHECK_ICON : stage.icon}
                          </motion.div>
                        </motion.div>
                      </div>

                      <div className="text-center select-none">
                        <motion.p
                          animate={{ opacity: future ? 0.18 : active ? 1 : 0.55 }}
                          transition={{ duration: 0.35 }}
                          className="text-sm font-semibold text-white leading-none">
                          {stage.label}
                        </motion.p>
                        <motion.p
                          animate={{ opacity: future ? 0.08 : active ? 0.42 : 0.25 }}
                          transition={{ duration: 0.35 }}
                          className="text-xs text-blue-100/65 mt-1">
                          {stage.sub}
                        </motion.p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-center mt-5 text-[10px] tracking-widest uppercase"
                style={{ color: "rgba(147,197,253,0.40)" }}>
                Demostración · Así verás el estado de tu equipo en tiempo real
              </p>
            </div>

            {/* MOBILE */}
            <div className="md:hidden flex flex-col gap-2.5">
              {STAGES.map((stage, i) => {
                const active = i === demoState;
                const future = i > demoState;
                return (
                  <motion.div key={stage.key}
                    animate={{
                      backgroundColor: active ? "rgba(0,115,207,0.12)" : "transparent",
                      borderColor: active ? "rgba(0,115,207,0.42)" : "rgba(0,115,207,0.14)",
                    }}
                    transition={{ duration: 0.35 }}
                    className="flex items-center gap-3.5 px-4 py-3 rounded-2xl border">
                    <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: active ? "#0073CF" : "rgba(0,115,207,0.20)" }}>
                      <div style={{ opacity: future ? 0.18 : active ? 0.92 : 0.50 }}>
                        {i < demoState ? CHECK_ICON : stage.icon}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${active ? "text-white" : "text-white/35"}`}>{stage.label}</p>
                      <p className={`text-xs mt-0.5 ${active ? "text-blue-200/45" : "text-blue-200/16"}`}>{stage.sub}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Tracker form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.32 }}
            className="w-full max-w-sm flex flex-col gap-2.5">
            <form onSubmit={handleTrack} className="flex gap-2">
              <input
                type="text"
                value={trackingCode}
                onChange={e => setTrackingCode(e.target.value.toUpperCase())}
                placeholder="Tu código · SRV-XXXXXX"
                maxLength={12}
                className="flex-1 rounded-2xl px-5 py-3.5 text-sm font-mono tracking-widest text-white focus:outline-none transition-all text-center"
                style={{
                  backgroundColor: "rgba(0,115,207,0.10)",
                  border: "1px solid rgba(0,115,207,0.28)",
                  color: "white",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,115,207,0.60)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,115,207,0.28)")}
              />
              <button type="submit"
                className="px-5 py-3.5 rounded-2xl text-sm font-bold active:scale-[0.97] transition-all whitespace-nowrap text-white"
                style={{ backgroundColor: "#0073CF" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0060B0")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0073CF")}>
                Ver Estado
              </button>
            </form>

            {/* Brand pills */}
            <div className="flex flex-wrap gap-1.5 justify-center pt-0.5">
              {BRANDS.map(b => (
                <span key={b} className="px-2.5 py-0.5 text-[10px] font-medium rounded-full"
                  style={{ color: "rgba(147,197,253,0.35)", border: "1px solid rgba(0,115,207,0.18)" }}>
                  {b}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SERVICIOS ─────────────────────────────────────── */}
      <section id="servicios" className="py-24 lg:py-32" style={{ borderTop: "1px solid rgba(0,115,207,0.18)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(147,197,253,0.60)" }}>
            Lo que hacemos
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white/78 max-w-xl mb-14 leading-tight">
            Un servicio técnico completo, sin compromisos.
          </h2>

          <div className="grid md:grid-cols-3 gap-px rounded-3xl overflow-hidden"
            style={{ background: "rgba(0,115,207,0.12)" }}>
            {[
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>,
                title: "Garantía Post-Reparación",
                desc: "Cada trabajo sale con respaldo oficial. Si algo falla, regresa sin costo.",
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
                title: "Rastreo en Tiempo Real",
                desc: "Código único por orden. Ve el estado actualizado sin necesidad de llamar.",
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
                title: "Repuestos 100% Originales",
                desc: "Bodega certificada. Sin piezas genéricas, sin sorpresas en el diagnóstico.",
              }
            ].map((item, i) => (
              <div key={i} className="p-8 lg:p-10 group transition-colors"
                style={{ backgroundColor: "#06111F" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0A1A2E")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#06111F")}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-all"
                  style={{ border: "1px solid rgba(0,115,207,0.25)", color: "rgba(147,197,253,0.50)" }}>
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(147,197,253,0.60)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MARCAS ────────────────────────────────────────── */}
      <section id="marcas" className="py-24 lg:py-32" style={{ borderTop: "1px solid rgba(0,115,207,0.18)", backgroundColor: "#0A1A2E" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(147,197,253,0.60)" }}>Taller Multimarca</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white/78 leading-tight mb-5">
              Especialistas en Bosch.<br />Aceptamos todo.
            </h2>
            <p className="text-base leading-relaxed max-w-md mb-8" style={{ color: "rgba(147,197,253,0.65)" }}>
              Certificados en la línea Bosch, pero también atendemos Emtop, Total, Ingco, Wadfow, Decakila y más. Un técnico que conoce el equipo lo repara bien.
            </p>
            <Link href="/login?tab=register"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors group"
              style={{ color: "#58A8E8" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "#58A8E8")}>
              Registra tu equipo
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {BRANDS.map((brand, i) => (
              <motion.div key={brand}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.035, duration: 0.4 }}
                className="p-3 rounded-xl transition-all cursor-default text-center"
                style={{
                  border: brand === "Bosch" ? "1px solid rgba(0,115,207,0.55)" : "1px solid rgba(0,115,207,0.15)",
                  backgroundColor: brand === "Bosch" ? "rgba(0,115,207,0.15)" : "rgba(0,115,207,0.05)",
                }}>
                <span className="font-semibold text-xs" style={{ color: brand === "Bosch" ? "rgba(147,197,253,0.90)" : "rgba(147,197,253,0.38)" }}>
                  {brand}
                </span>
                {brand === "Bosch" && (
                  <p className="text-[8px] mt-0.5 uppercase tracking-widest" style={{ color: "rgba(0,115,207,0.70)" }}>Principal</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRACKER CTA ─────────────────────────────────── */}
      <section id="rastreo" className="py-24 lg:py-32 relative overflow-hidden"
        style={{ borderTop: "1px solid rgba(0,115,207,0.18)" }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[200px] rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: "#0073CF" }} />
        </div>
        <div className="relative max-w-lg mx-auto px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "rgba(147,197,253,0.60)" }}>Consulta tu orden</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white/78 mb-3">¿Dónde está tu equipo?</h2>
          <p className="text-sm leading-relaxed mb-8 max-w-sm mx-auto" style={{ color: "rgba(147,197,253,0.65)" }}>
            Usa el código del recibo para ver el diagnóstico y estado actual de tu reparación.
          </p>
          <form onSubmit={handleTrack} className="flex gap-2 max-w-sm mx-auto">
            <input
              type="text"
              value={trackingCode}
              onChange={e => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="SRV-XXXXXX"
              maxLength={12}
              className="flex-1 rounded-2xl px-5 py-4 text-sm font-mono tracking-widest text-white focus:outline-none transition-all text-center"
              style={{
                backgroundColor: "rgba(0,115,207,0.10)",
                border: "1px solid rgba(0,115,207,0.28)",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,115,207,0.60)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,115,207,0.28)")}
            />
            <button type="submit"
              className="px-5 py-4 rounded-2xl text-sm font-bold active:scale-[0.97] transition-all text-white"
              style={{ backgroundColor: "#0073CF" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0060B0")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0073CF")}>
              Ver Estado
            </button>
          </form>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(0,115,207,0.18)", backgroundColor: "#0A1A2E" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ border: "1px solid rgba(0,115,207,0.30)", backgroundColor: "rgba(0,115,207,0.12)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: "rgba(147,197,253,0.70)" }}>{companyName}</span>
          </div>

          <div className="flex items-center gap-5 text-xs" style={{ color: "rgba(147,197,253,0.55)" }}>
            {settings?.phone && <span>{settings.phone}</span>}
            {settings?.email && <span>{settings.email}</span>}
            {settings?.address && <span>{settings.address}</span>}
          </div>

          <p className="text-xs" style={{ color: "rgba(147,197,253,0.45)" }}>
            © {new Date().getFullYear()} {companyName}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
