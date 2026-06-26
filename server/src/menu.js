// The catalog (pizzas, sizes, toppings).
// The client MUST fetch this via GET /api/menu.

export const MENU = {
  pizzas: [
    { id: 'margherita', name: 'Margherita', price: 35 },
    { id: 'vegetarian', name: 'Vegetarian', price: 39 },
    { id: 'pepperoni', name: 'Pepperoni', price: 42 },
  ],
  sizes: [
    { id: 'small', name: 'Small', price: 0 },
    { id: 'medium', name: 'Medium', price: 8 },
    { id: 'large', name: 'Large', price: 15 },
  ],
  toppings: [
    { id: 'olives', name: 'Olives', price: 4 },
    { id: 'mushrooms', name: 'Mushrooms', price: 4 },
    { id: 'corn', name: 'Corn', price: 4 },
    { id: 'onion', name: 'Onion', price: 4.5 },
    { id: 'extra_cheese', name: 'Extra Cheese', price: 3.5 },
  ],
};

export function findPizza(id) {
  return MENU.pizzas.find((p) => p.id === id) || null;
}

export function findSize(id) {
  return MENU.sizes.find((s) => s.id === id) || null;
}

export function findTopping(id) {
  return MENU.toppings.find((t) => t.id === id) || null;
}