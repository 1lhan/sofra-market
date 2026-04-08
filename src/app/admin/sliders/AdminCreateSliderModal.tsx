"use client"

import { Form } from "@/components/Form/Form"
import Badge from "@/components/ui/Badge"
import Icon from "@/components/ui/Icon"
import Modal from "@/components/ui/Modal"
import { CreateSliderFormInput } from "@/features/slider/slider.schema"
import { api } from "@/lib/eden"
import { RequestResponse } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { Activity } from "react"

export default function AdminCreateSliderModal({ isCreateModalOpen }: { isCreateModalOpen: Signal<boolean> }) {
    const formStatus = useSignal<RequestResponse | null>(null)

    const handleCreateSlider = async (formValues: CreateSliderFormInput) => {
        const { error } = await api.admin.sliders.post(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-sliders"] })
        batch(() => {
            formStatus.value = null
            isCreateModalOpen.value = false
        })
    }

    return (
        <Activity mode={isCreateModalOpen.value ? "visible" : "hidden"}>
            <Modal className="container-sm" onClose={() => isCreateModalOpen.value = false}>
                <div className="modal-header">
                    <Badge color="primary" size="md">
                        <Icon name="plus" size="lg" />
                    </Badge>
                    <h5>Slider Oluştur</h5>
                </div>
                <Form
                    groups={[
                        {
                            fields: [
                                { name: "image", type: "file", label: "Görsel", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 1, maxSize: 2 }] },
                                { name: "mobileImage", type: "file", label: "Mobil Görsel", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 1, maxSize: 2 }] },
                                { name: "imageAlt", type: "text", label: "Görsel Açıklaması (Alt)" },
                                { name: "href", type: "text", label: "Bağlantı URL'i" },
                                { name: "sortOrder", type: "number", label: "Sıra" },
                                { name: "isActive", type: "checkbox", label: "Aktif", options: [{ label: "Slider'ı yayınla", value: true }] },
                            ]
                        }
                    ]}
                    onSubmit={handleCreateSlider}
                    status={formStatus}
                    submitLabel="Oluştur"
                />
            </Modal>
        </Activity>
    )
}