import { Breadcrumb } from "@/components/Breadcrumb"
import { getPublicProducts } from "@/features/product/product.service"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { cacheLife, cacheTag } from "next/cache"
import { Suspense } from "react"
import AllProductsPageMain from "./AllProductsPageMain"

export const metadata: Metadata = {
    title: "Tüm Ürünler | Sofra Market",
    description: "Sofra Market'teki tüm ürünleri keşfet. Peynir, zeytin, şarküteri ve daha fazlası.",
    alternates: {
        canonical: "/tum-urunler"
    },
    openGraph: {
        title: "Tüm Ürünler | Sofra Market",
        description: "Sofra Market'teki tüm ürünleri keşfet. Peynir, zeytin, şarküteri ve daha fazlası.",
        url: "/tum-urunler",
        type: "website"
    }
}

export default async function AllProductsPage() {
    "use cache"
    cacheLife("hours")
    cacheTag("categories")
    cacheTag("products")

    const [categories, initialProducts] = await Promise.all([
        prisma.category.findMany({ select: { name: true, slug: true } }),
        getPublicProducts({}, 20)
    ])

    return (
        <div className="all-products-page container">
            <Breadcrumb items={[{ label: "Tüm Ürünler", url: `/tum-urunler` }]} />
            <Suspense>
                <AllProductsPageMain categories={categories} initialProducts={initialProducts} />
            </Suspense>
        </div>
    )
}