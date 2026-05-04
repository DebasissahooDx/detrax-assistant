import { getAIResponse } from "../utils/ai.js";
import Chat from "../models/Chat.js";

export const chatHandler = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is required." });

    const prompt = `System: You are Detrax, a professional AI assistant created by Debasis. 
    Instructions:
    1. Respond strictly in English. 
    2. Do not use any Hindi words or scripts. 
    3. Keep responses concise (under 3 sentences).
    4. Avoid using special characters like * or #.
    
    User: ${message}`;

    let aiReply = await getAIResponse(prompt);
    aiReply = aiReply.replace(/\*\*|\*|__|#/g, "").trim();

    const newChat = new Chat({
      userMessage: message,
      aiMessage: aiReply
    });
    await newChat.save();

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ reply: "Server error." });
  }
};

export const getHistoryHandler = async (req, res) => {
  try {
    const history = await Chat.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs." });
  }
};

// NEW: Delete specific message by ID
export const deleteMessageHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await Chat.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Delete failed." });
  }
};

export const deleteHistoryHandler = async (req, res) => {
  try {
    await Chat.deleteMany({});
    res.json({ message: "All logs purged." });
  } catch (error) {
    res.status(500).json({ error: "Purge failed." });
  }
};