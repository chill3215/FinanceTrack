import StatCard from "./StatCard.jsx";
import {PieChart as PieChartIcon, TrendingUp, Wallet} from "lucide-react";
import React, {useEffect, useState} from "react";
import {format} from "d3-format";
const currencyFormat = format(",.2f");

function StatSection({ refreshKey }) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [statInfos, setStatInfos] = useState([]);
    const [monthlyProfit, setMonthlyProfit] = useState(null);

    useEffect(() => {
        async function loadStatInfos() {
            try {
                const token = localStorage.getItem("jwtToken");

                const accountsResponse = await fetch(
                    `${BACKEND_URL}/accounts/all`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                const accountsData = await accountsResponse.json();
                let totalBalance = 0;
                const totalAssets = accountsData.length;
                for (const account of accountsData) {
                    totalBalance += account.balances.current;
                }
                setStatInfos([totalBalance, totalAssets]);

                // Fetch monthly balance history
                const monthlyRes = await fetch(
                    `${BACKEND_URL}/balance/monthly`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                const monthlyData = await monthlyRes.json();
                if (Array.isArray(monthlyData) && monthlyData.length >= 2) {
                    // Monthly profit = last month balance - previous month balance
                    const last = monthlyData[monthlyData.length - 1].balance;
                    const prev = monthlyData[monthlyData.length - 2].balance;
                    setMonthlyProfit(last - prev);
                } else {
                    setMonthlyProfit(null);
                }
            } catch (error) {
                console.error("Loading dashboard failed: ", error);
            }
        }
        loadStatInfos();
    }, [refreshKey]);
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
                label="Total Balance"
                value={`€${currencyFormat(statInfos[0])}`}
                change="0%"
                isPositive={true}
                icon={<Wallet className="text-blue-600" />}
            />
            <StatCard
                label="Monthly Profit"
                value={monthlyProfit !== null ? `€${currencyFormat(monthlyProfit)}` : "-"}
                change={monthlyProfit !== null ? `${monthlyProfit >= 0 ? "+" : ""}${((monthlyProfit / (statInfos[0] || 1)) * 100).toFixed(2)}%` : "-"}
                isPositive={monthlyProfit !== null ? monthlyProfit >= 0 : true}
                icon={<TrendingUp className="text-emerald-600" />}
            />
            <StatCard
                label="Accounts"
                value={statInfos[1]}
                change=""
                isPositive={true}
                icon={<PieChartIcon className="text-amber-600" />}
            />
        </div>
    )
}

export default StatSection