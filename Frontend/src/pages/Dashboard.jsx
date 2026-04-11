import React, { useState, useEffect } from "react";
import {
    TrendingUp,
    TrendingDown,
    PieChart as PieChartIcon,
    LayoutDashboard,
    History,
    Settings,
    LogOut,
    Plus,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Wallet
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { format } from "d3-format";
import PlaidLinkButton from "../components/PlaidLinkButton.jsx";
import StatCard from "../components/StatCard.jsx"
import SidebarItem from "../components/SidebarItem.jsx"
const currencyFormat = format(",.2f");

const performanceData = [
    { date: "2023-10", value: 45000 },
    { date: "2023-11", value: 48200 },
    { date: "2023-12", value: 47500 },
    { date: "2024-01", value: 51000 },
    { date: "2024-02", value: 53800 },
    { date: "2024-03", value: 58200 },
    { date: "2024-04", value: 57400 },
];

const allocationData = [
    { name: "Stocks", value: 35000, color: "#2563eb" },
    { name: "ETFs", value: 15000, color: "#10b981" },
    { name: "Crypto", value: 5000, color: "#f59e0b" },
    { name: "Cash", value: 2400, color: "#64748b" },
];

const assets = [
    { id: 1, name: "Apple Inc.", symbol: "AAPL", type: "Stock", value: 12450.50, change: 2.4, shares: 65 },
    { id: 2, name: "Vanguard S&P 500", symbol: "VOO", type: "ETF", value: 15200.20, change: 1.2, shares: 32 },
    { id: 3, name: "Bitcoin", symbol: "BTC", type: "Crypto", value: 5400.80, change: -4.5, shares: 0.08 },
    { id: 4, name: "Microsoft", symbol: "MSFT", type: "Stock", value: 8200.15, change: 0.8, shares: 20 },
    { id: 5, name: "Tesla", symbol: "TSLA", type: "Stock", value: 4150.40, change: -1.2, shares: 25 },
];

export default function Dashboard() {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [activeTab, setActiveTab] = useState("dashboard");
    const [statInfos, setStatInfos] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const token = localStorage.getItem("jwtToken");

                const accountsResponse = await fetch(
                    `${BACKEND_URL}/accounts/all`,
                    {
                        headers: {Authorization: `Bearer ${token}`}
                    }
                );

                const accountsData = await accountsResponse.json();
                let totalBalance = 0;
                const totalAssets = accountsData.length;

                for (const account of accountsData) {
                    totalBalance += account.balances.current;
                }

                setStatInfos([totalBalance, totalAssets]);
                console.log(statInfos);

            } catch (error) {
                console.error("Loading dashboard failed: ", error);
            } finally{
                setLoading(false);
            }
        }
        loadDashboard();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex text-slate-900 font-sans">
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <TrendingUp className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">FinanceTrack</span>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeTab === "dashboard"}
                        onClick={() => setActiveTab("dashboard")}
                    />
                    <SidebarItem
                        icon={<PieChartIcon size={20} />}
                        label="Portfolio"
                        active={activeTab === "portfolio"}
                        onClick={() => setActiveTab("portfolio")}
                    />
                    <SidebarItem
                        icon={<History size={20} />}
                        label="Transactions"
                        active={activeTab === "transactions"}
                        onClick={() => setActiveTab("transactions")}
                    />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => {
                            localStorage.removeItem("jwtToken");
                            window.location.href = "/login";
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Portfolio Overview</h1>
                        <p className="text-slate-500 mt-1">Welcome back, here's what's happening with your wealth today.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
                            <Plus size={18} />
                            <PlaidLinkButton/>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        label="Total Balance"
                        value={`$${currencyFormat(statInfos[0])}`}
                        change="0%"
                        isPositive={true}
                        icon={<Wallet className="text-blue-600" />}
                    />
                    <StatCard
                        label="Monthly Profit"
                        value={`€${currencyFormat(3600.20)}`}
                        change="+4.2%"
                        isPositive={true}
                        icon={<TrendingUp className="text-emerald-600" />}
                    />
                    <StatCard
                        label="Total Assets"
                        value={statInfos[1]}
                        change="0%"
                        isPositive={false}
                        icon={<PieChartIcon className="text-amber-600" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Portfolio Performance</h3>
                            <div className="flex gap-2">
                                {["1W", "1M", "3M", "1Y", "ALL"].map((period) => (
                                    <button
                                        key={period}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${period === "1M" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
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
                                        tickFormatter={(value) => `€${value/1000}k`}
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
                </div>

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
            </main>
        </div>
    );
}