
import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Users,
  CalendarDays,
  ReceiptText,
  BedDouble,
  RefreshCw
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { api } from "../api";
import MetricCard from "../components/MetricCard";
import Panel from "../components/Panel";
import { Loading, ErrorState, EmptyState } from "../components/State";


export default function Dashboard() {
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    if (force) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    const options = force ? { force: true } : {};

    try {
      const [overview, trendData, los] = await Promise.all([
        api.overview(options),
        api.trends(null, null, options),
        api.losSummary(options)
      ]);

      if (
        !overview.success ||
        !trendData.success ||
        !los.success
      ) {
        throw new Error("One or more dashboard requests returned an unsuccessful response.");
      }

      setData({
        ...overview.data,
        los: los.data
      });

      setTrends(trendData.data);

    } catch (e) {
      console.error("Dashboard loading error:", e);

      if (!data) {
        setError(e.message || "Unable to load dashboard data.");
      } else {
        setError(
          "Unable to refresh some dashboard data. Previously loaded information is still displayed."
        );
      }

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [data]);

  useEffect(() => {
    load();
  }, []);

  if (loading && !data) {
    return <Loading />;
  }

  if (error && !data) {
    return <ErrorState message={error} />;
  }

  const flow = (trends?.patient_flow || [])
    .slice(-14)
    .map((item) => ({
      date: String(item.flow_date).slice(5),
      visits: Number(item.visit_entries || 0)
    }));

  const fmt = (value) =>
    Number(value || 0).toLocaleString();

  const los = data?.los || {};

  return (
    <div className="page-stack">

      {/* PAGE HEADER */}

      <div className="page-title-row">
        <div>
          <p className="eyebrow">OVERVIEW</p>

          <h1>Executive dashboard</h1>

          <p className="page-subtitle">
            Historical hospital activity and operational indicators
            from the analytics database.
          </p>
        </div>

        <button
          className="quiet-button"
          onClick={() => load(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={refreshing ? "spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* REFRESH ERROR */}

      {error && data && (
        <div className="notice">
          <span>{error}</span>
        </div>
      )}

      {/* KPI CARDS */}

      <div className="metric-grid">

        <MetricCard
          label="Total patient records"
          value={fmt(data.total_patients)}
          icon={Users}
        />

        <MetricCard
          label="Total visit records"
          value={fmt(data.total_visits)}
          icon={Activity}
        />

        <MetricCard
          label="Total appointment records"
          value={fmt(data.total_appointments)}
          icon={CalendarDays}
        />

        <MetricCard
          label="Total billing records"
          value={fmt(data.total_billing_records)}
          icon={ReceiptText}
        />

      </div>

      {/* CHARTS AND LOS */}

      <div className="two-column">

        <Panel
          title="Patient flow"
          subtitle="Daily visit entries · latest 14 available dates"
        >
          {flow.length > 0 ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={flow}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="visits"
                    name="Visit entries"
                    fill="#2d7964"
                    radius={[5, 5, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No patient-flow trend records returned." />
          )}
        </Panel>

        <Panel
          title="Length of stay"
          subtitle="Source-derived visit duration"
        >

          <div className="los-highlight">
            <span>Average LOS</span>

            <strong>
              {los.average_los_days != null
                ? Number(los.average_los_days).toFixed(2)
                : "—"}

              <small> days</small>
            </strong>
          </div>

          <div className="mini-stats">

            <div>
              <span>Total visits</span>
              <b>{fmt(los.total_visits)}</b>
            </div>

            <div>
              <span>Minimum LOS</span>
              <b>
                {los.minimum_los_days != null
                  ? `${Number(los.minimum_los_days).toFixed(2)} days`
                  : "—"}
              </b>
            </div>

            <div>
              <span>Maximum LOS</span>
              <b>
                {los.maximum_los_days != null
                  ? `${Number(los.maximum_los_days).toFixed(2)} days`
                  : "—"}
              </b>
            </div>

          </div>

          {los.interpretation_note && (
            <p className="note">
              {los.interpretation_note}
            </p>
          )}

        </Panel>

      </div>

      {/* DATA LIMITATION NOTICE */}

      <div className="notice">
        <BedDouble size={17} />

        <span>
          Bed occupancy and live bed availability are not displayed
          because the current database contains room capacity
          references, not current bed-status records.
        </span>
      </div>

    </div>
  );
}
