import { Button } from "@/components/ui/Button"

export const Breadcrumb = ({ items }: { items: { label: string, url: string }[] }) => {
    const allItems = [{ label: "Anasayfa", url: "/" }, ...items]

    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol itemScope itemType="https://schema.org/BreadcrumbList">
                {allItems.map(({ label, url }, index) =>
                    <li
                        itemScope
                        itemProp="itemListElement"
                        itemType="https://schema.org/ListItem"
                        key={url}
                    >
                        {index > 0 && <span aria-hidden="true">{">"}</span>}
                        <Button
                            color="neutral"
                            variant="ghost"
                            href={url}
                            aria-current={index === allItems.length - 1 ? "page" : undefined}
                            itemProp="item"
                        >
                            <span itemProp="name">{label}</span>
                        </Button>
                        <meta itemProp="position" content={String(index + 1)} />
                    </li>
                )}
            </ol>
        </nav>
    )
}