import { Router } from "express";
import {
  getOrCreateChat,
  getMyChats,
  deleteChat,
  getUserInfo
} from "../controllers/chat/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // your existing auth middleware
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// All chat routes require authentication

router.use(verifyJWT);

// GET  /api/v1/chat          → list all my chats
// POST /api/v1/chat          → get or create a chat (idempotent)
router.route("/").get(getMyChats).post(getOrCreateChat);
router.delete("/:chatId", deleteChat);
router.get("/user-info/:userId", getUserInfo);



export default router;