"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function checkAdmin() {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("No autorizado. Se requiere perfil de Administrador.");
    }
}

// ─── CATEGORÍAS DE TIENDA ───────────────────────────────────

export async function getStoreCategories() {
    return await (prisma as any).storeCategory.findMany({
        orderBy: { name: "asc" }
    });
}

export async function createStoreCategory(name: string) {
    await checkAdmin();
    try {
        const cat = await (prisma as any).storeCategory.create({
            data: { name: name.trim() }
        });
        revalidatePath("/dashboard/store");
        return { success: "Categoría creada", data: cat };
    } catch (error: any) {
        return { error: "Error al crear categoría (posible duplicada)" };
    }
}

// ─── PRODUCTOS ──────────────────────────────────────────────

export async function getStoreProducts(query?: string) {
    return await (prisma as any).product.findMany({
        where: query ? {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        } : {},
        include: { storeCategory: true },
        orderBy: { createdAt: "desc" }
    });
}

export async function getPromotionProducts() {
    return await (prisma as any).product.findMany({
        where: { isPromotion: true },
        include: { storeCategory: true },
        take: 20
    });
}

export async function createProduct(formData: FormData) {
    await checkAdmin();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string) || 0;
    const isPromotion = formData.get("isPromotion") === "true";
    const promoPrice = formData.get("promoPrice") ? parseFloat(formData.get("promoPrice") as string) : null;
    const categoryId = formData.get("categoryId") as string;
    const image = formData.get("image") as string;

    try {
        const product = await (prisma as any).product.create({
            data: {
                name,
                description,
                price,
                stock,
                isPromotion,
                promoPrice,
                image,
                categoryId: categoryId || null
            }
        });
        revalidatePath("/dashboard/store");
        revalidatePath("/");
        return { success: "Producto creado correctamente", data: product };
    } catch (error) {
        return { error: "Error al crear el producto" };
    }
}

export async function updateProduct(id: string, formData: FormData) {
    await checkAdmin();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string) || 0;
    const isPromotion = formData.get("isPromotion") === "true";
    const promoPrice = formData.get("promoPrice") ? parseFloat(formData.get("promoPrice") as string) : null;
    const categoryId = formData.get("categoryId") as string;
    const image = formData.get("image") as string;

    try {
        await (prisma as any).product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                stock,
                isPromotion,
                promoPrice,
                image,
                categoryId: categoryId || null
            }
        });
        revalidatePath("/dashboard/store");
        revalidatePath("/");
        return { success: "Producto actualizado correctamente" };
    } catch (error) {
        return { error: "Error al actualizar el producto" };
    }
}

export async function deleteProduct(id: string) {
    await checkAdmin();
    try {
        await (prisma as any).product.delete({ where: { id } });
        revalidatePath("/dashboard/store");
        revalidatePath("/");
        return { success: "Producto eliminado" };
    } catch (error) {
        return { error: "Error al eliminar el producto" };
    }
}
