"use client"

import { formatInitialFileName } from "@/lib/string"
import { ReadonlySignal, Signal, useComputed } from "@preact/signals-react"
import { Checkbox } from "../inputs/Checkbox"
import { CustomSelect } from "../inputs/CustomSelect"
import { FileUpload } from "../inputs/FileUpload"
import { Input } from "../inputs/Input"
import { Radio } from "../inputs/Radio"
import { Textarea } from "../inputs/Textarea"
import { TinyMceEditor } from "../inputs/TinyMceEditor"
import { getDefaultFieldValue } from "./Form"
import { FormField, FormGroup } from "./form.types"

type FormInputComponentProps = {
    field: FormField
    groups: FormGroup[]
    values: Signal<Record<string, any>>
    id: string,
    error: ReadonlySignal<string | undefined>
    groupName?: string
    rowIndex?: number
}

function updateFormValue(name: FormField["name"], value: any, values: Signal<Record<string, any>>, groupName?: string, rowIndex?: number, onChange?: (value: any) => void) {
    if (groupName && rowIndex != null) {
        const groupRows = [...values.value[groupName]]
        groupRows[rowIndex] = { ...groupRows[rowIndex], [name]: value }
        values.value = { ...values.value, [groupName]: groupRows }
    }
    else {
        values.value = { ...values.value, [name]: value }
    }

    onChange?.(value)
}

export const FormInputComponent = ({ field, groups, values, id, error, groupName, rowIndex }: FormInputComponentProps) => {
    const { name, type, onChange, className = "" } = field

    const isRepeatableField = groupName != null && rowIndex != null
    const inputName = isRepeatableField ? `${groupName}-${rowIndex}-${name}` : name
    const inputClassName = className + (error.value ? ` input-error` : "")

    const fieldValue = useComputed(() => isRepeatableField
        ? values.value[groupName][rowIndex][name]
        : values.value[name]
    )

    const computedOptions = useComputed(() => {
        if (type !== "select") return []

        const { options, dependsOn, optionsMap } = field as Extract<FormField, { type: "select" }>

        if (options) return options
        if (dependsOn == null || optionsMap == null) return []

        return optionsMap[values.value[dependsOn]] ?? []
    })

    const initialFiles = useComputed(() => {
        if (type !== "file") return []

        const initialFileName = formatInitialFileName(name)

        return isRepeatableField
            ? values.value[groupName][rowIndex][initialFileName]
            : values.value[initialFileName]
    })

    switch (type) {
        case "text":
        case "number":
        case "date":
        case "datetime-local":
        case "email":
        case "password":
        case "search": {
            return (
                <Input
                    name={name}
                    value={fieldValue.value ?? ""}
                    onChange={(value) => updateFormValue(name, value, values, groupName, rowIndex, onChange)}
                    type={type}
                    className={inputClassName}
                    inputProps={{ ...field.inputProps, id }}
                />
            )
        }
        case "textarea":
            return (
                <Textarea
                    name={name}
                    value={fieldValue.value}
                    onChange={(value) => updateFormValue(name, value, values, groupName, rowIndex, onChange)}
                    className={inputClassName}
                    textareaProps={{ ...field.textareaProps, id }}
                />
            )
        case "checkbox":
            return (
                <div className="form-checkboxes">
                    {field.options.map((option, optionIndex) =>
                        <Checkbox
                            name={name}
                            checked={(Array.isArray(fieldValue.value) ? fieldValue.value.includes(option.value) : fieldValue.value) ?? false}
                            onChange={(checked) => {
                                const updatedValue = Array.isArray(fieldValue.value)
                                    ? (checked ? [...fieldValue.value, option.value] : [...fieldValue.value].filter((v: string) => v !== option.value))
                                    : checked

                                updateFormValue(name, updatedValue, values, groupName, rowIndex, onChange)
                            }}
                            label={option.label}
                            className={inputClassName}
                            render={field.render}
                            checkboxProps={{ ...field.checkboxProps, id }}
                            key={optionIndex}
                        />
                    )}
                </div>
            )
        case "radio":
            return (
                <div className="form-radios">
                    {field.options.map((option, optionIndex) =>
                        <Radio
                            name={inputName}
                            value={option.value}
                            checked={fieldValue.value === option.value}
                            onChange={(value) => updateFormValue(name, value, values, groupName, rowIndex, onChange)}
                            label={option.value}
                            className={inputClassName}
                            render={field.render}
                            radioProps={{ ...field.radioProps, id }}
                            key={optionIndex}
                        />
                    )}
                </div>
            )
        case "select": {
            const { placeholder, searchable, multiple, renderOption, buttonProps, resetOnChange } = field

            return (
                <CustomSelect
                    name={inputName}
                    value={fieldValue.value}
                    onChange={(value) => {
                        const newValue = multiple
                            ? (fieldValue.value.includes(value) ? fieldValue.value.filter((v: any) => v !== value) : [...fieldValue.value, value])
                            : value

                        let resetedValues = {}

                        if (resetOnChange?.length) {
                            resetedValues = groups.flatMap(g => g.fields).reduce((acc, field) => {
                                if (resetOnChange.includes(field.name)) {
                                    Object.assign(acc, getDefaultFieldValue(field))
                                }
                                return acc
                            }, {} as Record<string, any>)
                        }

                        values.value = {
                            ...values.value,
                            [name]: newValue,
                            ...resetedValues
                        }

                        onChange?.(newValue)
                    }}
                    options={computedOptions.value}
                    placeholder={placeholder}
                    searchable={searchable}
                    multiple={multiple}
                    renderOption={renderOption}
                    className={inputClassName}
                    buttonProps={{ ...buttonProps, id }}
                />
            )
        }
        case "file": {
            const initialFileName = formatInitialFileName(name)

            return (
                <FileUpload
                    id={id}
                    name={inputName}
                    files={fieldValue}
                    initialFiles={initialFiles}
                    config={field.config}
                    onChange={(newFiles, newInitialFiles) => {
                        if (isRepeatableField) {
                            const groupValue = values.value[groupName]
                            groupValue[rowIndex] = {
                                ...groupValue[rowIndex],
                                ...(newFiles ? { [name]: newFiles } : {}),
                                ...(newInitialFiles ? { [initialFileName]: newInitialFiles } : {})
                            }
                            values.value = { ...values.value, [groupName]: groupValue }
                        }
                        else {
                            values.value = {
                                ...values.value,
                                ...(newFiles ? { [name]: newFiles } : {}),
                                ...(newInitialFiles ? { [initialFileName]: newInitialFiles } : {})
                            }
                        }

                        onChange?.(newFiles, newInitialFiles)
                    }}
                    className={inputClassName}
                    labelProps={{ ...field.labelProps }}
                />
            )
        }
        case "editor":
            return (
                <TinyMceEditor
                    value={fieldValue.peek()}
                    onChange={(value) => updateFormValue(name, value, values, groupName, rowIndex, onChange)}
                    placeholder={field.placeholder}
                    className={className}
                />
            )
    }
}