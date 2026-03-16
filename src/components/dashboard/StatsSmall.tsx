export default function StatsSmall({ title, value, subtext, color, icon: Icon }: any) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all group flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] italic mb-1">{title}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
                </div>
                <div className={`p-2.5 rounded-2xl ${color} transition-transform group-hover:scale-110 duration-500`}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-500 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {subtext}
            </p>
        </div>
    );
}
