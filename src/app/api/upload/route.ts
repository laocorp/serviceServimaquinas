import { writeFile, mkdir } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { ensureStaff } from "@/lib/security";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // 1. Autorización: Solo el staff puede subir evidencias técnicos o productos
        await ensureStaff();

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
        }

        // 2. Validación Estricta de Mime-Type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Formato no permitido. Use JPG, PNG o WEBP." }, { status: 400 });
        }

        // 3. Validación de Tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "El archivo es demasiado grande (máx 5MB)" }, { status: 400 });
        }

        // 4. Nombre de Archivo Seguro e Impredecible
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        // Sanitizar extensión contra ataques de bypass
        const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
        const filename = `${crypto.randomUUID()}.${safeExt}`;

        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });

        // 5. Guardado Seguro
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(uploadsDir, filename), buffer);

        return NextResponse.json({ url: `/uploads/${filename}` });

    } catch (error: any) {
        console.error("SECURE UPLOAD ERROR:", error);
        // Error silenciado para el cliente
        const message = error.message.includes("Acceso denegado") || error.message.includes("Sesión")
            ? error.message
            : "Error interno al procesar la carga.";

        return NextResponse.json({ error: message }, { status: error.status || 500 });
    }
}
