import { useEffect, useState } from 'react';
import { listOrders, updateStatus } from '../api.js';

export default function DeliveryScreen() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function refresh() {
        setError(null);
        setLoading(true);
        try {
            const data = await listOrders(['ready']);
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

    async function markDelivered(order) {
        setError(null);
        try {
            await updateStatus(order.id, 'delivered');
            await refresh();
        } catch (err) {
            setError(`Could not update order #${order.id}: ${err.message}`);
        }
    }

    return (
        <div className="delivery-screen">
            <div className="screen-head">
                <h2>Ready for delivery</h2>
                <button className="btn" onClick={refresh} disabled={loading}>
                    {loading ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            {error && <div className="banner error">{error}</div>}

            <div data-testid="delivery-orders">
                {orders.length === 0 ? (
                    <p className="muted">No orders ready for delivery.</p>
                ) : (
                    orders.map((o) => (
                        <div className="card order-row" key={o.id}>
                            <div className="order-main">
                                <div>
                                    <strong>#{o.id}</strong> — {o.customerName}{' '}
                                    <span className="muted">({o.phone})</span>
                                </div>
                                <div className="muted">{o.deliveryAddress}</div>
                                <div className="muted small">Total: {o.totalPrice} ILS</div>
                            </div>
                            <div className="order-actions">
                                <span className="pill pill-ready">{o.status}</span>
                                <button className="btn primary" onClick={() => markDelivered(o)}>
                                    Mark delivered
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}