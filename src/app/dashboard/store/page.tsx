import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export default async function StoreManagementPage() {
    const session = await auth();
    const role = session?.user?.role || "TECNICO";
    const isAdmin = role === "ADMIN";

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="text-zinc-500 mt-2">Solo los administradores pueden gestionar el escaparate de la tienda.</p>
                <Link href="/dashboard" className="mt-4 text-blue-600 underline">Volver al Dashboard</Link>
            </div>
        );
    }

    const products = await (prisma as any).product.findMany({
        include: { storeCategory: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">Escaparate de Tienda</h1>
                    <p className="text-zinc-500 mt-1">Gestiona los productos que aparecen en la página principal.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dashboard/store/categories" className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-slate-600 dark:text-zinc-400">
                        Categorías
                    </Link>
                    <Link href="/dashboard/store/new" className="flex items-center gap-2 bg-[#0073CF] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-[#0060B0]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Añadir Producto
                    </Link>
                </div>
            </div>

            {/* Grid de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        <p className="text-zinc-400">No hay productos en el escaparate.</p>
                        <Link href="/dashboard/store/new" className="text-[#0073CF] font-bold mt-2 inline-block hover:underline">Empieza por añadir el primero</Link>
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    </div>
                                )}
                                {product.isPromotion && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                                        Oferta
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-[10px] uppercase tracking-widest text-[#0073CF] font-bold mb-1">
                                    {product.storeCategory?.name || "Sin Categoría"}
                                </p>
                                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm mb-2 line-clamp-1">{product.name}</h3>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col">
                                        {product.isPromotion && product.promoPrice ? (
                                            <>
                                                <span className="text-xs text-zinc-400 line-through">${product.price.toLocaleString()}</span>
                                                <span className="text-lg font-black text-red-600">${product.promoPrice.toLocaleString()}</span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-black text-slate-900 dark:text-zinc-100">${product.price.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin Stock'}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href={`/dashboard/store/${product.id}`} className="text-center py-2 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                        Editar
                                    </Link>
                                    <Link href={`/dashboard/store/${product.id}/preview`} className="text-center py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                        Vista Previa
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
