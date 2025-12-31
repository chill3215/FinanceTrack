import express from 'express';
import bodyParser from "body-parser";
import plaidRoutes from "./routes/plaid.js";
import dotenv from "dotenv";
//Path ist relativ zur root gegeben
dotenv.config({path: './.env'});
import cors from "cors";

const app = express();
const PORT = process.env.PORT; // process.env ist ein Obj, das alle Umgebungsvariablen enthält

app.use(cors());

// Test route
app.get("/", (req, res) =>{
    res.send("ping");
})

app.use(bodyParser.json());
app.use("/plaid", plaidRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})