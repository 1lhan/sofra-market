"use client"

import { ConfirmModal } from "@/components/common/ConfirmModal"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { SliderAdminList } from "@/features/slider/slider.types"
import { api } from "@/lib/eden"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import AdminCreateSliderModal from "./AdminCreateSliderModal"
import AdminSlidersList from "./AdminSlidersList"
import AdminUpdateSliderModal from "./AdminUpdateSliderModal"

export default function AdminSlidersPageContent() {
    const isCreateModalOpen = useSignal(false)
    const sliderToUpdate = useSignal<SliderAdminList | null>(null)
    const sliderToDelete = useSignal<string | null>(null)

    const handleDeleteSlider = async () => {
        if (!sliderToDelete.value) return

        const { error } = await api.admin.sliders({ id: sliderToDelete.value }).delete()

        if (error) {
            window.alert(error.value.message)
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-sliders"] })
        sliderToDelete.value = null
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <Badge color="primary" size="lg">
                    <Icon name="layer-group" size="xl" />
                </Badge>
                <h4>Sliderlar</h4>
                <Button color="primary" variant="filled" shape="rectangle" onClick={() => isCreateModalOpen.value = true}>Slider Oluştur</Button>
            </div>

            <AdminSlidersList sliderToUpdate={sliderToUpdate} sliderToDelete={sliderToDelete} />

            <AdminCreateSliderModal isCreateModalOpen={isCreateModalOpen} />

            <AdminUpdateSliderModal sliderToUpdate={sliderToUpdate} />

            <ConfirmModal
                isOpen={sliderToDelete}
                message="Slideri silmek istediğinizden emin misiniz?"
                onConfirm={handleDeleteSlider}
                onCancel={() => sliderToDelete.value = null}
            />
        </div>
    )
}