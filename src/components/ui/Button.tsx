"use client"

import Link from "next/link"
import Loader from "./Loader"

export type CommonButtonProps = {
    children: React.ReactNode
    color: "primary" | "secondary" | "neutral" | "muted" | "inverse" | "inverse-muted" | "surface" | "dark-surface"
    | "info" | "info-light" | "success" | "success-light" | "danger" | "danger-light" | "warning" | "warning-light"
    variant: "filled" | "outline" | "ghost" | "underline"
    size?: "sm" | "md" | "lg"
    shape?: "default" | "circle" | "compact"
    disabled?: boolean
    loading?: boolean
    className?: string
}

type ButtonProps = CommonButtonProps & (
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "disabled" | "href"> & { href?: never } |
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "disabled" | "href"> & { href: string }
)

export default function Button({ children, color, variant, size = "md", shape, loading, disabled, href, className, ...props }: ButtonProps) {
    const classNameAttr = `btn btn-${color} btn-${variant} btn-${size}${shape ? ` btn-${shape}` : ""}${loading ? " loading" : ""}${className ? ` ${className}` : ""}`

    if (href) {
        return (
            <Link className={classNameAttr} href={href} aria-disabled={disabled} {...props as React.AnchorHTMLAttributes<HTMLAnchorElement>}>
                {children}
            </Link>
        )
    }

    return (
        <button className={classNameAttr} type="button" disabled={disabled || loading} aria-busy={loading} {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}>
            {children}
            {loading && <Loader type="spinner" />}
        </button>
    )
}