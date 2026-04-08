"use client"

export type BadgeProps = {
    children: React.ReactNode
    color: "primary" | "info" | "success" | "danger" | "warning"
    size: "sm" | "md" | "lg"
    shape?: "default" | "compact"
}

export default function Badge({ children, color, size, shape = "compact" }: BadgeProps) {
    return (
        <span className={`badge badge-${color} badge-${size} badge-${shape}`} role="status">
            {children}
        </span>
    )
}