import express from "express";
import {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessageForEveryone,
  deleteMessageForMe,
  editMessage
} from "../controllers/chat/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
  "/send",
  verifyJWT,
  upload.single("file"), // image/video/audio
  sendMessage
);

router.get("/:chatId/messages",verifyJWT, getMessages);
router.put("/read", verifyJWT, markAsRead);
router.delete("/:messageId", verifyJWT, deleteMessageForEveryone);
router.patch("/:messageId", verifyJWT, editMessage);
router.delete("/me/:messageId", verifyJWT, deleteMessageForMe);
export default router;