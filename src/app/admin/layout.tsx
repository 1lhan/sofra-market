import Providers from "@/providers/Providers";
import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "../../styles/main.css";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

const workSans = Work_Sans({
    variable: "--font-work-sans",
    subsets: ["latin"]
})

export const metadata: Metadata = {
    title: "Sofra Market | Admin"
}

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${workSans.variable}`} style={{ fontFamily: "var(--font-work-sans)" }} suppressHydrationWarning={true}>
                <Providers>
                    <div className="admin-layout">
                        <AdminSidebar />
                        <main className="admin-layout-main">
                            <AdminHeader />
                            <div className="admin-layout-content">
                                {children}
                            </div>
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    )
}