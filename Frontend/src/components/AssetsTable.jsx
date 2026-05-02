import {ArrowDownRight, ArrowUpRight} from "lucide-react";
import React, { useEffect, useState } from "react";
import { format } from "d3-format";
const currencyFormat = format(",.2f");

function normalizeHolding(holding, index) {
    const quantity = Number(holding.quantity ?? 0);
    const priceFromPlaid = Number(holding.institutionPrice ?? NaN);
    const rawValue = Number(holding.institutionValue ?? NaN);
    const costBasis = Number(holding.costBasis ?? NaN);

    const value = Number.isFinite(rawValue)
        ? rawValue
        : Number.isFinite(quantity) && Number.isFinite(priceFromPlaid)
            ? quantity * priceFromPlaid
            : 0;

    const price = Number.isFinite(priceFromPlaid)
        ? priceFromPlaid
        : quantity > 0
            ? value / quantity
            : 0;

    const change = Number.isFinite(costBasis) && costBasis > 0
        ? ((value - costBasis) / costBasis) * 100
        : 0;

    const symbol = holding.tickerSymbol || holding.securityId || "N/A";
    return {
        id: holding._id || `${holding.securityId}-${index}`,
        name: holding.name || symbol || "Unknown asset",
        symbol,
        type: holding.type || "Unknown",
        price,
        shares: Number.isFinite(quantity) ? quantity : 0,
        value,
        change,
    };
}

function AssetsTable({ refreshKey }) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [assets, setAssets] = useState([]);

    useEffect(() => {
        async function loadHoldings() {
            try {
                const token = localStorage.getItem("jwtToken");
                const response = await fetch(`${BACKEND_URL}/holdings/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Holdings fetch failed: ${response.status}`);
                }

                const data = await response.json();
                console.log("Fetched holdings:", data);
                
                if (data.length === 0) {
                    // Try to import holdings automatically
                    console.log("No holdings found, attempting to import...");
                    try {
                        const importResponse = await fetch(`${BACKEND_URL}/holdings/import-all`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        });
                        
                        if (importResponse.ok) {
                            const importResult = await importResponse.json();
                            console.log("Import result:", importResult);
                            
                            // Fetch holdings again after import
                            const retryResponse = await fetch(`${BACKEND_URL}/holdings/all`, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                },
                            });
                            
                            if (retryResponse.ok) {
                                const retryData = await retryResponse.json();
                                setAssets(retryData.map(normalizeHolding));
                            }
                        }
                    } catch (importError) {
                        console.error("Failed to import holdings:", importError);
                    }
                } else {
                    setAssets(data.map(normalizeHolding));
                }
            } catch (err) {
                console.error("Failed to load holdings:", err);
            }
        }

        loadHoldings();
    }, [refreshKey, BACKEND_URL]);

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
                    {assets.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                No holdings available
                            </td>
                        </tr>
                    ) : (
                        assets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600 group-hover:bg-white transition-colors">
                                            {asset.symbol?.[0] ?? "A"}
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
                                    €{currencyFormat(asset.price)}
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
                                        {Math.abs(asset.change).toFixed(2)}%
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AssetsTable;