import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex selection:bg-slate-800 selection:text-white">
            {/* Sidebar Fija (Navegación Lateral) */}
            <Sidebar role={session.user.role} />

            {/* Contenedor Principal Ajustado al ancho del Sidebar (72 = 18rem = 288px) */}
            <div className="flex-1 flex flex-col pl-72 min-h-screen">
                {/* Barra Superior con Contexto de Usuario */}
                <Topbar session={session} />

                {/* Contenido Principal de cada Página */}
                <main className="flex-1 p-10 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
