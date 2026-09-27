type IconProps = { size?: number; stroke?: number };

export function Icon({ name, size = 18, stroke = 1.8 }: IconProps & { name: string }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<string, React.ReactNode> = {
    discover: <><path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z" /><path d="m19 4 .5 1.5L21 6l-1.5.5L19 8l-.5-1.5L17 6l1.5-.5L19 4Z" /></>,
    stocks: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3.2-4 3 2.2L19 7" /><path d="M16 7h3v3" /></>,
    stacks: <><path d="m4 8 8-4 8 4-8 4-8-4Z" /><path d="m4 12 8 4 8-4" /><path d="m4 16 8 4 8-4" /></>,
    portfolio: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M8 5V3h8v2M3 10h18" /><path d="M10 14h4" /></>,
    profile: <><circle cx="12" cy="8" r="3" /><path d="M5 20c.8-3.2 3-5 7-5s6.2 1.8 7 5" /></>,
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></>,
    wallet: <><path d="M4 6.5h15a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 19 19.5H5A2.5 2.5 0 0 1 2.5 17V6a2 2 0 0 1 2-2H18" /><path d="M16 13h4" /><circle cx="16" cy="13" r=".6" fill="currentColor" stroke="none" /></>,
    chevron: <path d="m7 9 5 5 5-5" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    external: <><path d="M14 5h5v5M19 5l-8 8" /><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg {...common}>{paths[name] ?? paths.info}</svg>;
}
