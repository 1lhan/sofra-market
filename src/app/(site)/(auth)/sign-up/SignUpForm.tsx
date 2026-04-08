"use client"

import { Form } from "@/components/Form/Form"
import { RegisterFormInput } from "@/features/auth/auth.schema"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { useSignal } from "@preact/signals-react"

export default function SignUpForm() {
    const formStatus = useSignal<FormStatus>(null)

    const handleRegister = async (formValues: RegisterFormInput) => {
        const { data, error } = await api.auth.register.post(formValues)
        formStatus.value = data ? data : (error as any).value
    }

    return (
        <div className="sign-up-page container">
            <Form
                groups={[
                    {
                        fields: [
                            { name: "email", type: "email", label: "Email" },
                            { name: "username", type: "text", label: "Username" },
                            { name: "password", type: "password", label: "Password" },
                            { name: "passwordConfirm", type: "password", label: "Password confirm" },
                        ]
                    }
                ]}
                title="Sign Up"
                submitLabel="Sign Up"
                onSubmit={handleRegister}
                status={formStatus}
            />
        </div>
    )
}