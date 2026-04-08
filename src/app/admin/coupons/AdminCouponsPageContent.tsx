"use client"

import { ConfirmModal } from "@/components/common/ConfirmModal"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { api } from "@/lib/eden"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import AdminCouponsList from "./AdminCouponsList"
import AdminCreateCouponModal from "./AdminCreateCouponModal"
import AdminUpdateCouponModal from "./AdminUpdateCouponModal"

export default function AdminCouponsPageContent() {
    const isCreateModalOpen = useSignal(false)
    const currentPage = useSignal(1)
    const couponToUpdate = useSignal<string | null>(null)
    const couponToDelete = useSignal<string | null>(null)

    const handleDeleteCoupon = async () => {
        if (!couponToDelete.value) return

        const { error } = await api.admin.coupons({ id: couponToDelete.value }).delete()

        if (error) {
            window.alert(error.value.message)
            return
        }

        queryClient.refetchQueries({ queryKey: ["admin-coupons"] })
        queryClient.removeQueries({ queryKey: ["admin-coupon-for-update", couponToDelete.value] })
        couponToDelete.value = null
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <Badge color="primary" size="lg">
                    <Icon name="layer-group" size="xl" />
                </Badge>
                <h4>Kuponlar</h4>
                <Button color="primary" variant="filled" shape="default" onClick={() => isCreateModalOpen.value = true}>Kupon Oluştur</Button>
            </div>

            <AdminCouponsList
                currentPage={currentPage}
                couponToUpdate={couponToUpdate}
                couponToDelete={couponToDelete}
            />

            <AdminCreateCouponModal isCreateModalOpen={isCreateModalOpen} />

            <AdminUpdateCouponModal couponToUpdate={couponToUpdate} />

            <ConfirmModal
                isOpen={couponToDelete}
                message="Bu kuponu silmek istediğinizden emin misiniz?"
                onConfirm={handleDeleteCoupon}
                onCancel={() => couponToDelete.value = null}
            />
        </div>
    )
}