import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userMessage: { type: String, required: true },
  aiMessage: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);