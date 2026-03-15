import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCustomerPage from "./client-page";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const customer = await prisma.customer.findUnique({
        where: { id: params.id }
    });

    if (!customer) {
        notFound();
    }

    return <EditCustomerPage customer={customer} />;
}
