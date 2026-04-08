"use client"

import { Form } from "@/components/Form/Form"
import Badge from "@/components/ui/Badge"
import Icon from "@/components/ui/Icon"
import Modal from "@/components/ui/Modal"
import { UpdateSubcategoryFormInput } from "@/features/subcategory/subcategory.schema"
import { SubcategoryAdminList } from "@/features/subcategory/subcategory.types"
import { api } from "@/lib/eden"
import { FormStatus, SelectOption } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"

export default function AdminUpdateSubcategoryModal({ subcategoryToUpdate, categoryOptions }: { subcategoryToUpdate: Signal<SubcategoryAdminList | null>, categoryOptions: SelectOption[] }) {
    const formStatus = useSignal<FormStatus>(null)

    const handleUpdateSubcategory = async (formValues: UpdateSubcategoryFormInput) => {
        if (!subcategoryToUpdate.value) return

        const { error } = await api.admin.subcategories({ id: subcategoryToUpdate.value.id }).put(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-subcategories"] })
        batch(() => {
            formStatus.value = null
            subcategoryToUpdate.value = null
        })
    }

    if (!subcategoryToUpdate.value) return null

    return (
        <Modal className="container-sm" onClose={() => batch(() => { formStatus.value = null; subcategoryToUpdate.value = null })}>
            <div className="modal-header">
                <Badge color="primary" size="md">
                    <Icon name="pen" size="lg" />
                </Badge>
                <h5>Alt Kategori Güncelle</h5>
            </div>
            <Form
                groups={[
                    {
                        fields: [
                            { name: "name", type: "text", label: "Ad", defaultValue: subcategoryToUpdate.value.name },
                            { name: "slug", type: "text", label: "URL (Slug)", defaultValue: subcategoryToUpdate.value.slug },
                            { name: "sortOrder", type: "number", label: "Sıra", defaultValue: String(subcategoryToUpdate.value.sortOrder) },
                            { name: "categoryId", type: "select", label: "Kategori", options: categoryOptions, defaultValue: subcategoryToUpdate.value.category.id }
                        ]
                    }
                ]}
                onSubmit={handleUpdateSubcategory}
                status={formStatus}
                submitLabel="Güncelle"
            />
        </Modal>
    )
}