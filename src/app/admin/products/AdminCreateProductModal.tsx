"use client"

import { Form } from "@/components/Form/Form"
import Badge from "@/components/ui/Badge"
import Icon from "@/components/ui/Icon"
import Modal from "@/components/ui/Modal"
import { CategoryWithSubcategories } from "@/features/category/category.types"
import { CreateProductFormInput } from "@/features/product/product.schema"
import { api } from "@/lib/eden"
import { RequestResponse } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { Activity } from "react"

export default function AdminCreateProductModal({ isCreateModalOpen, categoriesWithSubcategories }: { isCreateModalOpen: Signal<boolean>, categoriesWithSubcategories: CategoryWithSubcategories[] }) {
    const formStatus = useSignal<RequestResponse | null>(null)

    const handleCreateProduct = async (formValues: CreateProductFormInput) => {
        const { error } = await api.admin.products.post(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-products"] })
        batch(() => {
            formStatus.value = null
            isCreateModalOpen.value = false
        })
    }

    return (
        <Activity mode={isCreateModalOpen.value ? "visible" : "hidden"}>
            <Modal className="container-xl" onClose={() => isCreateModalOpen.value = false}>
                <div className="modal-header">
                    <Badge color="primary" size="md">
                        <Icon name="plus" size="lg" />
                    </Badge>
                    <h5>Ürün Oluştur</h5>
                </div>
                <Form
                    groups={[
                        {
                            layout: "row",
                            fields: [
                                { name: "title", type: "text", label: "Başlık" },
                                { name: "slug", type: "text", label: "URL (Slug)" },
                            ]
                        },
                        {
                            layout: "row",
                            fields: [
                                {
                                    name: "categoryId",
                                    type: "select",
                                    label: "Kategori",
                                    options: categoriesWithSubcategories.map(o => ({ label: o.name, value: o.id })),
                                    resetOnChange: ["subcategoryId"]
                                },
                                {
                                    name: "subcategoryId",
                                    type: "select",
                                    label: "Alt Kategori",
                                    optionsMap: Object.fromEntries(
                                        categoriesWithSubcategories.map(o => [
                                            o.id,
                                            o.subcategories.map(s => ({ label: s.name, value: s.id }))
                                        ])
                                    ),
                                    dependsOn: "categoryId"
                                },
                            ]
                        },
                        {
                            layout: "row",
                            fields: [
                                { name: "price", type: "number", label: "Fiyat" },
                                { name: "comparePrice", type: "number", label: "İndirim Öncesi Fiyat" },
                                { name: "stock", type: "number", label: "Stok" },
                                { name: "excerpt", type: "textarea", label: "Kısa Açıklama" },
                            ]
                        },
                        {
                            fields: [
                                { name: "description", type: "editor", label: "Açıklama" },
                                { name: "images", type: "file", label: "Ürün Görselleri", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 4, maxSize: 0.5 }] },
                            ]
                        },
                        {
                            layout: "row",
                            fields: [
                                { name: "metaTitle", type: "text", label: "Meta Başlık" },
                                { name: "metaDescription", type: "textarea", label: "Meta Açıklama" },
                            ]
                        },
                        {
                            fields: [
                                { name: "isActive", type: "checkbox", label: "Aktif", options: [{ label: "Ürünü yayınla", value: true }] },
                            ]
                        }
                    ]}
                    onSubmit={handleCreateProduct}
                    status={formStatus}
                    submitLabel="Oluştur"
                />
            </Modal>
        </Activity>
    )
}