"use client"

import { Table } from "@/components/Table"
import Loader from "@/components/ui/Loader"
import StatusMessage from "@/components/ui/StatusMessage"
import { SubcategoryAdminList } from "@/features/subcategory/subcategory.types"
import { api } from "@/lib/eden"
import { Signal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"

type AdminSubcategoriesListProps = {
    subcategoryToUpdate: Signal<SubcategoryAdminList | null>
    subcategoryToDelete: Signal<string | null>
}

export default function AdminSubcategoriesList({ subcategoryToUpdate, subcategoryToDelete }: AdminSubcategoriesListProps) {
    const { data: subcategories, isLoading, error } = useQuery({
        queryKey: ["admin-subcategories"],
        queryFn: async () => {
            const { data, error } = await api.admin.subcategories.get()
            if (error) throw new Error((error as any).value.message)
            return data.data
        },
        placeholderData: (previousData) => previousData
    })

    if (isLoading) return <Loader type="progress-bar" />

    if (!isLoading && error) return <StatusMessage color="danger">{error.message}</StatusMessage>

    if (!subcategories?.length) return <StatusMessage color="info">Henüz hiç alt kategori oluşturulmadı</StatusMessage>

    return (
        <Table
            data={subcategories}
            columns={[
                { header: "Ad", key: "name", type: "text" },
                { header: "URL (Slug)", key: "slug", type: "text" },
                { header: "Sıra", key: "sortOrder", type: "text" },
                { header: "Kategori", render: (row) => <span>{row.category.name}</span> },
                { header: "Ürün Sayısı", render: (row) => <span>{row._count.products}</span> },
                {
                    header: "Action",
                    columns: [
                        { type: "action:update", onAction: (row) => subcategoryToUpdate.value = row },
                        { type: "action:delete", onAction: (row) => subcategoryToDelete.value = row.id }
                    ]
                }
            ]}
        />
    )
}