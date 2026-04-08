/**
 * Date'i HTML datetime-local input format'ına dönüştür
 * Örnek: "2024-12-28T14:30"
 */
export function formatDateTimeLocal(date?: Date | string | null): string {
    if (!date) return ""

    const d = new Date(date)
    const pad = (n: number) => n.toString().padStart(2, "0")

    const year = d.getFullYear()
    const month = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())

    return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function formatDate(date: Date | string | null | undefined, includeTime: boolean = true) {
    if (!date) return "-"

    const dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        ...(includeTime && {
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return new Intl.DateTimeFormat(
        typeof navigator !== "undefined" ? navigator.language : "en-US",
        dateOptions
    ).format(new Date(date))
}

/**
 * İki tarih arasındaki gün sayısını hesapla
 * Örnek: getDaysDifference(new Date("2024-01-01"), new Date("2024-01-10")) → 9
 */
export function getDaysDifference(dateA: Date | null | undefined, dateB: Date | null | undefined): number | null {
    if (!dateA || !dateB) return null

    const millisecondsDiff = Math.abs(dateA.getTime() - dateB.getTime())
    const daysDiff = millisecondsDiff / (1000 * 60 * 60 * 24)

    return Math.round(daysDiff)
}