import { ToastContainer } from "@/components/ui/ToastContainer";
import CartDrawer from "@/features/cart/CartDrawer";
import Providers from "@/providers/Providers";
import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "../../styles/main.css";
import Header from "./(header)/Header";
import HeaderNav from "./(header)/HeaderNav";
import SiteTopBar from "./(header)/SiteTopBar";

const jost = Jost({
    variable: "--font-jost",
    subsets: ["latin"]
})

export const metadata: Metadata = {
    title: "Sofra Market",
    metadataBase: new URL("http://localhost:3000")
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${jost.variable}`} style={{ fontFamily: "var(--font-jost)" }} suppressHydrationWarning={true}>
                <Providers>
                    <SiteTopBar />
                    <Header />
                    <HeaderNav />
                    {children}
                    <CartDrawer />
                    <ToastContainer />
                </Providers>
            </body>
        </html>
    )
}