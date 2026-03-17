import NextAuth, { type DefaultSession } from "next-auth";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Extend session type to include user role
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }
    interface User {
        role?: string;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                try {
                    console.log("AUTH: Intento de login para:", credentials?.email);

                    if (!credentials?.email || !credentials?.password) {
                        console.error("AUTH: Faltan credenciales");
                        return null;
                    }

                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email as string }
                    });

                    if (!user || !user.password) {
                        console.error("AUTH: Usuario no encontrado o sin password:", credentials.email);
                        return null;
                    }

                    console.log("AUTH: Usuario encontrado, comparando passwords...");

                    const passwordsMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    if (!passwordsMatch) {
                        console.error("AUTH: Password incorrecta para:", credentials.email);
                        return null;
                    }

                    console.log("AUTH: Login exitoso para:", user.email);

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("AUTH ERROR CRITICO:", error);
                    return null;
                }
            }
        })
    ]
});
