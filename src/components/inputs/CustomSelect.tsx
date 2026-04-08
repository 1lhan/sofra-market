"use client"

import { useComputed, useSignal } from "@preact/signals-react"
import { useEffect, useRef } from "react"
import Icon from "../ui/Icon"
import { Checkbox } from "./Checkbox"
import { Input } from "./Input"

export type CustomSelectOption = {
    label: string
    value: string | number
    meta?: Record<string, any>
}

export type CustomSelectProps = {
    name: string
    value: string | number | (string | number)[]
    onChange: (value: string | number) => void
    options: CustomSelectOption[]
    placeholder?: string
    searchable?: boolean
    multiple?: boolean
    renderOption?: (option: CustomSelectOption) => React.ReactNode
    className?: string
    buttonProps?: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "onChange" | "onClick" | "style" | "type">
}

export const CustomSelect = ({ name, value, onChange, options, placeholder, searchable, multiple, renderOption, className, buttonProps }: CustomSelectProps) => {
    const isDropdownOpen = useSignal(false)
    const filterText = useSignal<string>("")
    const listRef = useRef<HTMLUListElement | null>(null)
    const lastScrollTop = useRef<number>(0)

    const onOptionClick = (optionValue: string | number) => {
        if (!multiple) isDropdownOpen.value = false
        if (multiple && listRef.current) lastScrollTop.current = listRef.current.scrollTop

        onChange(optionValue)
    }

    const CustomSelectDisplay = () => {
        const displayValue = Array.isArray(value)
            ? (value.length
                ? (value.length === 1 ? (options.find(o => o.value === value[0])?.label ?? placeholder) : `${value.length} Selected`)
                : placeholder || "Select...")
            : options.find(o => o.value === value)?.label || placeholder || "Select..."

        return (
            <span className="custom-select-display">
                {displayValue}
            </span>
        )
    }

    const CustomSelectDropdown = () => {
        const filteredOptions = useComputed(() =>
            options.filter(o =>
                o.label.toLowerCase().includes(filterText.value.toLowerCase())
            )
        )

        useEffect(() => {
            if (multiple && isDropdownOpen.value && listRef.current) {
                listRef.current.scrollTop = lastScrollTop.current
            }
        }, [])

        return (
            <div className="custom-select-dropdown" style={{ positionAnchor: `--${name}` }}>
                {searchable &&
                    <div className="custom-select-search-wrapper">
                        <Input
                            name={`${name}-custom-select-search`}
                            value={filterText.value}
                            onChange={(v) => filterText.value = v}
                            type="search"
                        />
                        <Icon name="magnifying-glass" />
                    </div>
                }
                <ul className="custom-select-options" role="listbox" ref={listRef}>
                    {filteredOptions.value.map((option, _) =>
                        <li className="custom-select-option" key={option.value as string | number} role="option">
                            {multiple
                                ? (
                                    <label className="custom-select-option-label">
                                        <Checkbox
                                            name=""
                                            checked={(value as (string | number)[]).includes(option.value)}
                                            onChange={() => onOptionClick(option.value)}
                                        />
                                        {renderOption ? renderOption(option) : <span>{option.label}</span>}
                                    </label>
                                ) : (
                                    <button className="custom-select-option-button" type="button" disabled={value === option.value} onClick={() => onOptionClick(option.value)}>
                                        {renderOption ? renderOption(option) : <span>{option.label}</span>}
                                    </button>
                                )
                            }
                        </li>
                    )}
                </ul>
            </div>
        )
    }

    return (
        <div
            className="custom-select"
            role="combobox"
            aria-expanded={isDropdownOpen.value}
            aria-haspopup="listbox"
        >
            <button
                className={`custom-select-trigger${isDropdownOpen.value ? " custom-select-trigger-open" : ""}${className ? ` ${className}` : ""}`}
                type="button"
                onClick={() => isDropdownOpen.value = !isDropdownOpen.value}
                style={{ anchorName: `--${name}` }}
                {...buttonProps}
            >
                <CustomSelectDisplay />
                <Icon name="chevron-down" aria-hidden="true" />
            </button>
            <CustomSelectDropdown />
        </div>
    )
}