import { getCategoryOptions } from "@/features/category/category.service"
import { cacheTag } from "next/cache"
import AdminSubcategoriesPageContent from "./AdminSubcategoriesPageContent"

export default async function AdminSubcategoriesPage() {
    "use cache"
    cacheTag("category")
    const categoryOptions = await getCategoryOptions()
    return <AdminSubcategoriesPageContent categoryOptions={categoryOptions} />
}