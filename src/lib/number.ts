import { Decimal } from "@prisma/client/runtime/client"

export function formatPrice(amount: Decimal | number | null | undefined, currency = "TRY"): string {
    if (amount == null) return "-"

    return new Intl.NumberFormat(navigator.language, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(+amount)
}

export function formatNumber(num: Decimal | number | null | undefined): string {
    if (num == null) return "-"
    return new Intl.NumberFormat(navigator.language).format(+num)
}