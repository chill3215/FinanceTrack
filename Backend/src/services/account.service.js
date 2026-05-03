import axios from "axios";
import Account from "../models/Account";
import Bank from "../models/Bank";
import Transaction from "../models/Transaction";
import Holding from "../models/Holding";
import BalanceHistory from "../models/BalanceHistory";
import mongoose from "mongoose";

async function clearImportedDataForBank(bankId) {
    const bankObjectId = new mongoose.Types.ObjectId(bankId);
    const accounts = await Account.find({ bank: bankObjectId })
        .select("_id accountId")
        .lean();

    const accountIds = accounts.map((account) => account.accountId).filter(Boolean);
    const accountObjectIds = accounts.map((account) => account._id);

    if (accountIds.length > 0) {
        await Transaction.deleteMany({ accountId: { $in: accountIds } });
        await Holding.deleteMany({ accountId: { $in: accountIds } });
    }

    if (accountObjectIds.length > 0) {
        await BalanceHistory.deleteMany({ account: { $in: accountObjectIds } });
    }

    await Account.deleteMany({ bank: bankObjectId });
}

async function importAccounts(bankId) {
    const foundedBank = await Bank.findById(bankId);
    const response = await axios.post(
        "https://sandbox.plaid.com/accounts/get",
        {
            "client_id": process.env.PLAID_CLIENT_ID,
            "secret": process.env.PLAID_SECRET,
            "access_token": foundedBank.accessToken
        }
    );
    const accounts = response.data.accounts;
    for (const account of accounts) {
        await Account.findOneAndUpdate(
            {
                accountId: account.account_id,
                bank: foundedBank._id,
            },
            {
            accountId: account.account_id,
            user: foundedBank.user,
            bank: foundedBank._id,
            balances: {
                current: account.balances.current,
                isoCurrencyCode: account.balances.iso_currency_code,
            },
            name: account.name,
            subtype: account.subtype,
            type: account.type
            },
            {
                upsert: true,
                new: true
            }
        );
    }
}

async function getAllAccountsByUserId(userId){
    return Account.find({ user: new mongoose.Types.ObjectId(userId) })
        .select("_id accountId balances name type subtype")
        .lean();
}

async function getAllAccountsByBankId(bankId){
    return Account.find({ bank: new mongoose.Types.ObjectId(bankId) })
        .select("_id accountId balances name type subtype")
        .lean();
}

async function getPortfolio(userId) {
    const accounts = await Account.find({
        user: new mongoose.Types.ObjectId(userId),
    }).select("balances type");
    let total = 0;
    const allocation = {
        "depository": 0,
        "investment": 0,
        "payroll": 0,
        "credit": 0,
        "loan": 0,
        "other": 0,
    }
    accounts.forEach(account => {
        allocation[account.type] += account.balances.current;
        total += account.balances.current;
    });
    return {
        total,
        allocation
    };
}


export default {
    clearImportedDataForBank,
    importAccounts,
    getAllAccountsByUserId,
    getAllAccountsByBankId,
    getPortfolio
}