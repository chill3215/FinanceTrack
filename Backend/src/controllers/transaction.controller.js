import Transaction from "../models/Transaction";
import Account from "../models/Account";
import mongoose from "mongoose";

const getAllTransactionsFromUser = async (req, res) => {
    try {
        const accounts = await Account.find(
            { user: new mongoose.Types.ObjectId(req.userId) },
            { accountId: 1 }
        ).lean();
        const accountIds = accounts.map(a => a.accountId).filter(Boolean);
        if (!accountIds.length) return res.json([]);
        const transactions = await Transaction.find({ accountId: { $in: accountIds } })
            .sort({ date: -1 })
            .lean();
        return res.json(transactions);
    } catch (error) {
        console.error(error);
        return res.status(500).json("Fetch transactions failed");
    }
};

export default { getAllTransactionsFromUser };
