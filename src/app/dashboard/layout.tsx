import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { NavbarProvider } from "@/components/layout/NavbarContext";

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
        <NavbarProvider>
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex selection:bg-slate-800 selection:text-white relative overflow-x-hidden">
                {/* Sidebar Fija (Colapsable en Móvil via Contexto) */}
                <Sidebar role={session.user.role} />

                {/* Contenedor Principal Ajustado al ancho del Sidebar en Desktop (72 = 18rem = 288px) */}
                <div className="flex-1 flex flex-col lg:pl-72 min-h-screen transition-all duration-300">
                    {/* Barra Superior con Contexto de Usuario y Botón Hamburguesa */}
                    <Topbar session={session} />

                    {/* Contenido Principal de cada Página */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto w-full">
                        <div className="max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </NavbarProvider>
    );
}
