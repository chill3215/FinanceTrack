import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import React, {useEffect, useState} from "react";
import {format} from "d3-format";
const currencyFormat = format(",.2f");

function BalanceChart({ refreshKey }) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [performanceData, setPerformanceData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState("Monthly");

    useEffect(() => {
        async function loadChart() {
            try {
                const token = localStorage.getItem("jwtToken");

                const res = await fetch(
                    `${BACKEND_URL}/balance/${selectedPeriod.toLowerCase()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await res.json();

                setPerformanceData(
                    data.map(item => ({
                        date: item.label,
                        value: item.balance
                    }))
                );

            } catch (err) {
                console.error("Chart load failed:", err);
            }
        }

        loadChart();
    }, [selectedPeriod, refreshKey]);
    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Portfolio Performance</h3>
                <div className="flex gap-2">
                    {["Weekly", "Monthly", "Yearly"].map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${selectedPeriod ===period ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                            tickFormatter={(value) =>
                                `€${(value / 1000).toFixed(2)}k`
                            }
                            domain={['dataMin - 500', 'dataMax + 500']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            formatter={(value) => [`€${currencyFormat(value)}`, "Value"]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

    )
}

export default BalanceChart;