import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NewInventoryItemPageBase from "./client-page";

export default async function NewInventoryItemPage() {
    const session = await auth();

    // Bloquear acceso a técnicos para crear inventario
    if (!session || session.user.role === "TECNICO") {
        redirect("/dashboard/inventory");
    }

    return <NewInventoryItemPageBase />;
}
