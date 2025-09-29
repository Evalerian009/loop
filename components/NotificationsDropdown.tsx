//NotificationsDropdown.tsx

"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  PiBellRingingThin,
  PiTrashThin,
  PiCheckThin,
} from "react-icons/pi";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import clsx from "clsx";

import { Doc, Id } from "@/convex/_generated/dataModel";

export function NotificationsDropdown() {
  const router = useRouter();
  const { user } = useUser();

  // Queries
  const notifications = useQuery(
    api.functions.notifications.getForUser,
    user?.id ? { userId: user.id } : "skip"
  );
  const unreadCount = useQuery(
    api.functions.notifications.getUnreadCount,
    user?.id ? { userId: user.id } : "skip"
  );

  // Mutations
  const markAsRead = useMutation(api.functions.notifications.markAsRead);
  const markAllAsRead = useMutation(api.functions.notifications.markAllAsRead);
  const removeNotification = useMutation(api.functions.notifications.remove);
  const clearAllNotifications = useMutation(api.functions.notifications.clearAll);

  // Local state for preventing double-click spam
  const [removing, setRemoving] = useState<Id<"notifications"> | null>(null);
  const [clearing, setClearing] = useState(false);

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllAsRead({ userId: user.id });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleRemoveNotification = async (notificationId: Id<"notifications">) => {
    if (!user?.id || removing === notificationId) return;
    setRemoving(notificationId);
    try {
      await removeNotification({ notificationId, userId: user.id });
    } catch (err) {
      console.error("Failed to remove notification:", err);
    } finally {
      setRemoving(null);
    }
  };

  const handleClearAll = async () => {
    if (!user?.id || clearing) return; // prevent double clear
    setClearing(true);
    try {
      await clearAllNotifications({ userId: user.id });
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    } finally {
      setClearing(false);
    }
  };

  const handleNotificationClick = (n: Doc<"notifications">) => {
    handleMarkAsRead(n._id); // mark read before navigation
    if (n.documentId) {
      let url = `/documents/${n.documentId}`;
      if (n.commentId) url += `?highlightComment=${n.commentId}`;
      router.push(url);
    }
  };

  const getNotificationIcon = (type: Doc<"notifications">["type"]) => {
    switch (type) {
      case "share":
        return "📤";
      case "comment":
        return "💬";
      case "collaborator_joined":
        return "👥";
      default:
        return "🔔"; // fallback
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (!user) return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--bg-secondary)] focus:outline-none"
        aria-label="Notifications"
      >
        <PiBellRingingThin className="w-5 h-5 text-[var(--text)]" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full flex items-center justify-center animate-pulse text-xs text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className="absolute right-0 mt-2 w-90 origin-top-right bg-[var(--bg)] divide-y divide-[var(--muted)] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-96 overflow-y-auto"
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-[var(--text)]">Notifications</h3>
            <div className="flex gap-2">
              {notifications && notifications.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  disabled={clearing}
                  className={clsx(
                    "text-xs hover:text-red-500 flex items-center",
                    clearing
                      ? "text-[var(--muted)] cursor-not-allowed"
                      : "text-[var(--error)]"
                  )}
                  aria-label="Clear all notifications"
                >
                  <PiTrashThin className="h-3 w-3 mr-1" />
                  {clearing ? "Clearing…" : "Clear all"}
                </button>
              )}
              {unreadCount && unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAllAsRead();
                  }}
                  className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center"
                  aria-label="Mark all notifications as read"
                >
                  <PiCheckThin className="h-3 w-3 mr-1" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {notifications && notifications.length > 0 ? (
            <div className="divide-y divide-[var(--muted)]">
              {notifications.map((n: Doc<"notifications">) => (
                <MenuItem key={n._id} as={Fragment}>
                  {({ active }) => (
                    <div
                      className={clsx(
                        "flex items-start p-3 cursor-pointer hover:bg-[var(--bg-secondary)] rounded",
                        active && "bg-[var(--bg-secondary)]"
                      )}
                      role="listitem"
                      onClick={() => handleNotificationClick(n)}
                    >
                      <span className="text-lg mr-2">{getNotificationIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.75rem] w-56 text-[var(--text)]">
                          {n.message}
                        </p>
                        <p className="text-[0.65rem] text-[var(--muted)] mt-1">
                          {formatTimeAgo(n.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {!n.read && (
                          <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNotification(n._id);
                          }}
                          disabled={removing === n._id}
                          className={clsx(
                            "p-1 hover:text-red-500",
                            removing === n._id
                              ? "text-[var(--muted)] cursor-not-allowed"
                              : "text-[var(--muted)]"
                          )}
                          aria-label="Remove notification"
                        >
                          <PiTrashThin className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </MenuItem>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-[var(--muted)]">
              No notifications
            </div>
          )}
        </MenuItems>
      </Transition>
    </Menu>
  );
}