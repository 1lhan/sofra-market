"use client"

import { signal, useComputed } from "@preact-signals/safe-react"
import { useEffect } from "react"
import { Button, ButtonProps } from "./Button"
import { Icon, STATUS_ICONS } from "./Icon"

type ToastData = {
    id: string
    title: string
    description?: string
    color: "info" | "success" | "danger" | "warning"
    duration?: number | false
    action?: Pick<ButtonProps, "color" | "variant" | "shape" | "href"> & { label: string, onClick?: () => void }
}

const toasts = signal<ToastData[]>([])

export const toast = {
    add: (item: Omit<ToastData, "id">) => {
        toasts.value = [...toasts.value, { ...item, id: crypto.randomUUID() }]
    },
    remove: (id: string) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }
}

const ToastAction = ({ label, ...buttonProps }: NonNullable<ToastData["action"]>) => (
    <Button size="sm" className="toast-action" {...buttonProps}>{label}</Button>
)

const ToastItem = ({ id, title, description, color, duration = 5000, action }: ToastData) => {
    const handleClose = () => toast.remove(id)

    useEffect(() => {
        if (duration === false) return
        const timer = setTimeout(handleClose, duration)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div
            className={`toast toast-${color}`}
            role={color === "danger" ? "alert" : "status"}
            aria-live={color === "danger" ? "assertive" : "polite"}
            aria-atomic="true"
        >
            <div className="toast-header">
                <Icon name={STATUS_ICONS[color]} size="sm" />
                <span className="toast-title">{title}</span>
                <Button color="muted" variant="ghost" aria-label="Close" onClick={handleClose}>
                    <Icon name="xmark" size="xs" />
                </Button>
            </div>
            {description && <p className="toast-description">{description}</p>}
            {action && <ToastAction {...action} />}
        </div>
    )
}

export const ToastContainer = () => {
    const items = useComputed(() => toasts.value)

    return (
        <div className="toast-container" aria-label="Notifications">
            {items.value.map(item =>
                <ToastItem {...item} key={item.id} />
            )}
        </div>
    )
}