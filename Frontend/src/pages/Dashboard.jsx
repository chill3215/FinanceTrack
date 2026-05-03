import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TrendingUp,
    PieChart as PieChartIcon,
    LayoutDashboard,
    History,
    BarChart3,
    LogOut,
    Plus,
    Target,
} from "lucide-react";

import PlaidLinkButton from "../components/PlaidLinkButton.jsx";
import SidebarItem from "../components/SidebarItem.jsx";
import BalanceChart from "../components/BalanceChart.jsx";
import StatSection from "../components/StatSection.jsx";
import PortfolioStats from "../components/PortfolioStats.jsx";
import Portfolio from "../components/Portfolio.jsx";
import PortfolioPage from "./PortfolioPage.jsx";
import SavingsGoalPage from "./SavingsGoalPage.jsx";
import TransactionsPage from "./TransactionsPage.jsx";
import IncomeExpensePage from "./IncomeExpensePage.jsx";

export default function Dashboard({ onLogout }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [refreshKey, setRefreshKey] = useState(0);
    const [bankStatus, setBankStatus] = useState(null); // null | "connecting" | "success" | "error"

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
                    <SidebarItem
                        icon={<Target size={20} />}
                        label="Savings Goals"
                        active={activeTab === "savings-goals"}
                        onClick={() => setActiveTab("savings-goals")}
                    />
                    <SidebarItem
                        icon={<BarChart3 size={20} />}
                        label="Income & Expenses"
                        active={activeTab === "income-expenses"}
                        onClick={() => setActiveTab("income-expenses")}
                    />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => {
                            localStorage.removeItem("jwtToken");
                            if (onLogout) onLogout();
                            navigate("/login", { replace: true });
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === "dashboard" && (
                    <>
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Financial Overview</h1>
                                <p className="text-slate-500 mt-1">Welcome back, here is what is happening with your wealth today.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
                                    <Plus size={18} />
                                    <PlaidLinkButton
                                        onImportSuccess={() => setRefreshKey(prev => prev + 1)}
                                        onConnecting={() => setBankStatus("connecting")}
                                        onConnected={() => {
                                            setBankStatus("success");
                                            setTimeout(() => setBankStatus(null), 4000);
                                        }}
                                        onError={() => setBankStatus("error")}
                                    />
                                </div>
                            </div>
                        </header>

                        {bankStatus && (
                            <div className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                                bankStatus === "connecting" ? "border-blue-200 bg-blue-50 text-blue-700"
                                : bankStatus === "success"  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}>
                                {bankStatus === "connecting" && (
                                    <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                )}
                                {bankStatus === "connecting" && "Connecting to bank…"}
                                {bankStatus === "success"   && "Bank connected successfully!"}
                                {bankStatus === "error"     && "Bank connection failed. Please try again."}
                            </div>
                        )}

                        <StatSection refreshKey={refreshKey} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <BalanceChart refreshKey={refreshKey} />
                            <Portfolio refreshKey={refreshKey} />
                        </div>

                        <PortfolioStats refreshKey={refreshKey} />
                    </>
                )}

                {activeTab === "portfolio" && <PortfolioPage refreshKey={refreshKey} />}
                {activeTab === "savings-goals" && <SavingsGoalPage refreshKey={refreshKey} />}
                {activeTab === "transactions" && <TransactionsPage refreshKey={refreshKey} />}
                {activeTab === "income-expenses" && <IncomeExpensePage refreshKey={refreshKey} />}
            </main>
        </div>
    );
}
