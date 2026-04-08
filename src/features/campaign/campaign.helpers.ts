import { CampaignAdminUpdate } from "./campaign.types"

export const CAMPAIGN_TYPE_OPTIONS = [
    { label: "X Al Y Öde", value: "BUY_X_GET_Y" },
    { label: "Her N. Ürüne İndirim", value: "EVERY_NTH_DISCOUNT" },
    { label: "Ücretsiz Kargo", value: "FREE_SHIPPING" },
    { label: "Sepet Tutarına Göre İndirim", value: "BASKET_THRESHOLD" },
    { label: "Hediye Ürün", value: "GIFT_PRODUCT" },
]

export const DISCOUNT_TYPE_OPTIONS = [
    { label: "Yüzde", value: "PERCENTAGE" },
    { label: "Sabit Değer", value: "FIXED" }
]

export const CAMPAIGN_TYPE_LABELS = {
    BUY_X_GET_Y: "X Al Y Öde",
    EVERY_NTH_DISCOUNT: "Her N. Ürüne İndirim",
    FREE_SHIPPING: "Ücretsiz Kargo",
    BASKET_THRESHOLD: "Sepet Tutarına Göre İndirim",
    GIFT_PRODUCT: "Hediye Ürün"
}

export function getCampaignTypeSpecificFormGroups(type: string | null, defaults?: CampaignAdminUpdate, hasOrders?: boolean) {
    switch (type) {
        case "BUY_X_GET_Y":
            return [{
                label: "X Al Y Öde Ayarları",
                layout: "row" as const,
                fields: [
                    { name: "buyQuantity", type: "number" as const, label: "Alınacak Ürün Adedi", defaultValue: defaults?.buyQuantity?.toString(), inputProps: { disabled: hasOrders } },
                    { name: "payQuantity", type: "number" as const, label: "Ödenecek Ürün Adedi", defaultValue: defaults?.payQuantity?.toString(), inputProps: { disabled: hasOrders } }
                ]
            }]
        case "EVERY_NTH_DISCOUNT":
            return [{
                label: "Her N. Ürüne İndirim Ayarları",
                layout: "row" as const,
                fields: [
                    { name: "everyNth", type: "number" as const, label: "Her Kaçıncı Ürüne", defaultValue: defaults?.everyNth?.toString(), inputProps: { disabled: hasOrders } },
                    { name: "discountType", type: "select" as const, label: "İndirim Türü", options: DISCOUNT_TYPE_OPTIONS, defaultValue: defaults?.discountType?.toString(), buttonProps: { disabled: hasOrders } },
                    { name: "discountValue", type: "number" as const, label: "İndirim Değeri", defaultValue: defaults?.discountValue?.toString(), inputProps: { disabled: hasOrders } },
                    { name: "maxDiscountAmount", type: "number" as const, label: "Maksimum İndirim Tutarı", defaultValue: defaults?.maxDiscountAmount?.toString(), inputProps: { disabled: hasOrders } }
                ]
            }]
        case "FREE_SHIPPING":
            return [{
                label: "Ücretsiz Kargo Ayarları",
                layout: "row" as const,
                fields: [
                    { name: "minOrderAmount", type: "number" as const, label: "Minimum Sepet Tutarı", defaultValue: defaults?.minOrderAmount?.toString(), inputProps: { disabled: hasOrders } }
                ]
            }]
        case "BASKET_THRESHOLD":
            return [{
                label: "Sepet Tutarına Göre İndirim Ayarları",
                layout: "row" as const,
                fields: [
                    { name: "minOrderAmount", type: "number" as const, label: "Minimum Sepet Tutarı", defaultValue: defaults?.minOrderAmount?.toString(), inputProps: { disabled: hasOrders } },
                    { name: "discountType", type: "select" as const, label: "İndirim Türü", options: DISCOUNT_TYPE_OPTIONS, defaultValue: defaults?.discountType?.toString(), buttonProps: { disabled: hasOrders } },
                    { name: "discountValue", type: "number" as const, label: "İndirim Değeri", defaultValue: defaults?.discountValue?.toString(), inputProps: { disabled: hasOrders } },
                    { name: "maxDiscountAmount", type: "number" as const, label: "Maksimum İndirim Tutarı", defaultValue: defaults?.maxDiscountAmount?.toString(), inputProps: { disabled: hasOrders } }
                ]
            }]
        case "GIFT_PRODUCT":
            return [{
                label: "Hediye Ürün Ayarları",
                layout: "row" as const,
                fields: [
                    { name: "minOrderAmount", type: "number" as const, label: "Minimum Sepet Tutarı", defaultValue: defaults?.minOrderAmount?.toString(), inputProps: { disabled: hasOrders } },
                ]
            }]
        default:
            return []
    }
}