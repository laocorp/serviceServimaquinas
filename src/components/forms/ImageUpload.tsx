"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
    onImagesChange: (urls: string[]) => void;
    maxImages?: number;
}

export default function ImageUpload({ onImagesChange, maxImages = 5 }: ImageUploadProps) {
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > maxImages) {
            toast.error(`Solo puedes subir hasta ${maxImages} imágenes.`);
            return;
        }

        setUploading(true);
        const newImages = [...images];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Form data para subir a la ruta de API que crearemos
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) throw new Error("Error al subir imagen");

                const blob = await response.json();
                newImages.push(blob.url);
            }

            setImages(newImages);
            onImagesChange(newImages);
            toast.success("Imágenes cargadas correctamente.");
        } catch (error) {
            console.error("UPLOAD ERROR:", error);
            toast.error("Hubo un fallo al subir una o más imágenes.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = (index: number) => {
        const updated = images.filter((_, i) => i !== index);
        setImages(updated);
        onImagesChange(updated);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-200">Evidencias Fotográficas ({images.length}/{maxImages})</p>
                <button
                    type="button"
                    disabled={uploading || images.length >= maxImages}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline"
                >
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Subir Fotos
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                />
            </div>

            {images.length > 0 ? (
                <div className="grid grid-cols-5 gap-3">
                    {images.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
                            <img src={url} alt={`Evidencia ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-zinc-500 text-center">Haz clic para subir fotos del equipo o reparaciones.<br />Formatos: JPG, PNG.</p>
                </div>
            )}
        </div>
    );
}
