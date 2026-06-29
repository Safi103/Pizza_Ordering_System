export default function MenuList({ menu }) {
    if (!menu) return null;

    return (
        <div className="menu-list card" data-testid="menu-list">
            <h3>Menu</h3>

            <div className="menu-group">
                <h4>Pizzas</h4>
                <ul>
                    {menu.pizzas.map((p) => (
                        <li key={p.id}>
                            <span>{p.name}</span>
                            <span className="price">{p.price} ILS</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="menu-group">
                <h4>Sizes</h4>
                <ul>
                    {menu.sizes.map((s) => (
                        <li key={s.id}>
                            <span>{s.name}</span>
                            <span className="price">{s.price > 0 ? `+${s.price} ILS` : 'included'}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="menu-group">
                <h4>Toppings</h4>
                <ul>
                    {menu.toppings.map((t) => (
                        <li key={t.id}>
                            <span>{t.name}</span>
                            <span className="price">+{t.price} ILS</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}