import {
  ArrowRight,
  ArrowSquareOut,
  CaretDown,
  ChartLineUp,
  Check,
  Clock,
  Compass,
  Funnel,
  Info,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  StackSimple,
  UserCircle,
  Wallet,
  X,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";

const icons: Record<string, PhosphorIcon> = {
  discover: Compass,
  stocks: ChartLineUp,
  stacks: StackSimple,
  portfolio: Wallet,
  profile: UserCircle,
  arrow: ArrowRight,
  plus: Plus,
  search: MagnifyingGlass,
  shield: ShieldCheck,
  chevron: CaretDown,
  close: X,
  external: ArrowSquareOut,
  clock: Clock,
  info: Info,
  filter: Funnel,
  check: Check,
};

export function Icon({ name, size = 18, stroke: _stroke = 1.8 }: { name: string; size?: number; stroke?: number }) {
  const Glyph = icons[name] ?? Info;
  return <Glyph size={size} weight="regular" aria-hidden="true" focusable="false" />;
}
