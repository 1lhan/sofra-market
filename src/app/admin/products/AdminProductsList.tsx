"use client"

import Pagination from "@/components/Pagination"
import { Table } from "@/components/Table"
import { Alert } from "@/components/ui/Alert"
import { Badge } from "@/components/ui/Badge"
import { Loader } from "@/components/ui/Loader"
import { api } from "@/lib/eden"
import { Signal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"

type AdminProductsListProps = {
    productToUpdate: Signal<string | null>
    productToDelete: Signal<string | null>
    currentPage: Signal<number>
}

export default function AdminProductsList({ productToUpdate, productToDelete, currentPage }: AdminProductsListProps) {
    const { data: products, isFetching, isLoading, error } = useQuery({
        queryKey: ["admin-products", currentPage.value],
        queryFn: async () => {
            const { data, error } = await api.admin.products.get({ query: { page: currentPage.value } })
            if (error) throw new Error((error as any).value.message)
            return data.data
        },
        placeholderData: (previousData) => previousData
    })

    if (isLoading) return <Loader type="progress-bar" />

    if (!isLoading && error) return <Alert color="danger">{error.message}</Alert>

    if (!products?.data.length) return <Alert color="info">Henüz hiç ürün oluşturulmadı</Alert>

    return (
        <>
            <Table
                data={products.data}
                columns={[
                    { header: "Görsel", render: (row) => row.images.length ? <Image src={row.images[0]} width={48} height={48} alt={row.title} /> : null },
                    { header: "Başlık", key: "title", type: "text" },
                    { header: "URL (Slug)", key: "slug", type: "text" },
                    { header: "Fiyat", key: "price", type: "text" },
                    { header: "İndirim Öncesi Fiyat", key: "comparePrice", type: "text" },
                    { header: "Stok", key: "stock", type: "text" },
                    { header: "Kategori", render: (row) => <span>{row.category.name}</span> },
                    { header: "Alt Kategori", render: (row) => <span>{row.subcategory?.name}</span> },
                    { header: "Durum", render: (row) => <Badge color={row.isActive ? "success" : "danger"}>{row.isActive ? "Aktif" : "Pasif"}</Badge> },
                    {
                        header: "Action",
                        columns: [
                            { type: "action:update", onAction: (row) => productToUpdate.value = row.id },
                            { type: "action:delete", onAction: (row) => productToDelete.value = row.id }
                        ]
                    }
                ]}
            />
            <Pagination
                currentPage={currentPage.value}
                totalCount={products.total}
                isFetching={isFetching}
                onPageChange={(page) => currentPage.value = page}
            />
        </>
    )
}