"use client"

import Pagination from "@/components/Pagination"
import { Table } from "@/components/Table"
import { Alert } from "@/components/ui/Alert"
import { Badge } from "@/components/ui/Badge"
import { Loader } from "@/components/ui/Loader"
import { CAMPAIGN_TYPE_LABELS } from "@/features/campaign/campaign.helpers"
import { formatDate } from "@/lib/date"
import { api } from "@/lib/eden"
import { Signal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"

type AdminCampaignsListProps = {
    campaignToUpdate: Signal<string | null>
    campaignToDelete: Signal<string | null>
    currentPage: Signal<number>
}

export default function AdminCampaignsList({ campaignToUpdate, campaignToDelete, currentPage }: AdminCampaignsListProps) {
    const { data: campaigns, isFetching, isLoading, error } = useQuery({
        queryKey: ["admin-campaigns", currentPage.value],
        queryFn: async () => {
            const { data, error } = await api.admin.campaigns.get({ query: { page: currentPage.value } })
            if (error) throw new Error((error as any).value.message)
            return data.data
        },
        placeholderData: (previousData) => previousData
    })

    if (isLoading) return <Loader type="progress-bar" />

    if (!isLoading && error) return <Alert color="danger">{error.message}</Alert>

    if (!campaigns?.data.length) return <Alert color="info">Henüz hiç kampanya oluşturulmadı</Alert>

    return (
        <>
            <Table
                data={campaigns.data}
                columns={[
                    { header: "Görsel", render: (row) => row.image && <Image src={row.image} width={48} height={14.5} alt={row.title} /> },
                    { header: "Başlık", key: "title", type: "text" },
                    { header: "Tür", render: (row) => <span>{CAMPAIGN_TYPE_LABELS[row.type]}</span> },
                    { header: "Tarih Aralığı", render: (row) => <span>{formatDate(row.startsAt)} / {formatDate(row.endsAt)}</span> },
                    { header: "Kullanım", render: (row) => <span>{row.usageCount} / {row.usageLimit ?? "∞"}</span> },
                    { header: "Ürün Sayısı", render: (row) => <span>{row._count.products}</span> },
                    { header: "Durum", render: (row) => <Badge color={row.isActive ? "success" : "danger"}>{row.isActive ? "Aktif" : "Pasif"}</Badge> },
                    {
                        header: "Action",
                        columns: [
                            { type: "action:update", onAction: (row) => campaignToUpdate.value = row.id },
                            { type: "action:delete", onAction: (row) => campaignToDelete.value = row.id }
                        ]
                    }
                ]}
            />
            <Pagination
                currentPage={currentPage.value}
                totalCount={campaigns.total}
                isFetching={isFetching}
                onPageChange={(page) => currentPage.value = page}
            />
        </>
    )
}