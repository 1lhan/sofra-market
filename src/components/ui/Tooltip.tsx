type TooltipProps = {
    children: React.ReactNode
    anchor: string
    direction?: "top" | "right" | "bottom" | "left"
}

export const Tooltip = ({ children, anchor, direction = "bottom" }: TooltipProps) => {
    return (
        <div
            className={`tooltip tooltip-${direction}`}
            style={{ positionAnchor: anchor }}
            role="tooltip"
        >
            {children}
        </div>
    )
}