"use client"

import { Breadcrumb } from "@/components/Breadcrumb"
import { usePathname } from "next/navigation"

const PAGE_LABELS: Record<string, string> = {
    "siparisler": "Siparişlerim",
    "degerlendirmeler": "Değerlendirmelerim",
    "kullanici-bilgileri": "Kullanıcı Bilgilerim",
    "adresler": "Adreslerim",
    "sifre-degistir": "Şifre Değiştir",
}

export default function MyAccountBreadCrumb() {
    const pathname = usePathname()
    const segment = pathname.split("/").pop() ?? ""
    const label = PAGE_LABELS[segment] ?? null

    return (
        <Breadcrumb
            items={[
                { label: "Hesabım", url: "/hesabim" },
                ...(label ? [{ label, url: pathname }] : [])
            ]}
        />
    )
}