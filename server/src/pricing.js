// The place where the order total is computed


export function priceOrder(items) {
    // Per-item breakdown: base pizza + size surcharge + toppings.
    const breakdownItems = items.map((it) => {
        const toppingsPrice = it.toppings.reduce((sum, t) => sum + t.price, 0);
        const lineTotal = it.basePrice + it.sizePrice + toppingsPrice;
        return {
            ...it,
            toppingsPrice: round(toppingsPrice),
            lineTotal: round(lineTotal),
        };
    });

    const pizzasSubtotal = round(
        breakdownItems.reduce((sum, it) => sum + it.lineTotal, 0)
    );

    // No deliveryFee or discount but added them to document this
    const deliveryFee = 0;
    const discount = 0;

    const total = round(pizzasSubtotal + deliveryFee - discount);

    return {
        items: breakdownItems,
        pizzasSubtotal,
        discount: round(discount),
        deliveryFee: round(deliveryFee),
        total,
    };
}

function round(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}