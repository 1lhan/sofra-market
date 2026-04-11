import { getPublicProductDetail } from "@/features/product/product.service"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { cacheTag } from "next/cache"
import { notFound } from "next/navigation"
import Breadcrumb from "../../Breadcrumb"

export async function generateStaticParams() {
    return prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true }
    })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    "use cache"
    const { slug } = await params
    //cacheLife("max")
    cacheTag(`product-${slug}`)

    const product = await prisma.product.findUnique({
        where: { slug, isActive: true },
        select: {
            title: true,
            images: true,
            metaTitle: true,
            metaDescription: true,
        }
    })

    if (!product) return {}

    const description = product.metaDescription ?? undefined

    return {
        title: `${product.title} | Sofra Market`,
        description,
        alternates: {
            canonical: `/urun/${slug}`
        },
        openGraph: {
            title: product.metaTitle ?? product.title,
            description,
            url: `/urun/${slug}`,
            type: "website",
            images: product.images[0] ? [{ url: product.images[0] }] : undefined
        }
    }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    "use cache"
    const { slug } = await params
    //cacheLife("max")
    cacheTag(`product-${slug}`)
    cacheTag("categories")

    const product = await getPublicProductDetail(slug)

    if (!product) notFound()

    const discountPct = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * -100)
        : null

    return (
        <div className="product-detail-page container">
            <Breadcrumb
                category={{ label: product.category.name, slug: product.category.slug }}
                subcategory={product.subcategory ? { label: product.subcategory.name, slug: product.subcategory.slug } : undefined}
                product={{ label: product.title, slug: product.slug }}
            />
            <main>
                <div className="product-images">
                    {/* <Image className="big-image" src={""} alt="" /> */}
                    <div className="product-images-thumbnails"></div>
                </div>
                <div className="product-info">
                    <h2 className="product-title">{product.title}</h2>
                    <div className="product-reviews"></div>
                    <div className="product-price">
                        {discountPct && <span className="product-discount-pct">{discountPct}</span>}
                        {product.comparePrice && <span className="product-compare-price">{product.comparePrice}</span>}
                        <span className="product-current-price">{product.price}</span>
                    </div>
                    <p className="product-excerpt">{product.excerpt}</p>
                </div>
            </main>
        </div>
    )
}