"use client"

import { getExtensionFromMimeType } from "@/lib/files"
import { formatInitialFileName, toKebabCase } from "@/lib/string"
import { RequestResponse } from "@/lib/types"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { useEffect, useRef } from "react"
import Button from "../ui/Button"
import { FormField, FormGroup } from "./form.types"
import { FormGroupComponent } from "./FormGroupComponent"

type FormProps = {
    title?: string
    groups: FormGroup[]
    onSubmit?: (formValues: any) => Promise<void> | void
    submitLabel?: string
    status?: Signal<RequestResponse | null>
}

export function getDefaultFieldValue(field: FormField): Record<string, any> {
    const { name, type, defaultValue } = field

    switch (type) {
        case "checkbox":
            return { [name]: defaultValue == null ? (field.options.length > 1 ? [] : false) : defaultValue }
        case "select":
            return { [name]: defaultValue == null ? (field.multiple ? [] : "") : defaultValue }
        case "file":
            return {
                [name]: [],
                [formatInitialFileName(name)]: defaultValue == null
                    ? []
                    : (Array.isArray(defaultValue) ? defaultValue : [defaultValue])
            }
        default:
            return { [name]: defaultValue == null ? "" : defaultValue }
    }
}

function initializeFormValues(groups: FormGroup[]): Record<string, any> {
    let values: Record<string, any> = {}

    for (const { fields, repeatable } of groups) {
        if (repeatable?.name && repeatable.max) {
            if (repeatable.defaultValues) {
                values[repeatable.name] = repeatable.defaultValues.map(item => {
                    fields.forEach(field => {
                        if (field.type === "file") {
                            item[formatInitialFileName(field.name)] = [].concat(item[field.name] ?? [])
                            item[field.name] = []
                        }
                    })
                    return item
                })
            }
            else {
                values[repeatable.name] = [Object.assign({}, ...fields.map(getDefaultFieldValue))]
            }
        }
        else {
            fields.forEach(field => Object.assign(values, getDefaultFieldValue(field)))
        }
    }

    return values
}

function extractEmbeddedImages(htmlContent: string): { html: string; images: File[] } {
    const doc = new DOMParser().parseFromString(htmlContent, "text/html")
    const images = Array.from(doc.querySelectorAll<HTMLImageElement>("img"))
        .filter(img => img.src.startsWith("data:image/"))

    const imageFiles = images.map((img, index) => {
        const [metadata, base64Data] = img.src.split(",")
        const mimeType = metadata.match(/data:(image\/[a-zA-Z0-9+.-]+);base64/)?.[1] ?? "image/png"
        const ext = getExtensionFromMimeType(mimeType) ?? "png"

        const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

        img.setAttribute("data-temp-id", `temp-${index}`)
        img.removeAttribute("src")

        return new File([byteArray], `image-${index}.${ext}`, { type: mimeType })
    })

    return { html: doc.body.innerHTML, images: imageFiles }
}

export const Form = ({ title, groups, onSubmit, submitLabel, status }: FormProps) => {
    const values = useSignal<Record<string, any>>(initializeFormValues(groups))
    const isSubmitting = useSignal(false)
    const isFirstRender = useRef(true)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!onSubmit) return

        batch(() => {
            isSubmitting.value = true
            if (status?.value) status.value = null
        })

        const formattedValues: Record<string, any> = { ...values.value }
        for (const field of groups.flatMap(g => g.fields)) {
            if (field.type === "editor") {
                const { html, images } = await extractEmbeddedImages(formattedValues[field.name])
                formattedValues[field.name] = html
                formattedValues[`${field.name}Images`] = images
            }
        }

        await onSubmit(formattedValues)

        batch(() => {
            if (status?.value?.success || status?.value === null) {
                values.value = initializeFormValues(groups)
            }
            isSubmitting.value = false
        })
    }

    const FormStatusElement = () => (
        status?.value?.message && (
            <div className={`form-status ${status.value.success ? "text-success" : "text-danger"}`} role="status" aria-live="polite">
                {status.value.message}
            </div>
        )
    )

    const FormSubmitButton = () => (
        submitLabel && (
            <Button color="primary" variant="filled" shape="default" className="form-submit-button" type="submit" loading={isSubmitting.value}>
                {submitLabel}
            </Button>
        )
    )

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const fieldNames = groups
            .flatMap(group => [group.repeatable?.name, ...group.fields.map(f => f.name)])
            .filter(Boolean)

        const newValues = initializeFormValues(groups)
        const prevValues = Object.fromEntries(
            Object.entries(values.value).filter(([key]) =>
                fieldNames.includes(key.replace("initial", ""))
            )
        )

        values.value = { ...newValues, ...prevValues }
    }, [groups])

    return (
        <form className={`form${title ? ` ${toKebabCase(title)}` : ""}`} onSubmit={handleSubmit}>
            {title && <h5 className="form-title">{title}</h5>}
            <div className="form-body">
                {groups.map((group, index) =>
                    <FormGroupComponent
                        group={group}
                        groups={groups}
                        values={values}
                        status={status}
                        key={index}
                    />
                )}
            </div>
            <FormStatusElement />
            <FormSubmitButton />
        </form>
    )
}