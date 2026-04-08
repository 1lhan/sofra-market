"use client"

import { Form } from "@/components/Form/Form"
import Badge from "@/components/ui/Badge"
import Icon from "@/components/ui/Icon"
import Loader from "@/components/ui/Loader"
import Modal from "@/components/ui/Modal"
import StatusMessage from "@/components/ui/StatusMessage"
import { CategoryWithSubcategories } from "@/features/category/category.types"
import { UpdateProductFormInput } from "@/features/product/product.schema"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"

export default function AdminUpdateProductModal({ productToUpdate, categoriesWithSubcategories }: { productToUpdate: Signal<string | null>, categoriesWithSubcategories: CategoryWithSubcategories[] }) {
    const formStatus = useSignal<FormStatus>(null)

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-product-for-update", productToUpdate.value],
        queryFn: async () => {
            const { data, error } = await api.admin.products({ id: productToUpdate.value! }).edit.get()
            if (error) throw new Error((error as any).value)
            return data.data
        },
        enabled: !!productToUpdate.value
    })

    const handleUpdateProduct = async (formValues: UpdateProductFormInput) => {
        if (!productToUpdate.value) return

        const { error } = await api.admin.products({ id: productToUpdate.value }).put(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-products"] })
        queryClient.removeQueries({ queryKey: ["admin-product-for-update", productToUpdate.value] })
        batch(() => {
            formStatus.value = null
            productToUpdate.value = null
        })
    }

    if (!productToUpdate.value) return null

    return (
        <Modal className="container-xl" onClose={() => batch(() => { formStatus.value = null; productToUpdate.value = null })}>
            <div className="modal-header">
                <Badge color="primary" size="md">
                    <Icon name="pen" size="lg" />
                </Badge>
                <h5>Ürün Güncelle</h5>
            </div>

            {isLoading && <Loader type="progress-bar" />}
            {error && <StatusMessage color="danger">{error.message}</StatusMessage>}

            {data && <Form
                groups={[
                    {
                        layout: "row",
                        fields: [
                            { name: "title", type: "text", label: "Başlık", defaultValue: data.title },
                            { name: "slug", type: "text", label: "URL (Slug)", defaultValue: data.slug },
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
                                resetOnChange: ["subcategoryId"],
                                defaultValue: data.categoryId
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
                                dependsOn: "categoryId",
                                defaultValue: data.subcategoryId
                            },
                        ]
                    },
                    {
                        layout: "row",
                        fields: [
                            { name: "price", type: "number", label: "Fiyat", defaultValue: String(data.price) },
                            { name: "comparePrice", type: "number", label: "İndirim Öncesi Fiyat", defaultValue: String(data.comparePrice ?? "") },
                            { name: "stock", type: "number", label: "Stok", defaultValue: String(data.stock) },
                            { name: "excerpt", type: "textarea", label: "Kısa Açıklama", defaultValue: data.excerpt },
                        ]
                    },
                    {
                        fields: [
                            { name: "description", type: "editor", label: "Açıklama", defaultValue: data.description },
                            { name: "images", type: "file", label: "Ürün Görselleri", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 4, maxSize: 0.5 }], defaultValue: data.images },
                        ]
                    },
                    {
                        layout: "row",
                        fields: [
                            { name: "metaTitle", type: "text", label: "Meta Başlık", defaultValue: data.metaTitle },
                            { name: "metaDescription", type: "textarea", label: "Meta Açıklama", defaultValue: data.metaDescription },
                        ]
                    },
                    {
                        fields: [
                            { name: "isActive", type: "checkbox", label: "Aktif", options: [{ label: "Ürünü yayınla", value: true }], defaultValue: data.isActive },
                        ]
                    }
                ]}
                onSubmit={handleUpdateProduct}
                status={formStatus}
                submitLabel="Güncelle"
            />}
        </Modal>
    )
}