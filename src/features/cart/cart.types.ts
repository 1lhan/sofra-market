import { calculateCart } from "./cart.service"

export type CalculatedCartItem = {
    id: string
    title: string
    slug: string
    image: string | null
    quantity: number
    comparePrice: number | null
    price: number
    totalPrice: number
    finalPrice: number
    appliedCampaign: { title: string, discountAmount: number } | null
}

export type CalculatedCart = Awaited<ReturnType<typeof calculateCart>>