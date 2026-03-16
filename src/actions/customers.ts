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
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            documentId: formData.get("documentId") as string,
            isVIP: formData.get("isVIP") === "on",
            notes: formData.get("notes") as string,
        };

        const validated = customerSchema.parse(rawData);

        if (validated.email) {
            const existingEmail = await prisma.customer.findUnique({ where: { email: validated.email } });
            if (existingEmail) return { error: "Ya existe un cliente con este correo." };
        }

        await prisma.customer.create({
            data: {
                ...validated,
                loyaltyPoints: validated.isVIP ? 100 : 0
            }
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
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
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
                firstName: validated.firstName || "S/N",
                lastName: validated.lastName || "S/N",
                email: validated.email || null,
                phone: validated.phone || null,
                isVIP: false,
                loyaltyPoints: 0,
            },
            select: { id: true, firstName: true, lastName: true, isVIP: true, phone: true, email: true },
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
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            documentId: formData.get("documentId") as string,
            isVIP: formData.get("isVIP") === "on",
            notes: formData.get("notes") as string,
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
