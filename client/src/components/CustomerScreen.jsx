import { useState } from 'react';
import Cart from './Cart.jsx';
import OrderSummary from './OrderSummary.jsx';
import MenuList from './MenuList.jsx';
import { createOrder, getOrder } from '../api.js';

const MAX_TOPPINGS = 3;

export default function CustomerScreen({ menu }) {
    // --- pizza builder state ---
    const [pizzaId, setPizzaId] = useState(menu.pizzas[0].id);
    const [size, setSize] = useState(menu.sizes[0].id);
    const [toppings, setToppings] = useState([]);

    // --- cart + contact state ---
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    // --- checkout / confirmation state ---
    const [placing, setPlacing] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const [orderError, setOrderError] = useState(null);

    // --- order tracking state ---
    const [trackId, setTrackId] = useState('');
    const [tracked, setTracked] = useState(null);
    const [trackError, setTrackError] = useState(null);

    function toggleTopping(id) {
        setToppings((prev) => {
            if (prev.includes(id)) return prev.filter((t) => t !== id);
            if (prev.length >= MAX_TOPPINGS) return prev; // cap reached
            return [...prev, id];
        });
    }

    function addToCart() {
        setCart((prev) => [...prev, { pizzaId, size, toppings: [...toppings] }]);
        setToppings([]); // reset toppings for the next pizza
    }

    function removeFromCart(idx) {
        setCart((prev) => prev.filter((_, i) => i !== idx));
    }

    // Fake payment step, no real card data ever leaves the browser.
    function simulatePayment() {
        return new Promise((resolve) => setTimeout(resolve, 400));
    }

    async function checkout() {
        setOrderError(null);
        setConfirmation(null);

        if (cart.length === 0) {
            setOrderError('Your cart is empty.');
            return;
        }
        if (!customerName.trim() || !phone.trim() || !deliveryAddress.trim()) {
            setOrderError('Please fill in name, phone and delivery address.');
            return;
        }

        setPlacing(true);
        try {
            await simulatePayment();

            const payload = {
                customerName: customerName.trim(),
                phone: phone.trim(),
                deliveryAddress: deliveryAddress.trim(),
                pizzas: cart.map((c) => ({
                    pizzaId: c.pizzaId,
                    size: c.size,
                    toppings: c.toppings,
                })),
            };

            const order = await createOrder(payload);
            setConfirmation(order);
            setCart([]); // clear the cart on success
        } catch (err) {
            const detail =
                err.details && err.details.length ? `: ${err.details.join('; ')}` : '';
            setOrderError(`${err.message}${detail}`);
        } finally {
            setPlacing(false);
        }
    }

    async function track() {
        setTrackError(null);
        setTracked(null);
        if (!trackId.trim()) {
            setTrackError('Enter an order id.');
            return;
        }
        try {
            const order = await getOrder(trackId.trim());
            setTracked(order);
        } catch (err) {
            setTrackError(err.message);
        }
    }

    return (
        <div className="customer-screen">
            <div className="columns">
                {/* left column: menu + builder */}
                <div className="col">
                    <MenuList menu={menu} />

                    <div className="card">
                        <h3>Build a pizza</h3>

                        <label>
                            Pizza
                            <select value={pizzaId} onChange={(e) => setPizzaId(e.target.value)}>
                                {menu.pizzas.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} — {p.price} ILS
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Size
                            <select value={size} onChange={(e) => setSize(e.target.value)}>
                                {menu.sizes.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.price > 0 ? `(+${s.price} ILS)` : ''}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <fieldset className="toppings">
                            <legend>Toppings (up to {MAX_TOPPINGS})</legend>
                            {menu.toppings.map((t) => {
                                const checked = toppings.includes(t.id);
                                const disabled = !checked && toppings.length >= MAX_TOPPINGS;
                                return (
                                    <label key={t.id} className="checkbox">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            disabled={disabled}
                                            onChange={() => toggleTopping(t.id)}
                                        />
                                        {t.name} (+{t.price} ILS)
                                    </label>
                                );
                            })}
                        </fieldset>

                        <button className="btn" onClick={addToCart}>
                            Add to cart
                        </button>
                    </div>
                </div>

                {/* right column: cart, summary, contact, checkout */}
                <div className="col">
                    <Cart menu={menu} items={cart} onRemove={removeFromCart} />
                    <OrderSummary menu={menu} items={cart} />

                    <div className="card">
                        <h3>Your details</h3>
                        <label>
                            Name
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Full name"
                            />
                        </label>
                        <label>
                            Phone
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="05x-xxxxxxx"
                            />
                        </label>
                        <label>
                            Delivery address
                            <input
                                type="text"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Street, city"
                            />
                        </label>

                        <button
                            className="btn primary"
                            data-testid="checkout-button"
                            onClick={checkout}
                            disabled={placing}
                        >
                            {placing ? 'Processing payment…' : 'Pay & place order'}
                        </button>

                        {orderError && <div className="banner error">{orderError}</div>}
                    </div>

                    {confirmation && (
                        <div className="card confirmation" data-testid="order-confirmation">
                            <h3>Order confirmed</h3>
                            <p>
                                Order <strong>#{confirmation.id}</strong>
                            </p>
                            <p>
                                Status: <strong>{confirmation.status}</strong>
                            </p>
                            <p>
                                Payment: <strong>{confirmation.paymentStatus}</strong>
                            </p>
                            <p>
                                Total (from server):{' '}
                                <strong>{confirmation.totalPrice} ILS</strong>
                            </p>
                            {confirmation.deliveryFee > 0 && (
                                <p className="muted small">
                                    Includes delivery fee of {confirmation.deliveryFee} ILS
                                </p>
                            )}
                            {confirmation.discount > 0 && (
                                <p className="muted small">
                                    Discount applied: -{confirmation.discount} ILS
                                </p>
                            )}
                        </div>
                    )}

                    <div className="card">
                        <h3>Track an order</h3>
                        <div className="row">
                            <input
                                type="text"
                                value={trackId}
                                onChange={(e) => setTrackId(e.target.value)}
                                placeholder="Order id"
                            />
                            <button className="btn" onClick={track}>
                                Check status
                            </button>
                        </div>
                        {trackError && <div className="banner error">{trackError}</div>}
                        {tracked && (
                            <p className="track-result">
                                Order #{tracked.id} — <strong>{tracked.status}</strong> (
                                {tracked.totalPrice} ILS)
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}