import { ReadonlyURLSearchParams } from "next/navigation"

/**
 * Sorts an array of items by a specified key
 * @param items - Array of items to sort
 * @param key - Object key to sort by
 * @param order - Sort order ("asc" or "desc")
 * @param type - Data type for proper sorting
 * @returns New sorted array
 */
export function sortByKey<T extends Record<string, any>>(items: T[], key: keyof T, order: "asc" | "desc", type: "text" | "number" | "date") {
    return [...items].sort((a, b) => {
        const aValue = a[key]
        const bValue = b[key]

        if (aValue == null && bValue == null) return 0
        if (aValue == null) return 1
        if (bValue == null) return -1

        const isDescending = order === "desc"

        switch (type) {
            case "text": {
                const strA = String(aValue)
                const strB = String(bValue)
                return isDescending
                    ? strB.localeCompare(strA, "en", { numeric: true })
                    : strA.localeCompare(strB, "en", { numeric: true })
            }
            case "number": {
                const numA = Number(aValue)
                const numB = Number(bValue)
                return isDescending ? numB - numA : numA - numB
            }
            case "date": {
                const dateA = new Date(aValue).getTime()
                const dateB = new Date(bValue).getTime()
                return isDescending ? dateB - dateA : dateA - dateB
            }
        }
    })
}

export function updateSortParam(key: string, searchParams: ReadonlyURLSearchParams): "asc" | "desc" {
    const params = new URLSearchParams(searchParams.toString())
    const sortParam = searchParams.get("sort") || ""
    const [currentKey, currentOrder] = sortParam.split("_")

    const newOrder = currentKey !== key
        ? "desc"
        : (currentOrder === "desc" ? "asc" : "desc")

    params.set("sort", `${key}_${newOrder}`)

    window.history.pushState({}, "", `?${params.toString().replaceAll("%2C", ",")}`)

    return newOrder
}