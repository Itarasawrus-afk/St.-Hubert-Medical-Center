export function Loading() { return <div className="state">Loading data from St. Hubert API…</div>; }
export function ErrorState({ message }) { return <div className="state error-state">Unable to load data: {message}</div>; }
export function EmptyState({ message = "No records available." }) { return <div className="state">{message}</div>; }