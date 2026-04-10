import * as notificationService from "../services/notificationService.js";

export async function getNotifications(req, res) {
  try {
    const since = req.query.since || new Date(0).toISOString();

    const notifications = await notificationService.getNotifications(since, {
      userId: req.userId,
      isAdmin: Boolean(req.admin),
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}