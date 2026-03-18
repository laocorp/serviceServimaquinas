"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { ensureStaff, handleServerError } from "@/lib/security";
import { orderSchema } from "@/lib/validations";



export async function createOrder(formData: FormData) {
    try {
        await ensureStaff();

        const rawData = {
            customerId: formData.get("customerId") as string,
            creatorId: formData.get("creatorId") as string,
            equipment: formData.get("equipment") as string,
            brand: formData.get("brand") as string,
            model: formData.get("model") as string,
            serialNumber: formData.get("serialNumber") as string,
            description: formData.get("description") as string,
        };

        const validated = orderSchema.parse(rawData);

        // Generar número de orden único (formato SM-XXXX)
        const count = await prisma.workOrder.count();
        const orderNumber = `SM-${(count + 1).toString().padStart(4, "0")}`;

        await prisma.workOrder.create({
            data: {
                ...validated,
                orderNumber,
                status: "PENDIENTE"
            }
        });

        revalidatePath("/dashboard/orders");
    } catch (error: any) {
        return handleServerError(error);
    }

    redirect("/dashboard/orders");
}

export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    technicianId?: string,
    laborCost?: number
) {
    try {
        await ensureStaff();

        const data: any = { status };
        if (technicianId) {
            data.technicianId = technicianId;
        }
        if (typeof laborCost === 'number') {
            data.laborCost = laborCost;
        }

        const oldOrder = await prisma.workOrder.findUnique({
            where: { id: orderId },
            select: { status: true, customerId: true, equipment: true, brand: true, model: true, serialNumber: true, totalCost: true }
        });

        await prisma.workOrder.update({
            where: { id: orderId },
            data
        });

        // Automatización CRM: Puntos y Registro de Herramientas
        if (status === "ENTREGADO" && oldOrder && oldOrder.status !== "ENTREGADO") {
            const pointsToAdd = Math.floor(Number(oldOrder.totalCost));

            await prisma.customer.update({
                where: { id: oldOrder.customerId },
                data: {
                    loyaltyPoints: { increment: pointsToAdd }
                }
            });

            // Registrar herramienta en historial si no existe por serial
            if (oldOrder.serialNumber) {
                const existingTool = await prisma.customerTool.findUnique({
                    where: { serialNumber: oldOrder.serialNumber }
                });

                if (!existingTool) {
                    await prisma.customerTool.create({
                        data: {
                            customerId: oldOrder.customerId,
                            name: oldOrder.equipment,
                            brand: oldOrder.brand || "Genérica",
                            model: oldOrder.model,
                            serialNumber: oldOrder.serialNumber,
                            condition: "USADA", // Las herramientas en reparación se asumen usadas
                        }
                    });
                }
            }
        }

        revalidatePath(`/dashboard/orders/${orderId}`);
        revalidatePath("/dashboard/orders");
        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error) {
        return handleServerError(error);
    }
}

export async function addInventoryItemToOrder(orderId: string, inventoryItemId: string, quantity: number) {
    try {
        await ensureStaff();

        await prisma.$transaction(async (tx: any) => {
            const item = await tx.inventoryItem.findUnique({ where: { id: inventoryItemId } });
            if (!item) throw new Error("Repuesto no encontrado en almacén.");
            if (item.quantity < quantity) throw new Error(`Stock insuficiente para ${item.name}.`);

            await tx.inventoryItem.update({
                where: { id: inventoryItemId },
                data: { quantity: item.quantity - quantity }
            });

            const unitPrice = Number(item.unitPrice);
            const totalPrice = unitPrice * quantity;

            await tx.workOrderItem.create({
                data: {
                    orderId: orderId,
                    itemId: inventoryItemId,
                    description: item.name,
                    quantity,
                    unitPrice,
                    totalPrice
                }
            });
        });

        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return handleServerError(error);
    }
}

export async function createWorkReport(orderId: string, technicianId: string, formData: FormData) {
    try {
        await ensureStaff();

        const diagnosis = formData.get("diagnosis") as string;
        const actionsTaken = formData.get("actionsTaken") as string;
        const recommendations = formData.get("recommendations") as string;
        const imagesRaw = formData.get("images") as string; // JSON array string
        let images: string[] = [];

        try {
            if (imagesRaw) images = JSON.parse(imagesRaw);
        } catch (e) {
            images = [];
        }

        if (!diagnosis || !actionsTaken) {
            throw new Error("Diagnóstico y acciones son obligatorios.");
        }

        await prisma.$transaction(async (tx: any) => {
            await tx.workReport.create({
                data: {
                    orderId,
                    technicianId,
                    diagnosis,
                    actionsTaken,
                    recommendations: recommendations || null,
                    images: images
                }
            });

            await tx.workOrder.update({
                where: { id: orderId },
                data: { status: "REPARADO" }
            });
        });

        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return handleServerError(error);
    }
}
