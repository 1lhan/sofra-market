"use client"

import { ConfirmModal } from "@/components/common/ConfirmModal"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { CategoryWithSubcategories } from "@/features/category/category.types"
import { api } from "@/lib/eden"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import AdminCreateProductModal from "./AdminCreateProductModal"
import AdminProductsList from "./AdminProductsList"
import AdminUpdateProductModal from "./AdminUpdateProductModal"

export default function AdminProductsPageContent({ categoriesWithSubcategories }: { categoriesWithSubcategories: CategoryWithSubcategories[] }) {
    const isCreateModalOpen = useSignal(false)
    const currentPage = useSignal(1)
    const productToUpdate = useSignal<string | null>(null)
    const productToDelete = useSignal<string | null>(null)

    const handleDeleteProduct = async () => {
        if (!productToDelete.value) return

        const { error } = await api.admin.products({ id: productToDelete.value }).delete()

        if (error) {
            window.alert(error.value.message)
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-products"] })
        queryClient.removeQueries({ queryKey: ["admin-product-for-update", productToDelete.value] })
        productToDelete.value = null
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <Badge color="primary" size="lg">
                    <Icon name="layer-group" size="xl" />
                </Badge>
                <h4>Ürünler</h4>
                <Button color="primary" variant="filled" shape="default" onClick={() => isCreateModalOpen.value = true}>Ürün Oluştur</Button>
            </div>

            <AdminProductsList
                currentPage={currentPage}
                productToUpdate={productToUpdate}
                productToDelete={productToDelete}
            />

            <AdminCreateProductModal isCreateModalOpen={isCreateModalOpen} categoriesWithSubcategories={categoriesWithSubcategories} />

            <AdminUpdateProductModal productToUpdate={productToUpdate} categoriesWithSubcategories={categoriesWithSubcategories} />

            <ConfirmModal
                isOpen={productToDelete}
                message="Ürünü silmek istediğinizden emin misiniz?"
                onConfirm={handleDeleteProduct}
                onCancel={() => productToDelete.value = null}
            />
        </div>
    )
}