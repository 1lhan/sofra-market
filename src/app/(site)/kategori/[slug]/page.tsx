import { Breadcrumb } from "@/components/Breadcrumb"
import { getCategoryBySlug } from "@/features/category/category.service"
import { getPublicProducts } from "@/features/product/product.service"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { cacheLife, cacheTag } from "next/cache"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import CategoryPageMain from "./CategoryPageMain"

export async function generateStaticParams() {
    const categories = await prisma.category.findMany({
        select: {
            slug: true,
            subcategories: { select: { slug: true } }
        }
    })

    return categories.flatMap(({ slug, subcategories }) => [
        { slug },
        ...subcategories.map(sub => ({ slug: sub.slug }))
    ])
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const category = await getCategoryBySlug(slug)

    if (!category) return {}

    const subcategory = category.subcategories.find(sub => sub.slug === slug)
    const pageName = subcategory?.name ?? category.name
    const parentName = subcategory ? category.name : null

    const title = `${pageName}${parentName ? ` | ${parentName}` : ""} | Sofra Market`
    const description = parentName
        ? `${parentName} kategorisinde ${pageName} ürünlerini keşfet. En taze ve kaliteli ürünler Sofra Market'te.`
        : `${pageName} kategorisindeki tüm ürünleri keşfet. En taze ve kaliteli ürünler Sofra Market'te.`

    return {
        title,
        description,
        alternates: {
            canonical: `/kategori/${slug}`
        },
        openGraph: {
            title,
            description,
            url: `/kategori/${slug}`,
            type: "website"
        }
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    "use cache"
    cacheLife("hours")
    cacheTag("products")

    const { slug } = await params
    const [category, initialProducts] = await Promise.all([
        getCategoryBySlug(slug),
        getPublicProducts({ categorySlug: slug }, 20)
    ])

    if (!category) notFound()

    const subcategory = category.subcategories.find(sub => sub.slug === slug)

    return (
        <div className="category-page container">
            <Breadcrumb
                items={[
                    { label: category.name, url: `/kategori/${category.slug}` },
                    ...(subcategory ? [{ label: subcategory.name, url: `/kategori/${subcategory.slug}` }] : [])
                ]}
            />
            <Suspense>
                <CategoryPageMain slug={slug} subcategories={category.subcategories} initialProducts={initialProducts} />
            </Suspense>
        </div>
    )
}