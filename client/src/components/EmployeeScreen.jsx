import { useEffect, useState } from 'react';
import { listOrders, updateStatus } from '../api.js';

const NEXT_LABEL = { new: 'Start preparing', preparing: 'Mark ready' };
const NEXT_STATUS = { new: 'preparing', preparing: 'ready' };

export default function EmployeeScreen() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function refresh() {
        setError(null);
        setLoading(true);
        try {
            const data = await listOrders(['new', 'preparing']);
            data.sort((a, b) => a.id - b.id);
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, []);

    async function advance(order) {
        setError(null);
        const target = NEXT_STATUS[order.status];
        if (!target) return;
        try {
            await updateStatus(order.id, target);
            await refresh();
        } catch (err) {
            setError(`Could not update order #${order.id}: ${err.message}`);
        }
    }

    return (
        <div className="employee-screen">
            <div className="screen-head">
                <h2>Active orders</h2>
                <button className="btn" onClick={refresh} disabled={loading}>
                    {loading ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            {error && <div className="banner error">{error}</div>}

            <div data-testid="employee-orders">
                {orders.length === 0 ? (
                    <p className="muted">No active orders.</p>
                ) : (
                    orders.map((o) => (
                        <div className="card order-row" key={o.id}>
                            <div className="order-main">
                                <div>
                                    <strong>#{o.id}</strong> — {o.customerName}{' '}
                                    <span className="muted">({o.phone})</span>
                                </div>
                                <ul className="items-mini">
                                    {o.items.map((it, idx) => (
                                        <li key={idx}>
                                            {it.pizzaName} ({it.sizeName})
                                            {it.toppings.length > 0 &&
                                                ` + ${it.toppings.map((t) => t.name).join(', ')}`}
                                        </li>
                                    ))}
                                </ul>
                                <div className="muted small">Total: {o.totalPrice} ILS</div>
                            </div>
                            <div className="order-actions">
                                <span className={`pill pill-${o.status}`}>{o.status}</span>
                                {NEXT_STATUS[o.status] && (
                                    <button className="btn primary" onClick={() => advance(o)}>
                                        {NEXT_LABEL[o.status]}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}