import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import EditInventoryItemPage from "./client-page";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();
    const role = session?.user?.role || "TECNICO";

    const item = await prisma.inventoryItem.findUnique({
        where: { id: params.id }
    });

    if (!item) {
        notFound();
    }

    return <EditInventoryItemPage item={item} role={role} />;
}
