import React, { useState, useEffect } from "react";
import {
    TrendingUp,
    PieChart as PieChartIcon,
    LayoutDashboard,
    History,
    LogOut,
    Plus,
} from "lucide-react";

import PlaidLinkButton from "../components/PlaidLinkButton.jsx";
import SidebarItem from "../components/SidebarItem.jsx"
import BalanceChart from "../components/BalanceChart.jsx";
import AssetAllocation from "../components/AssetAllocation.jsx";
import AssetsTable from "../components/AssetsTable.jsx";
import StatSection from "../components/StatSection.jsx";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [refreshKey, setRefreshKey] = useState(0);

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
                            <PlaidLinkButton
                                onImportSuccess={() => setRefreshKey(preKey => preKey + 1)}
                            />
                        </div>
                    </div>
                </header>

                <StatSection refreshKey={refreshKey}/>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <BalanceChart refreshKey={refreshKey}/>
                    <AssetAllocation refreshKey={refreshKey}/>
                </div>

                <AssetsTable refreshKey={refreshKey}/>
            </main>
        </div>
    );
}