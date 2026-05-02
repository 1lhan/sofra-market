type BadgeProps = {
    children: React.ReactNode
    color: "primary" | "info" | "success" | "danger" | "warning"
    size?: "xs" | "sm" | "md" | "lg"
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "className">

export const Badge = ({ children, color, size = "sm", ...props }: BadgeProps) => {
    return (
        <span className={`badge badge-${color} badge-${size}`} {...props}>
            {children}
        </span>
    )
}