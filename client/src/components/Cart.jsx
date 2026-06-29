export default function Cart({ menu, items, onRemove }) {
    const nameOf = (list, id) => {
        const found = list.find((x) => x.id === id);
        return found ? found.name : id;
    };

    return (
        <div className="cart card" data-testid="cart">
            <h3>Cart</h3>

            {items.length === 0 ? (
                <p className="muted">Your cart is empty.</p>
            ) : (
                <ul className="cart-items">
                    {items.map((it, idx) => (
                        <li key={idx}>
                            <div>
                                <strong>{nameOf(menu.pizzas, it.pizzaId)}</strong>{' '}
                                <span className="muted">({nameOf(menu.sizes, it.size)})</span>
                                {it.toppings.length > 0 && (
                                    <div className="muted small">
                                        {it.toppings.map((t) => nameOf(menu.toppings, t)).join(', ')}
                                    </div>
                                )}
                            </div>
                            <button className="link-btn" onClick={() => onRemove(idx)}>
                                remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}