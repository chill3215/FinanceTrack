import dotenv from "dotenv";
dotenv.config();
import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Bank from './src/models/Bank.js';
import Holding from './src/models/Holding.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log("MongoDB connected successfully");

    // Check banks
    const banks = await Bank.find({}).lean();
    console.log('Total banks:', banks.length);
    console.log('Sample banks:', banks.slice(0, 2));

    // Check accounts
    const accounts = await Account.find({}).lean();
    console.log('Total accounts:', accounts.length);

    // Check holdings
    const holdings = await Holding.find({}).lean();
    console.log('Total holdings:', holdings.length);

    process.exit(0);
})
.catch(err => {
    console.error("MongoDB connect error:", err);
    process.exit(1);
});