"use client"

type StatusMessageProps = {
    children: React.ReactNode
    color: "info" | "success" | "danger" | "warning"
}

export default function StatusMessage({ children, color }: StatusMessageProps) {
    return (
        <div className={`status-message status-message-${color}`} role="status" aria-live="polite">
            {children}
        </div>
    )
}