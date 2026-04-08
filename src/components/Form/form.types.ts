import { CheckboxProps } from "../inputs/Checkbox"
import { CustomSelectOption, CustomSelectProps } from "../inputs/CustomSelect"
import { FileUploadProps } from "../inputs/FileUpload"
import { InputProps } from "../inputs/Input"
import { RadioProps } from "../inputs/Radio"
import { TextareaProps } from "../inputs/Textarea"
import { TinyMceEditorProps } from "../inputs/TinyMceEditor"

export type FieldBase<TType extends string | string[], TValue = any> = {
    type: TType
    label?: string
    defaultValue?: TValue | null
    renderField?: (label: React.ReactNode, input: React.ReactNode, error: React.ReactNode) => React.ReactNode
}

export type InputField =
    FieldBase<"text" | "number" | "date" | "datetime-local" | "email" | "password" | "search", string> &
    Partial<Pick<InputProps, "onChange">> &
    Omit<InputProps, "value" | "onChange" | "type">


export type TextareaField =
    FieldBase<"textarea", string> &
    Partial<Pick<TextareaProps, "onChange">> &
    Omit<TextareaProps, "value" | "onChange">

export type CheckboxField =
    FieldBase<"checkbox", boolean> &
    Partial<Pick<CheckboxProps, "onChange">> &
    Omit<CheckboxProps, "checked" | "onChange" | "label"> &
    { options: { label: string, value: any, meta?: Record<string, any> }[] }

export type RadioField =
    FieldBase<"radio", string | number> &
    Partial<Pick<RadioProps, "onChange">> &
    Omit<RadioProps, "value" | "checked" | "onChange" | "label"> &
    { options: { label: string, value: any, meta?: Record<string, any> }[] }

export type SelectField =
    FieldBase<"select", string | number | (string | number)[]> &
    Partial<Pick<CustomSelectProps, "onChange" | "options">> &
    Omit<CustomSelectProps, "value" | "onChange" | "options"> &
    { dependsOn?: string, resetOnChange?: string[], optionsMap?: Record<string, CustomSelectOption[]> }

export type FileField =
    FieldBase<"file", string | string[]> &
    Partial<Pick<FileUploadProps, "onChange">> &
    Omit<FileUploadProps, "files" | "id" | "initialFiles" | "onChange">

export type EditorField =
    FieldBase<"editor", string> &
    Partial<Pick<TinyMceEditorProps, "onChange">> &
    Omit<TinyMceEditorProps, "value" | "onChange"> &
    { name: string }

export type FormField = InputField | TextareaField | CheckboxField | RadioField | SelectField | FileField | EditorField

export type FormGroup = {
    label?: string
    layout?: "row" | "column"
    fields: FormField[]
    repeatable?: {
        name: string
        max: number
        defaultValues?: Record<string, any>[]
    }
    renderGroup?: (label: React.ReactNode, body: React.ReactNode, addRowButton?: React.ReactNode) => React.ReactNode
}