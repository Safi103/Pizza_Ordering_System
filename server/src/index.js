import express from 'express';
import cors from 'cors';
import { MENU } from './menu.js';
import { validateAndEnrich } from './validation.js';
import { priceOrder } from './pricing.js';
import { applyPersonalValidation, getActiveRule } from './rules.js';
import { createOrder, getOrder, listOrders, updateStatus } from './store.js';


const app = express();
app.use(cors());         // register the cors middleware
app.use(express.json()); // register express's built-in JSON parser

// --- GET /api/menu ---------------------------------------------------------
// Returns the catalog. The client renders the menu from this response.
app.get('/api/menu', (req, res) => {
    res.status(200).json(MENU);
});


// --- POST /api/orders ------------------------------------------------------
// Creates an order. Body must contain exactly: 
// (customerName, phone, deliveryAddress, pizzas)
// The server validates, prices and stores it.
app.post('/api/orders', (req, res) => {
    // 1) base validation + resolve ids against the menu
    const result = validateAndEnrich(req.body);
    if (!result.ok) {
        return res.status(400).json({ error: 'Invalid order', details: result.errors });
    }

    // 2) the pair personal validation rule
    const ruleError = applyPersonalValidation(result.order);
    if (ruleError) {
        return res.status(400).json({ error: 'Invalid order', details: [ruleError] });
    }

    // 3) server-side pricing
    const breakdown = priceOrder(result.order.items);

    // 4) store and return the created order
    const order = createOrder({
        customerName: result.order.customerName,
        phone: result.order.phone,
        deliveryAddress: result.order.deliveryAddress,
        items: breakdown.items,
        pizzasSubtotal: breakdown.pizzasSubtotal,
        discount: breakdown.discount,
        deliveryFee: breakdown.deliveryFee,
        totalPrice: breakdown.total,
    });

    res.status(201).json(order);
});

// --- GET /api/orders?status=<a,b>  OR  GET /api/orders ----------------------
// Filters by status. Supports a single status (e.g. ?status=ready) or a
// comma-separated list (e.g. ?status=new,preparing). No status = all orders.
// When nothing matches, returns an empty array.
app.get('/api/orders', (req, res) => {
    const { status } = req.query;
    const statuses = status
        ? String(status)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : null;
    res.status(200).json(listOrders(statuses));
});

// --- GET /api/orders/:id ---------------------------------------------------
app.get('/api/orders/:id', (req, res) => {
    const order = getOrder(req.params.id);
    if (!order) {
        return res.status(404).json({ error: `Order ${req.params.id} not found` });
    }
    res.status(200).json(order);
});

// --- PATCH /api/orders/:id/status ------------------------------------------
// Body must contain a "status" field, e.g. { "status": "preparing" }.
// 404 if the order is missing, 400 if the field/value is bad, 409 if the
// transition is illegal.
app.patch('/api/orders/:id/status', (req, res) => {
    const target = req.body && req.body.status;
    if (typeof target !== 'string') {
        return res.status(400).json({ error: 'Body must contain a "status" string' });
    }
    const r = updateStatus(req.params.id, target);
    if (!r.ok) {
        return res.status(r.code).json({ error: r.error });
    }
    res.status(200).json(r.order);
});

const PORT = process.env.PORT || 3001; // use env. var. port if one is set or 3001

// start the server and listen for incoming connections on chosen PORT
app.listen(PORT, () => {
    console.log(`Pizza server listening on http://localhost:${PORT}`);
});


export default app;