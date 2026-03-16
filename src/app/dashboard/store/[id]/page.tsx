import { prisma } from "@/lib/prisma";
import { getStoreCategories } from "@/actions/store";
import { ProductForm } from "../product-form";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: productId } = await params;

    let product;
    try {
        // Log to identify the ID format causing the error
        console.log("Fetching product with ID:", productId);

        product = await (prisma as any).product.findUnique({
            where: { id: productId }
        });
    } catch (error: any) {
        console.error("Error fetching product:", error.message);
        // If it was an Int mismatch, the message would confirm.
        // We try a fallback in case it was expecting a number (legacy data)
        try {
            const numericId = parseInt(productId);
            if (!isNaN(numericId)) {
                product = await (prisma as any).product.findUnique({
                    where: { id: numericId as any }
                });
            }
        } catch (e) {
            console.error("Fallback fetch failed too.");
        }

        if (!product) throw error;
    }

    if (!product) notFound();

    let categories = [];
    try {
        categories = await getStoreCategories();
    } catch (error) {
        console.error("Error fetching categories:", error);
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
                <Link href="/dashboard/store" className="text-xs font-bold text-zinc-400 hover:text-[#0073CF] transition-colors flex items-center gap-1 mb-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Volver al escaparate
                </Link>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Editar Producto</h1>
                <p className="text-zinc-500">Modifica los detalles del producto: {product.name}</p>
            </div>

            <ProductForm categories={categories} initialData={product} />
        </div>
    );
}
