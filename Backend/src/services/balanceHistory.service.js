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
                await BalanceHistory.insertMany(history, { ordered: false });
            }
        } catch (error){
            console.error(`History build for account ${account._id} failed:`, error.message);
        }
    }
}

async function getMonthlyBalanceOfUser(userId) {
    try {
        const banks = await Bank.find({ user: new mongoose.Types.ObjectId(userId) }).select("_id");
        const bankIds = banks.map(b => b._id);
        const accounts = await Account.find({ bank: { $in: bankIds } }).select("accountId balances");
        const accountIds = accounts.map(a => a.accountId);
        const currentTotalBalance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0);

        // Aggregate net change per month, sorted newest first
        const monthlyFlow = await Transaction.aggregate([
            { $match: { accountId: { $in: accountIds } } },
            { $group: {
                _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                netChange: { $sum: "$amount" }
            }},
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        if (monthlyFlow.length === 0) {
            const now = new Date();
            return [{ label: `${now.getMonth() + 1}/${now.getFullYear()}`, balance: currentTotalBalance }];
        }

        // Work backwards from current balance
        let runningBalance = currentTotalBalance;
        const monthlyMap = new Map();
        for (const item of monthlyFlow) {
            const key = `${item._id.year}-${item._id.month}`;
            monthlyMap.set(key, { label: `${item._id.month}/${item._id.year}`, balance: runningBalance });
            runningBalance -= item.netChange;
        }

        // Fill missing months and return in ascending order
        const keys = Array.from(monthlyMap.keys()).sort((a, b) => {
            const [ay, am] = a.split('-').map(Number);
            const [by, bm] = b.split('-').map(Number);
            return ay !== by ? ay - by : am - bm;
        });
        const result = [];
        let prevBalance = monthlyMap.get(keys[0]).balance;
        let [startYear, startMonth] = keys[0].split('-').map(Number);
        let [endYear, endMonth] = keys[keys.length - 1].split('-').map(Number);
        for (let y = startYear; y <= endYear; y++) {
            let mStart = y === startYear ? startMonth : 1;
            let mEnd = y === endYear ? endMonth : 12;
            for (let m = mStart; m <= mEnd; m++) {
                const key = `${y}-${m}`;
                if (monthlyMap.has(key)) prevBalance = monthlyMap.get(key).balance;
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
        const currentTotalBalance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0);

        // Aggregate net change per ISO week, sorted newest first
        const weeklyFlow = await Transaction.aggregate([
            { $match: { accountId: { $in: accountIds } } },
            { $group: {
                _id: { year: { $isoWeekYear: "$date" }, week: { $isoWeek: "$date" } },
                netChange: { $sum: "$amount" }
            }},
            { $sort: { "_id.year": -1, "_id.week": -1 } }
        ]);

        if (weeklyFlow.length === 0) {
            const now = new Date();
            const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            return [{ label: `W${week}/${d.getUTCFullYear()}`, balance: currentTotalBalance }];
        }

        // Work backwards from current balance
        let runningBalance = currentTotalBalance;
        const weekMap = new Map();
        for (const item of weeklyFlow) {
            const key = `${item._id.year}-W${item._id.week}`;
            weekMap.set(key, { label: `W${item._id.week}/${item._id.year}`, balance: runningBalance });
            runningBalance -= item.netChange;
        }

        const keys = Array.from(weekMap.keys()).sort();
        const result = [];
        let prevBalance = weekMap.get(keys[0]).balance;
        let [startYear, startWeek] = keys[0].split('-W').map(Number);
        let [endYear, endWeek] = keys[keys.length - 1].split('-W').map(Number);
        for (let y = startYear; y <= endYear; y++) {
            let wStart = y === startYear ? startWeek : 1;
            let wEnd = y === endYear ? endWeek : 53;
            for (let w = wStart; w <= wEnd; w++) {
                const key = `${y}-W${w}`;
                if (weekMap.has(key)) prevBalance = weekMap.get(key).balance;
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
        const currentTotalBalance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0);

        // Aggregate net change per year, sorted newest first
        const yearlyFlow = await Transaction.aggregate([
            { $match: { accountId: { $in: accountIds } } },
            { $group: {
                _id: { year: { $year: "$date" } },
                netChange: { $sum: "$amount" }
            }},
            { $sort: { "_id.year": -1 } }
        ]);

        if (yearlyFlow.length === 0) {
            const now = new Date();
            return [{ label: `${now.getFullYear()}`, balance: currentTotalBalance }];
        }

        // Work backwards from current balance
        let runningBalance = currentTotalBalance;
        const yearMap = new Map();
        for (const item of yearlyFlow) {
            const key = `${item._id.year}`;
            yearMap.set(key, { label: `${item._id.year}`, balance: runningBalance });
            runningBalance -= item.netChange;
        }

        const keys = Array.from(yearMap.keys()).sort((a, b) => Number(a) - Number(b));
        const result = [];
        let prevBalance = yearMap.get(keys[0]).balance;
        let startYear = Number(keys[0]);
        let endYear = Number(keys[keys.length - 1]);
        for (let y = startYear; y <= endYear; y++) {
            const key = `${y}`;
            if (yearMap.has(key)) prevBalance = yearMap.get(key).balance;
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