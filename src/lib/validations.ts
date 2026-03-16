import { z } from "zod";

// ─── ESQUEMAS DE TIENDA ──────────────────────────────────
export const productSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    description: z.string().min(5, "La descripción es muy corta"),
    price: z.number().positive("El precio debe ser mayor a 0"),
    stock: z.number().int().nonnegative("El stock no puede ser negativo"),
    isPromotion: z.boolean().default(false),
    promoPrice: z.number().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    image: z.string().url("URL de imagen inválida").or(z.string().min(1)).nullable().optional(),
});

export const categorySchema = z.object({
    name: z.string().min(2, "Categoría demasiado corta").max(50),
});

// ─── ESQUEMAS DE CLIENTES ─────────────────────────────
export const customerSchema = z.object({
    firstName: z.string().min(2, "Nombre requerido"),
    lastName: z.string().min(2, "Apellido requerido"),
    email: z.string().email("Email inválido").nullable().optional().or(z.literal("")),
    phone: z.string().nullable().optional(),
    documentId: z.string().min(5, "Documento inválido").nullable().optional(),
    isVIP: z.boolean().default(false),
    notes: z.string().nullable().optional(),
});

// ─── ESQUEMAS DE INVENTARIO ──────────────────────────
export const inventorySchema = z.object({
    code: z.string().min(3, "Código de repuesto requerido"),
    name: z.string().min(3, "Nombre de repuesto requerido"),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    minStock: z.number().int().nonnegative().default(5),
});

// ─── ESQUEMAS DE ÓRDENES ─────────────────────────────
export const orderSchema = z.object({
    customerId: z.string().uuid(),
    createdById: z.string().uuid(),
    deviceBrand: z.string().min(2),
    deviceModel: z.string().min(2),
    deviceSerial: z.string().nullable().optional(),
    reportedIssue: z.string().min(10, "Por favor describa mejor la falla"),
});
