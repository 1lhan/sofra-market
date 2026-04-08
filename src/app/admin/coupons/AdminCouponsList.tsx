"use client"

import Pagination from "@/components/Pagination"
import { Table } from "@/components/Table"
import Badge from "@/components/ui/Badge"
import Loader from "@/components/ui/Loader"
import StatusMessage from "@/components/ui/StatusMessage"
import { formatDate } from "@/lib/date"
import { api } from "@/lib/eden"
import { Signal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"

type AdminCouponsListProps = {
    couponToUpdate: Signal<string | null>
    couponToDelete: Signal<string | null>
    currentPage: Signal<number>
}

export default function AdminCouponsList({ couponToUpdate, couponToDelete, currentPage }: AdminCouponsListProps) {
    const { data: coupons, isFetching, isLoading, error } = useQuery({
        queryKey: ["admin-coupons", currentPage.value],
        queryFn: async () => {
            const { data, error } = await api.admin.coupons.get({ query: { page: currentPage.value } })
            if (error) throw new Error((error as any).value.message)
            return data.data
        },
        placeholderData: (previousData) => previousData
    })

    if (isLoading) return <Loader type="progress-bar" />

    if (!isLoading && error) return <StatusMessage color="danger">{error.message}</StatusMessage>

    if (!coupons?.data.length) return <StatusMessage color="info">Henüz hiç kupon oluşturulmadı</StatusMessage>

    return (
        <>
            <Table
                data={coupons.data}
                columns={[
                    { header: "Görsel", render: (row) => row.image && <Image src={row.image} width={48} height={14.5} alt={row.title} /> },
                    { header: "Kod", key: "code", type: "text" },
                    { header: "Başlık", key: "title", type: "text" },
                    { header: "Tarih Aralığı", render: (row) => <span>{formatDate(row.startsAt)} / {formatDate(row.endsAt)}</span> },
                    { header: "Kullanım", render: (row) => <span>{row.usageCount} / {row.usageLimit ?? "∞"}</span> },
                    { header: "Durum", render: (row) => <Badge color={row.isActive ? "success" : "danger"} size="sm" shape="default">{row.isActive ? "Aktif" : "Pasif"}</Badge> },
                    {
                        header: "Action",
                        columns: [
                            { type: "action:update", onAction: (row) => couponToUpdate.value = row.id },
                            { type: "action:delete", onAction: (row) => couponToDelete.value = row.id }
                        ]
                    }
                ]}
            />
            <Pagination
                currentPage={currentPage.value}
                totalCount={coupons.total}
                isFetching={isFetching}
                onPageChange={(page) => currentPage.value = page}
            />
        </>
    )
}