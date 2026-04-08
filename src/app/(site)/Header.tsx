"use client"

import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { api } from "@/lib/eden"
import { useAuth } from "@/providers/AuthProvider"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Header() {
    const router = useRouter()
    const { user, setUser } = useAuth()

    const handleLogout = async () => {
        if (!window.confirm("Are you sure you want to log out?")) return

        const { error } = await api.auth.logout.post()

        if (error) {
            window.alert((error as any).value.message)
            return
        }

        router.push("/")
        setUser(null)
    }

    return (
        <header className="header">
            <div className="header-inner container">
                <Link className="home-btn" href="/">
                    <Image src="/logo_light.webp" alt="sofra market logo" width={107} height={40} priority />
                </Link>
                <div className="header-actions">
                    <Button color="neutral" variant="ghost" shape="compact" href={user ? undefined : "/giris-yap"}>
                        <Icon name="user" />
                    </Button>
                </div>
            </div>
        </header>
    )
}