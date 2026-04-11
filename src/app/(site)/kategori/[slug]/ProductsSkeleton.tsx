export default function ProductsSkeleton() {
    return (
        <div className="products-skeleton products">
            {Array.from({ length: 4 }).map((_, i) =>
                <div className="product-card" key={i}>
                    <div className="product-card-image" />
                    <div className="product-card-title" />
                    <div className="product-card-footer">
                        <div className="product-card-price" />
                        <div className="product-card-add-to-cart-btn" />
                    </div>
                </div>
            )}
        </div>
    )
}