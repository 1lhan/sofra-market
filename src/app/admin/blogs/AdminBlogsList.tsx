"use client"

import Pagination from "@/components/Pagination"
import { Table } from "@/components/Table"
import { Alert } from "@/components/ui/Alert"
import { Loader } from "@/components/ui/Loader"
import { api } from "@/lib/eden"
import { Signal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"

type AdminBlogsListProps = {
    blogToUpdate: Signal<string | null>
    blogToDelete: Signal<string | null>
    currentPage: Signal<number>
}

export default function AdminBlogsList({ blogToUpdate, blogToDelete, currentPage }: AdminBlogsListProps) {
    const { data: blogs, isFetching, isLoading, error } = useQuery({
        queryKey: ["admin-blogs", currentPage.value],
        queryFn: async () => {
            const { data, error } = await api.admin.blogs.get({ query: { page: currentPage.value } })
            if (error) throw new Error((error as any).value.message)
            return data.data
        },
        placeholderData: (previousData) => previousData
    })

    if (isLoading) return <Loader type="progress-bar" />

    if (!isLoading && error) return <Alert color="danger">{error.message}</Alert>

    if (!blogs?.data.length) return <Alert color="info">Henüz hiç blog oluşturulmadı</Alert>

    return (
        <>
            <Table
                data={blogs.data}
                columns={[
                    { header: "Görsel", render: (row) => row.image && <Image src={row.image} width={57} height={48} alt={row.title} /> },
                    { header: "Başlık", key: "title", type: "text" },
                    { header: "URL (Slug)", key: "slug", type: "text" },
                    { header: "Kısa Açıklama", key: "excerpt", type: "text" },
                    {
                        header: "Action",
                        columns: [
                            { type: "action:update", onAction: (row) => blogToUpdate.value = row.id },
                            { type: "action:delete", onAction: (row) => blogToDelete.value = row.id }
                        ]
                    }
                ]}
            />
            <Pagination
                currentPage={currentPage.value}
                totalCount={blogs.total}
                isFetching={isFetching}
                onPageChange={(page) => currentPage.value = page}
            />
        </>
    )
}