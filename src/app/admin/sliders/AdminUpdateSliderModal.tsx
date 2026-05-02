"use client"

import { Form } from "@/components/Form/Form"
import { Badge } from "@/components/ui/Badge"
import { Icon } from "@/components/ui/Icon"
import { Modal } from "@/components/ui/Modal"
import { UpdateSliderFormInput } from "@/features/slider/slider.schema"
import { SliderAdminList } from "@/features/slider/slider.types"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"

export default function AdminUpdateSliderModal({ sliderToUpdate }: { sliderToUpdate: Signal<SliderAdminList | null> }) {
    const formStatus = useSignal<FormStatus>(null)

    const handleUpdateSlider = async (formValues: UpdateSliderFormInput) => {
        if (!sliderToUpdate.value) return

        const { error } = await api.admin.sliders({ id: sliderToUpdate.value.id }).put(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-sliders"] })
        batch(() => {
            formStatus.value = null
            sliderToUpdate.value = null
        })
    }

    if (!sliderToUpdate.value) return null

    return (
        <Modal className="container-sm" onClose={() => batch(() => { formStatus.value = null; sliderToUpdate.value = null })}>
            <div className="modal-header">
                <Badge color="primary" size="md">
                    <Icon name="pen-line" size="lg" />
                </Badge>
                <h5>Slider Güncelle</h5>
            </div>
            <Form
                groups={[
                    {
                        fields: [
                            { name: "image", type: "file", label: "Görsel", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 1, maxSize: 2 }], defaultValue: sliderToUpdate.value.image },
                            { name: "mobileImage", type: "file", label: "Mobil Görsel", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 1, maxSize: 2 }], defaultValue: sliderToUpdate.value.mobileImage },
                            { name: "imageAlt", type: "text", label: "Görsel Açıklaması (Alt)", defaultValue: sliderToUpdate.value.imageAlt },
                            { name: "href", type: "text", label: "Bağlantı URL'i", defaultValue: sliderToUpdate.value.href },
                            { name: "sortOrder", type: "number", label: "Sıra", defaultValue: String(sliderToUpdate.value.sortOrder) },
                            { name: "isActive", type: "checkbox", label: "Aktif", options: [{ label: "Slider'ı yayınla", value: true }], defaultValue: sliderToUpdate.value.isActive },
                        ]
                    }
                ]}
                onSubmit={handleUpdateSlider}
                status={formStatus}
                submitLabel="Güncelle"
            />
        </Modal>
    )
}