import { Button } from "@/components/ui/Button"
import { getPublicCampaigns } from "@/features/campaign/campaign.service"
import { getPublicCoupons } from "@/features/coupon/coupon.service"
import { cacheLife, cacheTag } from "next/cache"
import Image from "next/image"

export default async function CampaignsPage() {
    "use cache"
    cacheLife("max")
    cacheTag("campaigns")
    cacheTag("coupons")
    const [campaigns, coupons] = await Promise.all([getPublicCampaigns(), getPublicCoupons()])

    return (
        <div className="campaigns-page container container-xl">
            <h2>Kampanyalar</h2>
            <main>
                {coupons.map((coupon, index) =>
                    <div className="promo-card" key={index}>
                        <div className="promo-card-image-wrapper">
                            {coupon.image && <Image src={coupon.image} alt={coupon.title} fill sizes="(max-width: 700px) 100vw, 700px" loading="eager" />}
                        </div>
                        <div className="promo-card-info">
                            <h3>{coupon.title}</h3>
                            <span className="text-muted">{coupon.description}</span>
                        </div>
                    </div>
                )}

                {campaigns.map((campaign, index) =>
                    <div className="promo-card" key={index}>
                        <div className="promo-card-image-wrapper">
                            {campaign.image && <Image src={campaign.image} alt={campaign.title} fill sizes="(max-width: 700px) 100vw, 700px" loading="eager" />}
                        </div>
                        <div className="promo-card-info">
                            <h3>{campaign.title}</h3>
                            <span className="text-muted">{campaign.description}</span>
                            <Button color="primary" variant="filled" shape="rectangle">Ürünleri İncele</Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}