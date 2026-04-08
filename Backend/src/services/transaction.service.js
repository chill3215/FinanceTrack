import axios from "axios";
import Bank from "../models/Bank";
import Transaction from "../models/Transaction";

const importTransactions = async (bankId) => {
     const foundedBank = await Bank.findById(bankId);
     const response = await axios.post(
         "https://sandbox.plaid.com/transactions/get",
         {
             "client_id": process.env.PLAID_CLIENT_ID,
             "secret": process.env.PLAID_SECRET,
             "access_token": foundedBank.accessToken,
             "start_date": new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split("T")[0],
             "end_date": new Date().toISOString().split("T")[0],
             "options": { "count": 250, "offset": 0}
     });

     const transactions = response.data.transactions;
    for (const transaction of transactions) {
        await Transaction.findOneAndUpdate(
            {
                transactionId: transaction.transaction_id,
                accountId: transaction.account_id,
            },
            {
                accountId: transaction.account_id,
                transactionId: transaction.transaction_id,
                amount: transaction.amount,
                isoCurrencyCode: transaction.iso_currency_code,
                date: transaction.date,
                name: transaction.name,
                merchantName: transaction.merchant_name,
            },
            {
                upsert: true,
                new: true,
            }
        );
    }
}

export default {
    importTransactions,
}