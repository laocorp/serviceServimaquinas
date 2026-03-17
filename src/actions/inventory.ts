"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureAdmin, ensureStaff, handleServerError } from "@/lib/security";
import { inventorySchema } from "@/lib/validations";

export async function createInventoryItem(formData: FormData) {
    try {
        await ensureStaff();

        const rawData = {
            sku: formData.get("sku") as string,
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            unitPrice: parseFloat(formData.get("unitPrice") as string),
            quantity: parseInt(formData.get("quantity") as string, 10),
            minQuantity: parseInt(formData.get("minQuantity") as string, 10),
        };

        const validated = inventorySchema.parse(rawData);

        const existing = await prisma.inventoryItem.findUnique({
            where: { sku: validated.sku }
        });

        if (existing) {
            return { error: "Ya existe un artículo con ese código técnico." };
        }

        await prisma.inventoryItem.create({
            data: { ...validated }
        });

        revalidatePath("/dashboard/inventory");
    } catch (error: any) {
        return handleServerError(error);
    }

    redirect("/dashboard/inventory");
}

export async function updateInventoryItem(id: string, formData: FormData) {
    try {
        await ensureStaff();

        const rawData = {
            sku: formData.get("sku") as string,
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            unitPrice: parseFloat(formData.get("unitPrice") as string),
            quantity: parseInt(formData.get("quantity") as string, 10),
            minQuantity: parseInt(formData.get("minQuantity") as string, 10),
        };

        const validated = inventorySchema.parse(rawData);

        const existing = await prisma.inventoryItem.findUnique({
            where: { sku: validated.sku }
        });

        if (existing && existing.id !== id) {
            return { error: "Ya existe otro artículo con ese código." };
        }

        await prisma.inventoryItem.update({
            where: { id },
            data: { ...validated }
        });

        revalidatePath("/dashboard/inventory");
    } catch (error: any) {
        return handleServerError(error);
    }

    redirect("/dashboard/inventory");
}

export async function deleteInventoryItem(id: string) {
    try {
        await ensureAdmin();

        const isUsed = await prisma.workOrderItem.findFirst({
            where: { itemId: id }
        });

        if (isUsed) {
            return { error: "No se puede eliminar porque ha sido usado en una orden (Integridad de datos)." };
        }

        await prisma.inventoryItem.delete({ where: { id } });
        revalidatePath("/dashboard/inventory");
        return { success: true };
    } catch (error: any) {
        return handleServerError(error);
    }
}
