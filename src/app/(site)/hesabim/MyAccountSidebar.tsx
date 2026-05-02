"use client"

import SidebarMenu, { SidebarMenuGroup } from "@/components/SidebarMenu"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { useUser } from "@/hooks/useUser"
import { authClient } from "@/lib/auth-client"
import { queryClient } from "@/providers/QueryProvider"
import { useRouter } from "next/navigation"

const SIDEBAR_MENU_GROUPS: SidebarMenuGroup[] = [
    {
        items: [
            { label: "Siparişlerim", path: "/hesabim/siparisler", icon: "box-archive" },
            { label: "Değerlendirmelerim", path: "/hesabim/degerlendirmeler", icon: "star" },
            { label: "Kullanıcı Bilgilerim", path: "/hesabim/kullanici-bilgileri", icon: "user-alt-1" },
            { label: "Adreslerim", path: "/hesabim/adresler", icon: "location-pin" },
            { label: "Şifre Değiştir", path: "/hesabim/sifre-degistir", icon: "lock-alt" }
        ]
    }
]

export default function MyAccountSidebar() {
    const router = useRouter()
    const { user } = useUser()

    async function handleLogout() {
        if (!window.confirm("Çıkış yapmak istediğinizden emin misiniz?")) return

        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    queryClient.removeQueries({ queryKey: ["user"] })
                    queryClient.removeQueries({ queryKey: ["cart"] })
                    router.replace("/")
                },
                onError: () => {
                    // toast.add()
                    window.alert("Bir hata oluştu, lütfen daha sonra tekrar deneyin")
                }
            }
        })
    }

    return (
        <aside className="my-account-sidebar">
            <div className="my-account-sidebar-user-info">
                <span className="my-account-sidebar-name">{`${user!.firstName} ${user!.lastName}`}</span>
                <span className="my-account-sidebar-email">{user!.email}</span>
            </div>
            <div className="my-account-sidebar-content">
                <SidebarMenu groups={SIDEBAR_MENU_GROUPS} />
                <Button className="logout-btn" color="neutral" variant="ghost" shape="rectangle" onClick={handleLogout}>
                    <Icon name="arrow-right-from-bracket" />
                    <span>Çıkış Yap</span>
                </Button>
            </div>
        </aside>
    )
}