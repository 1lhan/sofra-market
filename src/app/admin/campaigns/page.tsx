import { getProductOptions } from "@/features/product/product.service";
import { cacheTag } from "next/cache";
import AdminCampaignsPageContent from "./AdminCampaignsPageContent";

export default async function AdminCampaignsPage() {
    "use cache"
    cacheTag("products")
    const productOptions = await getProductOptions()
    return <AdminCampaignsPageContent productOptions={productOptions} />
}