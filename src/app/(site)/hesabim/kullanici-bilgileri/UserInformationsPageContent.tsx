"use client"

import { Form } from "@/components/Form/Form"
import { useUser } from "@/hooks/useUser"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"

export default function UserInformationsPageContent() {
    const formStatus = useSignal<FormStatus>(null)
    const { user } = useUser()

    async function updateUserInformations(formValues: any) {
        const { data, error } = await api.users.put(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        formStatus.value = null
        queryClient.setQueryData(["user"], { ...user, ...data.data })
    }

    if (!user) return null

    return (
        <div className="user-informations-page container-sm">
            <h1 className="page-title">Kullanıcı Bilgilerim</h1>
            <Form
                groups={[
                    {
                        layout: "row",
                        fields: [
                            { name: "firstName", type: "text", label: "Ad", defaultValue: user.firstName },
                            { name: "lastName", type: "text", label: "Soyad", defaultValue: user.lastName }
                        ]
                    },
                    {
                        fields: [
                            { name: "email", type: "email", label: "E-posta", defaultValue: user.email },
                            { name: "phone", type: "text", label: "Cep Telefonu", defaultValue: user.phone },
                        ]
                    }
                ]}
                submitLabel="Güncelle"
                onSubmit={updateUserInformations}
                status={formStatus}
                key={`${user.firstName}-${user.lastName}-${user.email}-${user.phone}`}
            />
        </div>
    )
}