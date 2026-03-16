"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { ensureStaff, handleServerError } from "@/lib/security";
import { orderSchema } from "@/lib/validations";

// Generador de Código de Rastreo Aleatorio
function generateTrackingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SRV-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function createOrder(formData: FormData) {
    try {
        await ensureStaff();

        const rawData = {
            customerId: formData.get("customerId") as string,
            createdById: formData.get("createdById") as string,
            deviceBrand: formData.get("deviceBrand") as string,
            deviceModel: formData.get("deviceModel") as string,
            deviceSerial: formData.get("deviceSerial") as string,
            reportedIssue: formData.get("reportedIssue") as string,
        };

        const validated = orderSchema.parse(rawData);

        // Generar código único de rastreo
        let trackingCode = generateTrackingCode();
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            const existing = await prisma.workOrder.findUnique({ where: { trackingCode } });
            if (!existing) {
                isUnique = true;
            } else {
                trackingCode = generateTrackingCode();
                attempts++;
            }
        }

        await prisma.workOrder.create({
            data: {
                ...validated,
                trackingCode,
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

        await prisma.workOrder.update({
            where: { id: orderId },
            data
        });

        revalidatePath(`/dashboard/orders/${orderId}`);
        revalidatePath("/dashboard/orders");
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
            if (item.stock < quantity) throw new Error(`Stock insuficiente para ${item.name}.`);

            await tx.inventoryItem.update({
                where: { id: inventoryItemId },
                data: { stock: item.stock - quantity }
            });

            await tx.workOrderItem.create({
                data: {
                    workOrderId: orderId,
                    inventoryItemId,
                    quantity,
                    priceAtTime: item.price
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
                    workOrderId: orderId,
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
