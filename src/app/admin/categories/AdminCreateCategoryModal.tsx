"use client"

import { Form } from "@/components/Form/Form"
import Badge from "@/components/ui/Badge"
import Icon from "@/components/ui/Icon"
import Modal from "@/components/ui/Modal"
import { CreateCategoryFormInput } from "@/features/category/category.schema"
import { api } from "@/lib/eden"
import { RequestResponse } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { Activity } from "react"

export default function AdminCreateCategoryModal({ isCreateModalOpen }: { isCreateModalOpen: Signal<boolean> }) {
    const formStatus = useSignal<RequestResponse | null>(null)

    const handleCreateCategory = async (formValues: CreateCategoryFormInput) => {
        const { error } = await api.admin.categories.post(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-categories"] })
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
                    <h5>Kategori Oluştur</h5>
                </div>
                <Form
                    groups={[
                        {
                            fields: [
                                { name: "name", type: "text", label: "Ad" },
                                { name: "slug", type: "text", label: "URL (Slug)" },
                                { name: "sortOrder", type: "number", label: "Sıra" }
                            ]
                        }
                    ]}
                    onSubmit={handleCreateCategory}
                    status={formStatus}
                    submitLabel="Oluştur"
                />
            </Modal>
        </Activity>
    )
}