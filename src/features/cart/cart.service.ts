import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/server/errors"
import { getCampaignsForCartCalculation } from "../campaign/campaign.service"
import { CampaignForCartCalculation } from "../campaign/campaign.types"
import { AddToCartInput, ApplyCouponInput, DeleteFromCartInput, GetCartInput, RemoveCouponInput, UpdateCartItemQuantityInput } from "./cart.schema"
import { CalculatedCartItem } from "./cart.types"

/**
 * Kullanıcı veya misafir için geçerli bir cart ID döner.
 * - Giriş yapmış kullanıcıda: kullanıcıya ait cart varsa onu döner.
 *   Yoksa misafir cartı varsa kullanıcıya bağlar, yoksa yeni cart oluşturur.
 * - Misafir kullanıcıda: cartId varsa ve DB'de bulunuyorsa onu döner,
 *   yoksa yeni misafir cart oluşturur.
 */
async function resolveCartId(cartId: string | null, userId: string | undefined) {
    if (userId) {
        const userCart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } })
        if (userCart) return userCart.id

        if (cartId) {
            const guestCart = await prisma.cart.findUnique({ where: { id: cartId }, select: { id: true, userId: true } })
            if (guestCart && !guestCart.userId) {
                await prisma.cart.update({ where: { id: cartId }, data: { userId } })
                return cartId
            }
        }

        const created = await prisma.cart.create({ data: { userId }, select: { id: true } })
        return created.id
    }

    if (cartId) {
        const guestCart = await prisma.cart.findUnique({ where: { id: cartId }, select: { id: true, userId: true } })
        if (guestCart && !guestCart.userId) return guestCart.id
    }

    const created = await prisma.cart.create({ data: {}, select: { id: true } })
    return created.id
}

/**
 * Kampanya tipine göre ürün bazlı indirim tutarını hesaplar.
 * - BUY_X_GET_Y: X al Y öde kampanyası — ücretsiz ürün adedi üzerinden hesaplar
 * - EVERY_NTH_DISCOUNT: Her N. ürüne indirim uygular
 * - BASKET_THRESHOLD: Sepet tutarı eşiği aşıldığında indirim uygular
 */
function calculateItemDiscount(campaign: CampaignForCartCalculation, price: number, quantity: number): number {
    switch (campaign.type) {
        case "BUY_X_GET_Y": {
            const freeCount = Math.floor(quantity / campaign.buyQuantity!) * (campaign.buyQuantity! - campaign.payQuantity!)
            return price * freeCount
        }
        case "EVERY_NTH_DISCOUNT": {
            const discountedCount = Math.floor(quantity / campaign.everyNth!)
            const discount = campaign.discountType === "PERCENTAGE"
                ? (price * discountedCount) * (+campaign.discountValue! / 100)
                : +campaign.discountValue! * discountedCount
            return campaign.maxDiscountAmount ? Math.min(discount, +campaign.maxDiscountAmount) : discount
        }
        case "BASKET_THRESHOLD": {
            const total = price * quantity
            if (!campaign.minOrderAmount || total < +campaign.minOrderAmount) return 0
            const discount = campaign.discountType === "PERCENTAGE"
                ? total * (+campaign.discountValue! / 100)
                : +campaign.discountValue!
            return campaign.maxDiscountAmount ? Math.min(discount, +campaign.maxDiscountAmount) : discount
        }
        default:
            return 0
    }
}


/**
 * Sepeti DB'den çeker, kampanya ve kupon indirimlerini hesaplar,
 * stok kontrolü yapar ve hesaplanmış sepeti döner.
 *
 * Stok sorunu olan ürünler otomatik güncellenir veya sepetten kaldırılır
 * ve cartActionMessages ile kullanıcıya bildirim üretilir.
 */
export async function calculateCart(cartId: string | null, userId: string | undefined) {
    if (!cartId && !userId) throw new AppError("Sepet bulunamadı", 400)

    const [cart, campaigns] = await Promise.all([
        prisma.cart.findUnique({
            where: userId ? { userId } : { id: cartId! },
            select: {
                id: true,
                userId: true,
                coupon: {
                    select: {
                        id: true,
                        code: true,
                        title: true,
                        discountType: true,
                        discountValue: true,
                        maxDiscountAmount: true,
                        minOrderAmount: true,
                        usageLimit: true,
                        usageCount: true,
                    }
                },
                items: {
                    select: {
                        productId: true,
                        product: {
                            select: {
                                title: true,
                                slug: true,
                                price: true,
                                comparePrice: true,
                                stock: true,
                                images: true,
                                isActive: true
                            }
                        },
                        quantity: true
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        }),
        getCampaignsForCartCalculation()
    ])

    if (!cart) throw new AppError("Sepet bulunamadı", 404)
    if (!userId && cart.userId) throw new AppError("UNAUTHORIZED", 401)

    const now = new Date()
    const validCampaigns = campaigns.filter(c =>
        (c.startsAt === null || c.startsAt <= now) &&
        (c.endsAt === null || c.endsAt >= now) &&
        (c.usageLimit === null || c.usageCount < c.usageLimit)
    )

    const cartActionMessages: string[] = []
    const usedCampaigns: { title: string, discountAmount: number }[] = []
    const itemsToUpdate: { productId: string, quantity: number }[] = []
    const calculatedItems: CalculatedCartItem[] = []

    for (const { productId, product, quantity } of cart.items) {
        let finalQuantity = quantity

        if (!product.isActive || quantity > product.stock) {
            if (!product.isActive || product.stock === 0) {
                itemsToUpdate.push({ productId, quantity: 0 })
                cartActionMessages.push(`"${product.title}" stokta kalmadığı için sepetinizden kaldırıldı`)
                continue
            }

            finalQuantity = product.stock
            itemsToUpdate.push({ productId, quantity: product.stock })
            cartActionMessages.push(`"${product.title}" için yalnızca ${product.stock} adet stok kaldığından miktarı güncellendi`)
        }

        const appliedCampaign = validCampaigns.find(c => c.type !== "FREE_SHIPPING" && c.products.some(p => p.id === productId))

        const totalPrice = +product.price * finalQuantity
        const campaignDiscount = appliedCampaign ? calculateItemDiscount(appliedCampaign, +product.price, finalQuantity) : 0

        if (appliedCampaign && campaignDiscount > 0) {
            const existing = usedCampaigns.find(c => c.title === appliedCampaign.title)
            if (existing) existing.discountAmount += campaignDiscount
            else usedCampaigns.push({ title: appliedCampaign.title, discountAmount: campaignDiscount })
        }

        calculatedItems.push({
            id: productId,
            title: product.title,
            slug: product.slug,
            image: product.images[0] ?? null,
            quantity: finalQuantity,
            comparePrice: product.comparePrice ? +product.comparePrice : null,
            price: +product.price,
            totalPrice,
            finalPrice: totalPrice - campaignDiscount,
            appliedCampaign: (appliedCampaign && campaignDiscount > 0)
                ? { title: appliedCampaign.title, discountAmount: campaignDiscount }
                : null
        })
    }

    if (itemsToUpdate.length > 0) {
        await prisma.$transaction(
            itemsToUpdate.map(({ productId, quantity }) =>
                quantity === 0
                    ? prisma.cartItem.delete({ where: { cartId_productId: { cartId: cart.id, productId } } })
                    : prisma.cartItem.update({ where: { cartId_productId: { cartId: cart.id, productId } }, data: { quantity } })
            )
        )
    }

    const subtotal = calculatedItems.reduce((sum, i) => sum + i.totalPrice, 0)
    const campaignDiscount = calculatedItems.reduce((sum, i) => sum + (i.appliedCampaign?.discountAmount ?? 0), 0)
    const netTotal = subtotal - campaignDiscount

    let couponDiscount = 0
    let appliedCoupon: { code: string, title: string, discountAmount: number } | null = null

    if (cart.coupon) {
        const coupon = cart.coupon
        const isValid =
            (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit) &&
            (coupon.minOrderAmount === null || netTotal >= +coupon.minOrderAmount)

        if (isValid) {
            const rawDiscount = coupon.discountType === "PERCENTAGE"
                ? netTotal * (+coupon.discountValue / 100)
                : +coupon.discountValue

            couponDiscount = coupon.maxDiscountAmount
                ? Math.min(rawDiscount, +coupon.maxDiscountAmount)
                : rawDiscount

            appliedCoupon = { code: coupon.code, title: coupon.title, discountAmount: couponDiscount }
        }
    }

    const freeShippingCampaign = validCampaigns.find(c => c.type === "FREE_SHIPPING")
    const isFreeShipping = freeShippingCampaign
        ? (freeShippingCampaign.minOrderAmount === null || netTotal >= +freeShippingCampaign.minOrderAmount)
        : false
    const shippingCost = isFreeShipping ? 0 : 79.90

    const total = netTotal - couponDiscount + shippingCost

    const giftCampaign = validCampaigns.find(c =>
        c.type === "GIFT_PRODUCT" &&
        (c.minOrderAmount === null || netTotal >= +c.minOrderAmount)
    ) ?? null

    return {
        id: cart.id,
        items: calculatedItems,
        subtotal,
        campaignDiscount,
        usedCampaigns,
        appliedCoupon,
        shippingCost,
        total,
        giftCampaign: giftCampaign ? { title: giftCampaign.title } : null,
        cartActionMessages
    }
}

/** Mevcut sepeti getirir ve hesaplar. */
export async function getCart(data: GetCartInput, userId: string | undefined) {
    return calculateCart(data.cartId, userId)
}

/** Sepete ürün ekler. Ürün zaten sepetteyse miktarını artırır. */
export async function addToCart(data: AddToCartInput, userId: string | undefined) {
    const { cartId, productId, quantity } = data

    const product = await prisma.product.findUnique({
        where: { id: productId, isActive: true },
        select: { stock: true }
    })
    if (!product) throw new AppError("Ürün bulunamadı", 404)

    const resolvedCartId = await resolveCartId(cartId, userId)

    const cartItem = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: resolvedCartId, productId } },
        select: { quantity: true }
    })

    const newQuantity = (cartItem?.quantity ?? 0) + quantity
    if (newQuantity > product.stock) throw new AppError("Yeterli stok yok", 400)

    await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: resolvedCartId, productId } },
        create: { cartId: resolvedCartId, productId, quantity },
        update: { quantity: newQuantity }
    })

    return calculateCart(resolvedCartId, userId)
}

export async function updateCartItemQuantity(data: UpdateCartItemQuantityInput, userId: string | undefined) {
    const { cartId, productId, quantity } = data

    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true }
    })

    if (!product) throw new AppError("Ürün bulunamadı", 404)
    if (quantity > product.stock) throw new AppError("Yeterli stok yok", 400)

    if (userId) {
        const result = await prisma.cartItem.updateMany({
            where: { cart: { userId }, productId },
            data: { quantity }
        })
        if (result.count === 0) throw new AppError("Ürün sepette bulunamadı", 404)
    }
    else {
        if (!cartId) throw new AppError("Sepet bulunamadı", 400)

        const cartItem = await prisma.cartItem.findUnique({
            where: { cartId_productId: { cartId, productId } },
            select: { cart: { select: { userId: true } } }
        })

        if (!cartItem) throw new AppError("Ürün sepette bulunamadı", 404)
        if (cartItem.cart.userId) throw new AppError("UNAUTHORIZED", 401)

        await prisma.cartItem.update({
            where: { cartId_productId: { cartId, productId } },
            data: { quantity }
        })
    }

    return calculateCart(cartId, userId)
}

export async function deleteFromCart(data: DeleteFromCartInput, userId: string | undefined) {
    const { cartId, productId } = data

    if (userId) {
        await prisma.cartItem.deleteMany({
            where: { cart: { userId }, productId }
        })
    }
    else {
        if (!cartId) throw new AppError("Sepet bulunamadı", 400)

        const cartItem = await prisma.cartItem.findUnique({
            where: { cartId_productId: { cartId, productId } },
            select: { cart: { select: { userId: true } } }
        })

        if (!cartItem) throw new AppError("Ürün sepette bulunamadı", 404)
        if (cartItem.cart.userId) throw new AppError("UNAUTHORIZED", 401)

        await prisma.cartItem.delete({
            where: { cartId_productId: { cartId, productId } }
        })
    }

    return calculateCart(cartId, userId)
}

/**
 * Sepete kupon kodu uygular.
 * Kuponun geçerliliği (aktiflik, tarih aralığı) kontrol edilir.
 * Minimum tutar ve kullanım limiti `calculateCart` içinde kontrol edilir.
 */
export async function applyCoupon(data: ApplyCouponInput, userId: string | undefined) {
    const { code, cartId } = data

    if (!cartId && !userId) throw new AppError("Sepet bulunamadı", 400)

    const now = new Date()
    const coupon = await prisma.coupon.findFirst({
        where: {
            code,
            isActive: true,
            AND: [
                { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
                { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
            ]
        }
    })

    if (!coupon) throw new AppError("Geçersiz veya süresi dolmuş kupon", 400)
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
        throw new AppError("Kupon kullanım limitine ulaşmış", 400)
    }

    await prisma.cart.update({
        where: userId ? { userId } : { id: cartId! },
        data: { couponId: coupon.id }
    })

    return calculateCart(cartId, userId)
}

export async function removeCoupon(data: RemoveCouponInput, userId: string | undefined) {
    const { cartId } = data

    if (!cartId && !userId) throw new AppError("Sepet bulunamadı", 400)

    await prisma.cart.update({
        where: userId ? { userId } : { id: cartId! },
        data: { couponId: null }
    })

    return calculateCart(cartId, userId)
}