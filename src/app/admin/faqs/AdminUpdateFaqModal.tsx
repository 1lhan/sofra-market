"use client"

import { Form } from "@/components/Form/Form"
import { Badge } from "@/components/ui/Badge"
import { Icon } from "@/components/ui/Icon"
import { Modal } from "@/components/ui/Modal"
import { UpdateFaqFormInput } from "@/features/faq/faq.schema"
import { FaqAdminList } from "@/features/faq/faq.types"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"

export default function AdminUpdateFaqModal({ faqToUpdate }: { faqToUpdate: Signal<FaqAdminList | null> }) {
    const formStatus = useSignal<FormStatus>(null)

    const handleUpdateFaq = async (formValues: UpdateFaqFormInput) => {
        if (!faqToUpdate.value) return

        const { error } = await api.admin.faqs({ id: faqToUpdate.value.id }).put(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-faqs"] })
        batch(() => {
            formStatus.value = null
            faqToUpdate.value = null
        })
    }

    if (!faqToUpdate.value) return null

    return (
        <Modal className="container-lg" onClose={() => batch(() => { formStatus.value = null; faqToUpdate.value = null })}>
            <div className="modal-header">
                <Badge color="primary" size="md">
                    <Icon name="pen-line" size="lg" />
                </Badge>
                <h5>S.S.S Güncelle</h5>
            </div>
            <Form
                groups={[
                    {
                        fields: [
                            { name: "question", type: "textarea", label: "Soru", defaultValue: faqToUpdate.value.question },
                            { name: "answer", type: "editor", label: "Cevap", defaultValue: faqToUpdate.value.answer },
                            { name: "sortOrder", type: "number", label: "Sıra", defaultValue: String(faqToUpdate.value.sortOrder) }
                        ]
                    }
                ]}
                onSubmit={handleUpdateFaq}
                status={formStatus}
                submitLabel="Güncelle"
            />
        </Modal>
    )
}