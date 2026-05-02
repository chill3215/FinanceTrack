import mongoose from "mongoose";
import Account from "../models/Account";
import Bank from "../models/Bank";
import Holding from "../models/Holding";
import axios from "axios";

// user -> all accounts -> holdings
async function getAllHoldingsByUserId(userId) {
    console.log('Getting holdings for userId:', userId);
    
    const accounts = await Account.find(
        { user: new mongoose.Types.ObjectId(userId) },
        { accountId: 1 }
    ).lean();
    
    console.log('Found accounts:', accounts);

    const accountIds = accounts
        .map((account) => account.accountId)
        .filter(Boolean);
        
    console.log('Extracted accountIds:', accountIds);

    if (!accountIds.length) {
        console.log('No accountIds found, returning empty array');
        return [];
    }

    const holdings = await Holding.find({ accountId: { $in: accountIds } }).lean();
    console.log('Found holdings:', holdings);
    
    return holdings;
}

async function importHoldings(bankId) {
    const bank = await Bank.findById(bankId);
    if (!bank) {
        throw new Error('Bank not found');
    }

    const response = await axios.post(
        "https://sandbox.plaid.com/investments/holdings/get",
        {
            "client_id": process.env.PLAID_CLIENT_ID,
            "secret": process.env.PLAID_SECRET,
            "access_token": bank.accessToken
        },
        { headers: { 'Content-Type': 'application/json' } }
    );

    const holdings = response.data.holdings;
    const securities = response.data.securities;

    // Create a map of security_id to security data for easy lookup
    const securityMap = {};
    securities.forEach(security => {
        securityMap[security.security_id] = security;
    });

    for (const holding of holdings) {
        const security = securityMap[holding.security_id];
        
        await Holding.findOneAndUpdate(
            {
                accountId: holding.account_id,
                securityId: holding.security_id,
            },
            {
                accountId: holding.account_id,
                securityId: holding.security_id,
                tickerSymbol: security?.ticker_symbol || holding.security_id,
                quantity: holding.quantity,
                costBasis: holding.cost_basis,
                institutionPrice: holding.institution_price,
                institutionValue: holding.institution_value,
                name: security?.name || holding.security_id,
                type: security?.security_type || security?.type || 'unknown',
            },
            {
                upsert: true,
                new: true
            }
        );
    }

    return holdings.length;
}

export default {
    getAllHoldingsByUserId,
    importHoldings,
};
