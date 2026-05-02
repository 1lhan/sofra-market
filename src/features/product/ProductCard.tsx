"use client"

import { RatingStars } from "@/components/RatingStars"
import { Button } from "@/components/ui/Button"
import { toast } from "@/components/ui/ToastContainer"
import { api } from "@/lib/eden"
import { formatPrice } from "@/lib/number"
import { queryClient } from "@/providers/QueryProvider"
import { Signal, useSignal } from "@preact-signals/safe-react"
import Image from "next/image"
import Link from "next/link"
import { ProductPublic } from "./product.types"

async function addToCart(productId: string, isLoading: Signal<boolean>) {
    isLoading.value = true
    const cartId = localStorage.getItem("cartId")
    const { data, error } = await api.carts.post({ cartId, productId, quantity: 1 })
    isLoading.value = false

    if (error) {
        toast.add({
            color: "danger",
            title: "Sepete eklenemedi",
            description: (error as any).value.message
        })
        return
    }

    if (!cartId) {
        localStorage.setItem("cartId", data.data.id)
    }
    queryClient.setQueryData(["cart"], data.data)
}

const AddToCartButton = ({ productId }: { productId: string }) => {
    const isLoading = useSignal(false)

    return (
        <Button color="primary" variant="filled" shape="rectangle" loading={isLoading.value} onClick={() => addToCart(productId, isLoading)}>
            Sepete Ekle
        </Button>
    )
}

export default function ProductCard({ id, title, slug, price, comparePrice, images, averageRating, _count }: ProductPublic) {
    const discountPct = comparePrice
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : null

    return (
        <div className="product-card">
            <Link className="product-card-image-link" href={`/urun/${slug}`}>
                {images.length > 0 && (
                    <Image src={images[0]} alt={title} sizes="(max-width: 768px) 50vw, 25vw" fill />
                )}
            </Link>
            <Button className="product-card-title" color="neutral" variant="ghost" href={`/urun/${slug}`}>{title}</Button>
            <div className="product-card-reviews-summary">
                <span>{averageRating}</span>
                <RatingStars average={averageRating} id={slug} />
                <span>{`(${_count.reviews})`}</span>
            </div>
            <div className="product-card-price-row">
                {discountPct && <span className="product-card-discount">{`-%${discountPct}`}</span>}
                <div>
                    {comparePrice && <span className="product-card-compare-price">{formatPrice(comparePrice)}</span>}
                    <span className="product-card-price">{formatPrice(price)}</span>
                </div>
            </div>
            <AddToCartButton productId={id} />
        </div>
    )
}