"use client"
import { Form } from "@/components/Form/Form"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { Modal } from "@/components/ui/Modal"
import { UserAddress } from "@/features/address/address.types"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { Signal, useSignal, useSignalEffect } from "@preact-signals/safe-react"

export default function UpdateAddressModal({ addressToUpdate }: { addressToUpdate: Signal<UserAddress | null> }) {
    const formStatus = useSignal<FormStatus>(null)
    const billingType = useSignal("")

    async function handleUpdateAddress(formValues: any) {
        if (!addressToUpdate.value) return

        const { error } = await api.addresses({ addressId: addressToUpdate.value.id }).put(formValues)

        formStatus.value = error ? (error as any).value : null

        if (!error) {
            queryClient.refetchQueries({ queryKey: ["addresses"] })
            addressToUpdate.value = null
        }
    }

    useSignalEffect(() => {
        billingType.value = addressToUpdate.value?.billingType ?? "INDIVIDUAL"
    })

    if (!addressToUpdate.value) return null

    return (
        <Modal className="update-address-modal container-sm" onClose={() => addressToUpdate.value = null}>
            <div className="modal-header">
                <Badge color="primary" size="md">
                    <Icon name="pen-line" size="lg" />
                </Badge>
                <h5>Adres Güncelle</h5>
                <Button color="neutral" variant="ghost" onClick={() => addressToUpdate.value = null}>
                    <Icon name="xmark" />
                </Button>
            </div>
            <Form
                groups={[
                    {
                        fields: [
                            { name: "title", type: "text", label: "Adres Başlığı", defaultValue: addressToUpdate.value.title }
                        ]
                    },
                    {
                        layout: "row",
                        fields: [
                            { name: "firstName", type: "text", label: "Ad", defaultValue: addressToUpdate.value.firstName },
                            { name: "lastName", type: "text", label: "Soyadı", defaultValue: addressToUpdate.value.lastName },
                        ]
                    },
                    {
                        fields: [
                            { name: "phone", type: "text", label: "Cep Telefonu", defaultValue: addressToUpdate.value.phone }
                        ]
                    },
                    {
                        layout: "row",
                        fields: [
                            { name: "city", type: "text", label: "Şehir", defaultValue: addressToUpdate.value.city },
                            { name: "district", type: "text", label: "İlçe", defaultValue: addressToUpdate.value.district },
                            { name: "neighborhood", type: "text", label: "Mahalle", defaultValue: addressToUpdate.value.neighborhood },
                            { name: "postalCode", type: "text", label: "Posta Kodu", defaultValue: addressToUpdate.value.postalCode },
                        ]
                    },
                    {
                        fields: [
                            { name: "addressLine", type: "textarea", label: "Adres", defaultValue: addressToUpdate.value.addressLine },
                            {
                                name: "billingType", type: "select", label: "Fatura Türü",
                                options: [{ label: "Bireysel", value: "INDIVIDUAL" }, { label: "Kurumsal", value: "CORPORATE" }],
                                onChange: (value) => billingType.value = value as string,
                                defaultValue: addressToUpdate.value.billingType
                            }
                        ]
                    },
                    ...(billingType.value === "CORPORATE"
                        ? [
                            {
                                layout: "row" as const,
                                fields: [
                                    { name: "companyName", type: "text" as const, label: "Firma Adı", defaultValue: addressToUpdate.value.companyName },
                                    { name: "taxNumber", type: "text" as const, label: "VKN/TCKN", defaultValue: addressToUpdate.value.taxNumber },
                                    { name: "taxOffice", type: "text" as const, label: "Vergi Dairesi", defaultValue: addressToUpdate.value.taxOffice },
                                    { name: "isEInvoice", type: "checkbox" as const, options: [{ label: "E-fatura mükellefiyim", value: true }], defaultValue: addressToUpdate.value.isEInvoice }
                                ]
                            }
                        ]
                        : []
                    )
                ]}
                submitLabel="Güncelle"
                onSubmit={handleUpdateAddress}
                status={formStatus}
            />
        </Modal>
    )
}