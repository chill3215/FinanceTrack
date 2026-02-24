import dotenv from "dotenv";
//Path ist relativ zur root gegeben
dotenv.config({path: './.env'});
import express from 'express';
import cors from "cors";
//importiert damit die Verbindung initialisiert wird, danach benutze nur models
import db from "./db";
import rateLimit from "express-rate-limit";
import plaidRoutes from "./routes/plaid.routes.js";
import authRoutes from "./routes/auth.routes.js";
import passport from "passport";

const app = express();
const PORT = process.env.PORT || 3000; // process.env ist ein Obj, das alle Umgebungsvariablen enthält

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    // store: ... , // Redis, Memcached, etc. See below.
})

app.use(limiter);
app.use(cors());

// Test route
app.get("/", (req, res) =>{
    res.send("ping");
})

app.use(express.json());
app.use(passport.initialize());
app.use("/auth", authRoutes);
app.use("/plaid", plaidRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
