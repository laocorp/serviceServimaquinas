import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCustomerPage from "./client-page";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const customer = await prisma.customer.findUnique({
        where: { id: params.id },
        include: {
            tools: {
                include: { maintenanceLogs: { orderBy: { serviceDate: 'desc' } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!customer) {
        notFound();
    }

    return <EditCustomerPage customer={customer} />;
}
