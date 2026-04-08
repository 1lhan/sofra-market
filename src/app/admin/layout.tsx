import Providers from "@/providers/Providers";
import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import { Suspense } from "react";
import "../../styles/main.css";
import AdminGuard from "./AdminGuard";

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
                <Suspense>
                    <Providers>
                        <AdminGuard>
                            {children}
                        </AdminGuard>
                    </Providers>
                </Suspense>
            </body>
        </html>
    )
}