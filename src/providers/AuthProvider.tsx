"use client"

import { UserContext } from "@/features/user/user.types";
import { createContext, ReactNode, useContext, useState } from "react";

type AuthContextType = {
    user: UserContext | null
    setUser: React.Dispatch<React.SetStateAction<UserContext | null>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, initialUser }: { children: ReactNode, initialUser: UserContext | null }) {
    const [user, setUser] = useState<UserContext | null>(initialUser)

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within a AuthProvider")
    return context
}
