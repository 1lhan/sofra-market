"use client"

import { Form } from "@/components/Form/Form"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { Modal } from "@/components/ui/Modal"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { Signal, useSignal } from "@preact/signals-react"

export default function AddAdressModal({ isAddAdressModalOpen }: { isAddAdressModalOpen: Signal<boolean> }) {
    const formStatus = useSignal<FormStatus>(null)
    const billingType = useSignal("INDIVIDUAL")

    async function handleAddAddress(formValues: any) {
        const { error } = await api.addresses.post(formValues)

        formStatus.value = error ? (error as any).value : null

        if (!error) {
            queryClient.refetchQueries({ queryKey: ["addresses"] })
            billingType.value = "INDIVIDUAL"
            isAddAdressModalOpen.value = false
        }
    }

    if (!isAddAdressModalOpen.value) return null

    return (
        <Modal className="create-address-modal container-sm" onClose={() => { isAddAdressModalOpen.value = false; billingType.value = "INDIVIDUAL" }}>
            <div className="modal-header">
                <Badge color="primary" size="md">
                    <Icon name="plus" size="lg" />
                </Badge>
                <h5>Adres Ekle</h5>
                <Button color="neutral" variant="ghost" onClick={() => { isAddAdressModalOpen.value = false; billingType.value = "INDIVIDUAL" }}>
                    <Icon name="xmark" />
                </Button>
            </div>
            <Form
                groups={[
                    {
                        fields: [
                            { name: "title", type: "text", label: "Adres Başlığı" }
                        ]
                    },
                    {
                        layout: "row",
                        fields: [
                            { name: "firstName", type: "text", label: "Ad" },
                            { name: "lastName", type: "text", label: "Soyadı" },
                        ]
                    },
                    {
                        fields: [
                            { name: "phone", type: "text", label: "Cep Telefonu" }
                        ]
                    },
                    {
                        layout: "row",
                        fields: [
                            { name: "city", type: "text", label: "Şehir" },
                            { name: "district", type: "text", label: "İlçe" },
                            { name: "neighborhood", type: "text", label: "Mahalle" },
                            { name: "postalCode", type: "text", label: "Posta Kodu" },
                        ]
                    },
                    {
                        fields: [
                            { name: "addressLine", type: "textarea", label: "Adres" },
                            {
                                name: "billingType", type: "select", label: "Fatura Türü",
                                options: [{ label: "Bireysel", value: "INDIVIDUAL" }, { label: "Kurumsal", value: "CORPORATE" }],
                                onChange: (value) => billingType.value = value as string,
                                defaultValue: "INDIVIDUAL"
                            }
                        ]
                    },
                    ...(billingType.value === "CORPORATE"
                        ? [
                            {
                                layout: "row" as const,
                                fields: [
                                    { name: "companyName", type: "text" as const, label: "Firma Adı" },
                                    { name: "taxNumber", type: "text" as const, label: "VKN/TCKN" },
                                    { name: "taxOffice", type: "text" as const, label: "Vergi Dairesi" },
                                    { name: "isEInvoice", type: "checkbox" as const, options: [{ label: "E-fatura mükellefiyim", value: true }] }
                                ]
                            }
                        ]
                        : []
                    )
                ]}
                submitLabel="Ekle"
                onSubmit={handleAddAddress}
                status={formStatus}
            />
        </Modal>
    )
}