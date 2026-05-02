"use client"

import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { Modal } from "@/components/ui/Modal"
import { api } from "@/lib/eden"
import { formatPrice } from "@/lib/number"
import { signal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"
import { CartItem } from "./CartItem"

export const isCartDrawerOpen = signal(false)

export default function CartDrawer() {
    const { data: cart } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const cartId = localStorage.getItem("cartId")
            const { data } = await api.carts.get({ query: { cartId } })

            if (!cartId && data?.data) {
                localStorage.setItem("cartId", data.data.id)
            }

            return data?.data ?? null
        },
        enabled: isCartDrawerOpen.value
    })

    if (!isCartDrawerOpen.value) return null

    const totalQuantity = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

    return (
        <Modal className="cart-drawer" direction="right" onClose={() => isCartDrawerOpen.value = false}>
            {(cart && totalQuantity > 0) ? (
                <>
                    <div className="cart-drawer-header">
                        <h6>{`Sepetim (${totalQuantity})`}</h6>
                        <Button color="neutral" variant="ghost" onClick={() => isCartDrawerOpen.value = false}>
                            <Icon name="xmark" size="lg" />
                        </Button>
                    </div>

                    <div className="cart-drawer-items">
                        {cart.items.map((item) =>
                            <CartItem item={item} key={item.id} />
                        )}
                    </div>

                    <div className="cart-drawer-footer">
                        {cart.campaignDiscount > 0 && (
                            <div className="cart-drawer-footer-row">
                                <span>Kampanya İndirimi</span>
                                <span>{`-${formatPrice(cart.campaignDiscount)}`}</span>
                            </div>
                        )}
                        {cart.appliedCoupon && (
                            <div className="cart-drawer-footer-row">
                                <span>{cart.appliedCoupon.title}</span>
                                <span>{`-${formatPrice(cart.appliedCoupon.discountAmount)}`}</span>
                            </div>
                        )}
                        <div className="cart-drawer-footer-row">
                            <span>Sepet Toplam</span>
                            <span>{formatPrice(cart.total)}</span>
                        </div>
                        <Button color="primary" variant="filled" shape="rectangle" href="/payment" onClick={() => isCartDrawerOpen.value = false}>
                            Sepeti Onayla
                        </Button>
                        <Button color="primary" variant="filled" shape="rectangle" href="/cart" onClick={() => isCartDrawerOpen.value = false}>
                            Sepete Git
                            <Icon name="chevron-right" size="sm" />
                        </Button>
                    </div>
                </>
            ) : (
                <div className="cart-drawer-empty">
                    <h6>Sepetiniz Boş</h6>
                    <Button color="primary" variant="filled" shape="rectangle" href="/tum-urunler" onClick={() => isCartDrawerOpen.value = false}>
                        Alışverişe devam et
                    </Button>
                </div>
            )}
        </Modal>
    )
}