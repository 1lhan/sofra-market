"use client"

import { Form } from "@/components/Form/Form"
import { authClient } from "@/lib/auth-client"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import { useRouter } from "next/navigation"

export default function SignInForm() {
    const router = useRouter()
    const formStatus = useSignal<FormStatus>(null)

    const handleLogin = async (formValues: any) => {
        await authClient.signIn.email(formValues, {
            onSuccess: async (ctx) => {
                queryClient.setQueryData(["user"], ctx.data.user)

                const cartId = localStorage.getItem("cartId")
                const { data } = await api.carts.get({ query: { cartId } })
                if (!data) return

                queryClient.setQueryData(["cart"], data.data)
                if (!cartId && data.data) localStorage.setItem("cartId", data.data.id)

                router.push("/")
            },
            onError: (ctx) => {
                formStatus.value = {
                    success: false,
                    message: ctx.error.code === "INVALID_EMAIL_OR_PASSWORD"
                        ? "Geçersiz e-posta ya da şifre"
                        : "Bir hata oluştu, lütfen daha sonra tekrar deneyin"
                }
            }
        })
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