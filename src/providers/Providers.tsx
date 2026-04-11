import ModalProvider from "./ActiveModalsProvider";
import { AuthProvider } from "./AuthProvider";
import QueryProvider from "./QueryProvider";

export default async function Providers({ children }: { children: React.ReactNode }) {
    //const initialUser = await getCurrentUser()
    const initialUser = null

    return (
        <AuthProvider initialUser={initialUser}>
            <QueryProvider>
                <ModalProvider>
                    {children}
                </ModalProvider>
            </QueryProvider>
        </AuthProvider>
    )
}