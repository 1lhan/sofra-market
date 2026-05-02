"use client"

import { Input } from "@/components/inputs/Input"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { Loader } from "@/components/ui/Loader"
import { CalculatedCart } from "@/features/cart/cart.types"
import { CartItem } from "@/features/cart/CartItem"
import { api } from "@/lib/eden"
import { formatPrice } from "@/lib/number"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact-signals/safe-react"
import { useQuery } from "@tanstack/react-query"

const Coupon = ({ appliedCoupon }: { appliedCoupon: CalculatedCart["appliedCoupon"] }) => {
    const coupon = useSignal(appliedCoupon ? appliedCoupon.code : "")
    const isLoading = useSignal(false)

    async function applyCoupon() {
        isLoading.value = true
        const cartId = localStorage.getItem("cartId")
        const { data, error } = await api.carts.coupons.post({ cartId, code: coupon.value })
        isLoading.value = false

        if (error) {
            window.alert((error as any).value.message)
            return
        }

        queryClient.setQueryData(["cart"], data.data)
    }

    async function removeCoupon() {
        isLoading.value = true
        const cartId = localStorage.getItem("cartId")
        const { data, error } = await api.carts.coupons.delete({ cartId })
        isLoading.value = false

        if (error) {
            window.alert((error as any).value.message)
            return
        }

        queryClient.setQueryData(["cart"], data.data)
        coupon.value = ""
    }

    return (
        <div className="coupon">
            <Input
                name="coupon"
                value={coupon.value}
                onChange={(value) => coupon.value = value}
                type="text"
                inputProps={{ placeholder: "İndirim Kodu", disabled: !!appliedCoupon }}
            />
            <Button color="secondary" variant="filled" shape="compact" loading={isLoading.value} onClick={appliedCoupon ? removeCoupon : applyCoupon}>
                {appliedCoupon ? "Kaldır" : "Uygula"}
            </Button>
        </div>
    )
}

export default function CartPageContent() {
    const { data: cart, isLoading } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const cartId = localStorage.getItem("cartId")
            const { data } = await api.carts.get({ query: { cartId } })
            return data?.data ?? null
        }
    })

    const cartItemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0

    return (
        <div className="cart-page container">
            <div className="cart-page-header">
                <h4>Sepetim {cartItemCount > 0 && `(${cartItemCount})`}</h4>
                {cartItemCount > 0 && (
                    <Button color="neutral" variant="ghost">
                        <Icon name="trash-alt" />
                        Sepeti Temizle
                    </Button>
                )}
            </div>

            {isLoading && <Loader type="progress-bar" />}

            {cart && (
                <>
                    <div className="cart-items">
                        {cart.shippingCost === 0 && (
                            <Badge color="success" size="md">
                                <Icon name="truck" />
                                Kargonuz Ücretsiz
                            </Badge>
                        )}

                        {cart?.items.map((item) =>
                            <CartItem item={item} key={item.id} />
                        )}
                    </div>

                    <div className="order-summary">
                        <h5>Sipariş Özeti</h5>

                        <div className="order-summary-row">
                            <span>Ara Toplam</span>
                            <span>{formatPrice(cart.subtotal)}</span>
                        </div>

                        {cart.usedCampaigns.map((campaign, index) =>
                            <div className="order-summary-row order-summary-row-discount" key={index}>
                                <span>{campaign.title}</span>
                                <span>{`-${formatPrice(campaign.discountAmount)}`}</span>
                            </div>
                        )}

                        {cart.appliedCoupon && (
                            <div className="order-summary-row order-summary-row-discount">
                                <span>{cart.appliedCoupon.title}</span>
                                <span>{`-${formatPrice(cart.appliedCoupon.discountAmount)}`}</span>
                            </div>
                        )}

                        <div className="order-summary-row">
                            <span>Kargo Ücreti</span>
                            <span className={cart.shippingCost === 0 ? "text-success" : ""}>{cart.shippingCost === 0 ? "Ücretsiz" : formatPrice(cart.shippingCost)}</span>
                        </div>

                        <div className="order-summary-row order-summary-row-total">
                            <span>Genel Toplam</span>
                            <span>{formatPrice(cart.total)}</span>
                        </div>

                        {cart.giftCampaign && (
                            <Badge color="primary" size="md">
                                <Icon name="gift" />
                                {cart.giftCampaign.title}
                            </Badge>
                        )}

                        <Coupon appliedCoupon={cart.appliedCoupon} />

                        <Button color="primary" variant="filled" shape="rectangle" size="lg" href="/checkout">Alışverişi Tamamla</Button>
                    </div>
                </>
            )}
        </div>
    )
}