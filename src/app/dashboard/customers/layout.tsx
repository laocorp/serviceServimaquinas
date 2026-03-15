import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CustomersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Bloquear acceso a técnicos a cualquier parte de clientes
    if (!session || session.user.role === "TECNICO") {
        redirect("/dashboard");
    }

    return <>{children}</>;
}
