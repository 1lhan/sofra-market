"use client"

import { Form } from "@/components/Form/Form"
import { Badge } from "@/components/ui/Badge"
import { Icon } from "@/components/ui/Icon"
import { Modal } from "@/components/ui/Modal"
import { CreateSubcategoryFormInput } from "@/features/subcategory/subcategory.schema"
import { api } from "@/lib/eden"
import { RequestResponse, SelectOption } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { Activity } from "react"

export default function AdminCreateSubcategoryModal({ isCreateModalOpen, categoryOptions }: { isCreateModalOpen: Signal<boolean>, categoryOptions: SelectOption[] }) {
    const formStatus = useSignal<RequestResponse | null>(null)

    const handleCreateSubcategory = async (formValues: CreateSubcategoryFormInput) => {
        const { error } = await api.admin.subcategories.post(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-subcategories"] })
        batch(() => {
            formStatus.value = null
            isCreateModalOpen.value = false
        })
    }

    return (
        <Activity mode={isCreateModalOpen.value ? "visible" : "hidden"}>
            <Modal className="container-sm" onClose={() => isCreateModalOpen.value = false}>
                <div className="modal-header">
                    <Badge color="primary" size="md">
                        <Icon name="plus" size="lg" />
                    </Badge>
                    <h5>Alt Kategori Oluştur</h5>
                </div>
                <Form
                    groups={[
                        {
                            fields: [
                                { name: "name", type: "text", label: "Ad" },
                                { name: "slug", type: "text", label: "URL (Slug)" },
                                { name: "sortOrder", type: "number", label: "Sıra" },
                                { name: "categoryId", type: "select", label: "Kategori", options: categoryOptions }
                            ]
                        }
                    ]}
                    onSubmit={handleCreateSubcategory}
                    status={formStatus}
                    submitLabel="Oluştur"
                />
            </Modal>
        </Activity>
    )
}