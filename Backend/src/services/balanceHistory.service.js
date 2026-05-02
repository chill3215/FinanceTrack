import Account from "../models/Account";
import Transaction from "../models/Transaction";
import BalanceHistory from "../models/BalanceHistory";
import mongoose from "mongoose";
import Bank from "../models/Bank";

async function buildInitialHistoryForBank(bankId) {
    const accounts = await Account.find({bank: new mongoose.Types.ObjectId(bankId) }).lean();

    for (const account of accounts) {
        try {
            const transactions = await Transaction.find({
                accountId: account.accountId,
            })
                .sort({date: -1})
                .select("date amount")
                .lean();

            let runningBalance = account.balances.current;

            const monthlyMap = new Map();

            for (const transaction of transactions) {
                const date = new Date(transaction.date);

                const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

                if (!monthlyMap.has(monthKey)) {
                    monthlyMap.set(monthKey, {
                        account: new mongoose.Types.ObjectId(account._id),
                        date: new Date(date.getFullYear(), date.getMonth(), 1),
                        balance: runningBalance,
                    });
                }

                runningBalance -= transaction.amount;
            }

            const history = Array.from(monthlyMap.values()).reverse();

            if (history.length > 0) {
                const result = await BalanceHistory.insertMany(history, { ordered: false });
                console.log(`Inserted ${result.length} entries`);
            }
        } catch (error){
            console.log(`History build for account ${account._id} failed`)
        }
    }
}

async function getMonthlyBalanceOfUser(userId) {
    try {
        const banks = await Bank.find({ user: new mongoose.Types.ObjectId(userId) }).select("_id");
        const bankIds = banks.map(b => b._id);
        const accounts = await Account.find({ bank: { $in: bankIds } }).select("accountId balances");
        const accountIds = accounts.map(a => a.accountId);

        // Get all transactions sorted by date ascending
        const transactions = await Transaction.find({ accountId: { $in: accountIds } })
            .sort({ date: 1 })
            .select("date amount");

        // Group transactions by month
        const monthlyMap = new Map();
        let runningBalance = 0;
        let lastMonthKey = null;

        for (const tx of transactions) {
            const date = new Date(tx.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            runningBalance += tx.amount;
            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, { label: `${date.getMonth() + 1}/${date.getFullYear()}`, balance: 0 });
            }
            monthlyMap.get(monthKey).balance = runningBalance;
            lastMonthKey = monthKey;
        }

        // If there are no transactions, use current balance
        if (monthlyMap.size === 0) {
            const currentTotalBalance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0);
            const now = new Date();
            return [{ label: `${now.getMonth() + 1}/${now.getFullYear()}`, balance: currentTotalBalance }];
        }

        // Fill missing months between first and last
        const keys = Array.from(monthlyMap.keys()).sort((a, b) => {
            const [ay, am] = a.split('-').map(Number);
            const [by, bm] = b.split('-').map(Number);
            return ay !== by ? ay - by : am - bm;
        });
        const result = [];
        let prevBalance = 0;
        let [startYear, startMonth] = keys[0].split('-').map(Number);
        let [endYear, endMonth] = keys[keys.length - 1].split('-').map(Number);
        for (let y = startYear; y <= endYear; y++) {
            let mStart = y === startYear ? startMonth : 1;
            let mEnd = y === endYear ? endMonth : 12;
            for (let m = mStart; m <= mEnd; m++) {
                const key = `${y}-${m}`;
                if (monthlyMap.has(key)) {
                    prevBalance = monthlyMap.get(key).balance;
                }
                result.push({ label: `${m}/${y}`, balance: prevBalance });
            }
        }
        return result;
    } catch (error) {
        console.error("Get monthly balance of users failed:", error);
        return [];
    }
}

async function getWeeklyBalanceOfUser(userId) {
    try {
        const banks = await Bank.find({ user: new mongoose.Types.ObjectId(userId) }).select("_id");
        const bankIds = banks.map(b => b._id);
        const accounts = await Account.find({ bank: { $in: bankIds } }).select("accountId balances");
        const accountIds = accounts.map(a => a.accountId);

        // Get all transactions sorted by date ascending
        const transactions = await Transaction.find({ accountId: { $in: accountIds } })
            .sort({ date: 1 })
            .select("date amount");

        // Group transactions by ISO week
        const weekMap = new Map();
        let runningBalance = 0;
        let lastWeekKey = null;
        function getISOWeek(date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
            return { year: d.getUTCFullYear(), week: weekNum };
        }
        for (const tx of transactions) {
            const date = new Date(tx.date);
            const { year, week } = getISOWeek(date);
            const weekKey = `${year}-W${week}`;
            runningBalance += tx.amount;
            if (!weekMap.has(weekKey)) {
                weekMap.set(weekKey, { label: `W${week}/${year}`, balance: 0 });
            }
            weekMap.get(weekKey).balance = runningBalance;
            lastWeekKey = weekKey;
        }
        if (weekMap.size === 0) {
            const currentTotalBalance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0);
            const now = new Date();
            const { year, week } = getISOWeek(now);
            return [{ label: `W${week}/${year}`, balance: currentTotalBalance }];
        }
        // Fill missing weeks between first and last
        const keys = Array.from(weekMap.keys()).sort();
        const result = [];
        let prevBalance = 0;
        let [startYear, startWeek] = keys[0].split('-W').map(Number);
        let [endYear, endWeek] = keys[keys.length - 1].split('-W').map(Number);
        for (let y = startYear; y <= endYear; y++) {
            let wStart = y === startYear ? startWeek : 1;
            let wEnd = y === endYear ? endWeek : 53;
            for (let w = wStart; w <= wEnd; w++) {
                const key = `${y}-W${w}`;
                if (weekMap.has(key)) {
                    prevBalance = weekMap.get(key).balance;
                }
                result.push({ label: `W${w}/${y}`, balance: prevBalance });
            }
        }
        return result;
    } catch (error) {
        console.error("Get weekly balance failed:", error);
        return [];
    }
}

async function getYearlyBalanceOfUser(userId) {
    try {
        const banks = await Bank.find({ user: new mongoose.Types.ObjectId(userId) }).select("_id");
        const bankIds = banks.map(b => b._id);
        const accounts = await Account.find({ bank: { $in: bankIds } }).select("accountId balances");
        const accountIds = accounts.map(a => a.accountId);

        // Get all transactions sorted by date ascending
        const transactions = await Transaction.find({ accountId: { $in: accountIds } })
            .sort({ date: 1 })
            .select("date amount");

        // Group transactions by year
        const yearMap = new Map();
        let runningBalance = 0;
        let lastYearKey = null;
        for (const tx of transactions) {
            const date = new Date(tx.date);
            const yearKey = `${date.getFullYear()}`;
            runningBalance += tx.amount;
            if (!yearMap.has(yearKey)) {
                yearMap.set(yearKey, { label: `${date.getFullYear()}`, balance: 0 });
            }
            yearMap.get(yearKey).balance = runningBalance;
            lastYearKey = yearKey;
        }
        if (yearMap.size === 0) {
            const currentTotalBalance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0);
            const now = new Date();
            return [{ label: `${now.getFullYear()}`, balance: currentTotalBalance }];
        }
        // Fill missing years between first and last
        const keys = Array.from(yearMap.keys()).sort((a, b) => Number(a) - Number(b));
        const result = [];
        let prevBalance = 0;
        let startYear = Number(keys[0]);
        let endYear = Number(keys[keys.length - 1]);
        for (let y = startYear; y <= endYear; y++) {
            const key = `${y}`;
            if (yearMap.has(key)) {
                prevBalance = yearMap.get(key).balance;
            }
            result.push({ label: `${y}`, balance: prevBalance });
        }
        return result;
    } catch (error) {
        console.error("Get yearly balance failed:", error);
        return [];
    }
}

async function getHistory(accountId) {
    return BalanceHistory.find({
        account: accountId
    }).sort({date: 1}).lean();
}

export default {
    buildInitialHistoryForBank,
    getMonthlyBalanceOfUser,
    getWeeklyBalanceOfUser,
    getYearlyBalanceOfUser,
    getHistory
}