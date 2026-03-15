import { getSettings } from "@/actions/settings";
import SettingsClient from "./client-page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) redirect("/login");
    if (session.user.role !== "ADMIN") redirect("/dashboard");

    const [settings, users] = await Promise.all([
        getSettings(),
        prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: "asc" },
        }),
    ]);

    return (
        <SettingsClient
            settings={settings}
            users={users as any}
            currentUserId={session.user.id as string}
        />
    );
}
