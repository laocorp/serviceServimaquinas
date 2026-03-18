"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureStaff, handleServerError } from "@/lib/security";
import { customerSchema } from "@/lib/validations";

export async function createCustomer(formData: FormData) {
    try {
        await ensureStaff();

        const rawData = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            dni: formData.get("dni") as string,
            address: formData.get("address") as string,
            isVIP: formData.get("isVIP") === "on",
        };

        const validated = customerSchema.parse(rawData);

        if (validated.email) {
            const existingEmail = await prisma.customer.findUnique({ where: { email: validated.email } });
            if (existingEmail) return { error: "Ya existe un cliente con este correo." };
        }

        if (validated.dni) {
            const existingDni = await prisma.customer.findUnique({ where: { dni: validated.dni } });
            if (existingDni) return { error: "Ya existe un cliente con este DNI/Documento." };
        }

        await prisma.customer.create({
            data: { ...validated }
        });

        revalidatePath("/dashboard/customers");
    } catch (error: any) {
        return handleServerError(error);
    }

    redirect("/dashboard/customers");
}

export async function createCustomerInline(formData: FormData) {
    try {
        await ensureStaff();

        const rawData = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
        };

        const validated = customerSchema.partial().parse(rawData);

        if (validated.email) {
            const existing = await prisma.customer.findUnique({ where: { email: validated.email } });
            if (existing) throw new Error("Ya existe un cliente con este correo.");
        }

        const customer = await prisma.customer.create({
            data: {
                name: validated.name || "S/N",
                email: validated.email || null,
                phone: validated.phone || null,
                isVIP: false,
            },
            select: { id: true, name: true, isVIP: true, phone: true, email: true },
        });

        revalidatePath("/dashboard/customers");
        revalidatePath("/dashboard/orders/new");
        return customer;

    } catch (error: any) {
        return handleServerError(error);
    }
}

export async function updateCustomer(id: string, formData: FormData) {
    try {
        await ensureStaff();

        const rawData = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            dni: formData.get("dni") as string,
            address: formData.get("address") as string,
            isVIP: formData.get("isVIP") === "on",
        };

        const validated = customerSchema.parse(rawData);

        if (validated.email) {
            const existingEmail = await prisma.customer.findUnique({
                where: { email: validated.email }
            });
            if (existingEmail && existingEmail.id !== id) {
                return { error: "Ya existe otro cliente con este correo." };
            }
        }

        await prisma.customer.update({
            where: { id },
            data: { ...validated }
        });

        revalidatePath("/dashboard/customers");
    } catch (error: any) {
        return handleServerError(error);
    }

    redirect("/dashboard/customers");
}

export async function deleteCustomer(id: string) {
    try {
        await ensureStaff();

        const hasOrders = await prisma.workOrder.findFirst({
            where: { customerId: id }
        });

        if (hasOrders) {
            return { error: "No se puede eliminar un cliente con historial de órdenes." };
        }

        await prisma.customer.delete({ where: { id: id } });
        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error: any) {
        return handleServerError(error);
    }
}

export async function registerTool(customerId: string, formData: FormData) {
    try {
        await ensureStaff();

        const name = formData.get("name") as string;
        const brand = formData.get("brand") as string;
        const model = formData.get("model") as string;
        const serialNumber = formData.get("serialNumber") as string;
        const condition = formData.get("condition") as "NUEVA" | "USADA";
        const isPurchasedHere = formData.get("isPurchasedHere") === "true";

        if (!name || !brand || !serialNumber) {
            throw new Error("Nombre, marca y serial son obligatorios.");
        }

        // Lógica de Mantenimiento Preventivo Bosch (Solo para NUEVAS)
        let nextMaintenance: Date | null = null;
        if (brand.toUpperCase() === "BOSCH" && condition === "NUEVA") {
            const now = new Date();
            // Programar para dentro de 3 meses
            nextMaintenance = new Date(now.setMonth(now.getMonth() + 3));
        }

        const tool = await prisma.customerTool.create({
            data: {
                customerId,
                name,
                brand,
                model: model || null,
                serialNumber,
                condition,
                isPurchasedHere,
                nextMaintenance,
                purchaseDate: isPurchasedHere ? new Date() : null
            }
        });

        revalidatePath(`/dashboard/customers/${customerId}`);
        return { success: "Herramienta registrada correctamente", data: tool };

    } catch (error: any) {
        return handleServerError(error);
    }
}

export async function getCustomerTools(customerId: string) {
    try {
        return await prisma.customerTool.findMany({
            where: { customerId },
            include: { maintenanceLogs: { orderBy: { serviceDate: "desc" } } },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        return [];
    }
}

export async function performMaintenance(toolId: string, formData: FormData) {
    try {
        await ensureStaff();

        const description = formData.get("description") as string;
        const observations = formData.get("observations") as string;
        const nextDateStr = formData.get("nextDate") as string;

        if (!description || !nextDateStr) {
            throw new Error("Descripción y próxima fecha son obligatorias.");
        }

        const nextDate = new Date(nextDateStr);
        const tool = await prisma.customerTool.findUnique({
            where: { id: toolId },
            select: { customerId: true }
        });

        if (!tool) throw new Error("Equipo no encontrado.");

        const log = await prisma.maintenanceLog.create({
            data: {
                toolId,
                description,
                observations,
                nextDate,
                serviceDate: new Date()
            }
        });

        // Actualizar la herramienta con la nueva fecha programada
        await prisma.customerTool.update({
            where: { id: toolId },
            data: { nextMaintenance: nextDate }
        });

        revalidatePath(`/dashboard/customers/${tool.customerId}`);
        revalidatePath("/dashboard"); // Para actualizar alertas

        return { success: "Mantenimiento registrado correctamente", data: log };

    } catch (error: any) {
        return handleServerError(error);
    }
}
