"use client"

import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import { memo } from "react"
import { Checkbox } from "./inputs/Checkbox"
import { Input } from "./inputs/Input"
import { Button } from "./ui/Button"
import { Icon } from "./ui/Icon"

type FilterGroupBase = {
    label: string
    key: string
}

type FilterGroupCheckboxes = FilterGroupBase & {
    type: "checkboxes"
    options: { label: string, value: string }[]
}

type FilterGroupRange = FilterGroupBase & { type: "range" }

type FilterGroup = FilterGroupCheckboxes | FilterGroupRange


const CHECKBOX_ITEM_HEIGHT = 1.5 // rem
const GROUP_BODY_PADDING_TOP = 0.5 // rem
const RANGE_HEIGHT = 2.75 + GROUP_BODY_PADDING_TOP // rem


const FilterGroupBodyContent = memo(({ group, searchParams, apply }: {
    group: FilterGroup,
    searchParams: ReadonlyURLSearchParams,
    apply: (key: string, value: string, multiple: boolean) => void
}) => {
    const { key, type } = group

    if (type === "checkboxes") {
        return group.options.map(({ label, value }) =>
            <Checkbox
                name={value}
                checked={(searchParams.get(key)?.split(",") ?? []).includes(value)}
                onChange={() => apply(key, value, true)}
                label={label}
                key={value}
            />
        )
    }

    if (type === "range") {
        return (
            <div className="filter-range">
                <Input
                    name={`${key}Min`}
                    value={searchParams.get(`${key}Min`) ?? ""}
                    onChange={(value) => apply(`${key}Min`, value, false)}
                    type="number"
                    inputProps={{ placeholder: "En düşük" }}
                />
                <Input
                    name={`${key}Max`}
                    value={searchParams.get(`${key}Max`) ?? ""}
                    onChange={(value) => apply(`${key}Max`, value, false)}
                    type="number"
                    inputProps={{ placeholder: "En yüksek" }}
                />
            </div>
        )
    }
}, (prev, next) => {
    if (prev.group.type === "checkboxes") {
        return prev.searchParams.get(prev.group.key) === next.searchParams.get(next.group.key)
    }
    return (
        prev.searchParams.get(`${prev.group.key}Min`) === next.searchParams.get(`${next.group.key}Min`) &&
        prev.searchParams.get(`${prev.group.key}Max`) === next.searchParams.get(`${next.group.key}Max`)
    )
})

export const Filters = ({ groups }: { groups: FilterGroup[] }) => {
    const searchParams = useSearchParams()

    const apply = (key: string, value: string, multiple: boolean) => {
        const params = new URLSearchParams(window.location.search)

        if (multiple) {
            const current = params.get(key)?.split(",").filter(Boolean) ?? []
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value]

            next.length > 0 ? params.set(key, next.join(",")) : params.delete(key)
        }
        else {
            params.get(key) === value || !value
                ? params.delete(key)
                : params.set(key, value)
        }

        window.history.pushState({}, "", `?${params.toString().replaceAll("%2C", ",")}`)
    }

    return (
        <aside className="filters">
            {groups.map((group) =>
                <div className="filter-group" key={group.key}>
                    <input
                        id={`filter-${group.label}-toggle`}
                        className="filter-group-toggle"
                        type="checkbox"
                        defaultChecked={true}
                    />
                    <label className="filter-group-header" htmlFor={`filter-${group.label}-toggle`}>
                        <span className="filter-group-label">{group.label}</span>
                        <Icon name="chevron-down" />
                    </label>
                    <div
                        className="filter-group-body"
                        style={{ height: group.type === "checkboxes" ? (`${(group.options.length * CHECKBOX_ITEM_HEIGHT) + GROUP_BODY_PADDING_TOP}rem`) : `${RANGE_HEIGHT}rem` }}
                    >
                        <FilterGroupBodyContent group={group} searchParams={searchParams} apply={apply} />
                    </div>
                </div>
            )}

            <Button color="neutral" variant="ghost-underline" onClick={() => window.history.pushState({}, "", `?`)}>
                Filtreleri temizle
            </Button>
        </aside>
    )
}