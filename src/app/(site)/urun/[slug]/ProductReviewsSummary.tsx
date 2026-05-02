import { RatingStars } from "@/components/RatingStars"
import { prisma } from "@/lib/prisma"
import { cacheLife } from "next/cache"

export async function ProductReviewsSummary({ slug }: { slug: string }) {
    "use cache"
    cacheLife("hours")

    const product = await prisma.product.findUnique({
        where: { slug },
        select: {
            averageRating: true,
            _count: { select: { reviews: { where: { status: "APPROVED" } } } }
        }
    })

    if (!product) return null

    const count = product._count.reviews
    const average = product.averageRating

    return (
        <div className="product-reviews-summary">
            <span>{average.toFixed(1)}</span>
            <RatingStars average={average} id="product" />
            <span>{count} değerlendirme</span>
        </div>
    )
}