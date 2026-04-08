"use client"

import { Table } from "@/components/Table"
import Loader from "@/components/ui/Loader"
import StatusMessage from "@/components/ui/StatusMessage"
import { CategoryAdminList } from "@/features/category/category.types"
import { api } from "@/lib/eden"
import { Signal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"

type AdminCategoriesListProps = {
    categoryToUpdate: Signal<CategoryAdminList | null>
    categoryToDelete: Signal<string | null>
}

export default function AdminCategoriesList({ categoryToUpdate, categoryToDelete }: AdminCategoriesListProps) {
    const { data: categories, isLoading, error } = useQuery({
        queryKey: ["admin-categories"],
        queryFn: async () => {
            const { data, error } = await api.admin.categories.get()
            if (error) throw new Error((error as any).value)
            return data.data
        }
    })

    if (isLoading) return <Loader type="progress-bar" />

    if (!isLoading && error) return <StatusMessage color="danger">{error.message}</StatusMessage>

    if (!categories?.length) return <StatusMessage color="info">Henüz hiç kategori oluşturulmadı</StatusMessage>

    return (
        <Table
            data={categories}
            columns={[
                { header: "Ad", key: "name", type: "text" },
                { header: "URL (Slug)", key: "slug", type: "text" },
                { header: "Sıra", key: "sortOrder", type: "text" },
                { header: "Alt Kategoriler", render: (row) => <span>{row.subcategories.map(s => s.name).join(", ")}</span> },
                { header: "Ürün Sayısı", render: (row) => <span>{row._count.products}</span> },
                {
                    header: "Action",
                    columns: [
                        { type: "action:update", onAction: (row) => categoryToUpdate.value = row },
                        { type: "action:delete", onAction: (row) => categoryToDelete.value = row.id }
                    ]
                }
            ]}
        />
    )
}