//  Personal Rule 5: an order may contain at most 5 pizzas.
// ---
//  It is a validation rule: it runs on the resolved order (its items are
//  already matched against the menu in validation.js) and returns an error
//  string to reject the order, or null when the order is fine.
// ---
//  The global cap of 3 toppings per pizza is enforced separately in
//  validation.js and is always in effect, independently of this rule.

export const PERSONAL_RULE = {
  id: 5,
  description: 'Cannot order more than 5 pizzas in one order',
};

// Returns the active personal rule (kept as a function so index.js can log it).
export function getActiveRule() {
  return PERSONAL_RULE;
}

// Personal validation rule: reject an order that has more than 5 pizzas.
// Returns an error string to reject the order, or null to accept it.
export function applyPersonalValidation(order) {
  if (order.items.length > 5) {
    return 'Rule(5): cannot order more than 5 pizzas in one order';
  }
  return null;
}
