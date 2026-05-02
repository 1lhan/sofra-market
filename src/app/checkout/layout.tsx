import Providers from "@/providers/Providers";
import type { Metadata } from "next";
import { Jost } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "../../styles/main.css";

const jost = Jost({
    variable: "--font-jost",
    subsets: ["latin"]
})

export const metadata: Metadata = {
    title: "Sofra Market",
    metadataBase: new URL("http://localhost:3000")
}

export default async function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${jost.variable}`} style={{ fontFamily: "var(--font-jost)" }} suppressHydrationWarning={true}>
                <Providers>
                    <header className="checkout-header">
                        <div className="container">
                            <Link className="home-btn" href="/">
                                <Image src="/logo_light.webp" alt="sofra market logo" width={107} height={40} priority />
                            </Link>
                        </div>
                    </header>
                    {children}
                </Providers>
            </body>
        </html>
    )
}