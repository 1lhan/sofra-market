import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export default async function SiteTopBar() {
    "use cache"
    cacheLife("max")
    cacheTag("campaigns")
    cacheTag("coupons")

    const [coupon, freeShippingCampaign] = await Promise.all([
        prisma.coupon.findFirst({
            where: { code: { contains: "MERHABA" }, isActive: true },
            select: { title: true }
        }),
        prisma.campaign.findFirst({
            where: { type: "FREE_SHIPPING", isActive: true },
            select: { title: true }
        })
    ])

    const items = [coupon?.title, freeShippingCampaign?.title].filter(Boolean)

    if (!items.length) return null

    return (
        <div className="site-top-bar">
            <div className="site-top-bar-track">
                {Array.from({ length: 5 }).map((_, i) =>
                    <div className="site-top-bar-track-group" key={i}>
                        {items.map((title, j) => <span key={j}>{title}</span>)}
                    </div>
                )}
            </div>
        </div>
    )
}