"use client"

import { Form } from "@/components/Form/Form"
import Badge from "@/components/ui/Badge"
import Icon from "@/components/ui/Icon"
import Loader from "@/components/ui/Loader"
import Modal from "@/components/ui/Modal"
import StatusMessage from "@/components/ui/StatusMessage"
import { DISCOUNT_TYPE_OPTIONS } from "@/features/campaign/campaign.helpers"
import { UpdateCouponFormInput } from "@/features/coupon/coupon.schema"
import { formatDateTimeLocal } from "@/lib/date"
import { api } from "@/lib/eden"
import { FormStatus } from "@/lib/types"
import { queryClient } from "@/providers/QueryProvider"
import { batch, Signal, useSignal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"

export default function AdminUpdateCouponModal({ couponToUpdate }: { couponToUpdate: Signal<string | null> }) {
    const formStatus = useSignal<FormStatus>(null)

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-coupon-for-update", couponToUpdate.value],
        queryFn: async () => {
            const { data, error } = await api.admin.coupons({ id: couponToUpdate.value! }).edit.get()
            if (error) throw new Error((error as any).value)
            return data.data
        },
        enabled: !!couponToUpdate.value
    })

    const handleUpdateCoupon = async (formValues: UpdateCouponFormInput) => {
        if (!couponToUpdate.value) return

        const { error } = await api.admin.coupons({ id: couponToUpdate.value }).put(formValues)

        if (error) {
            formStatus.value = (error as any).value
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-coupons"] })
        queryClient.removeQueries({ queryKey: ["admin-coupon-for-update", couponToUpdate.value] })
        batch(() => {
            formStatus.value = null
            couponToUpdate.value = null
        })
    }

    const couponHasOrders = !!data?._count.orderDiscounts

    if (!couponToUpdate.value) return null

    return (
        <Modal className="container-md" onClose={() => batch(() => { formStatus.value = null; couponToUpdate.value = null })}>
            <div className="modal-header">
                <Badge color="primary" size="md">
                    <Icon name="pen" size="lg" />
                </Badge>
                <h5>Kupon Güncelle</h5>
            </div>

            {isLoading && <Loader type="progress-bar" />}
            {error && <StatusMessage color="danger">{error.message}</StatusMessage>}

            {data && <Form
                groups={[
                    {
                        label: "Temel Bilgiler",
                        fields: [
                            { name: "code", type: "text", label: "Kod", defaultValue: data.code },
                            { name: "title", type: "text", label: "Başlık", defaultValue: data.title },
                            { name: "isActive", type: "checkbox", label: "Aktif", options: [{ label: "Kuponu yayınla", value: true }], defaultValue: data.isActive },
                        ]
                    },
                    {
                        label: "Tarih Aralığı",
                        layout: "row",
                        fields: [
                            { name: "startsAt", type: "datetime-local", label: "Başlangıç Tarihi", defaultValue: formatDateTimeLocal(data.startsAt) },
                            { name: "endsAt", type: "datetime-local", label: "Bitiş Tarihi", defaultValue: formatDateTimeLocal(data.endsAt) },
                        ]
                    },
                    {
                        label: "İndirim Bilgileri",
                        layout: "row",
                        fields: [
                            { name: "discountType", type: "select", label: "İndirim Türü", options: DISCOUNT_TYPE_OPTIONS, defaultValue: data.discountType, buttonProps: { disabled: !!couponHasOrders } },
                            { name: "discountValue", type: "number", label: "İndirim Değeri", defaultValue: String(data.discountValue), inputProps: { disabled: !!couponHasOrders } },
                            { name: "maxDiscountAmount", type: "number", label: "Maksimum İndirim Tutarı", defaultValue: data.maxDiscountAmount?.toString(), inputProps: { disabled: !!couponHasOrders } },
                            { name: "minOrderAmount", type: "number", label: "Minimum Sepet Tutarı", defaultValue: data.minOrderAmount?.toString(), inputProps: { disabled: !!couponHasOrders } },
                            { name: "usageLimit", type: "number", label: "Kullanım Limiti", defaultValue: data.usageLimit?.toString(), inputProps: { disabled: !!couponHasOrders } }
                        ]
                    },
                    {
                        label: "İçerik",
                        fields: [
                            { name: "description", type: "textarea", label: "Açıklama", defaultValue: data.description },
                            { name: "image", type: "file", label: "Görsel", config: [{ mimeTypes: ["image/webp", "image/jpeg"], maxFiles: 1, maxSize: 1 }], defaultValue: data.image },
                        ]
                    }
                ]}
                onSubmit={handleUpdateCoupon}
                status={formStatus}
                submitLabel="Güncelle"
            />}
        </Modal>
    )
}