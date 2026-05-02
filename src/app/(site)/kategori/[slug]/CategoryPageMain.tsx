"use client"

import { Filters } from "@/components/Filters";
import { CustomSelect } from "@/components/inputs/CustomSelect";
import { PRODUCT_SORT_OPTIONS } from "@/features/product/product.helpers";
import { ProductPublic } from "@/features/product/product.types";
import ProductCard from "@/features/product/ProductCard";
import { api } from "@/lib/eden";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import ProductsSkeleton from "./ProductsSkeleton";

export default function CategoryPageMain({ slug, subcategories, initialProducts }: { slug: string, subcategories: { name: string, slug: string }[] | undefined, initialProducts: { total: number, data: ProductPublic[] } }) {
    const searchParams = useSearchParams()

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["products", slug, searchParams.toString()],
        queryFn: async () => {
            const query = { categorySlug: slug, ...Object.fromEntries(searchParams.entries()) }
            const { data, error } = await api.products.get({ query })
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
                    ...(
                        (subcategories?.length && !subcategories?.some(s => s.slug === slug))
                            ? [{ label: "Alt Kategoriler", key: "subcategory", type: "checkboxes" as const, options: subcategories.map(c => ({ label: c.name, value: c.slug })) }]
                            : []
                    ),
                    { label: "Fiyat", key: "price", type: "range" },
                    { label: "Diğer", key: "filter", type: "checkboxes", options: [{ label: "İndirimli Ürünler", value: "discounted" }, { label: "Kampanyalı Ürünler", value: "campaign" }] }
                ]}
            />

            <section className="products-section">
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
            </section>
        </main >
    )
}