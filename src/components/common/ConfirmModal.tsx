"use client"

import { Signal } from "@preact/signals-react"
import Badge, { BadgeProps } from "../ui/Badge"
import Button, { CommonButtonProps } from "../ui/Button"
import Icon, { IconNames } from "../ui/Icon"
import Modal from "../ui/Modal"

type ConfirmModalProps = {
    isOpen: Signal<string | boolean | number | null>,
    title?: string
    message: string
    icon?: IconNames
    badgeColor?: BadgeProps["color"]
    confirmButtonText?: string
    confirmButtonColor?: CommonButtonProps["color"]
    isLoading?: Signal<boolean>
    onConfirm: () => void
    onCancel: () => void
}

export const ConfirmModal = ({
    isOpen,
    title = "Onayla",
    message,
    icon = "trash-can",
    badgeColor = "danger",
    confirmButtonText = "Sil",
    confirmButtonColor = "danger",
    isLoading,
    onConfirm,
    onCancel
}: ConfirmModalProps) => {
    if (!isOpen.value) return null

    return (
        <Modal onClose={onCancel} className="confirm-modal container-sm" aria-label={title}>
            <div className="confirm-modal-header">
                <Badge color={badgeColor} size="md" aria-hidden="true">
                    <Icon name={icon} size="lg" />
                </Badge>
                <div className="confirm-modal-header-content">
                    <h5 className="confirm-modal-title">{title}</h5>
                    <span className="confirm-modal-message">{message}</span>
                </div>
            </div>
            <div className="confirm-modal-actions">
                <Button
                    color="secondary"
                    variant="outline"
                    shape="default"
                    onClick={onCancel}
                >
                    Vazgeç
                </Button>
                <Button
                    color={confirmButtonColor}
                    variant="filled"
                    shape="default"
                    loading={isLoading?.value ?? false}
                    onClick={onConfirm}
                >
                    {confirmButtonText}
                </Button>
            </div>
        </Modal>
    )
}