"use client"

import { Input } from "@/components/inputs/Input"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { useSignal } from "@preact/signals-react"
import Image from "next/image"

export const ProductGallery = ({ images, title }: { images: string[], title: string }) => {
    const selectedImage = useSignal(0)

    return (
        <div className="product-gallery">
            <div className="product-gallery-thumbnails">
                {images.map((image, index) =>
                    <Image
                        className="product-gallery-thumbnail"
                        src={image}
                        alt={`${title} ${index + 1}`}
                        width={128}
                        height={128}
                        sizes="128px"
                        onClick={() => selectedImage.value = index}
                        key={index}
                    />
                )}
            </div>
            {images.length > 0 && (
                <Image className="product-gallery-main" src={images[selectedImage.value]} alt={title} width={600} height={600} sizes="600px" />
            )}
        </div>
    )
}

export const ProductFavoriteButton = () => {
    return (
        <Button className="product-favorite-btn" color="neutral" variant="ghost" size="lg" aria-label="Favorilere ekle">
            <Icon name="heart" size="xl" />
        </Button>
    )
}

export const ProductCartActions = () => {
    const quantity = useSignal(1)

    return (
        <div className="product-cart-actions">
            <div className="product-quantity">
                <Button color="surface" variant="filled" shape="compact" onClick={() => { if (quantity.value > 1) quantity.value-- }}>
                    <Icon name="minus" />
                </Button>
                <Input
                    name="quantity"
                    value={String(quantity.value)}
                    onChange={(value) => quantity.value = +value}
                    type="number"
                />
                <Button color="surface" variant="filled" shape="compact" onClick={() => quantity.value++}>
                    <Icon name="plus" />
                </Button>
            </div>
            <Button color="primary" variant="filled" size="lg" shape="default">Sepete Ekle</Button>
        </div>
    )
}