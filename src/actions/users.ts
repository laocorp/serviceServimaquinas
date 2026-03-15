"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { auth } from "@/auth";

export async function registerUser(formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Solo administradores pueden gestionar usuarios." };

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const role = formData.get("role") as Role;

    if (!name || !email || !password || !role) {
        return { error: "Todos los campos son obligatorios." };
    }
    if (password.length < 6) {
        return { error: "La contraseña debe tener al menos 6 caracteres." };
    }
    if (!["ADMIN", "TECNICO", "RECEPCION"].includes(role)) {
        return { error: "Rol inválido." };
    }

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return { error: "Ya existe un usuario con ese correo electrónico." };
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        revalidatePath("/dashboard/settings");
        return { user };

    } catch (error) {
        console.error("registerUser error:", error);
        return { error: "Error al crear el usuario." };
    }
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "No autorizado." };

    try {
        // No permitir eliminar si tiene órdenes asignadas
        const hasOrders = await prisma.workOrder.findFirst({
            where: { OR: [{ createdById: userId }, { technicianId: userId }] }
        });
        if (hasOrders) {
            return { error: "Este usuario tiene órdenes de trabajo asociadas y no puede eliminarse." };
        }

        await prisma.user.delete({ where: { id: userId } });
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch {
        return { error: "Error al eliminar el usuario." };
    }
}

export async function updateUserRole(userId: string, role: Role) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "No autorizado." };

    try {
        await prisma.user.update({ where: { id: userId }, data: { role } });
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch {
        return { error: "Error al actualizar el rol." };
    }
}
