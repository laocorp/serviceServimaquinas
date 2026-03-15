"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function createInventoryItem(formData: FormData) {
    const session = await auth();
    if (!session || session.user.role === "TECNICO") return { error: "No autorizado." };

    const code = formData.get("code") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string, 10);
    const minStock = parseInt(formData.get("minStock") as string, 10);

    if (!code || !name || isNaN(price)) {
        return { error: "El código, nombre y precio son obligatorios." };
    }

    try {
        const existing = await prisma.inventoryItem.findUnique({
            where: { code }
        });

        if (existing) {
            return { error: "Ya existe un artículo con ese código." };
        }

        await prisma.inventoryItem.create({
            data: {
                code,
                name,
                description,
                price,
                stock: isNaN(stock) ? 0 : stock,
                minStock: isNaN(minStock) ? 5 : minStock,
            }
        });

    } catch (error: any) {
        return { error: "Error al crear el artículo en la base de datos." };
    }

    // Clear cache and go back
    revalidatePath("/dashboard/inventory");
    redirect("/dashboard/inventory");
}

export async function updateInventoryItem(id: string, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role === "TECNICO") return { error: "No autorizado." };

    const code = formData.get("code") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string, 10);
    const minStock = parseInt(formData.get("minStock") as string, 10);

    if (!code || !name || isNaN(price)) {
        return { error: "El código, nombre y precio son obligatorios." };
    }

    try {
        const existing = await prisma.inventoryItem.findUnique({
            where: { code }
        });

        if (existing && existing.id !== id) {
            return { error: "Ya existe otro artículo con ese código." };
        }

        await prisma.inventoryItem.update({
            where: { id },
            data: {
                code,
                name,
                description,
                price,
                stock: isNaN(stock) ? 0 : stock,
                minStock: isNaN(minStock) ? 5 : minStock,
            }
        });

    } catch (error: any) {
        return { error: "Error al actualizar el artículo." };
    }

    revalidatePath("/dashboard/inventory");
    redirect("/dashboard/inventory");
}

export async function deleteInventoryItem(id: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Solo los administradores pueden eliminar inventario." };

    try {
        // Verificar si está asociado a órdenes
        const isUsed = await prisma.workOrderItem.findFirst({
            where: { inventoryItemId: id }
        });

        if (isUsed) {
            return { error: "No se puede eliminar porque ha sido usado en una orden." };
        }

        await prisma.inventoryItem.delete({
            where: { id }
        });
    } catch (error: any) {
        return { error: "Error al eliminar el artículo." };
    }

    revalidatePath("/dashboard/inventory");
    // Cannot redirect from inside a non-form action easily without client router, 
    // so we just return success
    return { success: true };
}
