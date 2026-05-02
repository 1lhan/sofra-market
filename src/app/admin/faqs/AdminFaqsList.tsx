"use client"

import { Table } from "@/components/Table"
import { Alert } from "@/components/ui/Alert"
import { Loader } from "@/components/ui/Loader"
import { FaqAdminList } from "@/features/faq/faq.types"
import { api } from "@/lib/eden"
import { Signal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"

type AdminFaqsListProps = {
    faqToUpdate: Signal<FaqAdminList | null>
    faqToDelete: Signal<string | null>
}

export default function AdminFaqsList({ faqToUpdate, faqToDelete }: AdminFaqsListProps) {
    const { data: faqs, isLoading, error } = useQuery({
        queryKey: ["admin-faqs"],
        queryFn: async () => {
            const { data, error } = await api.admin.faqs.get()
            if (error) throw new Error((error as any).value.message)
            return data.data
        },
        placeholderData: (previousData) => previousData
    })

    if (isLoading) return <Loader type="progress-bar" />

    if (!isLoading && error) return <Alert color="danger">{error.message}</Alert>

    if (!faqs?.length) return <Alert color="info">Henüz hiç sıkça sorulan soru oluşturulmadı</Alert>

    return (
        <Table
            data={faqs}
            columns={[
                { header: "Soru", key: "question", type: "text" },
                { header: "Cevap", render: (row) => <span>{row.answer.replace(/<[^>]*>/g, "").slice(0, 100)}...</span> },
                { header: "Sıra", key: "sortOrder", type: "text" },
                {
                    header: "Action",
                    columns: [
                        { type: "action:update", onAction: (row) => faqToUpdate.value = row },
                        { type: "action:delete", onAction: (row) => faqToDelete.value = row.id }
                    ]
                }
            ]}
        />
    )
}