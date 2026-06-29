// Single page with three role areas (Customer / Employee / Delivery) selected bytabs.

import { useEffect, useState } from 'react';
import { getMenu } from './api.js';
import CustomerScreen from './components/CustomerScreen.jsx';
import EmployeeScreen from './components/EmployeeScreen.jsx';
import DeliveryScreen from './components/DeliveryScreen.jsx';

const TABS = [
    { id: 'customer', label: 'Customer' },
    { id: 'employee', label: 'Restaurant employee' },
    { id: 'delivery', label: 'Delivery' },
];

export default function App() {
    const [role, setRole] = useState('customer');
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        getMenu()
            .then((m) => {
                if (active) setMenu(m);
            })
            .catch((err) => {
                if (active) setError(err.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="app">
            <header className="app-header">
                <h1>Pizza Ordering</h1>
                <nav className="tabs">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            className={`tab ${role === t.id ? 'active' : ''}`}
                            onClick={() => setRole(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>
            </header>

            <main className="app-main">
                {loading && <div className="banner">Loading menu…</div>}
                {error && (
                    <div className="banner error">
                        Could not load the menu from the server: {error}
                    </div>
                )}

                {!loading && !error && menu && (
                    <>
                        {role === 'customer' && <CustomerScreen menu={menu} />}
                        {role === 'employee' && <EmployeeScreen />}
                        {role === 'delivery' && <DeliveryScreen />}
                    </>
                )}
            </main>
        </div>
    );
}