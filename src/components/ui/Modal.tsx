"use client"

import { signal } from "@preact-signals/safe-react"
import { useEffect } from "react"

type ModalProps = {
    children: React.ReactNode
    className: string
    direction?: "center" | "right" | "left"
    onClose: () => void
}

const modalStack = signal<string[]>([])

function pushModal(className: string) {
    if (modalStack.value.length === 0) document.body.style.overflow = "hidden"
    modalStack.value = [...modalStack.value, className]
}

function popModal() {
    modalStack.value = modalStack.value.slice(0, -1)
    if (modalStack.value.length === 0) document.body.style.overflow = "auto"
}

function isTopModal(className: string) {
    return modalStack.value[modalStack.value.length - 1] === className
}

export const Modal = ({ children, className, direction = "center", onClose }: ModalProps) => {
    const handleModalClose = () => {
        if (isTopModal(className)) {
            popModal()
            onClose()
        }
    }

    useEffect(() => {
        pushModal(className)
        const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") handleModalClose() }
        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [])

    return (
        <div className="modal-backdrop" onClick={handleModalClose}>
            <div className={`modal-content modal-${direction}${className ? ` ${className}` : ""}`} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}