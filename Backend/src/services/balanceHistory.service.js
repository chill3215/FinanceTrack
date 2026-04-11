import Account from "../models/Account";
import Transaction from "../models/Transaction";
import BalanceHistory from "../models/BalanceHistory";
import mongoose from "mongoose";

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

async function getHistory(accountId) {
    return BalanceHistory.find({
        account: accountId
    }).sort({date: 1}).lean();
}

export default {
    buildInitialHistoryForBank,
    getHistory
}