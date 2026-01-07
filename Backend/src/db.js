import dotenv from "dotenv";
dotenv.config();
import mongoose from 'mongoose';


// Verbindung zur MongoDB erstellen
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected successfully"))
.catch(err => {
    console.error("MongoDB connect error:", err);
    process.exit(1); // stop server if connection fails
});

export default mongoose;
