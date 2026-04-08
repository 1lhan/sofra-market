import { getCurrentUser } from "@/features/auth/auth.service";
import ModalProvider from "./ActiveModalsProvider";
import { AuthProvider } from "./AuthProvider";
import QueryProvider from "./QueryProvider";

export default async function Providers({ children }: { children: React.ReactNode }) {
    const initialUser = await getCurrentUser()

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