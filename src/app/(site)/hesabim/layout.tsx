import MyAccountAuthGuard from "./MyAccountAuthGuard"
import MyAccountBreadCrumb from "./MyAccountBreadCrumb"
import MyAccountSidebar from "./MyAccountSidebar"

export default function MyAccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <MyAccountAuthGuard>
            <div className="my-account-layout container container-xl">
                <MyAccountBreadCrumb />
                <MyAccountSidebar />
                <main>
                    {children}
                </main>
            </div>
        </MyAccountAuthGuard>
    )
}