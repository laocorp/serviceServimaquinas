import { getStoreCategories } from "@/actions/store";
import { ProductForm } from "../product-form";
import Link from "next/link";

export default async function NewProductPage() {
    const categories = await getStoreCategories();

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
                <Link href="/dashboard/store" className="text-xs font-bold text-zinc-400 hover:text-[#0073CF] transition-colors flex items-center gap-1 mb-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Volver al escaparate
                </Link>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Nuevo Producto</h1>
                <p className="text-zinc-500">Publica una nueva herramienta o repuesto en la página principal.</p>
            </div>

            <ProductForm categories={categories} />
        </div>
    );
}
