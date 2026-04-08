"use client"

import { Signal } from "@preact/signals-react"
import Button from "./Button"
import Icon from "./Icon"

type BulkActionsBarProps = {
    children: React.ReactNode
    selectedItems: Signal<string[] | number[]>
}

export default function BulkActionsBar({ children, selectedItems }: BulkActionsBarProps) {
    if (!selectedItems.value.length) return null

    return (
        <div className="bulk-actions-bar" role="toolbar" aria-label="Bulk actions">
            <span className="bulk-actions-bar-count" aria-live="polite">{`${selectedItems.value.length} Selected`}</span>
            {children}
            <Button color="secondary" variant="outline" shape="compact" aria-label="Clear selection" onClick={() => selectedItems.value = []} >
                <Icon name="broom" />
            </Button>
        </div>
    )
}