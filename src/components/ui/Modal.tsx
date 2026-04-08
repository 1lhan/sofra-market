"use client"

import { useActiveModals } from "@/providers/ActiveModalsProvider"
import { useEffect } from "react"

export default function Modal({ children, className, onClose }: { children: React.ReactNode, className: string, onClose: () => void }) {
    const { activeModals, setActiveModals } = useActiveModals()
    const isTopModal = activeModals[activeModals.length - 1] === className

    useEffect(() => {
        setActiveModals([...activeModals, ...(activeModals.includes(className) ? [] : [className])])

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isTopModal) onClose()
        }

        document.addEventListener("keydown", handleEscape)

        return () => {
            setActiveModals(activeModals.filter((c) => c !== className))
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isTopModal])

    return (
        <div className="modal-backdrop" onClick={() => isTopModal && onClose()}>
            <div className="modal-container">
                <div className={`modal${className ? ` ${className}` : ""}`} onClick={(e) => e.stopPropagation()}>
                    {children}
                </div>
            </div>
        </div>
    )
}