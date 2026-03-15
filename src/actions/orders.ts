"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/auth";

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
    const session = await auth();
    if (!session || session.user.role === "TECNICO") return { error: "No autorizado." };

    const customerId = formData.get("customerId") as string;
    const createdById = formData.get("createdById") as string;
    const deviceBrand = formData.get("deviceBrand") as string;
    const deviceModel = formData.get("deviceModel") as string;
    const deviceSerial = formData.get("deviceSerial") as string;
    const reportedIssue = formData.get("reportedIssue") as string;

    if (!customerId || !createdById || !deviceBrand || !deviceModel || !reportedIssue) {
        return { error: "Faltan campos obligatorios para crear la orden." };
    }

    // Generar código único de rastreo
    let trackingCode = generateTrackingCode();
    let isUnique = false;

    while (!isUnique) {
        const existing = await prisma.workOrder.findUnique({ where: { trackingCode } });
        if (!existing) {
            isUnique = true;
        } else {
            trackingCode = generateTrackingCode();
        }
    }

    try {
        await prisma.workOrder.create({
            data: {
                trackingCode,
                customerId,
                createdById,
                deviceBrand,
                deviceModel,
                deviceSerial: deviceSerial || null,
                reportedIssue,
                status: "PENDIENTE"
            }
        });

    } catch (error: any) {
        console.error("CREATE ORDER ERROR:", error);
        return { error: "Error al crear la orden de trabajo en la base de datos." };
    }

    revalidatePath("/dashboard/orders");
    redirect("/dashboard/orders");
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, technicianId?: string) {
    const session = await auth();
    if (!session) return { error: "No autorizado." };

    try {
        const data: any = { status };
        if (technicianId) {
            data.technicianId = technicianId;
        }

        await prisma.workOrder.update({
            where: { id: orderId },
            data
        });

        revalidatePath(`/dashboard/orders/${orderId}`);
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar el estado." };
    }
}

export async function addInventoryItemToOrder(orderId: string, inventoryItemId: string, quantity: number) {
    const session = await auth();
    if (!session || session.user.role === "RECEPCION") return { error: "No autorizado para añadir repuestos." };

    try {
        // Transaction para asegurar que el stock baje correctamente o falle todo
        await prisma.$transaction(async (tx: any) => {
            // 1. Obtener item actual y verificar stock
            const item = await tx.inventoryItem.findUnique({ where: { id: inventoryItemId } });
            if (!item) throw new Error("Repuesto no encontrado.");
            if (item.stock < quantity) throw new Error(`Stock insuficiente. Solo quedan ${item.stock} unidades.`);

            // 2. Descontar stock
            await tx.inventoryItem.update({
                where: { id: inventoryItemId },
                data: { stock: item.stock - quantity }
            });

            // 3. Agregar elemento a la orden usando el precio en este momento exacto
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
        return { error: error.message || "Error al asignar repuesto a la orden." };
    }
}

export async function createWorkReport(orderId: string, technicianId: string, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role === "RECEPCION") return { error: "No autorizado para reportes técnicos." };

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
        return { error: "Diagnóstico y acciones realizadas son obligatorios." };
    }

    try {
        // Verificar que la orden existe y cerrar su estado a 'REPARADO'
        await prisma.$transaction(async (tx: any) => {
            // Crear reporte
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

            // Actualizar estado de orden
            await tx.workOrder.update({
                where: { id: orderId },
                data: { status: "REPARADO" }
            });
        });

        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true };
    } catch (error: any) {
        return { error: "Error al guardar el informe." };
    }
}
