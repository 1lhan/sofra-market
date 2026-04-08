"use client"

export type TextareaProps = {
    name: string
    value: string
    onChange: (value: string) => void
    className?: string
    textareaProps?: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "name" | "onChange" | "value">
}

export const Textarea = ({ name, value, onChange, className, textareaProps }: TextareaProps) => {
    return (
        <textarea
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`input input-textarea${className ? ` ${className}` : ""}`}
            {...textareaProps}
        />
    )
}