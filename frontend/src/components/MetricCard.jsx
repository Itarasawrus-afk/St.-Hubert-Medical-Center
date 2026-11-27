export default function MetricCard({ label, value, detail, icon: Icon }) {
  return <article className="metric-card">
    <div className="metric-top">
      <span className="metric-label">{label}</span>
      {Icon && <span className="metric-icon"><Icon size={18} /></span>}
    </div>
    <div className="metric-value">{value ?? "—"}</div>
    {detail && <div className="metric-detail">{detail}</div>}
  </article>;
}