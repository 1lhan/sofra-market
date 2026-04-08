"use client"

export type RadioProps = {
    name: string
    value: string | number
    checked: boolean
    onChange: (value: string | number) => void
    label?: string
    className?: string
    render?: (radio: React.ReactNode) => React.ReactNode
    radioProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "className" | "onChange" | "type" | "name" | "value">
}

export const Radio = ({ name, value, checked, onChange, label, className, render, radioProps }: RadioProps) => {
    const radioElement = (
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={(e) => onChange(e.target.value)}
            className={`input input-radio${className ? ` ${className}` : ""}`}
            {...radioProps}
        />
    )

    return (
        <label className="radio-wrapper">
            {render ? render(radioElement) : radioElement}
            {label && <span>{label}</span>}
        </label>
    )
}