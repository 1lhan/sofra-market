import { Icon, IconNames, STATUS_ICONS } from "./Icon"

type AlertProps = {
    children: React.ReactNode
    color: "info" | "success" | "danger" | "warning"
    icon?: IconNames | false
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className">

export const Alert = ({ children, color, icon, ...props }: AlertProps) => {
    return (
        <div
            className={`alert alert-${color}`}
            role={color === "danger" ? "alert" : "status"}
            aria-live={color === "danger" ? "assertive" : "polite"}
            aria-atomic="true"
            {...props}
        >
            {icon !== false && <Icon name={icon ?? STATUS_ICONS[color]} />}
            {children}
        </div>
    )
}