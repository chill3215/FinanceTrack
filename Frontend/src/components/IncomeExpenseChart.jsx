import React, { useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { format } from "d3-format";

const currencyFormat = format(",.0f");

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildMonthly(transactions) {
    const map = {};
    for (const tx of transactions) {
        const d = new Date(tx.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!map[key]) map[key] = { label: MONTH_LABELS[d.getMonth()] + " " + String(d.getFullYear()).slice(2), income: 0, expense: 0 };
        if (tx.amount < 0) map[key].income += Math.abs(tx.amount);
        else map[key].expense += tx.amount;
    }
    return Object.keys(map).sort().slice(-12).map(k => ({
        ...map[k],
        income: Math.round(map[k].income * 100) / 100,
        expense: Math.round(map[k].expense * 100) / 100,
    }));
}

function buildYearly(transactions) {
    const map = {};
    for (const tx of transactions) {
        const year = String(new Date(tx.date).getFullYear());
        if (!map[year]) map[year] = { label: year, income: 0, expense: 0 };
        if (tx.amount < 0) map[year].income += Math.abs(tx.amount);
        else map[year].expense += tx.amount;
    }
    return Object.keys(map).sort().map(k => ({
        ...map[k],
        income: Math.round(map[k].income * 100) / 100,
        expense: Math.round(map[k].expense * 100) / 100,
    }));
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const income = payload.find(p => p.dataKey === "income")?.value ?? 0;
    const expense = payload.find(p => p.dataKey === "expense")?.value ?? 0;
    const net = income - expense;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-sm min-w-[160px]">
            <p className="font-bold text-slate-700 mb-2">{label}</p>
            <div className="space-y-1">
                <div className="flex justify-between gap-6">
                    <span className="text-emerald-600 font-medium">Income</span>
                    <span className="font-bold text-slate-800">€{currencyFormat(income)}</span>
                </div>
                <div className="flex justify-between gap-6">
                    <span className="text-red-500 font-medium">Expense</span>
                    <span className="font-bold text-slate-800">€{currencyFormat(expense)}</span>
                </div>
                <div className="border-t border-slate-100 pt-1 mt-1 flex justify-between gap-6">
                    <span className={`font-bold ${net >= 0 ? "text-emerald-600" : "text-red-500"}`}>Net</span>
                    <span className={`font-bold ${net >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {net >= 0 ? "+" : ""}€{currencyFormat(Math.abs(net))}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function IncomeExpenseChart({ transactions }) {
    const [view, setView] = useState("monthly");

    const data = useMemo(
        () => view === "monthly" ? buildMonthly(transactions) : buildYearly(transactions),
        [transactions, view]
    );

    const totalIncome = data.reduce((s, d) => s + d.income, 0);
    const totalExpense = data.reduce((s, d) => s + d.expense, 0);
    const net = totalIncome - totalExpense;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Income vs Expenses</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Net {net >= 0 ? "savings" : "deficit"}:{" "}
                        <span className={`font-bold ${net >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {net >= 0 ? "+" : ""}€{currencyFormat(Math.abs(net))}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                        {["monthly", "yearly"].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all capitalize ${
                                    view === v ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary pills */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span className="text-xs text-slate-500">Total Income</span>
                    <span className="text-sm font-bold text-emerald-600">€{currencyFormat(totalIncome)}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl">
                    <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                    <span className="text-xs text-slate-500">Total Expenses</span>
                    <span className="text-sm font-bold text-red-500">€{currencyFormat(totalExpense)}</span>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No transaction data.</div>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data} barCategoryGap="30%" barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={v => `€${currencyFormat(v)}`}
                            width={70}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                        <Legend
                            formatter={(value) => <span className="text-xs font-bold text-slate-500 capitalize">{value}</span>}
                            iconType="square"
                            iconSize={10}
                        />
                        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
