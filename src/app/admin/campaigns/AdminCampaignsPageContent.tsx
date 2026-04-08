"use client"

import { ConfirmModal } from "@/components/common/ConfirmModal"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { api } from "@/lib/eden"
import { SelectOption } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import AdminCampaignsList from "./AdminCampaignsList"
import AdminCreateCampaignModal from "./AdminCreateCampaignModal"
import AdminUpdateCampaignModal from "./AdminUpdateCampaignModal"

export default function AdminCampaignsPageContent({ productOptions }: { productOptions: SelectOption[] }) {
    const isCreateModalOpen = useSignal(false)
    const currentPage = useSignal(1)
    const campaignToUpdate = useSignal<string | null>(null)
    const campaignToDelete = useSignal<string | null>(null)

    const handleDeleteCampaign = async () => {
        if (!campaignToDelete.value) return

        const { error } = await api.admin.campaigns({ id: campaignToDelete.value }).delete()

        if (error) {
            window.alert(error.value.message)
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-campaigns"] })
        queryClient.removeQueries({ queryKey: ["admin-campaign-for-update", campaignToDelete.value] })
        campaignToDelete.value = null
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <Badge color="primary" size="lg">
                    <Icon name="layer-group" size="xl" />
                </Badge>
                <h4>Kampanyalar</h4>
                <Button color="primary" variant="filled" shape="default" onClick={() => isCreateModalOpen.value = true}>Kampanya Oluştur</Button>
            </div>

            <AdminCampaignsList
                currentPage={currentPage}
                campaignToUpdate={campaignToUpdate}
                campaignToDelete={campaignToDelete}
            />

            <AdminCreateCampaignModal isCreateModalOpen={isCreateModalOpen} productOptions={productOptions} />

            <AdminUpdateCampaignModal campaignToUpdate={campaignToUpdate} productOptions={productOptions} />

            <ConfirmModal
                isOpen={campaignToDelete}
                message="Bu kampanyayı silmek istediğinizden emin misiniz?"
                onConfirm={handleDeleteCampaign}
                onCancel={() => campaignToDelete.value = null}
            />
        </div>
    )
}