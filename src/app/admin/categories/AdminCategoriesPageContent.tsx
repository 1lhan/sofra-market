"use client"

import { ConfirmModal } from "@/components/common/ConfirmModal"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { CategoryAdminList } from "@/features/category/category.types"
import { api } from "@/lib/eden"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import AdminCategoriesList from "./AdminCategoriesList"
import AdminCreateCategoryModal from "./AdminCreateCategoryModal"
import AdminUpdateCategoryModal from "./AdminUpdateCategoryModal"

export default function AdminCategoriesPageContent() {
    const isCreateModalOpen = useSignal(false)
    const categoryToUpdate = useSignal<CategoryAdminList | null>(null)
    const categoryToDelete = useSignal<string | null>(null)

    const handleDeleteCategory = async () => {
        if (!categoryToDelete.value) return

        const { error } = await api.admin.categories({ id: categoryToDelete.value }).delete()

        if (error) {
            window.alert(error.value.message)
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-categories"] })
        categoryToDelete.value = null
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <Badge color="primary" size="lg">
                    <Icon name="layer-group" size="xl" />
                </Badge>
                <h4>Kategoriler</h4>
                <Button color="primary" variant="filled" shape="default" onClick={() => isCreateModalOpen.value = true}>Kategori Oluştur</Button>
            </div>

            <AdminCategoriesList categoryToUpdate={categoryToUpdate} categoryToDelete={categoryToDelete} />

            <AdminCreateCategoryModal isCreateModalOpen={isCreateModalOpen} />

            <AdminUpdateCategoryModal categoryToUpdate={categoryToUpdate} />

            <ConfirmModal
                isOpen={categoryToDelete}
                message="Kategoriyi silmek istediğinizden emin misiniz?"
                onConfirm={handleDeleteCategory}
                onCancel={() => categoryToDelete.value = null}
            />
        </div>
    )
}