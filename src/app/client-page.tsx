"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const COLORS = {
  accent: "#0073CF", // Bosch Blue
  accentHover: "#0060B0",
  danger: "#E2001A", // Bosch Red
  obsidian: "#0F172A", // Deep Navy/Slate
  slate: "#64748B",
  glass: "rgba(255, 255, 255, 0.7)",
  border: "rgba(15, 23, 42, 0.06)",
};

const BRANDS = [
  "Bosch", "Ducati", "Goodyear", "Echo", "Shindaiwa", "Espa", "Pentax",
  "Ingco", "Total", "Emtop", "Wadfow", "Decakila", "Bellota"
];

export default function LandingPageClient({ settings, products }: { settings: any, products: any[] }) {
  const [trackingCode, setTrackingCode] = useState("");
  const router = useRouter();
  const companyName = settings?.companyName || "Servimaquinas";

  // Carrusel Logic
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.8;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < (scrollWidth - clientWidth - 20));
  };

  useEffect(() => {
    handleScroll();
  }, [products]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    router.push(`/track/${trackingCode.trim().toUpperCase()}`);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans selection:bg-blue-600/10 selection:text-blue-600 bg-white text-slate-900 overflow-x-hidden">

      <nav className="fixed top-0 w-full z-50 transition-all duration-500 bg-white/70 backdrop-blur-2xl border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500 rotate-[-5deg] group-hover:rotate-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div className="flex flex-col -gap-1">
              <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-950 uppercase leading-none">{companyName}</span>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 opacity-80">Engineering Elite</span>
            </div>
          </Link>

          {/* Nav Desktop */}
          <div className="hidden lg:flex items-center gap-10">
            {['Servicios', 'Tienda', 'Contacto'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </a>
            ))}
            <Link href="/login" className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative px-8 py-3.5 bg-slate-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest group-hover:bg-slate-900 transition-all">
                Staff Access
              </div>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-950"
          >
            <div className="flex flex-col gap-1.5 items-end">
              <span className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
              <span className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'w-4'}`} />
              <span className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-6 lg:hidden shadow-2xl"
            >
              {['Servicios', 'Tienda', 'Contacto'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-black uppercase tracking-widest text-slate-600 active:text-blue-600"
                >
                  {item}
                </a>
              ))}
              <Link
                href="/login"
                className="w-full py-4 bg-slate-950 text-white text-center rounded-2xl font-black uppercase tracking-widest"
              >
                Staff Access
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative pt-40 md:pt-64 pb-20 md:pb-40 overflow-hidden bg-slate-50">
        {/* ELEMENTOS DE FONDO TÉCNICOS */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[60%] h-[120%] bg-[radial-gradient(circle_at_70%_20%,#0073CF15,transparent)]" />
          <div className="absolute bottom-0 left-[-10%] w-[50%] h-[80%] bg-[radial-gradient(circle_at_30%_80%,#E2001A08,transparent)]" />
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-center">

            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-4 py-2 md:px-5 md:py-2.5 bg-white border border-slate-200/60 rounded-xl md:rounded-2xl w-fit shadow-2xl shadow-blue-500/5 backdrop-blur-xl"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-blue-600 opacity-20" />
                    </div>
                  ))}
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Trusted by <span className="text-slate-900">5,000+</span> Professional Technicians
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-col"
              >
                <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-[-0.04em] text-slate-950 mb-6 md:mb-8">
                  SERVICE<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">REDEFINED</span>
                </h1>

                <p className="text-lg md:text-2xl text-slate-500 max-w-xl font-medium leading-relaxed mb-10 md:mb-12">
                  Precisión alemana y tecnología de rastreo en vivo para tu equipo industrial pesado.
                  <span className="text-slate-900 block md:inline"> El estándar de oro en reparación.</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <form onSubmit={handleTrack} className="group relative w-full max-w-md">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition duration-500" />
                    <div className="relative flex flex-col sm:flex-row p-2 bg-white rounded-2xl md:rounded-[1.8rem] border border-slate-200 items-center overflow-hidden shadow-2xl gap-2 sm:gap-0">
                      <div className="hidden sm:block pl-6 text-slate-400">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      <input
                        value={trackingCode}
                        onChange={e => setTrackingCode(e.target.value.toUpperCase())}
                        placeholder="Tracking ID: SRV-ABC123"
                        className="w-full sm:flex-1 px-4 py-3 md:py-4 outline-none font-bold text-base md:text-lg placeholder:text-slate-300 tracking-wider text-center sm:text-left"
                      />
                      <button className="w-full sm:w-auto bg-slate-950 text-white px-8 py-3.5 md:py-4 rounded-xl md:rounded-[1.4rem] text-xs md:text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95">
                        Track Now
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-5 relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-40 animate-pulse" />
                <div className="relative bg-white p-4 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000"
                    className="rounded-[2.8rem] object-cover h-[550px] w-full group-hover:scale-105 transition-transform duration-1000"
                    alt="Precision Engineering"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <div className="absolute bottom-10 left-10 right-10 flex gap-4">
                    <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl">
                      <span className="block text-white text-xs font-black uppercase tracking-widest opacity-60 mb-2">Diagnosis Speed</span>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: "94%" }}
                          className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]"
                        />
                      </div>
                    </div>
                    <div className="bg-blue-600 p-6 rounded-3xl flex items-center justify-center aspect-square shadow-2xl">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      <section id="servicios" className="py-40 relative bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="flex flex-col gap-4">
              <motion.span
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                className="text-xs font-black uppercase tracking-[0.4em] text-blue-600"
              >
                Technical Mastery
              </motion.span>
              <h3 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-950">
                Soluciones de Ingeniería.
              </h3>
            </div>
            <p className="text-xl text-slate-500 max-w-sm leading-relaxed border-l-2 border-slate-100 pl-8">
              Mantenimiento de alta precisión para las marcas líderes de la industria.
            </p>
          </div>

          <div className="grid md:grid-cols-6 gap-6">
            {/* CARD 1: LARGE FEATURE */}
            <motion.div
              whileHover={{ y: -10 }}
              className="md:col-span-3 lg:col-span-3 bg-slate-950 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-16 text-white relative overflow-hidden group shadow-2xl min-h-[400px] md:min-h-[600px] flex flex-col"
            >
              <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_100%_0%,#0073CF,transparent)]" />
              <div className="relative z-10 h-full flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-10 border border-white/10 group-hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="md:w-8 md:h-8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                  </div>
                  <h4 className="text-3xl md:text-5xl font-black mb-4 md:mb-8 leading-tight tracking-tight">Especialistas en <br /><span className="text-blue-500">Alta Potencia.</span></h4>
                  <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md">Diagnóstico avanzado asistido por software para herramientas Bosch Professional y equipo industrial pesado.</p>
                </div>

                <div className="mt-8 md:mt-12 flex items-center gap-4 md:gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-slate-900 bg-slate-800" />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm font-bold text-slate-500 italic">Certificado por Bosch Global</span>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: MEDIUM FEATURE (BLUE) / APILADO EN MOBILE */}
            <div className="md:col-span-3 space-y-6 flex flex-col">
              <motion.div
                whileHover={{ y: -10 }}
                className="flex-1 bg-blue-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden group shadow-2xl shadow-blue-600/20 min-h-[250px] md:min-h-0 flex flex-col"
              >
                <div className="relative z-10 flex-1 flex flex-col justify-between">
                  <h4 className="text-2xl md:text-3xl font-black leading-tight">Garantía de Repuestos <br />100% Originales.</h4>
                  <div className="flex items-center justify-between mt-6 md:mt-8">
                    <span className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest">Inventory Stocked</span>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="md:w-10 md:h-10"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-2xl md:blur-3xl" />
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-2">
                {/* CARD 3: SMALL FEATURE (WHITE/SLATE) */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="sm:col-span-2 lg:col-span-2 bg-slate-50 border border-slate-100 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 flex flex-col justify-between group shadow-xl"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="md:w-6 md:h-6"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div>
                    <h5 className="text-lg md:text-xl font-black text-slate-950 mb-2">Entrega Express</h5>
                    <p className="text-slate-500 text-xs md:text-sm">Servicio de logística puerta a puerta a nivel nacional.</p>
                  </div>
                </motion.div>

                {/* CARD 4: SMALL FEATURE (ACCENT) */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="sm:col-span-1 lg:col-span-1 bg-white border-2 border-blue-50 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all shadow-xl min-h-[150px]"
                >
                  <span className="text-3xl md:text-4xl font-black text-blue-600 mb-2">24h</span>
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">SLA de <br />Diagnóstico</p>
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="tienda" className="py-40 bg-slate-50 relative overflow-hidden">
        {/* TEXTURA TÉCNICA DE FONDO */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#0073CF 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="max-w-7xl mx-auto px-6 mb-24 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="w-12 h-[2px] bg-blue-600" />
                <span className="text-xs font-black uppercase tracking-[0.5em] text-blue-600">Industrial Selection</span>
              </div>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-950 max-w-2xl">
                Catálogo de <br /><span className="text-blue-600">Alta Gama.</span>
              </h3>
            </div>
            <p className="text-xl text-slate-500 max-w-sm font-medium leading-relaxed">
              Herramientas diseñadas para el rendimiento extremo. Disponibilidad inmediata con respaldo técnico oficial.
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-32 text-slate-400 font-bold uppercase tracking-widest text-sm italic">
            No stock listed at this moment.
          </div>
        ) : (
          <div className="relative group/carousel">
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex gap-6 md:gap-10 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-6 md:px-[max(24px,calc((100vw-1280px)/2))] py-12"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -15 }}
                  className="snap-center shrink-0 w-[300px] md:w-[380px] group bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100/50 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,115,207,0.15)] transition-all duration-700"
                >
                  <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden p-8 md:p-10 flex flex-col justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,1),rgba(241,245,249,0.5))]" />
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-contain w-full h-full relative z-10 group-hover:scale-110 transition-transform duration-1000 rotate-[-5deg] group-hover:rotate-0"
                      />
                    )}

                    {item.isPromotion && (
                      <div className="absolute top-10 left-10 z-20">
                        <div className="bg-red-600 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-tighter shadow-2xl flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          Elite Offer
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-6 left-10 right-10 flex justify-between items-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="text-[10px] font-black uppercase text-slate-400">SKU: {item.id.slice(-8)}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1 h-1 bg-blue-600 rounded-full" />)}
                      </div>
                    </div>
                  </div>

                  <div className="p-12">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">{item.storeCategory?.name || "Official Edition"}</p>
                        <h4 className="text-2xl font-black text-slate-950 leading-tight line-clamp-2 h-16">{item.name}</h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-10">
                      <div className="flex flex-col">
                        {item.promoPrice ? (
                          <>
                            <span className="text-xs text-slate-400 line-through font-bold mb-1">${item.price.toLocaleString()}</span>
                            <span className="text-4xl font-black text-slate-950 tracking-tighter">${item.promoPrice.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-4xl font-black text-slate-950 tracking-tighter">${item.price.toLocaleString()}</span>
                        )}
                      </div>
                      <a
                        href={`https://wa.me/${settings?.phone || ''}?text=Hola, estoy interesado en ${item.name}`}
                        target="_blank"
                        className="w-16 h-16 bg-slate-950 text-white rounded-3xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-2xl active:scale-90 group/btn"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CONTROLES TÉCNICOS */}
            <AnimatePresence>
              {showLeftArrow && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onClick={() => scrollCarousel('left')}
                  className="absolute left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/80 backdrop-blur-2xl shadow-2xl rounded-[2rem] flex items-center justify-center z-20 border border-slate-100 hover:bg-slate-950 hover:text-white transition-all duration-500 active:scale-95"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6" /></svg>
                </motion.button>
              )}
              {showRightArrow && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  onClick={() => scrollCarousel('right')}
                  className="absolute right-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/80 backdrop-blur-2xl shadow-2xl rounded-[2rem] flex items-center justify-center z-20 border border-slate-100 hover:bg-slate-950 hover:text-white transition-all duration-500 active:scale-95"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section id="contacto" className="py-40 relative bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-slate-50 z-0 hidden lg:block" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-0 bg-slate-950 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)]">

            <div className="lg:col-span-7 p-12 lg:p-24 text-white relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_0%_0%,#0073CF,transparent)]" />
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                className="relative z-10"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-6 block">Direct Assistance</span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 leading-none">
                  ¿Listo para la <br /><span className="text-blue-500">Excelencia?</span>
                </h2>
                <p className="text-slate-400 text-xl leading-relaxed max-w-md mb-16 font-medium">
                  Nuestro laboratorio técnico está operando bajo estándares internacionales. Agenda tu diagnóstico premium ahora.
                </p>

                <div className="flex flex-col gap-10">
                  <div className="flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:bg-blue-600/20 transition-all">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Expert Support</p>
                      <p className="text-xl font-bold">{settings?.phone || "+593 98 337 9649"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:scale-110 transition-all">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 21l1.65-3.8A9 9 0 1121 12a9 9 0 01-9 9 8.9 8.9 0 01-4.5-1.2L3 21z" /></svg>
                    </div>
                    <a href={`https://wa.me/${settings?.phone || ''}`} className="text-2xl font-black underline decoration-blue-500 underline-offset-8 decoration-4 hover:text-blue-500 transition-colors">
                      WhatsApp Business
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-5 relative h-[500px] lg:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d249.328!2d-80.7116201!3d-0.9610996!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902be7e3da48cb73%3A0xb4db965f8fbd7670!2sSERVIMAQUINAS%20Servicio%20t%C3%A9cnico%20autorizado!5e0!3m2!1sen!2sec!4v1742084232328!5m2!1sen!2sec"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy"
                className="grayscale brightness-[0.7] contrast-[1.2] hover:grayscale-0 transition-all duration-1000"
              ></iframe>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <footer className="py-32 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-20 mb-32">
            <div className="lg:col-span-5 flex flex-col gap-8">
              <Link href="/" className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-2xl">S</div>
                <span className="font-black text-3xl tracking-tighter uppercase text-slate-950">{companyName}</span>
              </Link>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Ingeniería y soporte técnico de precisión. Distribuidor oficial autorizado de equipos de alta gama para la industria del mañana.
              </p>
            </div>

            <div className="lg:col-span-7 grid md:grid-cols-3 gap-12">
              <div className="flex flex-col gap-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Marcas de Élite</p>
                <ul className="flex flex-col gap-3">
                  {BRANDS.slice(0, 6).map(b => (
                    <li key={b} className="font-bold text-slate-400 hover:text-slate-950 transition-colors cursor-default">{b}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Ubicación</p>
                <p className="font-bold text-slate-500 leading-relaxed">
                  {settings?.address || 'Manta, Av 4 de Noviembre y Calle J16'}
                </p>
              </div>
              <div className="flex flex-col gap-6 text-right md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Oficial</p>
                <p className="font-bold text-slate-400">©{new Date().getFullYear()} Precision Systems.</p>
                <div className="flex gap-4 justify-end md:justify-start mt-2">
                  {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-lg bg-slate-200" />)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Certified Technical Laboratory & Industrial Supply</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950">Manta • Ecuador • 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
