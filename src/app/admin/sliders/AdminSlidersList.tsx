"use client"

import { Table } from "@/components/Table"
import { Alert } from "@/components/ui/Alert"
import { Badge } from "@/components/ui/Badge"
import { Loader } from "@/components/ui/Loader"
import { SliderAdminList } from "@/features/slider/slider.types"
import { api } from "@/lib/eden"
import { Signal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"

type AdminSlidersListProps = {
    sliderToUpdate: Signal<SliderAdminList | null>
    sliderToDelete: Signal<string | null>
}

export default function AdminSlidersList({ sliderToUpdate, sliderToDelete }: AdminSlidersListProps) {
    const { data: sliders, isLoading, error } = useQuery({
        queryKey: ["admin-sliders"],
        queryFn: async () => {
            const { data, error } = await api.admin.sliders.get()
            if (error) throw new Error((error as any).value.message)
            return data.data
        },
        placeholderData: (previousData) => previousData
    })

    if (isLoading) return <Loader type="progress-bar" />

    if (!isLoading && error) return <Alert color="danger">{error.message}</Alert>

    if (!sliders?.length) return <Alert color="info">Henüz hiç slider oluşturulmadı</Alert>

    return (
        <Table
            data={sliders}
            columns={[
                { header: "Görsel", render: (row) => row.image && <Image src={row.image} width={57} height={48} alt={row.imageAlt ?? ""} /> },
                { header: "Görsel Açıklaması (Alt)", key: "imageAlt", type: "text" },
                { header: "Bağlantı URL'i", key: "href", type: "text" },
                { header: "Sıra", key: "sortOrder", type: "text" },
                { header: "Durum", render: (row) => <Badge color={row.isActive ? "success" : "danger"}>{row.isActive ? "Aktif" : "Pasif"}</Badge> },
                {
                    header: "Action",
                    columns: [
                        { type: "action:update", onAction: (row) => sliderToUpdate.value = row },
                        { type: "action:delete", onAction: (row) => sliderToDelete.value = row.id }
                    ]
                }
            ]}
        />
    )
}