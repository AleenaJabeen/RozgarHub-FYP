export const formatLastSeen = (lastActiveAt) => {
  if (!lastActiveAt) return "Last seen a while ago";

  const now = new Date();
  const last = new Date(lastActiveAt);
  const diffMs = now - last;
  const diffMins = Math.floor(diffMs / 60000);

  // Just now
  if (diffMins < 1) return "last seen just now";

  // Within an hour
  if (diffMins < 60) return `last seen ${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

  // Shared time formatting options for clean 12-hour AM/PM
  const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };

  // Today
  const isToday = last.toDateString() === now.toDateString();
  if (isToday) {
    const time = last.toLocaleTimeString([], timeOptions);
    return `last seen today at ${time}`;
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = last.toDateString() === yesterday.toDateString();
  if (isYesterday) {
    const time = last.toLocaleTimeString([], timeOptions); // Fixed: Now strictly 12-hour with AM/PM
    return `last seen yesterday at ${time}`;
  }

  // Older — show date
  return `last seen ${last.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}`;
};