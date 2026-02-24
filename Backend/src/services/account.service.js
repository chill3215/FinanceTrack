import axios from "axios";
import Account from "../models/Account";
import Bank from "../models/Bank";

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
                accountId: account.accountId,
                bank: foundedBank._id,
            },
            {
            accountId: account.account_id,
            user: foundedBank.user,
            bank: foundedBank._id,
            balances: {
                current: account.balances.current,
                isoCurrencyCode: account.balances.isoCurrencyCode
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

export default {importAccounts}