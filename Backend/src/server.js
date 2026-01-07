import dotenv from "dotenv";
//Path ist relativ zur root gegeben
dotenv.config({path: './.env'});
import express from 'express';
import cors from "cors";
//importiert damit die Verbindung initialisiert wird, danach benutze nur models
import db from "./db";
import plaidRoutes from "./routes/plaid.routes.js";
import authRoutes from "./routes/auth.routes";
import passport from "passport";

const app = express();
const PORT = process.env.PORT; // process.env ist ein Obj, das alle Umgebungsvariablen enthält

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
