export default function OrderSummary({ menu, items }) {
    const priceOf = (list, id) => {
        const found = list.find((x) => x.id === id);
        return found ? found.price : 0;
    };

    const lines = items.map((it) => {
        const base = priceOf(menu.pizzas, it.pizzaId);
        const sizeP = priceOf(menu.sizes, it.size);
        const topsP = it.toppings.reduce((sum, t) => sum + priceOf(menu.toppings, t), 0);
        return {
            name: (menu.pizzas.find((p) => p.id === it.pizzaId) || {}).name || it.pizzaId,
            size: (menu.sizes.find((s) => s.id === it.size) || {}).name || it.size,
            lineTotal: base + sizeP + topsP,
        };
    });

    const estimate = lines.reduce((sum, l) => sum + l.lineTotal, 0);

    return (
        <div className="order-summary card" data-testid="order-summary-panel">
            <h3>Order summary</h3>

            {lines.length === 0 ? (
                <p className="muted">Add items to see a price estimate.</p>
            ) : (
                <>
                    <ul className="summary-lines">
                        {lines.map((l, idx) => (
                            <li key={idx}>
                                <span>
                                    {l.name} ({l.size})
                                </span>
                                <span className="price">{round(l.lineTotal)} ILS</span>
                            </li>
                        ))}
                    </ul>
                    <div className="summary-total">
                        <span>Estimated total</span>
                        <span className="price">{round(estimate)} ILS</span>
                    </div>
                    <p className="muted small">
                        This is an estimate. The final price is calculated by the server.
                    </p>
                </>
            )}
        </div>
    );
}

function round(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}