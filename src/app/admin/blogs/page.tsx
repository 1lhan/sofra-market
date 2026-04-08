import { getProductOptions } from "@/features/product/product.service";
import { cacheTag } from "next/cache";
import AdminBlogsPageContent from "./AdminBlogsPageContent";

export default async function AdminBlogsPage() {
    "use cache"
    cacheTag("product")
    const productOptions = await getProductOptions()
    return <AdminBlogsPageContent productOptions={productOptions} />
}