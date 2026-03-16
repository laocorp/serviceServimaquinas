import { Clock, CheckCircle2, AlertCircle, Image as ImageIcon, Plus, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ActivityItem {
    id: string;
    type: 'ORDER_CREATED' | 'STATUS_CHANGED' | 'REPORT_ADDED';
    title: string;
    description: string;
    time: Date;
    brand?: string;
    image?: string;
}

export default function ActivityTimeline({ items }: { items: ActivityItem[] }) {
    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 italic text-sm">
                    <Clock className="w-8 h-8 mb-2 opacity-20" />
                    Sin actividad reciente
                </div>
            ) : (
                items.map((item, i) => (
                    <div key={item.id} className="relative pl-8 group">
                        {/* Línea conectora */}
                        {i !== items.length - 1 && (
                            <div className="absolute left-3 top-6 bottom-[-24px] w-[2px] bg-slate-100 dark:bg-zinc-800 group-hover:bg-blue-200 transition-colors" />
                        )}

                        {/* Punto / Icono */}
                        <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white dark:bg-zinc-950 z-10 
              ${item.type === 'ORDER_CREATED' ? 'border-emerald-500 text-emerald-500' :
                                item.type === 'STATUS_CHANGED' ? 'border-blue-500 text-blue-500' :
                                    'border-slate-800 text-slate-800'}`}
                        >
                            {item.type === 'ORDER_CREATED' ? <Plus className="w-3 h-3" strokeWidth={4} /> :
                                item.type === 'STATUS_CHANGED' ? <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> :
                                    <FileText className="w-3 h-3" strokeWidth={3} />}
                        </div>

                        <div className="bg-slate-50/50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-all">
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tight italic">
                                    {item.title}
                                </h4>
                                <span className="text-[9px] font-bold text-zinc-400 whitespace-nowrap uppercase">
                                    {formatDistanceToNow(item.time, { addSuffix: true, locale: es })}
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-1 font-medium">{item.description}</p>

                            {item.image && (
                                <div className="mt-2 relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <img src={item.image} alt="Evidencia" className="object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ImageIcon className="w-4 h-4 text-white drop-shadow-md" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
