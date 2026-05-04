import 'dotenv/config'; 
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";

connectDB(); // MongoDB connect

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes); // Route prefix

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Dev2.O Server running on port ${PORT}`));