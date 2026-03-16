import { auth } from "@/auth";

/**
 * Verifica si el usuario actual es ADMINISTRADOR.
 * Lanza un error si no está autenticado o no tiene el rol.
 */
export async function ensureAdmin() {
    const session = await auth();
    if (!session) {
        throw new Error("Sesión no iniciada.");
    }
    if (session.user.role !== "ADMIN") {
        throw new Error("Acceso restringido. Se requiere perfil de Administrador.");
    }
    return session.user;
}

/**
 * Verifica si el usuario tiene rol STAFF (ADMIN, RECEPCION o TECNICO).
 * Lanza un error si el usuario no tiene permisos mínimos de sistema.
 */
export async function ensureStaff() {
    const session = await auth();
    const validRoles = ["ADMIN", "RECEPCION", "TECNICO"];

    if (!session || !validRoles.includes(session.user.role)) {
        throw new Error("Acceso denegado. Permisos de staff insuficientes.");
    }
    return session.user;
}

/**
 * Evita la fuga de datos técnicos en errores del servidor.
 */
export function handleServerError(error: any) {
    console.error("SERVER ERROR:", error);

    // Si es un error de validación o autorización que nosotros lanzamos, pasamos el mensaje.
    if (error instanceof Error && (
        error.message.includes("No autorizado") ||
        error.message.includes("restringido") ||
        error.message.includes("obligatorios")
    )) {
        return { error: error.message };
    }

    // Para errores de DB u otros, devolvemos un mensaje genérico.
    return { error: "Ha ocurrido un error interno en el servidor técnico. Por favor, contacte soporte." };
}
