"use client"

export type InputProps = {
    name: string
    value: string
    onChange: (value: string) => void
    type: "text" | "number" | "date" | "datetime-local" | "email" | "password" | "search"
    className?: string
    inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "name" | "onChange" | "type" | "value">
}

export const Input = ({ name, value, onChange, type, className, inputProps }: InputProps) => {
    return (
        <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`input input-field${className ? ` ${className}` : ""}`}
            {...inputProps}
        />
    )
}