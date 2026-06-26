// In-memory order store + the order state machine.
// All data lives only in process memory and resets when the server restarts

export const ORDER_STATES = ['new', 'preparing', 'ready', 'delivered'];

const NEXT = {
    new: ['preparing'],
    preparing: ['ready'],
    ready: ['delivered'],
    delivered: [],
};

const orders = new Map(); // id (number) -> order
let nextId = 1;

export function createOrder(data) {
    const id = nextId++;
    const order = {
        id,
        customerName: data.customerName,
        phone: data.phone,
        deliveryAddress: data.deliveryAddress,
        items: data.items,
        pizzasSubtotal: data.pizzasSubtotal,
        discount: data.discount,
        deliveryFee: data.deliveryFee,
        totalPrice: data.totalPrice,
        status: 'new', // every new order starts here
        paymentStatus: 'paid', // payment is simulated on the client
        createdAt: new Date().toISOString(),
    };
    orders.set(id, order);
    return order;
}

export function getOrder(id) {
    return orders.get(Number(id)) || null;
}

// statuses: array of status strings, or null/empty for "all".
export function listOrders(statuses) {
    const all = Array.from(orders.values());
    if (!statuses || statuses.length === 0) return all;
    const wanted = new Set(statuses);
    return all.filter((o) => wanted.has(o.status));
}

export function isValidState(state) {
    return ORDER_STATES.includes(state);
}

// Returns { ok, code, order?, error? } so the route can map directly to HTTP.
export function updateStatus(id, target) {
    const order = getOrder(id);
    if (!order) {
        return { ok: false, code: 404, error: `Order ${id} not found` };
    }
    if (!isValidState(target)) {
        return { ok: false, code: 400, error: `Invalid status "${target}"` };
    }
    const allowed = NEXT[order.status] || [];
    if (!allowed.includes(target)) {
        return {
            ok: false,
            code: 409,
            error: `Illegal status transition: "${order.status}" -> "${target}"`,
        };
    }
    order.status = target;
    return { ok: true, code: 200, order };
}