"use client"

type TooltipProps = {
    children: React.ReactNode
    anchor: string
    direction?: "top" | "right" | "bottom" | "left"
}

export default function Tooltip({ anchor, children, direction = "bottom" }: TooltipProps) {
    return (
        <div className={`tooltip tooltip-${direction}`} style={{ positionAnchor: anchor }} role="tooltip">
            {children}
        </div>
    )
}