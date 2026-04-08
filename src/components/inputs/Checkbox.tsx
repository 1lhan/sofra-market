"use client"

export type CheckboxProps = {
    name: string
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
    className?: string
    render?: (checkboxElement: React.ReactNode) => React.ReactNode
    checkboxProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "className" | "name" | "onChange" | "type">
}

export const Checkbox = ({ name, checked, onChange, label, className, render, checkboxProps }: CheckboxProps) => {
    const checkboxElement = (
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className={`input input-checkbox${className ? ` ${className}` : ""}`}
            {...checkboxProps}
        />
    )

    return (
        <label className="checkbox-wrapper">
            {render ? render(checkboxElement) : checkboxElement}
            {label && <span>{label}</span>}
        </label>
    )
}