import { Notification } from "../../models/notification.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const createNotification = asyncHandler(async (data) => {
  const notification = await Notification.create(data);
  return notification;
});


export const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(50);

  return res.status(200).json({
    success: true,
    data: notifications,
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return res.status(200).json({
    success: true,
    data: count,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json({
    success: true,
    data: notification,
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );

  return res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  await Notification.findOneAndDelete({
    _id: id,
    recipient: userId,
  });

  return res.status(200).json({
    success: true,
    message: "Notification deleted",
  });
});