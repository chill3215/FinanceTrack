import StatCard from "./StatCard.jsx";
import {PieChart as PieChartIcon, TrendingUp, Wallet} from "lucide-react";
import React, {useEffect, useState} from "react";
import {format} from "d3-format";
const currencyFormat = format(",.2f");

function StatSection({ refreshKey }) {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [statInfos, setStatInfos] = useState([]);

    useEffect(() => {
        async function loadStatInfos() {
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
            }
        }
        loadStatInfos();
    }, [refreshKey]);
    return (
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
    )
}

export default StatSection