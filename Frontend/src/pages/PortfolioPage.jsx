import React, { useEffect, useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "d3-format";

const currencyFormat = format(",.2f");

export default function PortfolioPage({ refreshKey }) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [holdings, setHoldings] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const token = localStorage.getItem("jwtToken");
            const headers = { Authorization: `Bearer ${token}` };
            try {
                const [holdingsRes, accountsRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/holdings/all`, { headers }),
                    fetch(`${BACKEND_URL}/accounts/all`, { headers }),
                ]);
                const holdingsData = holdingsRes.ok ? await holdingsRes.json() : [];
                const accountsData = accountsRes.ok ? await accountsRes.json() : [];
                setHoldings(holdingsData);
                setAccounts(accountsData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [refreshKey]);

    const normalized = holdings.map((h, i) => {
        const qty = Number(h.quantity ?? 0);
        const price = Number(h.institutionPrice ?? 0);
        const value = Number(h.institutionValue ?? qty * price);
        const cost = Number(h.costBasis ?? NaN);
        const change = Number.isFinite(cost) && cost > 0 ? ((value - cost) / cost) * 100 : 0;
        const gain = Number.isFinite(cost) && cost > 0 ? value - cost : 0;
        const symbol = h.tickerSymbol || h.securityId || "N/A";
        return { id: h._id || i, name: h.name || symbol, symbol, type: h.type || "unknown", qty, price, value, cost, change, gain };
    });

    const holdingsValue = normalized.reduce((s, h) => s + h.value, 0);
    const weightDenominator = holdingsValue > 0 ? holdingsValue : 1;
    const colorClasses = [
        "bg-blue-100 text-blue-700",
        "bg-emerald-100 text-emerald-700",
        "bg-amber-100 text-amber-700",
        "bg-rose-100 text-rose-700",
        "bg-indigo-100 text-indigo-700",
        "bg-cyan-100 text-cyan-700",
    ];

    const assets = [...normalized]
        .sort((a, b) => b.value - a.value)
        .map((asset, i) => ({
            ...asset,
            shares: asset.qty,
            color: colorClasses[i % colorClasses.length],
        }));

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Portfolio</h1>
                <p className="text-slate-500 mt-1">Track your investments and account allocations.</p>
            </div>

            {/* Accounts */}
            <div className="mb-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4">Accounts</h3>
                    {accounts.length === 0 && !loading && (
                        <p className="text-slate-400 text-sm">No accounts found.</p>
                    )}
                    <div className="space-y-3">
                        {accounts.map((acc, i) => (
                            <div key={acc._id || i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Wallet size={16} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{acc.name}</p>
                                        <p className="text-xs text-slate-400 capitalize">{acc.type} · {acc.subtype || "account"}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-slate-900">€{currencyFormat(acc.balances?.current ?? 0)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Holdings table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Holding Details</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Summary of your top performance investments</p>
                    </div>
                    <button className="text-blue-600 text-sm font-bold hover:underline">View Full Portfolio</button>
                </div>
                {loading ? (
                    <div className="p-10 text-center text-slate-400 text-sm">Loading holdings…</div>
                ) : assets.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-sm">No holdings found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                                    <th className="px-6 py-4">Asset Name</th>
                                    <th className="px-6 py-4 text-center">Weight</th>
                                    <th className="px-6 py-4 text-center">Shares</th>
                                    <th className="px-6 py-4 text-right">Market Value</th>
                                    <th className="px-6 py-4 text-right">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {assets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 ${asset.color} rounded-xl flex items-center justify-center font-bold text-sm shadow-sm`}>
                                                    {asset.symbol?.[0] ?? "?"}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{asset.name}</div>
                                                    <div className="text-xs text-slate-500 group-hover:text-blue-600 transition-colors">{asset.symbol}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${Math.min(100, (asset.value / weightDenominator) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {((asset.value / weightDenominator) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center text-sm font-medium text-slate-600">
                                            {asset.shares}
                                        </td>
                                        <td className="px-6 py-5 text-right font-bold text-slate-900 text-sm">
                                            €{currencyFormat(asset.value)}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-lg ${
                                                asset.change >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                            }`}>
                                                {asset.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {Math.abs(asset.change).toFixed(2)}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
