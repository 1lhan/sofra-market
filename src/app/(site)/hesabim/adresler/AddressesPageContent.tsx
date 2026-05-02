"use client"

import { ConfirmModal } from "@/components/common/ConfirmModal"
import { Alert } from "@/components/ui/Alert"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { Loader } from "@/components/ui/Loader"
import { UserAddress } from "@/features/address/address.types"
import { api } from "@/lib/eden"
import { queryClient } from "@/providers/QueryProvider"
import { useSignal } from "@preact/signals-react"
import { useQuery } from "@tanstack/react-query"
import AddAdressModal from "./AddAdressModal"
import UpdateAddressModal from "./UpdateAddressModal"

export default function AddressesPageContent() {
    const isAddAdressModalOpen = useSignal(false)
    const addressToUpdate = useSignal<UserAddress | null>(null)
    const addressToDelete = useSignal<string | null>(null)

    async function deleteAddress() {
        if (!addressToDelete.value) return

        const { error } = await api.addresses({ addressId: addressToDelete.value }).delete()

        if (error) {
            // toast.add()
            return
        }

        queryClient.refetchQueries({ queryKey: ["addresses"] })
        addressToDelete.value = null
    }

    const { data: addresses, isLoading, error } = useQuery({
        queryKey: ["addresses"],
        queryFn: async () => {
            const { data, error } = await api.addresses.get()
            if (error) throw new Error((error as any).value.message)
            return data.data
        }
    })

    return (
        <section className="addresses-page">
            <div className="addresses-page-header">
                <h1 className="page-title">Adreslerim</h1>
                <Button color="primary" variant="filled" shape="rectangle" onClick={() => isAddAdressModalOpen.value = true}>
                    Yeni Adres Ekle
                </Button>
            </div>

            <div className="addresses">
                {isLoading && <Loader type="progress-bar" />}
                {error && <Alert color="danger">{error.message}</Alert>}

                {addresses?.map((address) =>
                    <div className="address" key={address.id}>
                        <div className="address-header">
                            <span className="address-title">{address.title}</span>
                            <Button color="neutral" variant="ghost" onClick={() => addressToUpdate.value = address}>
                                <Icon name="pen-line" />
                            </Button>
                            <Button color="neutral" variant="ghost" onClick={() => addressToDelete.value = address.id}>
                                <Icon name="trash-alt" />
                            </Button>
                        </div>

                        <div className="address-badges">
                            <Badge color="primary">
                                {address.billingType === "INDIVIDUAL" ? "Bireysel" : "Kurumsal"}
                            </Badge>
                            {address.isDefault && (
                                <Badge color="success">
                                    Varsayılan Adres
                                </Badge>
                            )}
                        </div>

                        <div className="address-info">
                            <div className="address-info-row">
                                <Icon name="user-alt-1" size="lg" />
                                <span>{`${address.firstName} ${address.lastName}`}</span>
                            </div>
                            <div className="address-info-row">
                                <Icon name="phone" size="lg" />
                                <span>{address.phone}</span>
                            </div>
                            <div className="address-info-row">
                                <Icon name="location-pin" size="lg" />
                                <address>
                                    <span>{address.addressLine}</span>
                                    <span>{address.neighborhood}, {address.district}/{address.city}</span>
                                    {address.postalCode && <span>{address.postalCode}</span>}
                                </address>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AddAdressModal isAddAdressModalOpen={isAddAdressModalOpen} />
            <UpdateAddressModal addressToUpdate={addressToUpdate} />
            <ConfirmModal
                isOpen={addressToDelete}
                message="Bu adresi silmek istediğinizden emin misiniz?"
                onConfirm={deleteAddress}
                onCancel={() => addressToDelete.value = null}
            />
        </section>
    )
}