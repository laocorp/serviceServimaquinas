import { writeFile, mkdir } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validar tipo de archivo
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
        }

        // Validar tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "El archivo no puede superar 5MB" }, { status: 400 });
        }

        // Crear nombre único para el archivo
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        // Directorio de uploads dentro de public (accesible desde el navegador)
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });

        // Guardar archivo en disco
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(uploadsDir, filename), buffer);

        // Retornar URL pública relativa
        const url = `/uploads/${filename}`;
        return NextResponse.json({ url });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        return NextResponse.json({ error: "Error al guardar el archivo" }, { status: 500 });
    }
}
