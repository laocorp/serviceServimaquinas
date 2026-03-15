"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function createCustomer(formData: FormData) {
    const session = await auth();
    if (!session || session.user.role === "TECNICO") return { error: "No autorizado." };

    const documentId = formData.get("documentId") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const isVIP = formData.get("isVIP") === "on";
    const notes = formData.get("notes") as string;

    if (!firstName || !lastName) {
        return { error: "El nombre y apellido son obligatorios." };
    }

    try {
        if (email) {
            const existingEmail = await prisma.customer.findUnique({ where: { email } });
            if (existingEmail) return { error: "Ya existe un cliente con este correo." };
        }

        await prisma.customer.create({
            data: {
                documentId: documentId || null,
                firstName, lastName,
                email: email || null, phone: phone || null,
                isVIP, notes: notes || null,
                loyaltyPoints: isVIP ? 100 : 0
            }
        });

    } catch (error: any) {
        return { error: "Error al crear el cliente en la base de datos." };
    }

    revalidatePath("/dashboard/customers");
    redirect("/dashboard/customers");
}

// Versión sin redirect — para el modal de orden nueva (retorna el cliente creado)
export async function createCustomerInline(formData: FormData) {
    const session = await auth();
    if (!session || session.user.role === "TECNICO") return { error: "No autorizado." };

    const documentId = formData.get("documentId") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!firstName || !lastName) {
        return { error: "El nombre y apellido son obligatorios." };
    }

    try {
        if (email) {
            const existing = await prisma.customer.findUnique({ where: { email } });
            if (existing) return { error: "Ya existe un cliente con este correo." };
        }

        const customer = await prisma.customer.create({
            data: {
                documentId: documentId || null,
                firstName, lastName,
                email: email || null, phone: phone || null,
                isVIP: false, loyaltyPoints: 0,
            },
            select: { id: true, firstName: true, lastName: true, isVIP: true, phone: true, email: true },
        });

        revalidatePath("/dashboard/customers");
        revalidatePath("/dashboard/orders/new");
        return customer;

    } catch (error: any) {
        return { error: "Error al crear el cliente." };
    }
}


export async function updateCustomer(id: string, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role === "TECNICO") return { error: "No autorizado." };

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const isVIP = formData.get("isVIP") === "on";
    const notes = formData.get("notes") as string;

    if (!firstName || !lastName) {
        return { error: "El nombre y apellido son obligatorios." };
    }

    try {
        if (email) {
            const existingEmail = await prisma.customer.findUnique({
                where: { email }
            });
            if (existingEmail && existingEmail.id !== id) {
                return { error: "Ya existe otro cliente con este correo." };
            }
        }

        await prisma.customer.update({
            where: { id },
            data: {
                firstName,
                lastName,
                email: email || null,
                phone: phone || null,
                isVIP,
                notes: notes || null,
            }
        });

    } catch (error: any) {
        return { error: "Error al actualizar el cliente." };
    }

    revalidatePath("/dashboard/customers");
    redirect("/dashboard/customers");
}

export async function deleteCustomer(id: string) {
    const session = await auth();
    if (!session || session.user.role === "TECNICO") return { error: "No autorizado." };

    try {
        // Verificar si tiene órdenes
        const hasOrders = await prisma.workOrder.findFirst({
            where: { customerId: id }
        });

        if (hasOrders) {
            return { error: "No se puede eliminar un cliente con historial de órdenes." };
        }

        await prisma.customer.delete({
            where: { id }
        });
    } catch (error: any) {
        return { error: "Error al eliminar el cliente." };
    }

    revalidatePath("/dashboard/customers");
    return { success: true };
}
