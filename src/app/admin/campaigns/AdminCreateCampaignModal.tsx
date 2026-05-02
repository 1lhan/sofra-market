"use client"

import { Form } from "@/components/Form/Form"
import { Badge } from "@/components/ui/Badge"
import { Icon } from "@/components/ui/Icon"
import { Modal } from "@/components/ui/Modal"
import { CAMPAIGN_TYPE_OPTIONS, getCampaignTypeSpecificFormGroups } from "@/features/campaign/campaign.helpers"
import { CreateCampaignFormInput } from "@/features/campaign/campaign.schema"
import { api } from "@/lib/eden"
import { RequestResponse, SelectOption } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { Activity } from "react"

export default function AdminCreateCampaignModal({ isCreateModalOpen, productOptions }: { isCreateModalOpen: Signal<boolean>, productOptions: SelectOption[] }) {
    const formStatus = useSignal<RequestResponse | null>(null)
    const selectedCampaignType = useSignal<string | null>(null)

    const handleCreateCampaign = async (formValues: CreateCampaignFormInput) => {
        const { error } = await api.admin.campaigns.post(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-campaigns"] })
        batch(() => {
            formStatus.value = null
            isCreateModalOpen.value = false
        })
    }

    return (
        <Activity mode={isCreateModalOpen.value ? "visible" : "hidden"}>
            <Modal className="container-lg" onClose={() => isCreateModalOpen.value = false}>
                <div className="modal-header">
                    <Badge color="primary" size="md">
                        <Icon name="plus" size="lg" />
                    </Badge>
                    <h5>Kampanya Oluştur</h5>
                </div>
                <Form
                    groups={[
                        {
                            label: "Temel Bilgiler",
                            layout: "row",
                            fields: [
                                { name: "title", type: "text", label: "Başlık" },
                                { name: "type", type: "select", label: "Kampanya Türü", options: CAMPAIGN_TYPE_OPTIONS, onChange: (value) => selectedCampaignType.value = value as string },
                                { name: "isActive", type: "checkbox", label: "Aktif", options: [{ label: "Kampanyayı yayınla", value: true }] },
                            ]
                        },
                        {
                            label: "Tarih Aralığı",
                            layout: "row",
                            fields: [
                                { name: "startsAt", type: "datetime-local", label: "Başlangıç Tarihi" },
                                { name: "endsAt", type: "datetime-local", label: "Bitiş Tarihi" },
                            ]
                        },
                        ...getCampaignTypeSpecificFormGroups(selectedCampaignType.value),
                        {
                            label: "Kullanım Limitleri",
                            layout: "row",
                            fields: [
                                { name: "usageLimit", type: "number", label: "Toplam Kullanım Limiti" },
                                { name: "perUserLimit", type: "number", label: "Kullanıcı Başı Limit" },
                            ]
                        },
                        {
                            label: "İçerik",
                            fields: [
                                { name: "description", type: "textarea", label: "Açıklama" },
                                { name: "image", type: "file", label: "Görsel", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 1, maxSize: 1 }] },
                            ]
                        },
                        {
                            label: "Ürünler",
                            fields: [
                                { name: "products", type: "select", label: "Kampanya Ürünleri", options: productOptions, multiple: true },
                            ]
                        }
                    ]}
                    onSubmit={handleCreateCampaign}
                    status={formStatus}
                    submitLabel="Oluştur"
                />
            </Modal>
        </Activity>
    )
}