import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import React, {useEffect, useState} from "react";
import {format} from "d3-format";
const currencyFormat = format(",.2f");

function formatToShortCurrency(num) {
    return num.toLocaleString("en-US", {
        notation: "compact",
        maximumFractionDigits: 2
    })
}

function Portfolio({ refreshKey}) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [total, setTotal] = useState(0);
    const [allocationData, setAllocationData] = useState([]);
    const mapping = {
        investment: { name: "Investments", color: "#2563eb" },
        depository: { name: "Cash", color: "#10b981" },
        credit: { name: "Credit", color: "#f43f5e" },
        loan: { name: "Loans", color: "#f59e0b" },
        payroll: { name: "Payroll", color: "#8b5cf6" },
        other: { name: "Other", color: "#64748b" }
    };

    function CustomTooltip({active, payload}) {
        if (!active) return null;
        const data = payload[0].payload;
        return (
            <div className="bg-white p-2 border rounded shadow">
                <p>{data.name}: {data.percent.toFixed(1)}%</p>
            </div>
        )
    }

    useEffect(() => {
        async function loadData() {
            try {
                const token = localStorage.getItem("jwtToken");
                const res = await fetch(
                    `${BACKEND_URL}/accounts/portfolio`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                if (!res.ok) {
                    throw new Error("Fail to load asset allocation data: " + await res.json().catch(() => ({})));
                }
                const data = await res.json();
                setTotal(data.total);
                const formatted = Object.entries(data.allocation).map(([type, value]) => ({
                    name: mapping[type]?.name || type,
                    value,
                    percent: (value / data.total) * 100,
                    color: mapping[type]?.color || "#ccc",
                }));
                setAllocationData(formatted);
            } catch (error) {
                console.error(error);
            }
        }

        loadData();

    }, [refreshKey]);

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Financial Portfolio</h3>
            <div className="h-[240px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {allocationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={CustomTooltip}/>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-xs text-slate-500 font-medium block">Total</span>
                    <span className="text-xl font-bold">${formatToShortCurrency(total)}</span>
                </div>
            </div>
            <div className="space-y-3 mt-4">
                {allocationData.filter(item => item.value > 0).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="font-medium text-slate-700">{item.name}</span>
                        </div>
                        <span className="font-bold">${currencyFormat(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Portfolio;