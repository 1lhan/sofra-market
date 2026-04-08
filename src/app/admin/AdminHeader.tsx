"use client"

import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { useSignal } from "@preact/signals-react"

export default function AdminHeader() {
    const isSidebarOpen = useSignal(false)

    return (
        <header className="admin-header">
            <Button
                className={`sidebar-toggle${isSidebarOpen.value ? " active" : ""}`}
                onClick={() => {
                    isSidebarOpen.value = !isSidebarOpen.value
                    document.querySelector(".admin-sidebar")?.classList.toggle("sidebar-hidden", isSidebarOpen.value)
                }}
                color="neutral"
                variant="ghost"
                size="lg"
            >
                <Icon name="angles-left" size="lg" />
            </Button>
        </header>
    )
}