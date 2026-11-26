export default function Panel({ title, subtitle, children, action }) {
  return <section className="panel">
    <div className="panel-heading">
      <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      {action}
    </div>
    {children}
  </section>;
}