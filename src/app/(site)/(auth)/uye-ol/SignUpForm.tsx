"use client"

import { Form } from "@/components/Form/Form"
import { authClient } from "@/lib/auth-client"
import { FormStatus } from "@/lib/types"
import { useSignal } from "@preact/signals-react"

export default function SignUpForm() {
    const formStatus = useSignal<FormStatus>(null)

    const handleRegister = async (formValues: any) => {
        const { passwordConfirm, ...rest } = formValues

        await authClient.signUp.email({ ...rest, name: rest.firstName }, {
            onSuccess: () => {
                formStatus.value = { success: true, message: "Hesap başarıyla oluşturuldu" }
            },
            onError: () => {
                formStatus.value = { success: false, message: "Bir hata oluştu, lütfen daha sonra tekrar deneyin" }
            }
        })
    }

    return (
        <div className="sign-up-page container">
            <Form
                groups={[
                    {
                        layout: "row",
                        fields: [
                            { name: "email", type: "email", label: "E-posta" },
                            { name: "firstName", type: "text", label: "Ad" },
                            { name: "lastName", type: "text", label: "Soyad" },
                            { name: "password", type: "password", label: "Şifre" },
                            { name: "passwordConfirm", type: "password", label: "Şifre (Tekrar)" }
                        ]
                    }
                ]}
                title="Üye Ol"
                submitLabel="Üye Ol"
                onSubmit={handleRegister}
                status={formStatus}
            />
        </div>
    )
}