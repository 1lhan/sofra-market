"use client"

import { Form } from "@/components/Form/Form"
import Badge from "@/components/ui/Badge"
import Icon from "@/components/ui/Icon"
import Modal from "@/components/ui/Modal"
import { CreateFaqFormInput } from "@/features/faq/faq.schema"
import { api } from "@/lib/eden"
import { RequestResponse } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { Activity } from "react"

export default function AdminCreateFaqModal({ isCreateModalOpen }: { isCreateModalOpen: Signal<boolean> }) {
    const formStatus = useSignal<RequestResponse | null>(null)

    const handleCreateFaq = async (formValues: CreateFaqFormInput) => {
        const { error } = await api.admin.faqs.post(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-faqs"] })
        batch(() => {
            formStatus.value = null
            isCreateModalOpen.value = false
        })
    }

    return (
        <Activity mode={isCreateModalOpen.value ? "visible" : "hidden"}>
            <Modal className="container-lg" onClose={() => isCreateModalOpen.value = false}>
                <div className="modal-header">
                    <Badge color="primary" size="md">
                        <Icon name="plus" size="lg" />
                    </Badge>
                    <h5>S.S.S Oluştur</h5>
                </div>
                <Form
                    groups={[
                        {
                            fields: [
                                { name: "question", type: "textarea", label: "Soru" },
                                { name: "answer", type: "editor", label: "Cevap" },
                                { name: "sortOrder", type: "number", label: "Sıra" }
                            ]
                        }
                    ]}
                    onSubmit={handleCreateFaq}
                    status={formStatus}
                    submitLabel="Oluştur"
                />
            </Modal>
        </Activity>
    )
}