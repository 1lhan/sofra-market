"use client"

import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { isCartDrawerOpen } from "@/features/cart/CartDrawer"
import { authClient } from "@/lib/auth-client"
import { api } from "@/lib/eden"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Header() {
    const router = useRouter()

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data } = await authClient.getSession()
            return data?.user ?? null
        }
    })

    const { data: cart, isLoading: isCartLoading } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const cartId = localStorage.getItem("cartId")
            const { data } = await api.carts.get({ query: { cartId } })
            return data?.data ?? null
        }
    })

    const cartItemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0

    return (
        <header className="header">
            <div className="header-inner container">
                <Link className="home-btn" href="/">
                    <Image src="/logo_light.webp" alt="sofra market logo" width={107} height={40} priority />
                </Link>
                <div className="header-actions">
                    <Button color="neutral" variant="ghost" shape="compact" disabled={isUserLoading} onClick={() => router.push(user ? "/hesabim" : "/giris-yap")}>
                        <Icon name="user-alt-1" />
                    </Button>
                    <Button className="cart-btn" color="neutral" variant="ghost" shape="compact" disabled={isCartLoading} onClick={() => isCartDrawerOpen.value = true}>
                        <Icon name="bag-shopping" />
                        {cartItemCount > 0 && <span className="cart-item-count">{cartItemCount}</span>}
                    </Button>
                </div>
            </div>
        </header>
    )
}