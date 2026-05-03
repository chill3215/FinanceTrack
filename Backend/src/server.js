import dotenv from "dotenv";
dotenv.config({path: './.env'});
import express from 'express';
import cors from "cors";
import db from "./db";
import rateLimit from "express-rate-limit";
import plaidRoutes from "./routes/plaid.routes.js";
import authRoutes from "./routes/auth.routes.js";
import holdingRoutes from "./routes/holding.routes.js";
import savingsGoalRoutes from "./routes/savingsGoal.routes.js";
import passport from "passport";
import { setupPassport } from "./auth/passport.js";
import accountRoutes from "./routes/account.routes";
import balanceHistoryRoutes from "./routes/balanceHistory.routes";
import transactionRoutes from "./routes/transaction.routes";

setupPassport();

const app = express();
const PORT = process.env.PORT || 3000; // process.env ist ein Obj, das alle Umgebungsvariablen enthält

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    skip: () => true, // rate limiting disabled
})

app.use(limiter);
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://finance-track-phi.vercel.app"
    ],
    credentials: true
}));

// Test route
app.get("/", (req, res) =>{
    res.send("ping");
})

app.use(express.json());
app.use(passport.initialize());
app.use("/auth", authRoutes);
app.use("/plaid", plaidRoutes);
app.use("/accounts", accountRoutes);
app.use("/balance", balanceHistoryRoutes);
app.use("/holdings", holdingRoutes);
app.use("/savings-goals", savingsGoalRoutes);
app.use("/transactions", transactionRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
