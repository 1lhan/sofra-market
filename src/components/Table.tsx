"use client"

import { toKebabCase } from "@/lib/string"
import { SortState } from "@/lib/types"
import { Signal } from "@preact/signals-react"
import { useSearchParams } from "next/navigation"
import { Checkbox } from "./inputs/Checkbox"
import { Button } from "./ui/Button"
import { Icon } from "./ui/Icon"

export type TableColumn<T extends Record<string, any>> = {
    header?: string
    key?: Extract<keyof T, string>
    type?: "text" | "number" | "date" | "action:view" | "action:update" | "action:delete"
    sortable?: boolean
    render?: (row: T) => React.ReactNode
    href?: (row: T) => string
    onAction?: (row: T) => void
}

type TableColumnGroup<T extends Record<string, any>> = {
    header?: string
    columns: TableColumn<T>[]
}

type TableProps<T extends Record<string, any>> = {
    data: T[]
    columns: (TableColumn<T> | TableColumnGroup<T>)[]
    rowSelection?: {
        key: Extract<keyof T, string>,
        state: Signal<(string | number)[]>
    }
    sortConfig?:
    { type: "state", state: Signal<SortState> } |
    { type: "search-params" }
    onSort?: (key: keyof T, type: "text" | "number" | "date") => void
}

function handleSort<T extends Record<string, any>>(column: TableColumn<T>, onSort: TableProps<T>["onSort"]) {
    const { key, type } = column

    if (key && (type === "text" || type === "number" || type === "date") && onSort) {
        onSort(key, type)
    }
}

const TableCheckbox = <T extends Record<string, any>>({ data, row, rowIndex, rowSelection }: { data: T[], row?: T, rowIndex?: number, rowSelection: TableProps<T>["rowSelection"] }) => {
    if (!rowSelection?.key || !rowSelection.state) return null

    const { key, state } = rowSelection
    const isHeaderCell = !row
    const value = isHeaderCell ? "all" : row[key]

    const handleCheckboxChange = (checked: boolean) => {
        if (!key || !state) return

        if (value === "all") {
            state.value = checked
                ? [...new Set([...state.value, ...data.map(item => item[key])])]
                : state.value.filter(v => !data.some(i => i[key] === v))
        }
        else {
            state.value = checked
                ? [...state.value, value]
                : state.value.filter(item => item !== value)
        }
    }

    const Element = isHeaderCell ? "th" : "td"

    return (
        <Element className="table-cell table-cell-checkbox" scope={isHeaderCell ? "col" : undefined}>
            <Checkbox
                name={isHeaderCell ? "select-all" : `select-row-${rowIndex! + 1}`}
                checked={
                    value === "all"
                        ? !!data.length && data.every(item => state.value.includes(item[key]))
                        : state.value.includes(value)
                }
                onChange={handleCheckboxChange}
                checkboxProps={{ "aria-label": isHeaderCell ? "Select all rows" : `Select row ${rowIndex! + 1}` }}
            />
        </Element>
    )
}

const TableSortIcons = <T extends Record<string, any>>({ column, sortConfig }: { column: TableColumn<T>, sortConfig: TableProps<T>["sortConfig"] }) => {
    const searchParams = useSearchParams()
    const { key, sortable } = column

    if (!key || !sortable || !sortConfig) return null

    let isActive: boolean;
    let order: "asc" | "desc";

    if (sortConfig.type === "state") {
        isActive = sortConfig.state.value.key === key
        order = sortConfig.state.value.order
    }
    else {
        const sortParam = searchParams.get("sort") || ""
        const [paramKey, paramOrder] = sortParam.split("_")
        isActive = paramKey === key
        order = paramOrder === "asc" ? "asc" : "desc"
    }

    return (
        <div className="table-sort-icons" aria-hidden="true">
            {/* <Icon name="caret-up" style={{ color: isActive && order === "asc" ? "var(--color-text-primary)" : "" }} />
            <Icon name="caret-down" style={{ color: isActive && order === "desc" ? "var(--color-text-primary)" : "" }} /> */}
        </div>
    )
}

const TableHeaderColumn = <T extends Record<string, any>>({ column, sortConfig, onSort }: { column: TableColumn<T> | TableColumnGroup<T>, sortConfig: TableProps<T>["sortConfig"], onSort: TableProps<T>["onSort"] }) => {
    if ("columns" in column) {
        const { columns, header } = column

        return (
            <th className={`table-cell${header ? ` table-cell-${toKebabCase(header)}` : ""}`} scope="colgroup">
                {header && <span className="table-cell-group-header">{header}</span>}
                {columns.some(col => col.header) &&
                    <div className="table-cell-group-content">
                        {columns.map((groupColumn, index) => {
                            const isSortable = groupColumn.sortable && sortConfig

                            return (
                                <div
                                    className={`table-cell-item${isSortable ? " sortable" : ""}`}
                                    onClick={isSortable ? () => handleSort(groupColumn, onSort) : undefined}
                                    role={isSortable ? "button" : undefined}
                                    key={index}
                                >
                                    <span>{groupColumn.header}</span>
                                    {isSortable && <TableSortIcons column={groupColumn} sortConfig={sortConfig} />}
                                </div>
                            )
                        })}
                    </div>
                }
            </th>
        )
    }

    const { header, sortable } = column
    const isSortable = sortable && sortConfig

    return (
        <th className={`table-cell${header ? ` table-cell-${toKebabCase(header)}` : ""}`} scope="col">
            <div
                className={`table-cell-item${isSortable ? " sortable" : ""}`}
                onClick={isSortable ? () => handleSort(column, onSort) : undefined}
                role={isSortable ? "button" : undefined}
            >
                <span>{header}</span>
                {isSortable && <TableSortIcons column={column} sortConfig={sortConfig} />}
            </div>
        </th >
    )
}

const TableBodyColumn = <T extends Record<string, any>>({ row, column }: { row: T, column: TableColumn<T> }) => {
    const { key, type, render, href, onAction } = column
    const value = row[`${key}`]

    if (render) return render(row)
    if (value == null && !href && !onAction) return null

    switch (type) {
        case "text":
            return <span>{value}</span>
        case "number":
            return <span>{value == null ? "-" : new Intl.NumberFormat(navigator.language).format(+value)}</span>
        case "date":
            return <span>{value ? new Date(value).toLocaleDateString() : "-"}</span>
        case "action:view":
            return (
                <Button
                    color="info"
                    variant="ghost"
                    size="sm"
                    aria-label="View row details"
                    onClick={() => onAction?.(row)}
                    {...(href ? { href: href(row) } : {})}
                >
                    <Icon name="pen-line" />
                </Button>
            )
        case "action:update":
            return (
                <Button
                    color="success"
                    variant="ghost"
                    size="sm"
                    aria-label="Edit row"
                    onClick={() => onAction?.(row)}
                    {...(href ? { href: href(row) } : {})}
                >
                    <Icon name="pen-line" />
                </Button>
            )
        case "action:delete":
            return (
                <Button
                    color="danger"
                    variant="ghost"
                    size="sm"
                    aria-label="Delete row"
                    onClick={() => onAction?.(row)}
                    {...(href ? { href: href(row) } : {})}
                >
                    <Icon name="trash-alt" />
                </Button>
            )
    }
}

export const Table = <T extends Record<string, any>>({ data, columns, rowSelection, sortConfig, onSort }: TableProps<T>) => {
    return (
        <table className="table" role="table">
            <thead className="table-head">
                <tr className="table-row">
                    <TableCheckbox data={data} rowSelection={rowSelection} />
                    {columns.map((column, index) =>
                        <TableHeaderColumn column={column} sortConfig={sortConfig} onSort={onSort} key={index} />
                    )}
                </tr>
            </thead>
            <tbody className="table-body">
                {data.map((row, rowIndex) =>
                    <tr className="table-row" role="row" aria-rowindex={rowIndex + 2} key={rowIndex}>
                        <TableCheckbox data={data} row={row} rowIndex={rowIndex + 1} rowSelection={rowSelection} />
                        {columns.map((column, columnIndex) =>
                            "columns" in column ? (
                                <td className={`table-cell${column.header ? ` table-cell-${toKebabCase(column.header)}` : ""}`} role="gridcell" key={columnIndex}>
                                    <div className="table-cell-group-content">
                                        {column.columns.map((groupColumn, groupColumnIndex) =>
                                            <div className="table-cell-item" key={groupColumnIndex}>
                                                <TableBodyColumn row={row} column={groupColumn} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                            ) : (
                                <td className={`table-cell${column.header ? ` table-cell-${toKebabCase(column.header)}` : ""}`} role="gridcell" key={columnIndex}>
                                    <TableBodyColumn row={row} column={column} />
                                </td>
                            )
                        )}
                    </tr>
                )}
            </tbody>
        </table>
    )
}