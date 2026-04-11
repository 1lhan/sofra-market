"use client"

import { Form } from "@/components/Form/Form"
import { LoginFormInput } from "@/features/auth/auth.schema"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { useAuth } from "@/providers/AuthProvider"
import { useSignal } from "@preact/signals-react"
import { useRouter } from "next/navigation"

export default function SignInForm() {
    const router = useRouter()
    const { setUser } = useAuth()
    const formStatus = useSignal<FormStatus>(null)

    const handleLogin = async (formValues: LoginFormInput) => {
        const { data, error } = await api.auth.login.post(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        setUser(data.data)
        router.push("/")
    }

    return (
        <div className="sign-in-page container">
            <Form
                groups={[
                    {
                        fields: [
                            { name: "email", type: "email", label: "E-posta" },
                            { name: "password", type: "password", label: "Şifre" },
                        ]
                    }
                ]}
                title="Giriş Yap"
                submitLabel="Giriş Yap"
                onSubmit={handleLogin}
                status={formStatus}
            />
        </div>
    )
}