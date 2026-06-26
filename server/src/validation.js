// Base validation for POST /api/orders: it resolves
// the pizza/size/topping ids that arrive from the client against the real menu and
// returns a fully-resolved order. The personal rule (rules.js) runs afterwards.

import { findPizza, findSize, findTopping } from './menu.js';

// Global cap, in effect BEFORE the pair's personal rule.
const MAX_TOPPINGS_GLOBAL = 3;

export function validateAndEnrich(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { ok: false, errors: ['Request body must be a JSON object'] };
    }

    const { customerName, phone, deliveryAddress, pizzas } = body;
    const errors = [];

    if (!isNonEmptyString(customerName)) errors.push('customerName is required');
    if (!isNonEmptyString(phone)) errors.push('phone is required');
    if (!isNonEmptyString(deliveryAddress)) errors.push('deliveryAddress is required');
    if (!Array.isArray(pizzas) || pizzas.length === 0) {
        errors.push('pizzas must be a non-empty array (at least one pizza)');
    }

    // If the structure itself is broken we cannot resolve items — stop here.
    if (errors.length > 0) return { ok: false, errors };

    const items = [];
    pizzas.forEach((p, idx) => {
        const where = `pizzas[${idx}]`;

        if (!p || typeof p !== 'object') {
            errors.push(`${where}: must be an object`);
            return;
        }

        const pizza = findPizza(p.pizzaId);
        if (!pizza) {
            errors.push(`${where}: unknown pizzaId "${p.pizzaId}"`);
            return;
        }

        const size = findSize(p.size);
        if (!size) {
            errors.push(`${where}: unknown or missing size "${p.size}"`);
            return;
        }

        const rawToppings = Array.isArray(p.toppings) ? p.toppings : [];
        if (rawToppings.length > MAX_TOPPINGS_GLOBAL) {
            errors.push(`${where}: a pizza may have at most ${MAX_TOPPINGS_GLOBAL} toppings`);
        }

        const toppings = [];
        rawToppings.forEach((tid) => {
            const t = findTopping(tid);
            if (!t) {
                errors.push(`${where}: unknown topping "${tid}"`);
                return;
            }
            toppings.push({ id: t.id, name: t.name, price: t.price });
        });

        items.push({
            pizzaId: pizza.id,
            pizzaName: pizza.name,
            basePrice: pizza.price,
            sizeId: size.id,
            sizeName: size.name,
            sizePrice: size.price,
            toppings,
        });
    });

    if (errors.length > 0) return { ok: false, errors };

    const order = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items,
    };

    return { ok: true, order };
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}