import axios from "axios";
import Account from "../models/Account";
import Bank from "../models/Bank";
import mongoose from "mongoose";

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
        .select("_id balances name type")
        .lean();
}

async function getAllAccountsByBankId(bankId){
    return Account.find({ bank: new mongoose.Types.ObjectId(bankId) })
        .select("_id balances name type")
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
    importAccounts,
    getAllAccountsByUserId,
    getAllAccountsByBankId,
    getPortfolio
}