import { getSettings } from "@/actions/settings";
import LandingPageClient from "./client-page";

export default async function Home() {
    const settings = await getSettings();
    return <LandingPageClient settings={settings} />;
}
