"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function registerAction(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!name || !email || !password) {
            return { error: "Todos los campos son obligatorios" };
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "El correo ya está registrado" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Determines role for demonstration purposes (First user is Admin)
        const usersCount = await prisma.user.count();
        const role = usersCount === 0 ? "ADMIN" : "RECEPCION";

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        return { success: "Cuenta creada exitosamente. Ya puedes iniciar sesión." };
    } catch (error) {
        console.error("Register Error:", error);
        return { error: "Ocurrió un error al registrar la cuenta." };
    }
}

export async function loginAction(formData: FormData) {
    try {
        await signIn("credentials", formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Credenciales inválidas." };
                default:
                    return { error: "Ocurrió un error al iniciar sesión." };
            }
        }
        // Respect Next.js redirect mechanism
        if (isRedirectError(error)) {
            throw error;
        }
    }
}
