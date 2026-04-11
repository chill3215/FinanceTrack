import {ArrowDownRight, ArrowUpRight} from "lucide-react";
import React from "react";
import { format } from "d3-format";
const assets = [
    { id: 1, name: "Apple Inc.", symbol: "AAPL", type: "Stock", value: 12450.50, change: 2.4, shares: 65 },
    { id: 2, name: "Vanguard S&P 500", symbol: "VOO", type: "ETF", value: 15200.20, change: 1.2, shares: 32 },
    { id: 3, name: "Bitcoin", symbol: "BTC", type: "Crypto", value: 5400.80, change: -4.5, shares: 0.08 },
    { id: 4, name: "Microsoft", symbol: "MSFT", type: "Stock", value: 8200.15, change: 0.8, shares: 20 },
    { id: 5, name: "Tesla", symbol: "TSLA", type: "Stock", value: 4150.40, change: -1.2, shares: 25 },
];
const currencyFormat = format(",.2f");

function AssetsTable({ refreshKey }) {
    return (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold">Your Assets</h3>
                <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                        <th className="px-6 py-4">Asset</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Shares</th>
                        <th className="px-6 py-4">Value</th>
                        <th className="px-6 py-4">Change</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {assets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600 group-hover:bg-white transition-colors">
                                        {asset.symbol[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{asset.name}</div>
                                        <div className="text-xs text-slate-500">{asset.symbol}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {asset.type}
                      </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700">
                                €{currencyFormat(asset.value / asset.shares)}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                {asset.shares}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900">
                                €{currencyFormat(asset.value)}
                            </td>
                            <td className="px-6 py-4">
                                <div className={`flex items-center gap-1 font-bold text-sm ${asset.change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    {asset.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {Math.abs(asset.change)}%
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AssetsTable;