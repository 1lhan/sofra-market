"use client"

import { Form } from "@/components/Form/Form"
import { Alert } from "@/components/ui/Alert"
import { Badge } from "@/components/ui/Badge"
import { Icon } from "@/components/ui/Icon"
import { Loader } from "@/components/ui/Loader"
import { Modal } from "@/components/ui/Modal"
import { CAMPAIGN_TYPE_OPTIONS, getCampaignTypeSpecificFormGroups } from "@/features/campaign/campaign.helpers"
import { UpdateCampaignFormInput } from "@/features/campaign/campaign.schema"
import { formatDateTimeLocal } from "@/lib/date"
import { api } from "@/lib/eden"
import { FormStatus, SelectOption } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"

export default function AdminUpdateCampaignModal({ campaignToUpdate, productOptions }: { campaignToUpdate: Signal<string | null>, productOptions: SelectOption[] }) {
    const formStatus = useSignal<FormStatus>(null)
    const selectedCampaignType = useSignal<string | null>(null)

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-campaign-for-update", campaignToUpdate.value],
        queryFn: async () => {
            const { data, error } = await api.admin.campaigns({ id: campaignToUpdate.value! }).edit.get()

            if (error) throw new Error((error as any).value)

            selectedCampaignType.value = data.data?.type ?? null
            return data.data
        },
        enabled: !!campaignToUpdate.value
    })

    const handleUpdateCampaign = async (formValues: UpdateCampaignFormInput) => {
        if (!campaignToUpdate.value) return

        const { error } = await api.admin.campaigns({ id: campaignToUpdate.value }).put(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-campaigns"] })
        queryClient.removeQueries({ queryKey: ["admin-campaign-for-update", campaignToUpdate.value] })
        batch(() => {
            formStatus.value = null
            campaignToUpdate.value = null
        })
    }

    if (!campaignToUpdate.value) return null

    return (
        <Modal className="container-lg" onClose={() => batch(() => { formStatus.value = null; campaignToUpdate.value = null })}>
            <div className="modal-header">
                <Badge color="primary" size="md">
                    <Icon name="pen-line" size="lg" />
                </Badge>
                <h5>Kampanya Güncelle</h5>
            </div>

            {isLoading && <Loader type="progress-bar" />}
            {error && <Alert color="danger">{error.message}</Alert>}

            {data && <Form
                groups={[
                    {
                        label: "Temel Bilgiler",
                        layout: "row",
                        fields: [
                            { name: "title", type: "text", label: "Başlık", defaultValue: data.title },
                            { name: "type", type: "select", label: "Kampanya Türü", options: CAMPAIGN_TYPE_OPTIONS, onChange: (value) => selectedCampaignType.value = value as string, defaultValue: data.type },
                            { name: "isActive", type: "checkbox", label: "Aktif", options: [{ label: "Kampanyayı yayınla", value: true }], defaultValue: data.isActive },
                        ]
                    },
                    {
                        label: "Tarih Aralığı",
                        layout: "row",
                        fields: [
                            { name: "startsAt", type: "datetime-local", label: "Başlangıç Tarihi", defaultValue: formatDateTimeLocal(data.startsAt) },
                            { name: "endsAt", type: "datetime-local", label: "Bitiş Tarihi", defaultValue: formatDateTimeLocal(data.endsAt) },
                        ]
                    },
                    ...getCampaignTypeSpecificFormGroups(selectedCampaignType.value, data, !!data?._count.orderDiscounts),
                    {
                        label: "Kullanım Limitleri",
                        layout: "row",
                        fields: [
                            { name: "usageLimit", type: "number", label: "Toplam Kullanım Limiti", defaultValue: String(data.usageLimit ?? "") },
                            { name: "perUserLimit", type: "number", label: "Kullanıcı Başı Limit", defaultValue: String(data.perUserLimit ?? ""), inputProps: { disabled: !!data?._count.orderDiscounts } },
                        ]
                    },
                    {
                        label: "İçerik",
                        fields: [
                            { name: "description", type: "textarea", label: "Açıklama", defaultValue: data.description },
                            { name: "image", type: "file", label: "Görsel", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 1, maxSize: 1 }], defaultValue: data.image },
                        ]
                    },
                    {
                        label: "Ürünler",
                        fields: [
                            { name: "products", type: "select", label: "Kampanya Ürünleri", options: productOptions, multiple: true, defaultValue: data.products.map(p => p.id) },
                        ]
                    }
                ]}
                onSubmit={handleUpdateCampaign}
                status={formStatus}
                submitLabel="Güncelle"
            />}
        </Modal>
    )
}