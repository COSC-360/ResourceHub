import * as adminAnalyticsService from "../services/adminAnalyticsService.js";

export async function getLastWeek(req, res) {
  try {
    const data = await adminAnalyticsService.getLastWeekDailyCounts();
    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load analytics" });
  }
}
