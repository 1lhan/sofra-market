"use client"

import { Loader } from "@/components/ui/Loader"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MyAccountAuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user, isUserLoading } = useUser()

    useEffect(() => {
        if (!isUserLoading && !user) router.replace("/giris-yap")
    }, [user, isUserLoading])

    if (isUserLoading) {
        return (
            <div className="my-account-auth-guard-loader container">
                <Loader type="spinner" />
            </div>
        )
    }

    if (!user) return null

    return children
}