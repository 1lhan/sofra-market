import Link from "next/link"
import { Loader } from "./Loader"

export type ButtonProps = {
    children: React.ReactNode
    color: "primary" | "secondary" | "surface" | "neutral" | "muted" | "inverse" | "inverse-muted" | "info" | "info-light" | "success" | "success-light" | "danger" | "danger-light" | "warning" | "warning-light"
    variant: "filled" | "outline" | "ghost" | "ghost-underline" | "ghost-filled"
    shape?: "rectangle" | "pill" | "compact" | "circle"
    size?: "sm" | "md" | "lg"
} & (
        React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never, loading?: boolean } |
        React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string, loading?: never }
    )

export const Button = ({ children, color, variant, shape, size = "md", className, href, loading, ...props }: ButtonProps) => {
    const cn = `btn btn-${color} btn-${variant}${shape ? ` btn-${shape}` : ""} btn-${size}${className ? ` ${className}` : ""}${loading ? " loading" : ""}`

    if (href) {
        return (
            <Link
                {...props as React.AnchorHTMLAttributes<HTMLAnchorElement>}
                className={cn}
                href={href}
            >
                {children}
            </Link>
        )
    }

    return (
        <button
            type="button"
            {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            className={cn}
            disabled={(props as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled || loading}
            aria-busy={loading}
        >
            {children}
            {loading && <Loader type="spinner" />}
        </button>
    )
}