"use client"

import { ConfirmModal } from "@/components/common/ConfirmModal"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { SubcategoryAdminList } from "@/features/subcategory/subcategory.types"
import { api } from "@/lib/eden"
import { SelectOption } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import AdminCreateSubcategoryModal from "./AdminCreateSubcategoryModal"
import AdminSubcategoriesList from "./AdminSubcategoriesList"
import AdminUpdateSubcategoryModal from "./AdminUpdateSubcategoryModal"

export default function AdminSubcategoriesPageContent({ categoryOptions }: { categoryOptions: SelectOption[] }) {
    const isCreateModalOpen = useSignal(false)
    const subcategoryToUpdate = useSignal<SubcategoryAdminList | null>(null)
    const subcategoryToDelete = useSignal<string | null>(null)

    const handleDeleteSubcategory = async () => {
        if (!subcategoryToDelete.value) return

        const { error } = await api.admin.subcategories({ id: subcategoryToDelete.value }).delete()

        if (error) {
            window.alert(error.value.message)
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-subcategories"] })
        subcategoryToDelete.value = null
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <Badge color="primary" size="lg">
                    <Icon name="layer-group" size="xl" />
                </Badge>
                <h4>Alt Kategoriler</h4>
                <Button color="primary" variant="filled" shape="rectangle" onClick={() => isCreateModalOpen.value = true}>Alt Kategori Oluştur</Button>
            </div>

            <AdminSubcategoriesList subcategoryToUpdate={subcategoryToUpdate} subcategoryToDelete={subcategoryToDelete} />

            <AdminCreateSubcategoryModal isCreateModalOpen={isCreateModalOpen} categoryOptions={categoryOptions} />

            <AdminUpdateSubcategoryModal subcategoryToUpdate={subcategoryToUpdate} categoryOptions={categoryOptions} />

            <ConfirmModal
                isOpen={subcategoryToDelete}
                message="Alt kategoriyi silmek istediğinizden emin misiniz?"
                onConfirm={handleDeleteSubcategory}
                onCancel={() => subcategoryToDelete.value = null}
            />
        </div>
    )
}