import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../store/notification-slice";

import {
  IoNotificationsOutline,
  IoCheckmarkDoneOutline,
  IoTrashOutline,
} from "react-icons/io5";

function Notification() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: notifications, loading } = useSelector(
    (state) => state.notifications,
  );

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const handleMarkAll = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleMarkOne = (id) => {
    dispatch(markNotificationAsRead(id));
    navigate(notifications.find((n) => n._id === id)?.link || "/");
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center self-center gap-2">
            <IoNotificationsOutline className="text-secondary text-2xl sm:text-3xl" />
            Notifications
          </h1>

          <button
            onClick={handleMarkAll}
            className="text-sm text-secondary font-semibold hover:underline self-end sm:self-auto"
          >
            Mark all as read
          </button>
        </div>

        {/* Loading */}
        {loading && <p className="text-gray-500 text-center">Loading...</p>}

        {/* List */}
        <div className="space-y-3">
          {notifications.filter(Boolean).map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkOne(n._id)}
              className={`flex flex-col sm:flex-row items-start gap-2 sm:gap-4 p-4 rounded-xl border cursor-pointer transition-all
              ${
                n.isRead
                  ? "bg-white border-gray-200"
                  : "bg-blue-50 border-blue-100"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 sm:flex hidden items-center justify-center rounded-full
                ${
                  n.isRead
                    ? "bg-gray-100 text-gray-500"
                    : "bg-secondary/10 text-secondary"
                }`}
              >
                {n.isRead ? (
                  <IoCheckmarkDoneOutline className="text-xl" />
                ) : (
                  <IoNotificationsOutline className="text-xl" />
                )}
              </div>

              {/* Content */}
              <div className="hidden sm:flex flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{n.title}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
              </div>
              <button
                onClick={(e) => handleDelete(e, n._id)}
                className="sm:flex hidden text-gray-400 hover:text-red-500 transition"
              >
                <IoTrashOutline className="text-lg" />
              </button>

              {/* Unread dot */}
              {!n.isRead && (
                <span className="sm:flex hidden w-2.5 h-2.5 bg-red-500 rounded-full mt-2" />
              )}
              <div className="sm:hidden flex justify-between w-full">
              <div className="sm:hidden flex items-center gap-4 w-full">
                <div
                  className={`w-10 h-10 sm:hidden flex items-center justify-center rounded-full
                ${
                  n.isRead
                    ? "bg-gray-100 text-gray-500"
                    : "bg-secondary/10 text-secondary"
                }`}
                >
                  {n.isRead ? (
                    <IoCheckmarkDoneOutline className="text-xl" />
                  ) : (
                    <IoNotificationsOutline className="text-xl" />
                  )}
                </div>

                {/* Content */}
                <div className="sm:hidden flex flex-col">
                    <h3 className="font-semibold text-gray-800">{n.title}</h3>
                  <p className="text-sm text-gray-600">{n.message}</p>
                </div>
                
              </div>
              {/* Unread dot */}
                {!n.isRead && (
                  <span className="sm:hidden self-center flex w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
                </div>
              <div className="sm:hidden flex items-center justify-between w-full">
                <span className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
                <button
                  onClick={(e) => handleDelete(e, n._id)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <IoTrashOutline className="text-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty */}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default Notification;
