"use client"

import { RequestResponse } from "@/lib/types"
import { ReadonlySignal, Signal, useComputed } from "@preact/signals-react"
import { Button } from "../ui/Button"
import { Icon } from "../ui/Icon"
import { getDefaultFieldValue } from "./Form"
import { FormGroup } from "./form.types"
import { FormFieldComponent } from "./FormFieldComponent"

type FormGroupComponentProps = {
    group: FormGroup
    groups: FormGroup[]
    values: Signal<Record<string, any>>
    status?: Signal<RequestResponse | null>
}

function addRepeatableGroupRow(group: FormGroup, values: Signal<Record<string, any>>) {
    const { fields, repeatable } = group

    if (repeatable?.name == null || repeatable.max == null) return

    const currentRows = [...values.value[repeatable.name]]

    if (currentRows.length >= repeatable.max) return

    const newRow = Object.assign({}, ...fields.map(getDefaultFieldValue))

    values.value = {
        ...values.value,
        [repeatable.name]: [...currentRows, newRow]
    }
}

function removeRepeatableGroupRow(groupName: string, rowIndex: number, values: Signal<Record<string, any>>) {
    const currentRows = [...values.value[groupName]]

    values.value = {
        ...values.value,
        [groupName]: currentRows.filter((_, i) => i !== rowIndex)
    }
}

const GroupLabel = ({ label }: { label: FormGroup["label"] }) => (
    label && <span className="form-group-label">{label}</span>
)

const GroupBody = ({ group, groups, values, status, rowCount }: FormGroupComponentProps & { rowCount: ReadonlySignal<number> }) => {
    const { fields, repeatable } = group

    if (rowCount.value > 0) {
        return (
            <div className="form-group-body">
                {Array.from({ length: rowCount.value }).map((_, rowIndex) =>
                    <div className="form-group-body-repeatable-row" key={rowIndex}>
                        {fields.map((field, fieldIndex) =>
                            <FormFieldComponent
                                field={field}
                                groups={groups}
                                values={values}
                                status={status}
                                groupName={repeatable!.name}
                                rowIndex={rowIndex}
                                key={fieldIndex}
                            />
                        )}
                        {rowCount.value > 1 &&
                            <Button color="danger" variant="ghost" size="sm" onClick={() => removeRepeatableGroupRow(repeatable!.name, rowIndex, values)}>
                                <Icon name="xmark" />
                                Remove Row
                            </Button>
                        }
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="form-group-body">
            {fields.map((field, fieldIndex) =>
                <FormFieldComponent
                    field={field}
                    groups={groups}
                    values={values}
                    status={status}
                    key={fieldIndex}
                />
            )}
        </div>
    )
}

const AddRowButton = ({ group, values, rowCount }: FormGroupComponentProps & { rowCount: ReadonlySignal<number> }) => {
    const { repeatable } = group
    const canAddRow = repeatable?.name && repeatable.max != null && rowCount.value < repeatable.max

    if (!canAddRow) return null

    return (
        <Button color="info" variant="outline" size="sm" shape="compact" onClick={() => addRepeatableGroupRow(group, values)}>
            Add Row
        </Button>
    )
}

export const FormGroupComponent = ({ group, groups, values, status }: FormGroupComponentProps) => {
    const { label, layout = "column", renderGroup, repeatable } = group

    const rowCount = useComputed(() => (repeatable?.name && repeatable.max != null) ? values.value[repeatable.name].length : 0)

    return (
        <div className={`form-group ${layout === "column" ? "form-group-column" : "form-group-row"}`}>
            {renderGroup
                ? renderGroup(
                    <GroupLabel label={label} />,
                    <GroupBody group={group} groups={groups} values={values} status={status} rowCount={rowCount} />,
                    <AddRowButton group={group} groups={groups} values={values} rowCount={rowCount} />
                ) : (
                    <>
                        <GroupLabel label={label} />
                        <GroupBody group={group} groups={groups} values={values} status={status} rowCount={rowCount} />
                        <AddRowButton group={group} groups={groups} values={values} rowCount={rowCount} />
                    </>
                )}
        </div>
    )
}