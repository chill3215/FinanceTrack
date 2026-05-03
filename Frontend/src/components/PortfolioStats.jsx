import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Briefcase, TrendingUp, Layers, Wallet } from "lucide-react";
import { format } from "d3-format";

const currencyFormat = format(",.2f");

function SummaryCard({ title, value, description, icon, badge, badgePositive }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                    {icon}
                </div>
                {badge !== undefined && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgePositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {badgePositive ? "▲" : "▼"} {badge}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
        </div>
    );
}

export default function PortfolioStats({ refreshKey }) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [holdings, setHoldings] = useState([]);
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        async function load() {
            const token = localStorage.getItem("jwtToken");
            const headers = { Authorization: `Bearer ${token}` };
            try {
                const [holdingsRes, accountsRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/holdings/all`, { headers }),
                    fetch(`${BACKEND_URL}/accounts/all`, { headers }),
                ]);
                setHoldings(holdingsRes.ok ? await holdingsRes.json() : []);
                setAccounts(accountsRes.ok ? await accountsRes.json() : []);
            } catch (e) {
                console.error(e);
            }
        }
        load();
    }, [refreshKey]);

    const normalized = holdings.map((h) => {
        const qty = Number(h.quantity ?? 0);
        const price = Number(h.institutionPrice ?? 0);
        const value = Number(h.institutionValue ?? qty * price);
        const cost = Number(h.costBasis ?? NaN);
        const gain = Number.isFinite(cost) && cost > 0 ? value - cost : 0;
        return { value, cost, gain, type: h.type || "unknown" };
    });

    const totalPortfolioValue = accounts
        .filter(a => a.type === "investment")
        .reduce((s, a) => s + (a.balances?.current ?? 0), 0);

    const cashBalance = accounts
        .filter(a => a.type === "depository")
        .reduce((s, a) => s + (a.balances?.current ?? 0), 0);

    const holdingsValue = normalized.reduce((s, h) => s + h.value, 0);
    const totalCost = normalized.reduce((s, h) => s + (Number.isFinite(h.cost) ? h.cost : 0), 0);
    const totalGain = holdingsValue - totalCost;
    const totalReturn = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    const uniqueTypes = new Set(normalized.map(h => h.type)).size;
    const diversificationScore = Math.min(100, uniqueTypes * 25);

    return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <Briefcase className="text-blue-400" size={20} />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Investment</span>
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Portfolio Value</p>
                    <p className="text-3xl font-bold">€{currencyFormat(totalPortfolioValue)}</p>
                    <p className={`text-xs font-bold mt-2 flex items-center gap-0.5 ${totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {totalReturn >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(totalReturn).toFixed(2)}% all-time return
                    </p>
                </div>
                <div className="mt-8 pt-5 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Holdings Value</span>
                        <span className="font-bold">€{currencyFormat(holdingsValue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Cash & Savings</span>
                        <span className="font-bold">€{currencyFormat(cashBalance)}</span>
                    </div>
                </div>
            </div>
            <SummaryCard
                title="Total Return"
                value={`${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}%`}
                description="Unrealised gain vs cost basis"
                icon={<TrendingUp size={18} />}
                badge={`€${currencyFormat(Math.abs(totalGain))}`}
                badgePositive={totalGain >= 0}
            />
            <SummaryCard
                title="Holdings"
                value={holdings.length}
                description={`Across ${uniqueTypes} asset type${uniqueTypes !== 1 ? "s" : ""}`}
                icon={<Layers size={18} />}
            />
            <SummaryCard
                title="Diversification"
                value={`${diversificationScore}/100`}
                description="Based on asset type spread"
                icon={<Wallet size={18} />}
                badge={`${uniqueTypes} type${uniqueTypes !== 1 ? "s" : ""}`}
                badgePositive={true}
            />
        </div>
    );
}
