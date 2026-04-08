"use client"

import SidebarMenu, { SidebarMenuGroup } from "@/components/SidebarMenu"
import Image from "next/image"
import Link from "next/link"

const sidebarMenuGroups: SidebarMenuGroup[] = [
    {
        items: [
            {
                label: "Katalog",
                icon: "book-open",
                items: [
                    { label: "Kategoriler", path: "/admin/categories" },
                    { label: "Alt Kategoriler", path: "/admin/subcategories" },
                    { label: "Ürünler", path: "/admin/products" }
                ]
            },
            {
                label: "Site İçeriği",
                icon: "layer-group",
                items: [
                    { label: "Bloglar", path: "/admin/blogs" },
                    { label: "S.S.S", path: "/admin/faqs" },
                    { label: "Sliderlar", path: "/admin/sliders" }
                ]
            },
            {
                label: "Kampanya & Kupon",
                icon: "gift",
                items: [
                    { label: "Kampanyalar", path: "/admin/campaigns" },
                    { label: "Kuponlar", path: "/admin/coupons" }
                ]
            }
        ]
    }
]

export default function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-logo-wrapper">
                <Link className="home-btn" href="/">
                    <Image src="/logo_dark.webp" alt="sofra market logo" width={107} height={40} priority />
                </Link>
            </div>
            <SidebarMenu groups={sidebarMenuGroups} />
        </aside>
    )
}