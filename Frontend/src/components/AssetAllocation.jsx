import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import React from "react";
import {format} from "d3-format";
const currencyFormat = format(",.2f");
const allocationData = [
    { name: "Stocks", value: 35000, color: "#2563eb" },
    { name: "ETFs", value: 15000, color: "#10b981" },
    { name: "Crypto", value: 5000, color: "#f59e0b" },
    { name: "Cash", value: 2400, color: "#64748b" },
];

function AssetAllocation({ refreshKey }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Asset Allocation</h3>
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
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-xs text-slate-500 font-medium block">Total</span>
                    <span className="text-xl font-bold">€57.4k</span>
                </div>
            </div>
            <div className="space-y-3 mt-4">
                {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="font-medium text-slate-700">{item.name}</span>
                        </div>
                        <span className="font-bold">€{currencyFormat(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AssetAllocation;