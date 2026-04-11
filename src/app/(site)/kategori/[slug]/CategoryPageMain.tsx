"use client"

import { CustomSelect } from "@/components/inputs/CustomSelect";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { ProductPublic } from "@/features/product/product.types";
import { api } from "@/lib/eden";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductsSkeleton from "./ProductsSkeleton";

export default function CategoryPageMain({ slug, initialProducts }: { slug: string, initialProducts: { total: number, data: ProductPublic[] } }) {
    const searchParams = useSearchParams()

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ["products", slug, searchParams.toString()],
        queryFn: async () => {
            const query = { categorySlug: slug, ...Object.fromEntries(searchParams.entries()) }
            const { data, error } = await api.products.get({ query })
            if (error) throw new Error((error as any).value.message)
            return data.data
        },
        initialData: searchParams.toString() === "" ? initialProducts : undefined,
        placeholderData: (previousData) => previousData,
    })

    return (
        <main className="category-page-main">
            <aside className="filters">

            </aside>

            <section className="products-section">

                <div className="products-section-header">
                    {data && <span className="product-count">{`${data.total} Ürün`}</span>}
                    <CustomSelect
                        name="sort"
                        value={searchParams.get("sort") ?? ""}
                        onChange={(value) => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set("sort", value as string)
                            window.history.pushState({}, "", `?${params.toString().replaceAll("%2C", ",")}`)
                        }}
                        options={[
                            { label: "Öne Çıkanlar", value: "featured" },
                            { label: "Çok Satılanlar", value: "best_selling" },
                            { label: "Fiyata Göre (Artan)", value: "price_asc" },
                            { label: "Fiyata Göre (Azalan)", value: "price_desc" },
                            { label: "Alfabetik (A-Z)", value: "name_asc" },
                            { label: "Alfabetik (Z-A)", value: "name_desc" }
                        ]}
                        buttonProps={{ disabled: !data?.total || isFetching }}
                    />
                </div>

                {isLoading && <ProductsSkeleton />}

                {!isLoading && data && (
                    <div className="products">
                        {data.data.map(({ title, slug, price, comparePrice, images }) => {
                            const discountPct = comparePrice
                                ? Math.round(((comparePrice - price) / comparePrice) * -100)
                                : null

                            return (
                                <div className="product-card" key={slug}>
                                    <Link className="product-card-image" href={`/urun/${slug}`}>
                                        {images.length > 0 && <Image src={images[0]} alt={title} fill sizes="500px" />}
                                    </Link>
                                    <Button className="product-card-title" color="neutral" variant="ghost" href={`/urun/${slug}`}>{title}</Button>
                                    <div className="product-card-footer">
                                        <div className="product-card-price">
                                            {discountPct && <span className="product-card-discount">{discountPct}%</span>}
                                            <div>
                                                {comparePrice && <span className="text-muted">{comparePrice} ₺</span>}
                                                <span className="price">{price} ₺</span>
                                            </div>
                                        </div>
                                        <Button color="primary" variant="filled" shape="compact">
                                            <Icon name="shopping-bag-plus" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

            </section>
        </main >
    )
}