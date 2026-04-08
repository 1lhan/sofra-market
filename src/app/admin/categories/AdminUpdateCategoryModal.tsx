"use client"

import { Form } from "@/components/Form/Form"
import Badge from "@/components/ui/Badge"
import Icon from "@/components/ui/Icon"
import Modal from "@/components/ui/Modal"
import { UpdateCategoryFormInput } from "@/features/category/category.schema"
import { CategoryAdminList } from "@/features/category/category.types"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"

export default function AdminUpdateCategoryModal({ categoryToUpdate }: { categoryToUpdate: Signal<CategoryAdminList | null> }) {
    const formStatus = useSignal<FormStatus>(null)

    const handleUpdateCategory = async (formValues: UpdateCategoryFormInput) => {
        if (!categoryToUpdate.value) return

        const { error } = await api.admin.categories({ id: categoryToUpdate.value.id }).put(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-categories"] })
        batch(() => {
            formStatus.value = null
            categoryToUpdate.value = null
        })
    }

    if (!categoryToUpdate.value) return null

    return (
        <Modal className="container-sm" onClose={() => batch(() => { formStatus.value = null; categoryToUpdate.value = null })}>
            <div className="modal-header">
                <Badge color="primary" size="md">
                    <Icon name="pen" size="lg" />
                </Badge>
                <h5>Kategori Güncelle</h5>
            </div>
            <Form
                groups={[
                    {
                        fields: [
                            { name: "name", type: "text", label: "Ad", defaultValue: categoryToUpdate.value.name },
                            { name: "slug", type: "text", label: "URL (Slug)", defaultValue: categoryToUpdate.value.slug },
                            { name: "sortOrder", type: "number", label: "Sıra", defaultValue: String(categoryToUpdate.value.sortOrder) }
                        ]
                    }
                ]}
                onSubmit={handleUpdateCategory}
                status={formStatus}
                submitLabel="Güncelle"
            />
        </Modal>
    )
}