"use client"

import { useSignal } from "@preact/signals-react"
import { Button } from "./ui/Button"
import { Icon } from "./ui/Icon"

type PaginationProps = {
    currentPage: number
    totalCount: number
    pageSize?: number
    isFetching: boolean
    onPageChange: (page: number) => void
}

const MAX_VISIBLE_PAGES = 5
const PAGES_OFFSET = 2 // Math.floor(MAX_VISIBLE_PAGES / 2)

export default function Pagination({ currentPage, totalCount, pageSize = 10, isFetching, onPageChange }: PaginationProps) {
    const pages = useSignal<(string | number)[]>([])
    const totalPages = Math.ceil(totalCount / pageSize)

    const generatePages = () => {
        if (totalPages <= 5) {
            pages.value = Array.from({ length: totalPages }, (_, i) => i + 1)
            return
        }

        let start = Math.max(currentPage - PAGES_OFFSET, 2)
        let end = start + MAX_VISIBLE_PAGES - 1

        if (end > totalPages - 1) {
            end = totalPages - 1
            start = Math.max(end - MAX_VISIBLE_PAGES + 1, 2)
        }

        pages.value = [
            1,
            ...(start > 2 ? ["..."] : []),
            ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
            ...(end < totalPages - 1 ? ["..."] : []),
            totalPages
        ]
    }

    generatePages()

    if (pages.value.length < 2) return null

    const handlePageClick = (page: string | number) => {
        if (isFetching || page === currentPage) return
        onPageChange(page as number)
    }

    return (
        <div className="pagination" aria-label="pagination">
            <Button
                color="surface"
                variant="filled"
                size="sm"
                className="pagination-button-previous"
                disabled={currentPage === 1}
                onClick={() => handlePageClick(currentPage - 1)}
                aria-label="Previous page"
            >
                <Icon name="chevron-left" size="sm" />
            </Button>
            {pages.value.map((page, index) =>
                <Button
                    color="surface"
                    variant="filled"
                    size="sm"
                    className={currentPage === page ? "pagination-button-active" : ""}
                    disabled={page === "..."}
                    onClick={() => handlePageClick(page)}
                    aria-label={page !== "..." ? `Page ${page}` : undefined}
                    aria-current={page === currentPage ? "page" : undefined}
                    key={index}
                >
                    {page}
                </Button>
            )}
            <Button
                color="surface"
                variant="filled"
                size="sm"
                className="pagination-button-next"
                disabled={currentPage === totalPages}
                onClick={() => handlePageClick(currentPage + 1)}
                aria-label="Next page"
            >
                <Icon name="chevron-right" size="sm" />
            </Button>
        </div>
    )
}