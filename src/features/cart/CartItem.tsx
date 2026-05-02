import { Input } from "@/components/inputs/Input"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { api } from "@/lib/eden"
import { formatPrice } from "@/lib/number"
import { queryClient } from "@/providers/QueryProvider"
import { Signal, useSignal } from "@preact-signals/safe-react"
import Image from "next/image"
import { CalculatedCart } from "./cart.types"

async function updateCartItemQuantity(productId: string, quantity: number, isLoading: Signal<boolean>): Promise<boolean> {
    isLoading.value = true
    const cartId = localStorage.getItem("cartId")
    const { data, error } = await api.carts.patch({ cartId, productId, quantity })
    isLoading.value = false

    if (error) {
        window.alert((error as any).value.message)
        return false
    }

    queryClient.setQueryData(["cart"], data.data)
    return true
}

async function deleteFromCart(productId: string, isLoading: Signal<boolean>) {
    isLoading.value = true
    const cartId = localStorage.getItem("cartId")
    const { data, error } = await api.carts.delete({}, { query: { cartId, productId } })
    isLoading.value = false

    if (error) {
        window.alert((error as any).value.message)
        return
    }

    queryClient.setQueryData(["cart"], data.data)
}

export const CartItem = ({ item }: { item: CalculatedCart["items"][number] }) => {
    const quantity = useSignal(item.quantity)
    const isLoading = useSignal(false)

    async function handleQuantityChange(newQuantity: number) {
        if (newQuantity < 1) return
        const ok = await updateCartItemQuantity(item.id, newQuantity, isLoading)
        if (ok) quantity.value = newQuantity
    }

    return (
        <div className="cart-item">
            <div className="cart-item-image-wrapper">
                {item.image && <Image src={item.image} alt={item.title} width={96} height={96} sizes="96px" />}
            </div>

            <div className="cart-item-info">
                <Button color="neutral" variant="ghost-underline" href={`/urun/${item.slug}`}>{item.title}</Button>

                <div className="cart-item-prices">
                    <span className="cart-item-price">{formatPrice(item.price)}</span>
                    {item.comparePrice && <span className="cart-item-compare-price">{formatPrice(item.comparePrice)}</span>}
                </div>

                <div className="cart-item-quantity">
                    <span>Adet</span>
                    <div className="cart-item-quantity-stepper">
                        <Button
                            color="surface"
                            variant="filled"
                            shape="compact"
                            size="sm"
                            disabled={isLoading.value || quantity.value <= 1}
                            onClick={() => handleQuantityChange(quantity.value - 1)}
                        >
                            <Icon name="minus" size="sm" />
                        </Button>
                        <Input
                            name="quantity"
                            value={String(quantity.value)}
                            onChange={(value) => handleQuantityChange(Number(value))}
                            type="number"
                        />
                        <Button
                            color="surface"
                            variant="filled"
                            shape="compact"
                            size="sm"
                            disabled={isLoading.value}
                            onClick={() => handleQuantityChange(quantity.value + 1)}
                        >
                            <Icon name="plus" size="sm" />
                        </Button>
                    </div>
                </div>

                {item.appliedCampaign && <span className="cart-item-applied-campaign">{item.appliedCampaign.title}</span>}
            </div>

            <div className="cart-item-actions">
                {item.finalPrice !== item.totalPrice && <span className="cart-item-total-price">{formatPrice(item.totalPrice)}</span>}
                <span className="cart-item-final-price">{formatPrice(item.finalPrice)}</span>
                <Button color="neutral" variant="ghost" aria-label="Ürünü kaldır" disabled={isLoading.value} onClick={() => deleteFromCart(item.id, isLoading)}>
                    <Icon name="trash-alt" />
                </Button>
            </div>
        </div>
    )
}