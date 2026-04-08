"use client"

import StatusMessage from "@/components/ui/StatusMessage"
import { useAuth } from "@/providers/AuthProvider"
import { redirect } from "next/navigation"
import AdminHeader from "./AdminHeader"
import AdminSidebar from "./AdminSidebar"

export default function AdminGuard({ children }: Readonly<{ children: React.ReactNode }>) {
    // const { user } = useAuth()

    // if (!user) redirect("/sign-in")

    // if (!user.roles.includes("ADMIN")) {
    //     return (
    //         <div className="container">
    //             <StatusMessage color="danger">You don't have permission to access this page.</StatusMessage>
    //         </div>
    //     )
    // }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-layout-main">
                <AdminHeader />
                <div className="admin-layout-content">
                    {children}
                </div>
            </main>
        </div>
    )
}