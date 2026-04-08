export type SelectOption = {
    label: string
    value: string | number
}

export type RequestResponse = {
    success: boolean
    data?: any
    message?: string
    errors?: Record<string, string>
}

export type SortState = {
    key: string | null
    order: "asc" | "desc"
}

export type FormStatus = RequestResponse | null