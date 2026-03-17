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

        await prisma.customer.delete({ where: { id } });
        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error: any) {
        return handleServerError(error);
    }
}
