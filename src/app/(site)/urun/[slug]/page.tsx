import { Breadcrumb } from "@/components/Breadcrumb"
import { Badge } from "@/components/ui/Badge"
import { getPublicProductDetail } from "@/features/product/product.service"
import { formatPrice } from "@/lib/number"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { cacheLife, cacheTag } from "next/cache"
import { notFound } from "next/navigation"
import { ProductCartActions, ProductDescription, ProductFavoriteButton, ProductGallery } from "./ProductDetailPageComponents"
import { ProductReviewsSummary } from "./ProductReviewsSummary"

export async function generateStaticParams() {
    return prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true }
    })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    "use cache"
    const { slug } = await params
    cacheLife("max")
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

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    "use cache"
    const { slug } = await params
    cacheLife("max")
    cacheTag(`product-${slug}`)
    cacheTag("categories")
    cacheTag("campaigns")

    const product = await getPublicProductDetail(slug)
    if (!product) notFound()

    const discountPct = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : null

    return (
        <div className="product-detail-page container">
            <Breadcrumb
                items={[
                    { label: product.category.name, url: `/kategori/${product.category.slug}` },
                    ...(product.subcategory ? [{ label: product.subcategory.name, url: `/kategori/${product.subcategory.slug}` }] : []),
                    { label: product.title, url: `/urun/${product.slug}` }
                ]}
            />

            <main>
                <ProductGallery title={product.title} images={product.images} />

                <section className="product-info">
                    <div className="product-info-header">
                        <h1 className="product-title">{product.title}</h1>
                        <ProductFavoriteButton productId={product.id} />
                    </div>

                    <ProductReviewsSummary slug={slug} />

                    <div className="product-price-row">
                        {discountPct && (
                            <span className="product-discount">{`-%${discountPct}`}</span>
                        )}
                        <div>
                            {product.comparePrice && (
                                <span className="product-compare-price">{formatPrice(product.comparePrice)}</span>
                            )}
                            <span className="product-price">{formatPrice(product.price)}</span>
                        </div>
                    </div>

                    {product.campaigns.length > 0 && (
                        <div className="product-campaigns">
                            {product.campaigns.map((campaign, index) =>
                                <Badge color="primary" size="md" key={index}>
                                    {campaign.title}
                                </Badge>
                            )}
                        </div>
                    )}

                    <ProductCartActions productId={product.id} />

                    <p className="product-excerpt">{product.excerpt}</p>
                </section>

                <ProductDescription description={product.description} />

                {/* product reviews */}
                {/* <section className="product-reviews">
                    <h2>Ürün Değerlendirmeleri</h2>
                    <div className="product-review">
                        <div className="product-review-stars">
                            <Icon name="star" />
                            <Icon name="star" />
                            <Icon name="star" />
                            <Icon name="star" />
                            <Icon name="star" />
                        </div>
                        <div>
                            <span className="product-review-name">A*** B***</span>
                            <span className="product-review-date">28.04.2026</span>
                        </div>
                        <p className="product-review-comment">comment</p>
                    </div>
                </section> */}
            </main>
        </div>
    )
}

{/* <main>
    <ProductGallery images={product.images} title={product.title} />
    <section className="product-info">
        <div className="product-header">
            <h1 className="product-title">{product.title}</h1>
            <ProductFavoriteButton />
        </div>
        <ProductReviewsSummary slug={product.slug} />
        <div className="product-price">
            {discountPct && <span className="product-price-discount-pct">{`-%${discountPct}`}</span>}
            <div>
                {product.comparePrice && <span className="product-price-original">{`${product.comparePrice} ₺`}</span>}
                <span className="product-price-current">{`${product.price} ₺`}</span>
            </div>
        </div>
        {product.campaigns.length > 0 && (
            <ul className="product-campaigns">
                {product.campaigns.map((campaign, index) =>
                    <li key={index}>{campaign.title}</li>
                )}
            </ul>
        )}
        <ProductCartActions productId={product.id} />
        <p className="product-excerpt">{product.excerpt}</p>
    </section>
</main> */}