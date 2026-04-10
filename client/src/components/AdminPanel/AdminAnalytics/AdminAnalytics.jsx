import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiClient } from "../../../lib/api-client";
import "./AdminAnalytics.css";

function formatDayLabel(isoDate) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function WeekMetricCard({ title, value, caption }) {
  return (
    <section className="admin-analytics-card admin-analytics-stat-card" aria-label={title}>
      <h2 className="admin-analytics-card-title">{title}</h2>
      <p className="admin-analytics-metric-hero">{value}</p>
      <p className="admin-analytics-stat-metric">
        <span className="admin-analytics-stat-label">{caption}</span>
      </p>
    </section>
  );
}

function LeaderStatCard({ title, leader, variant }) {
  const active = leader && leader.postsAndComments > 0;
  return (
    <section className="admin-analytics-card admin-analytics-stat-card" aria-label={title}>
      <h2 className="admin-analytics-card-title">{title}</h2>
      {active ? (
        <>
          <p className="admin-analytics-stat-main">
            {variant === "user" ? leader.username : leader.name}
          </p>
          {variant === "course" && leader.code ? (
            <p className="admin-analytics-stat-sub">{leader.code}</p>
          ) : null}
          <p className="admin-analytics-stat-metric">
            <span className="admin-analytics-stat-value">{leader.postsAndComments}</span>
            <span className="admin-analytics-stat-label"> combined posts & comments</span>
          </p>
        </>
      ) : (
        <p className="admin-analytics-muted admin-analytics-stat-empty">No activity yet</p>
      )}
    </section>
  );
}

function MiniLineChart({ title, dataKey, color, data, loading }) {
  return (
    <section className="admin-analytics-card" aria-label={title}>
      <h2 className="admin-analytics-card-title">{title}</h2>
      <div className="admin-analytics-chart-wrap">
        {loading ? (
          <p className="admin-analytics-muted">Loading…</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis allowDecimals={false} width={36} tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                name={title}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    let cancelled = false;

    apiClient("/api/analytics/week", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => {
        if (cancelled) return;
        setPayload(response?.data ?? null);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Could not load analytics.");
        setPayload(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    const days = payload?.days;
    if (!Array.isArray(days)) return [];
    return days.map((row) => ({
      ...row,
      label: formatDayLabel(row.date),
    }));
  }, [payload]);

  return (
    <div className="admin-analytics">
      <header className="admin-analytics-header">
        <h1>Analytics</h1>
      </header>

      {loading && <p>Loading charts…</p>}
      {!loading && error && <p className="admin-analytics-error">{error}</p>}

      {!loading && !error && payload && (payload.weekDiscussionEngagement || payload.leaders) && (
        <div className="admin-analytics-leaders">
          {payload.weekDiscussionEngagement && (
            <>
              <WeekMetricCard
                title="Active users (7 days)"
                value={payload.weekDiscussionEngagement.distinctUsers}
                caption="Distinct users who posted or commented"
              />
              <WeekMetricCard
                title="Courses with activity (7 days)"
                value={payload.weekDiscussionEngagement.distinctCourses}
                caption="Distinct courses with at least one post or comment"
              />
            </>
          )}
          {payload.leaders && (
            <>
              <LeaderStatCard
                title="Most active user"
                leader={payload.leaders.mostActiveUser}
                variant="user"
              />
              <LeaderStatCard
                title="Most active course"
                leader={payload.leaders.mostActiveCourse}
                variant="course"
              />
            </>
          )}
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <div className="admin-analytics-grid">
          <MiniLineChart
            title="Comments"
            dataKey="comments"
            color="#7c3aed"
            data={chartData}
            loading={false}
          />
          <MiniLineChart
            title="New users"
            dataKey="newUsers"
            color="#0d9488"
            data={chartData}
            loading={false}
          />
          <MiniLineChart
            title="Posts"
            dataKey="posts"
            color="#2563eb"
            data={chartData}
            loading={false}
          />
          <MiniLineChart
            title="Courses created"
            dataKey="coursesCreated"
            color="#c2410c"
            data={chartData}
            loading={false}
          />
        </div>
      )}
    </div>
  );
}

export default AdminAnalytics;
