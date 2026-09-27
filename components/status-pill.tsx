export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "blue" | "green" | "orange" }) {
  return <span className={`status-pill status-pill--${tone}`}><span className="status-dot" />{children}</span>;
}
