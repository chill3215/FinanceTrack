import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import React, { useEffect, useState } from "react";
import { format } from "d3-format";
const currencyFormat = format(",.2f");

const PERIODS = ["Weekly", "Monthly", "Yearly"];

function BalanceChart({ refreshKey }) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [performanceData, setPerformanceData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadChart() {
            setLoading(true);
            try {
                const token = localStorage.getItem("jwtToken");
                const res = await fetch(
                    `${BACKEND_URL}/balance/${selectedPeriod.toLowerCase()}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                setPerformanceData(data.map(item => ({ date: item.label, value: item.balance })));
            } catch (err) {
                console.error("Chart load failed:", err);
            } finally {
                setLoading(false);
            }
        }
        loadChart();
    }, [selectedPeriod, refreshKey]);

    const latest = performanceData.at(-1)?.value ?? 0;
    const first = performanceData.at(0)?.value ?? 0;
    const change = latest - first;
    const changePct = first !== 0 ? ((change / Math.abs(first)) * 100).toFixed(2) : "0.00";
    const isPositive = change >= 0;

    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <p className="text-sm text-slate-500 font-medium">Portfolio Performance</p>
                    <h2 className="text-2xl font-bold text-slate-900">€{currencyFormat(latest)}</h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                        isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                    }`}>
                        {isPositive ? "+" : ""}{changePct}% {selectedPeriod === "Weekly" ? "this period" : selectedPeriod === "Monthly" ? "vs first month" : "overall"}
                    </span>
                </div>
                <div className="flex gap-2">
                    {PERIODS.map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                selectedPeriod === period
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                    : "text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[280px] w-full mt-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? "#2563eb" : "#ef4444"} stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor={isPositive ? "#2563eb" : "#ef4444"} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                dy={8}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                tickFormatter={(v) => `€${(v / 1000).toFixed(1)}k`}
                                domain={["dataMin - 500", "dataMax + 500"]}
                                width={60}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    fontSize: "13px"
                                }}
                                formatter={(value) => [`€${currencyFormat(value)}`, "Balance"]}
                                labelStyle={{ color: "#64748b", fontWeight: 600 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={isPositive ? "#2563eb" : "#ef4444"}
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                dot={false}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default BalanceChart;