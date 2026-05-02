"use client"

import { Form } from "@/components/Form/Form"
import { Badge } from "@/components/ui/Badge"
import { Icon } from "@/components/ui/Icon"
import { Modal } from "@/components/ui/Modal"
import { DISCOUNT_TYPE_OPTIONS } from "@/features/campaign/campaign.helpers"
import { CreateCouponFormInput } from "@/features/coupon/coupon.schema"
import { api } from "@/lib/eden"
import { RequestResponse } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { Activity } from "react"

export default function AdminCreateCouponModal({ isCreateModalOpen }: { isCreateModalOpen: Signal<boolean> }) {
    const formStatus = useSignal<RequestResponse | null>(null)

    const handleCreateCoupon = async (formValues: CreateCouponFormInput) => {
        const { error } = await api.admin.coupons.post(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-coupons"] })
        batch(() => {
            formStatus.value = null
            isCreateModalOpen.value = false
        })
    }

    return (
        <Activity mode={isCreateModalOpen.value ? "visible" : "hidden"}>
            <Modal className="container-md" onClose={() => isCreateModalOpen.value = false}>
                <div className="modal-header">
                    <Badge color="primary" size="md">
                        <Icon name="plus" size="lg" />
                    </Badge>
                    <h5>Kupon Oluştur</h5>
                </div>
                <Form
                    groups={[
                        {
                            label: "Temel Bilgiler",
                            fields: [
                                { name: "code", type: "text", label: "Kod" },
                                { name: "title", type: "text", label: "Başlık" },
                                { name: "isActive", type: "checkbox", label: "Aktif", options: [{ label: "Kuponu yayınla", value: true }] },
                            ]
                        },
                        {
                            label: "Tarih Aralığı",
                            layout: "row",
                            fields: [
                                { name: "startsAt", type: "datetime-local", label: "Başlangıç Tarihi" },
                                { name: "endsAt", type: "datetime-local", label: "Bitiş Tarihi" },
                            ]
                        },
                        {
                            label: "İndirim Bilgileri",
                            layout: "row",
                            fields: [
                                { name: "discountType", type: "select", label: "İndirim Türü", options: DISCOUNT_TYPE_OPTIONS, },
                                { name: "discountValue", type: "number", label: "İndirim Değeri" },
                                { name: "maxDiscountAmount", type: "number", label: "Maksimum İndirim Tutarı" },
                                { name: "minOrderAmount", type: "number", label: "Minimum Sepet Tutarı" },
                                { name: "usageLimit", type: "number", label: "Kullanım Limiti" }
                            ]
                        },
                        {
                            label: "İçerik",
                            fields: [
                                { name: "description", type: "textarea", label: "Açıklama" },
                                { name: "image", type: "file", label: "Görsel", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 1, maxSize: 1 }] },
                            ]
                        }
                    ]}
                    onSubmit={handleCreateCoupon}
                    status={formStatus}
                    submitLabel="Oluştur"
                />
            </Modal>
        </Activity>
    )
}