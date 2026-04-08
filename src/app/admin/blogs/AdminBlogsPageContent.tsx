"use client"

import { ConfirmModal } from "@/components/common/ConfirmModal"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { api } from "@/lib/eden"
import { SelectOption } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import AdminBlogsList from "./AdminBlogsList"
import AdminCreateBlogModal from "./AdminCreateBlogModal"
import AdminUpdateBlogModal from "./AdminUpdateBlogModal"

export default function AdminBlogsPageContent({ productOptions }: { productOptions: SelectOption[] }) {
    const isCreateModalOpen = useSignal(false)
    const currentPage = useSignal(1)
    const blogToUpdate = useSignal<string | null>(null)
    const blogToDelete = useSignal<string | null>(null)

    const handleDeleteBlog = async () => {
        if (!blogToDelete.value) return

        const { error } = await api.admin.blogs({ id: blogToDelete.value }).delete()

        if (error) {
            window.alert(error.value.message)
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-blogs"] })
        blogToDelete.value = null
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <Badge color="primary" size="lg">
                    <Icon name="layer-group" size="xl" />
                </Badge>
                <h4>Bloglar</h4>
                <Button color="primary" variant="filled" shape="default" onClick={() => isCreateModalOpen.value = true}>Blog Oluştur</Button>
            </div>

            <AdminBlogsList
                currentPage={currentPage}
                blogToUpdate={blogToUpdate}
                blogToDelete={blogToDelete}
            />

            <AdminCreateBlogModal isCreateModalOpen={isCreateModalOpen} productOptions={productOptions} />

            <AdminUpdateBlogModal blogToUpdate={blogToUpdate} productOptions={productOptions} />

            <ConfirmModal
                isOpen={blogToDelete}
                message="Bu blogu silmek istediğinizden emin misiniz?"
                onConfirm={handleDeleteBlog}
                onCancel={() => blogToDelete.value = null}
            />
        </div>
    )
}