"use client"

import { createContext, useContext, useEffect, useState } from "react"

type ActiveModalsContextType = {
    activeModals: string[]
    setActiveModals: React.Dispatch<React.SetStateAction<string[]>>
}

export const ActiveModalsContext = createContext<ActiveModalsContextType | undefined>(undefined)

export default function ActiveModalsProvider({ children }: { children: React.ReactNode }) {
    const [activeModals, setActiveModals] = useState<string[]>([])

    useEffect(() => {
        document.body.style.overflow = activeModals.length > 0 ? "hidden" : "auto"
    }, [activeModals])

    return (
        <ActiveModalsContext.Provider value={{ activeModals, setActiveModals }}>
            {children}
        </ActiveModalsContext.Provider>
    )
}

export const useActiveModals = () => {
    const context = useContext(ActiveModalsContext)
    if (!context) throw new Error("useActiveModals must be used within a ActiveModalsProvider")
    return context
}