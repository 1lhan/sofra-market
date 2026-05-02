export default function ProductsSkeleton({ length = 4 }: { length?: number }) {
    return (
        <div className="products-skeleton">
            {Array.from({ length }).map((_, i) =>
                <div className="product-card-skeleton product-card" key={i}>
                    <div className="product-card-image-link" />
                    <div className="product-card-title" />
                    <div className="product-card-reviews-summary" />
                    <div className="product-card-price-row" />
                    <div className="product-card-add-to-cart-btn" />
                </div>
            )}
        </div>
    )
}