import Button from "@/components/ui/Button"

type BreadcrumbPropsItem = {
    label: string
    slug: string
}

export default function Breadcrumb({ category, subcategory, product }: { category: BreadcrumbPropsItem, subcategory?: BreadcrumbPropsItem, product?: BreadcrumbPropsItem }) {
    return (
        <div className="breadcrumb">
            <Button color="neutral" variant="ghost" href="/">Anasayfa</Button>
            <span>{">"}</span>
            <Button color="neutral" variant="ghost" href={category.slug}>{category.label}</Button>
            {subcategory && (
                <>
                    <span>{">"}</span>
                    <Button color="neutral" variant="ghost" href={subcategory.slug}>{subcategory.label}</Button>
                </>
            )}
            {product && (
                <>
                    <span>{">"}</span>
                    <Button color="neutral" variant="ghost" href={product.slug}>{product.label}</Button>
                </>
            )}
        </div >
    )
}