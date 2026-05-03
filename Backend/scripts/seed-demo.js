import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../src/models/User.js";
import Bank from "../src/models/Bank.js";
import Account from "../src/models/Account.js";
import Transaction from "../src/models/Transaction.js";
import Holding from "../src/models/Holding.js";

dotenv.config();

const DEMO_USER = {
    email: "demo@fintrack.app",
    password: "Demo123!",
    name: "Demo User",
};

function daysAgo(days) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - days);
    return d;
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function round2(value) {
    return Math.round(value * 100) / 100;
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);

    try {
        let demoUser = await User.findOne({ email: DEMO_USER.email });

        if (!demoUser) {
            const hashed = await bcrypt.hash(DEMO_USER.password, 10);
            demoUser = await User.create({
                email: DEMO_USER.email,
                password: hashed,
                name: DEMO_USER.name,
            });
            console.log("Created demo user:", DEMO_USER.email);
        } else {
            console.log("Using existing demo user:", DEMO_USER.email);
        }

        const oldBanks = await Bank.find({ user: demoUser._id }).select("_id").lean();
        const oldBankIds = oldBanks.map((b) => b._id);
        const oldAccounts = await Account.find({ bank: { $in: oldBankIds } }).select("accountId _id").lean();
        const oldAccountIds = oldAccounts.map((a) => a.accountId);

        if (oldAccountIds.length > 0) {
            await Transaction.deleteMany({ accountId: { $in: oldAccountIds } });
            await Holding.deleteMany({ accountId: { $in: oldAccountIds } });
        }

        if (oldBankIds.length > 0) {
            await Account.deleteMany({ bank: { $in: oldBankIds } });
            await Bank.deleteMany({ _id: { $in: oldBankIds } });
        }

        const bank = await Bank.create({
            user: demoUser._id,
            name: "Demo National Bank",
            institutionId: "demo_bank_main",
            accessToken: "demo_access_token",
            itemId: "demo_item_id",
        });

        const accounts = await Account.insertMany([
            {
                user: demoUser._id,
                bank: bank._id,
                accountId: "demo_checking_001",
                name: "Everyday Checking",
                balances: { current: 3824.57, isoCurrencyCode: "EUR" },
                subtype: "checking",
                type: "depository",
            },
            {
                user: demoUser._id,
                bank: bank._id,
                accountId: "demo_savings_001",
                name: "High Yield Savings",
                balances: { current: 12450.12, isoCurrencyCode: "EUR" },
                subtype: "savings",
                type: "depository",
            },
            {
                user: demoUser._id,
                bank: bank._id,
                accountId: "demo_invest_001",
                name: "Long-Term Portfolio",
                balances: { current: 21990.34, isoCurrencyCode: "EUR" },
                subtype: "brokerage",
                type: "investment",
            },
        ]);

        const accountIdMap = Object.fromEntries(accounts.map((a) => [a.name, a.accountId]));

        const transactions = [];

        for (let i = 180; i >= 0; i--) {
            const date = daysAgo(i);

            if (date.getDate() === 1) {
                transactions.push({
                    transactionId: `salary_${date.toISOString().slice(0, 10)}`,
                    accountId: accountIdMap["Everyday Checking"],
                    amount: 3200,
                    isoCurrencyCode: "EUR",
                    date,
                    name: "Salary",
                    merchantName: "Demo Employer GmbH",
                });
            }

            if (date.getDay() === 6) {
                transactions.push({
                    transactionId: `groceries_${date.toISOString().slice(0, 10)}`,
                    accountId: accountIdMap["Everyday Checking"],
                    amount: round2(-randomBetween(45, 120)),
                    isoCurrencyCode: "EUR",
                    date,
                    name: "Groceries",
                    merchantName: "Fresh Market",
                });
            }

            if (date.getDate() === 5) {
                transactions.push({
                    transactionId: `rent_${date.toISOString().slice(0, 10)}`,
                    accountId: accountIdMap["Everyday Checking"],
                    amount: -1150,
                    isoCurrencyCode: "EUR",
                    date,
                    name: "Rent",
                    merchantName: "City Apartments",
                });
            }

            if (date.getDate() === 10) {
                transactions.push({
                    transactionId: `savings_transfer_${date.toISOString().slice(0, 10)}`,
                    accountId: accountIdMap["High Yield Savings"],
                    amount: 500,
                    isoCurrencyCode: "EUR",
                    date,
                    name: "Monthly Savings",
                    merchantName: "Internal Transfer",
                });
            }

            if (date.getDate() === 15) {
                transactions.push({
                    transactionId: `invest_contrib_${date.toISOString().slice(0, 10)}`,
                    accountId: accountIdMap["Long-Term Portfolio"],
                    amount: 700,
                    isoCurrencyCode: "EUR",
                    date,
                    name: "Investment Contribution",
                    merchantName: "Broker Transfer",
                });
            }

            if (date.getDate() % 9 === 0) {
                transactions.push({
                    transactionId: `invest_pnl_${date.toISOString().slice(0, 10)}`,
                    accountId: accountIdMap["Long-Term Portfolio"],
                    amount: round2(randomBetween(-180, 280)),
                    isoCurrencyCode: "EUR",
                    date,
                    name: "Market P/L",
                    merchantName: "Portfolio Revaluation",
                });
            }
        }

        await Transaction.insertMany(transactions);

        await Holding.insertMany([
            {
                accountId: accountIdMap["Long-Term Portfolio"],
                securityId: "sec_msft",
                tickerSymbol: "MSFT",
                name: "Microsoft Corp.",
                type: "equity",
                quantity: 18,
                institutionPrice: 415.72,
                institutionValue: 7482.96,
                costBasis: 6200,
            },
            {
                accountId: accountIdMap["Long-Term Portfolio"],
                securityId: "sec_vwce",
                tickerSymbol: "VWCE",
                name: "FTSE All-World UCITS ETF",
                type: "etf",
                quantity: 42,
                institutionPrice: 122.48,
                institutionValue: 5144.16,
                costBasis: 4600,
            },
            {
                accountId: accountIdMap["Long-Term Portfolio"],
                securityId: "sec_tsla",
                tickerSymbol: "TSLA",
                name: "Tesla Inc.",
                type: "equity",
                quantity: 12,
                institutionPrice: 201.55,
                institutionValue: 2418.6,
                costBasis: 2800,
            },
            {
                accountId: accountIdMap["Long-Term Portfolio"],
                securityId: "sec_btc",
                tickerSymbol: "BTC",
                name: "Bitcoin",
                type: "crypto",
                quantity: 0.11,
                institutionPrice: 63344,
                institutionValue: 6967.84,
                costBasis: 5400,
            },
        ]);

        console.log("Demo data seeded successfully.");
        console.log("Demo login email:", DEMO_USER.email);
        console.log("Demo login password:", DEMO_USER.password);
        console.log("Accounts:", accounts.length);
        console.log("Transactions:", transactions.length);
    } finally {
        await mongoose.disconnect();
    }
}

seed().catch(async (err) => {
    console.error("Seed failed:", err);
    await mongoose.disconnect();
    process.exit(1);
});
