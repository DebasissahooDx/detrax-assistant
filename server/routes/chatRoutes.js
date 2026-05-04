import express from "express";
import { 
  chatHandler, 
  getHistoryHandler, 
  deleteHistoryHandler,
  deleteMessageHandler 
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", chatHandler);
router.get("/history", getHistoryHandler);
router.delete("/history", deleteHistoryHandler);
router.delete("/:id", deleteMessageHandler); // Route for individual deletion

export default router;