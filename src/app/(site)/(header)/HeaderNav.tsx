import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Fragment } from "react/jsx-runtime";

export default async function HeaderNav() {
    "use cache"
    cacheLife("max")
    cacheTag("categories")

    const categories = await prisma.category.findMany({
        select: {
            name: true,
            slug: true,
            subcategories: {
                select: { name: true, slug: true, },
                orderBy: { sortOrder: "asc" }
            }
        },
        orderBy: { sortOrder: "asc" }
    })

    return (
        <nav className="header-nav">
            <div className="container">
                {categories.map(({ name, slug, subcategories }) => {
                    const hasSubcategories = subcategories.length > 0

                    return (
                        <Fragment key={slug}>
                            <Button color="neutral" variant="ghost" shape="compact" href={`/kategori/${slug}`} {...(hasSubcategories && { style: { anchorName: `--category-${slug}` } })}>
                                {name}
                                {subcategories.length > 0 && <Icon name="chevron-down" size="sm" />}
                            </Button>

                            {hasSubcategories && (
                                <div className="header-nav-dropdown" style={{ positionAnchor: `--category-${slug}` }}>
                                    {subcategories.map(sub =>
                                        <Button color="neutral" variant="ghost" shape="compact" href={`/kategori/${sub.slug}`} key={sub.slug}>
                                            {sub.name}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </Fragment>
                    )
                })}

                <Button color="secondary" variant="filled" shape="compact" href="/kampanyalar">
                    Kampanyalar
                </Button>
            </div>
        </nav>
    )
}