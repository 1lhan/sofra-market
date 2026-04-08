"use client"

import { RequestResponse } from "@/lib/types"
import { ReadonlySignal, Signal, useComputed } from "@preact/signals-react"
import { useId } from "react"
import { FormField, FormGroup } from "./form.types"
import { FormInputComponent } from "./FormInputComponent"

type FormFieldComponentProps = {
    field: FormField
    groups: FormGroup[]
    values: Signal<Record<string, any>>
    status?: Signal<RequestResponse | null>
    groupName?: string
    rowIndex?: number
}

const FieldLabel = ({ type, label, id }: { type: FormField["type"], label: FormField["label"], id: string }) => {
    const nonFocusableInputTypes = ["checkbox", "radio", "select", "editor"]

    return nonFocusableInputTypes.includes(type)
        ? <span>{label}</span>
        : <label htmlFor={id}>{label}</label>
}

const FieldError = ({ error }: { error: ReadonlySignal<string | undefined> }) => (
    error.value && <span className="form-field-error" role="alert">{error.value}</span>
)

export const FormFieldComponent = ({ field, groups, values, status, groupName, rowIndex }: FormFieldComponentProps) => {
    const { name, type, label, renderField } = field

    const id = name + useId()

    const error = useComputed(() => status?.value?.errors?.[name])

    return (
        <div className="form-field">
            {renderField
                ? renderField(
                    <FieldLabel type={type} label={label} id={id} />,
                    <FormInputComponent field={field} groups={groups} values={values} id={id} error={error} groupName={groupName} rowIndex={rowIndex} />,
                    <FieldError error={error} />
                )
                : (
                    <>
                        <FieldLabel type={type} label={label} id={id} />
                        <FormInputComponent field={field} groups={groups} values={values} id={id} error={error} groupName={groupName} rowIndex={rowIndex} />
                        <FieldError error={error} />
                    </>
                )
            }
        </div>
    )
}