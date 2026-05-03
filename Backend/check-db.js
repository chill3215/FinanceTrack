import dotenv from "dotenv";
dotenv.config();
import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Bank from './src/models/Bank.js';
import Holding from './src/models/Holding.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(async () => {

    // Check banks
    const banks = await Bank.find({}).lean();

    // Check accounts
    const accounts = await Account.find({}).lean();

    // Check holdings
    const holdings = await Holding.find({}).lean();

    process.exit(0);
})
.catch(err => {
    console.error("MongoDB connect error:", err);
    process.exit(1);
});