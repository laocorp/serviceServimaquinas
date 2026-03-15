import { prisma } from "@/lib/prisma";
import NewOrderClient from "./client-page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewOrderPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role === "TECNICO") {
        redirect("/dashboard/orders");
    }

    // Only Recepcion or Admin should ideally create, but here any authenticated user can for demo
    const customers = await prisma.customer.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            isVIP: true,
            email: true,
            phone: true,
        },
        orderBy: {
            firstName: 'asc'
        }
    });

    return <NewOrderClient customers={customers} currentUserId={session.user.id} />;
}
