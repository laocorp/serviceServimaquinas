"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureAdmin, handleServerError } from "@/lib/security";
import { productSchema, categorySchema } from "@/lib/validations";

// ─── CATEGORÍAS DE TIENDA ───────────────────────────────────

export async function getStoreCategories() {
    try {
        return await prisma.storeCategory.findMany({
            orderBy: { name: "asc" }
        });
    } catch (error) {
        return [];
    }
}

export async function createStoreCategory(name: string) {
    try {
        await ensureAdmin();
        const validated = categorySchema.parse({ name });

        const cat = await prisma.storeCategory.create({
            data: { name: validated.name.trim() }
        });

        revalidatePath("/dashboard/store");
        return { success: "Categoría creada", data: cat };
    } catch (error: any) {
        return handleServerError(error);
    }
}

// ─── PRODUCTOS ──────────────────────────────────────────────

export async function getStoreProducts(query?: string) {
    try {
        const products = await prisma.product.findMany({
            where: query ? {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            } : {},
            include: { category: true },
            orderBy: { createdAt: "desc" }
        });

        return products.map(p => ({
            ...p,
            price: Number(p.price),
            promoPrice: p.promoPrice ? Number(p.promoPrice) : null
        }));
    } catch (error) {
        return [];
    }
}

export async function getPromotionProducts() {
    try {
        const products = await prisma.product.findMany({
            where: { isPromotion: true },
            include: { category: true },
            take: 20
        });

        return products.map(p => ({
            ...p,
            price: Number(p.price),
            promoPrice: p.promoPrice ? Number(p.promoPrice) : null
        }));
    } catch (error) {
        return [];
    }
}

export async function createProduct(formData: FormData) {
    try {
        await ensureAdmin();

        const rawData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            price: parseFloat(formData.get("price") as string),
            stock: parseInt(formData.get("stock") as string, 10),
            isPromotion: formData.get("isPromotion") === "true",
            promoPrice: formData.get("promoPrice") ? parseFloat(formData.get("promoPrice") as string) : null,
            categoryId: formData.get("categoryId") as string,
            image: formData.get("image") as string,
        };

        const validated = productSchema.parse(rawData);

        const product = await prisma.product.create({
            data: {
                ...validated,
                categoryId: validated.categoryId
            }
        });

        revalidatePath("/dashboard/store");
        revalidatePath("/");
        return { success: "Producto creado correctamente", data: product };
    } catch (error) {
        return handleServerError(error);
    }
}

export async function updateProduct(id: string, formData: FormData) {
    try {
        await ensureAdmin();

        const rawData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            price: parseFloat(formData.get("price") as string),
            stock: parseInt(formData.get("stock") as string, 10),
            isPromotion: formData.get("isPromotion") === "true",
            promoPrice: formData.get("promoPrice") ? parseFloat(formData.get("promoPrice") as string) : null,
            categoryId: formData.get("categoryId") as string,
            image: formData.get("image") as string,
        };

        const validated = productSchema.parse(rawData);

        await prisma.product.update({
            where: { id },
            data: {
                ...validated,
                categoryId: validated.categoryId
            }
        });

        revalidatePath("/dashboard/store");
        revalidatePath("/");
        return { success: "Producto actualizado correctamente" };
    } catch (error) {
        return handleServerError(error);
    }
}

export async function deleteProduct(id: string) {
    try {
        await ensureAdmin();
        await prisma.product.delete({ where: { id } });
        revalidatePath("/dashboard/store");
        revalidatePath("/");
        return { success: "Producto eliminado" };
    } catch (error) {
        return handleServerError(error);
    }
}
