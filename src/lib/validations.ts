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
    name: z.string().min(2, "Nombre requerido"),
    email: z.string().email("Email inválido").nullable().optional().or(z.literal("")),
    phone: z.string().nullable().optional(),
    dni: z.string().min(5, "Documento inválido").nullable().optional(),
    address: z.string().nullable().optional(),
    isVIP: z.boolean().default(false),
});

// ─── ESQUEMAS DE INVENTARIO ──────────────────────────
export const inventorySchema = z.object({
    name: z.string().min(3, "Nombre de repuesto requerido"),
    sku: z.string().min(3, "SKU requerido"),
    description: z.string().optional(),
    unitPrice: z.number().positive(),
    quantity: z.number().int().nonnegative(),
    minQuantity: z.number().int().nonnegative().default(5),
});

// ─── ESQUEMAS DE ÓRDENES ─────────────────────────────
export const orderSchema = z.object({
    customerId: z.string().min(1),
    creatorId: z.string().min(1),
    technicianId: z.string().nullable().optional(),
    equipment: z.string().min(2),
    brand: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    serialNumber: z.string().nullable().optional(),
    description: z.string().min(10, "Por favor describa mejor la falla"),
});

// ─── ESQUEMAS DE CONFIGURACIÓN ─────────────────────────────
export const settingsSchema = z.object({
    publicUrl: z.string().url().default("http://localhost:3000"),
    currency: z.enum(["USD", "PEN"]).default("USD"),
    currencySymbol: z.string().default("$"),
});
