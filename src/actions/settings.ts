"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getSettings() {
    let settings = await prisma.systemSettings.findUnique({
        where: { id: "global" }
    });

    if (!settings) {
        settings = await prisma.systemSettings.create({
            data: {
                id: "global",
                companyName: "Servimaquinas",
                phone: "",
                publicUrl: "http://localhost:3000",
                currency: "USD"
            }
        });
    }

    return settings;
}

export async function updateSettings(formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Solo administradores pueden cambiar la configuración." };

    const companyName = formData.get("companyName") as string;
    const documentId = formData.get("documentId") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const publicUrl = formData.get("publicUrl") as string;
    const currency = formData.get("currency") as string;

    if (!companyName) {
        return { error: "El nombre de la empresa es obligatorio." };
    }

    try {
        const data = {
            companyName,
            documentId: documentId || null,
            address: address || null,
            phone: phone || "",
            email: email || null,
            publicUrl: publicUrl || "http://localhost:3000",
            currency: currency || "USD",
        };

        // Upsert since the row might not exist yet
        await prisma.systemSettings.upsert({
            where: { id: "global" },
            update: data,
            create: {
                id: "global",
                ...data
            }
        });

    } catch (error: any) {
        return { error: "Error al actualizar configuraciones." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath("/"); // Update landing page if needed

    return { success: true };
}
