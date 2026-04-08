"use client"

import { Form } from "@/components/Form/Form"
import Badge from "@/components/ui/Badge"
import Icon from "@/components/ui/Icon"
import Modal from "@/components/ui/Modal"
import { CreateBlogFormInput } from "@/features/blog/blog.schema"
import { api } from "@/lib/eden"
import { RequestResponse, SelectOption } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { Activity } from "react"

export default function AdminCreateBlogModal({ isCreateModalOpen, productOptions }: { isCreateModalOpen: Signal<boolean>, productOptions: SelectOption[] }) {
    const formStatus = useSignal<RequestResponse | null>(null)

    const handleCreateBlog = async (formValues: CreateBlogFormInput) => {
        const { error } = await api.admin.blogs.post(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-blogs"] })
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
                    <h5>Blog Oluştur</h5>
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
                            fields: [
                                { name: "excerpt", type: "textarea", label: "Kısa Açıklama" },
                                { name: "content", type: "editor", label: "İçerik" },
                                { name: "image", type: "file", label: "Kapak Görseli", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 1, maxSize: 0.5 }] },
                                { name: "products", type: "select", label: "İlgili Ürünler", options: productOptions, multiple: true },
                            ]
                        },
                        {
                            layout: "row",
                            fields: [
                                { name: "metaTitle", type: "text", label: "Meta Başlık" },
                                { name: "metaDescription", type: "textarea", label: "Meta Açıklama" },
                            ]
                        },
                    ]}
                    onSubmit={handleCreateBlog}
                    status={formStatus}
                    submitLabel="Oluştur"
                />
            </Modal>
        </Activity>
    )
}