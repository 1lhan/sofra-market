"use client"

import { Input } from "@/components/inputs/Input"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { api } from "@/lib/eden"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import Image from "next/image"

export const ProductGallery = ({ title, images }: { title: string, images: string[] }) => {
    const selectedImage = useSignal(0)

    if (images.length === 0) return null

    return (
        <div className="product-gallery">
            <div className="product-gallery-thumbnails">
                {images.map((image, index) =>
                    <button
                        className="product-gallery-thumbnail-btn"
                        onClick={() => selectedImage.value = index}
                        aria-label={`${title} görsel ${index + 1}`}
                        aria-pressed={selectedImage.value === index}
                        key={index}
                    >
                        <Image
                            src={image}
                            alt=""
                            sizes="128px"
                            fill
                        />
                    </button>
                )}
            </div>
            <div className="product-gallery-main-wrapper">
                <Image
                    src={images[selectedImage.value]}
                    alt={title}
                    sizes="600px"
                    fill
                />
            </div>
        </div>
    )
}

export const ProductFavoriteButton = ({ productId }: { productId: string }) => {
    return (
        <Button
            color="neutral"
            variant="ghost"
            size="lg"
            aria-label="Favorilere ekle"
        >
            <Icon name="heart" size="xl" />
        </Button>
    )
}

export const ProductCartActions = ({ productId }: { productId: string }) => {
    const quantity = useSignal(1)
    const isLoading = useSignal(false)

    async function updateCartItemQuantity() {
        isLoading.value = true
        const cartId = localStorage.getItem("cartId")
        const { data, error } = await api.carts.post({ cartId, productId, quantity: quantity.value })
        isLoading.value = false

        if (error) {
            // toast.add()
            return
        }

        if (!cartId) {
            localStorage.setItem("cartId", data.data.id)
        }
        queryClient.setQueryData(["cart"], data.data)
    }

    return (
        <div className="product-cart-actions">
            <div className="product-quantity">
                <Button
                    color="surface"
                    variant="filled"
                    shape="compact"
                    size="lg"
                    aria-label="Azalt"
                    onClick={() => { if (quantity.value > 1) quantity.value-- }}
                >
                    <Icon name="minus" size="lg" />
                </Button>
                <Input
                    name="quantity"
                    value={String(quantity.value)}
                    onChange={(value) => quantity.value = +value}
                    type="number"
                />
                <Button
                    color="surface"
                    variant="filled"
                    shape="compact"
                    size="lg"
                    aria-label="Artır"
                    onClick={() => quantity.value++}
                >
                    <Icon name="plus" size="lg" />
                </Button>
            </div>
            <Button
                color="primary"
                variant="filled"
                size="lg"
                shape="rectangle"
                loading={isLoading.value}
                onClick={updateCartItemQuantity}
            >
                Sepete Ekle
            </Button>
        </div>
    )
}

export const ProductDescription = ({ description }: { description: string }) => {
    const isExpanded = useSignal(false)

    return (
        <section className={`product-description${isExpanded.value ? " product-description-expanded" : ""}`}>
            <h2 className="section-title">Ürün Açıklaması</h2>
            <div className="product-description-content" dangerouslySetInnerHTML={{ __html: description }} />
            <div className="product-description-fade" />
            <Button color="surface" variant="filled" shape="pill" onClick={() => isExpanded.value = !isExpanded.value}>
                {isExpanded.value ? "Daha Az Göster" : "Daha Fazla Göster"}
                <Icon name="chevron-down" />
            </Button>
        </section>
    )
}