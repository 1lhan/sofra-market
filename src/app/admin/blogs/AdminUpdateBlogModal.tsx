"use client"

import { Form } from "@/components/Form/Form"
import Badge from "@/components/ui/Badge"
import Icon from "@/components/ui/Icon"
import Loader from "@/components/ui/Loader"
import Modal from "@/components/ui/Modal"
import StatusMessage from "@/components/ui/StatusMessage"
import { UpdateBlogFormInput } from "@/features/blog/blog.schema"
import { api } from "@/lib/eden"
import { FormStatus, SelectOption } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"

export default function AdminUpdateBlogModal({ blogToUpdate, productOptions }: { blogToUpdate: Signal<string | null>, productOptions: SelectOption[] }) {
    const formStatus = useSignal<FormStatus>(null)

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-blog-for-update", blogToUpdate.value],
        queryFn: async () => {
            const { data, error } = await api.admin.blogs({ id: blogToUpdate.value! }).edit.get()
            if (error) throw new Error((error as any).value)
            return data.data
        },
        enabled: !!blogToUpdate.value
    })

    const handleUpdateBlog = async (formValues: UpdateBlogFormInput) => {
        if (!blogToUpdate.value) return

        const { error } = await api.admin.blogs({ id: blogToUpdate.value }).put(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-blogs"] })
        queryClient.removeQueries({ queryKey: ["admin-blog-for-update", blogToUpdate.value] })
        batch(() => {
            formStatus.value = null
            blogToUpdate.value = null
        })
    }

    if (!blogToUpdate.value) return null

    return (
        <Modal className="container-lg" onClose={() => batch(() => { formStatus.value = null; blogToUpdate.value = null })}>
            <div className="modal-header">
                <Badge color="primary" size="md">
                    <Icon name="pen" size="lg" />
                </Badge>
                <h5>Blog Güncelle</h5>
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
                        fields: [
                            { name: "excerpt", type: "textarea", label: "Kısa Açıklama", defaultValue: data.excerpt },
                            { name: "content", type: "editor", label: "İçerik", defaultValue: data.content },
                            { name: "image", type: "file", label: "Kapak Görseli", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 1, maxSize: 0.5 }], defaultValue: data.image },
                            { name: "products", type: "select", label: "İlgili Ürünler", options: productOptions, multiple: true, defaultValue: data.products.map(p => p.id) },
                        ]
                    },
                    {
                        layout: "row",
                        fields: [
                            { name: "metaTitle", type: "text", label: "Meta Başlık", defaultValue: data.metaTitle },
                            { name: "metaDescription", type: "textarea", label: "Meta Açıklama", defaultValue: data.metaDescription },
                        ]
                    },
                ]}
                onSubmit={handleUpdateBlog}
                status={formStatus}
                submitLabel="Güncelle"
            />}
        </Modal>
    )
}