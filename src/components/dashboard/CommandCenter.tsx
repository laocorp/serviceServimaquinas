import {
    Plus,
    Search,
    QrCode,
    AlertTriangle,
    Users,
    FileText,
    Zap
} from "lucide-react";
import Link from "next/link";

export default function CommandCenter() {
    const actions = [
        {
            title: "Nueva Orden",
            description: "Ingreso de equipo",
            icon: <Plus className="w-5 h-5" />,
            href: "/dashboard/orders/new",
            color: "bg-blue-600 text-white shadow-blue-200",
        },
        {
            title: "Buscar Tracking",
            description: "Localizar por código",
            icon: <Search className="w-5 h-5" />,
            href: "/dashboard/orders",
            color: "bg-slate-900 text-white shadow-slate-200",
        },
        {
            title: "Escanear QR",
            description: "Cámara rápida",
            icon: <QrCode className="w-5 h-5" />,
            href: "#",
            color: "bg-indigo-600 text-white shadow-indigo-200",
            isBeta: true,
        },
        {
            title: "Stock Crítico",
            description: "Ver faltantes",
            icon: <AlertTriangle className="w-5 h-5" />,
            href: "/dashboard/inventory",
            color: "bg-amber-500 text-white shadow-amber-200",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            {actions.map((action, i) => (
                <Link
                    key={i}
                    href={action.href}
                    className={`group relative overflow-hidden p-4 rounded-3xl transition-all duration-300 active:scale-95 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl flex flex-col justify-between`}
                >
                    <div className={`${action.color} w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-12`}>
                        {action.icon}
                    </div>

                    <div className="mt-4">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight leading-none uppercase italic">
                            {action.title}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest leading-none">
                            {action.description}
                        </p>
                    </div>

                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Zap className="w-4 h-4 text-blue-500 fill-blue-500 animate-pulse" />
                    </div>

                    {action.isBeta && (
                        <span className="absolute top-3 right-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                            Pro
                        </span>
                    )}
                </Link>
            ))}
        </div>
    );
}
