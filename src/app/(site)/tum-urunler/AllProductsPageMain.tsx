"use client"

import { Filters } from "@/components/Filters"
import { CustomSelect } from "@/components/inputs/CustomSelect"
import { PRODUCT_SORT_OPTIONS } from "@/features/product/product.helpers"
import { ProductPublic } from "@/features/product/product.types"
import ProductCard from "@/features/product/ProductCard"
import { api } from "@/lib/eden"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import ProductsSkeleton from "../kategori/[slug]/ProductsSkeleton"

export default function AllProductsPageMain({ categories, initialProducts }: { categories: { name: string, slug: string }[], initialProducts: { total: number, data: ProductPublic[] } }) {
    const searchParams = useSearchParams()

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["products", searchParams.toString()],
        queryFn: async () => {
            const { data, error } = await api.products.get({ query: Object.fromEntries(searchParams.entries()) })
            if (error) throw new Error((error as any).value.message)
            return data.data
        },
        initialData: searchParams.toString() === "" ? initialProducts : undefined,
        placeholderData: (previousData) => previousData
    })

    return (
        <main>
            <Filters
                groups={[
                    { label: "Kategoriler", key: "category", type: "checkboxes", options: categories.map(c => ({ label: c.name, value: c.slug })) },
                    { label: "Fiyat", key: "price", type: "range" },
                    { label: "Diğer", key: "filter", type: "checkboxes", options: [{ label: "İndirimli Ürünler", value: "discounted" }, { label: "Kampanyalı Ürünler", value: "campaign" }] }
                ]}
            />

            <div className="products-section">
                <div className="products-section-header">
                    {data && <span className="product-count">{`${data.total} Ürün`}</span>}
                    <CustomSelect
                        name="sort"
                        value={searchParams.get("sort") ?? "featured"}
                        onChange={(value) => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set("sort", value as string)
                            window.history.pushState({}, "", `?${params.toString().replaceAll("%2C", ",")}`)
                        }}
                        options={PRODUCT_SORT_OPTIONS}
                        buttonProps={{ disabled: !data?.total || isFetching }}
                    />
                </div>

                {isLoading
                    ? <ProductsSkeleton />
                    : (
                        <div className="products">
                            {data?.data.map(item =>
                                <ProductCard {...item} key={item.id} />
                            )}
                        </div>
                    )
                }
            </div>
        </main >
    )
}