import React, { useEffect, useState, useMemo } from "react";
import { format } from "d3-format";
import { ChevronDown, ChevronUp, Wallet } from "lucide-react";

const currencyFormat = format(",.2f");

function AccountGroup({ account, transactions }) {
    const [open, setOpen] = useState(true);
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = transactions.reduce((s, tx) => s + tx.amount, 0);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wallet size={16} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-slate-800">{account.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{account.type} · {account.subtype || "account"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400">{transactions.length} transactions</span>
                    <span className={`text-sm font-bold ${total <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {total <= 0 ? "+" : "−"}€{currencyFormat(Math.abs(total))}
                    </span>
                    {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
            </button>

            {open && (
                <div className="overflow-x-auto border-t border-slate-100">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sorted.map((tx, i) => (
                                <tr key={tx._id || i} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-3 text-slate-500 text-sm whitespace-nowrap">
                                        {new Date(tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-slate-800 text-sm">{tx.name || tx.description || "—"}</td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                                            {tx.category || "Other"}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-3 text-right font-bold text-sm ${tx.amount < 0 ? "text-emerald-600" : "text-red-500"}`}>
                                        {tx.amount < 0 ? "+" : "−"}€{currencyFormat(Math.abs(tx.amount))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function TransactionsPage({ refreshKey }) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("by-account");

    useEffect(() => {
        async function load() {
            setLoading(true);
            const token = localStorage.getItem("jwtToken");
            const headers = { Authorization: `Bearer ${token}` };
            try {
                const [txRes, accRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/transactions/all`, { headers }),
                    fetch(`${BACKEND_URL}/accounts/all`, { headers }),
                ]);
                if (txRes.ok) setTransactions(await txRes.json());
                if (accRes.ok) setAccounts(await accRes.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [refreshKey]);

    const grouped = useMemo(() => {
        const map = {};
        for (const tx of transactions) {
            if (!map[tx.accountId]) map[tx.accountId] = [];
            map[tx.accountId].push(tx);
        }
        return map;
    }, [transactions]);

    const accountNameById = useMemo(
        () => Object.fromEntries(accounts.map((account) => [account.accountId, account.name || "Unknown Account"])),
        [accounts]
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
                <p className="text-slate-500 mt-1">A history of all your account activity.</p>
            </div>

            {/* Subtabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
                {[
                    { key: "by-account", label: "By Account" },
                    { key: "all", label: "All Transactions" },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                            tab === key ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "by-account" && (
                <>
                    {loading ? (
                        <div className="p-10 text-center text-slate-400 text-sm">Loading transactions…</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm">No transactions found.</div>
                    ) : (
                        accounts
                            .filter(acc => grouped[acc.accountId]?.length > 0)
                            .map(acc => (
                                <AccountGroup
                                    key={acc.accountId}
                                    account={acc}
                                    transactions={grouped[acc.accountId] || []}
                                />
                            ))
                    )}
                </>
            )}

            {tab === "all" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold">All Transactions</h3>
                    </div>
                    {loading ? (
                        <div className="p-10 text-center text-slate-400 text-sm">Loading transactions…</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm">No transactions found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Account</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...transactions]
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((tx, i) => (
                                            <tr key={tx._id || i} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                                                    {new Date(tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                                    {accountNameById[tx.accountId] || tx.accountId || "Unknown Account"}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-800">{tx.name || tx.description || "—"}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                                                        {tx.category || "Other"}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold ${tx.amount < 0 ? "text-emerald-600" : "text-red-500"}`}>
                                                    {tx.amount < 0 ? "+" : "−"}€{currencyFormat(Math.abs(tx.amount))}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
