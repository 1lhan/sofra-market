import { Decimal } from "@prisma/client/runtime/client"

export function formatNumber(num: Decimal | number | null | undefined): string {
    if (num == null) return "-"
    return new Intl.NumberFormat(navigator.language).format(+num)
}

export function formatPercentShare(value: number, total: number): string {
    if (total === 0 || isNaN(value) || isNaN(total)) return "-"
    const pct = (value / total) * 100
    if (pct === 0) return "0%"
    return `${pct < 1 ? +pct.toFixed(1) : Math.round(pct)}%`
}