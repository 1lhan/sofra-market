import { getCategoriesWithSubcategories } from "@/features/category/category.service"
import { cacheTag } from "next/cache"
import AdminProductsPageContent from "./AdminProductsPageContent"

export default async function AdminProductsPage() {
    "use cache"
    cacheTag("categories")
    const categoriesWithSubcategories = await getCategoriesWithSubcategories()
    return <AdminProductsPageContent categoriesWithSubcategories={categoriesWithSubcategories} />
}