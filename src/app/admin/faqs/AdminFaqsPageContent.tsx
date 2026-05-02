"use client"

import { ConfirmModal } from "@/components/common/ConfirmModal"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { FaqAdminList } from "@/features/faq/faq.types"
import { api } from "@/lib/eden"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import AdminCreateFaqModal from "./AdminCreateFaqModal"
import AdminFaqsList from "./AdminFaqsList"
import AdminUpdateFaqModal from "./AdminUpdateFaqModal"

export default function AdminFaqsPageContent() {
    const isCreateModalOpen = useSignal(false)
    const faqToUpdate = useSignal<FaqAdminList | null>(null)
    const faqToDelete = useSignal<string | null>(null)

    const handleDeleteFaq = async () => {
        if (!faqToDelete.value) return

        const { error } = await api.admin.faqs({ id: faqToDelete.value }).delete()

        if (error) {
            window.alert(error.value.message)
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-faqs"] })
        faqToDelete.value = null
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <Badge color="primary" size="lg">
                    <Icon name="layer-group" size="xl" />
                </Badge>
                <h4>Sıkça Sorulan Sorular</h4>
                <Button color="primary" variant="filled" shape="rectangle" onClick={() => isCreateModalOpen.value = true}>S.S.S Oluştur</Button>
            </div>

            <AdminFaqsList faqToUpdate={faqToUpdate} faqToDelete={faqToDelete} />

            <AdminCreateFaqModal isCreateModalOpen={isCreateModalOpen} />

            <AdminUpdateFaqModal faqToUpdate={faqToUpdate} />

            <ConfirmModal
                isOpen={faqToDelete}
                message="Bu sık sorulan soruyu silmek istediğinizden emin misiniz?"
                onConfirm={handleDeleteFaq}
                onCancel={() => faqToDelete.value = null}
            />
        </div>
    )
}