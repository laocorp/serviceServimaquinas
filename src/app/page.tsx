import { getSettings } from "@/actions/settings";
import { getPromotionProducts } from "@/actions/store";
import LandingPageClient from "./client-page";

export default async function Home() {
    const [settings, products] = await Promise.all([
        getSettings(),
        getPromotionProducts()
    ]);

    return <LandingPageClient settings={settings} products={products} />;
}
