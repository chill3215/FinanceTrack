import React, { useEffect, useState } from "react";
import IncomeExpenseChart from "../components/IncomeExpenseChart.jsx";

export default function IncomeExpensePage({ refreshKey }) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const token = localStorage.getItem("jwtToken");
            try {
                const res = await fetch(`${BACKEND_URL}/transactions/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    setTransactions(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [BACKEND_URL, refreshKey]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Income & Expenses</h1>
                <p className="text-slate-500 mt-1">Compare how much comes in and goes out across months and years.</p>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center text-slate-400 text-sm">
                    Loading income and expense data…
                </div>
            ) : (
                <IncomeExpenseChart transactions={transactions} />
            )}
        </div>
    );
}