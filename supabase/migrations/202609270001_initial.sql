create extension if not exists pgcrypto;

create type public.asset_provider as enum ('bstocks', 'xstocks', 'ondo');
create type public.asset_status as enum ('verified', 'stale', 'unsupported', 'not_routable');
create type public.transaction_status as enum ('pending', 'submitted', 'confirmed', 'failed', 'needs_recovery');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_subject text not null unique,
  wallet_address text,
  username text unique,
  avatar_url text,
  bio text,
  x_profile_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  provider public.asset_provider not null,
  chain_id integer not null check (chain_id = 56),
  token_address text not null,
  symbol text not null,
  name text not null,
  decimals integer not null check (decimals between 0 and 36),
  underlying_ticker text not null,
  logo_url text,
  data_source text not null,
  status public.asset_status not null default 'unsupported',
  data_timestamp timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, chain_id, token_address)
);

create table public.stacks (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id),
  slug text not null unique,
  name text not null,
  ticker text not null,
  description text not null,
  image_url text,
  chain_id integer not null default 56 check (chain_id = 56),
  recipe_hash text not null unique,
  launched_at timestamptz not null default now()
);

create table public.stack_components (
  stack_id uuid not null references public.stacks(id) on delete cascade,
  asset_id uuid not null references public.assets(id),
  weight_bps integer not null check (weight_bps > 0 and weight_bps <= 10000),
  primary key (stack_id, asset_id)
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create table public.stack_reactions (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  stack_id uuid not null references public.stacks(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'save')),
  created_at timestamptz not null default now(),
  primary key (profile_id, stack_id, reaction)
);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  owner_wallet text not null,
  stack_id uuid references public.stacks(id),
  token_id numeric not null unique,
  chain_id integer not null default 56 check (chain_id = 56),
  created_at timestamptz not null default now()
);

create table public.position_balances (
  position_id uuid not null references public.positions(id) on delete cascade,
  asset_id uuid not null references public.assets(id),
  raw_quantity numeric not null check (raw_quantity >= 0),
  cost_basis_usd numeric check (cost_basis_usd >= 0),
  updated_at timestamptz not null default now(),
  primary key (position_id, asset_id)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_wallet text not null,
  position_id uuid references public.positions(id),
  stack_id uuid references public.stacks(id),
  type text not null check (type in ('buy', 'sell', 'redeem', 'create_stack')),
  status public.transaction_status not null default 'pending',
  tx_hashes text[] not null default '{}',
  quote_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.creator_fee_ledger (
  id uuid primary key default gen_random_uuid(),
  stack_id uuid not null references public.stacks(id),
  creator_id uuid not null references public.profiles(id),
  transaction_id uuid not null references public.transactions(id),
  fee_amount_raw numeric not null check (fee_amount_raw >= 0),
  claim_tx_hash text,
  created_at timestamptz not null default now()
);

create index assets_ticker_idx on public.assets (underlying_ticker, provider, status);
create index stacks_creator_idx on public.stacks (creator_id, launched_at desc);
create index transactions_wallet_idx on public.transactions (user_wallet, created_at desc);
create index positions_owner_idx on public.positions (lower(owner_wallet));

alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.stacks enable row level security;
alter table public.stack_components enable row level security;
alter table public.follows enable row level security;
alter table public.stack_reactions enable row level security;
alter table public.positions enable row level security;
alter table public.position_balances enable row level security;
alter table public.transactions enable row level security;
alter table public.creator_fee_ledger enable row level security;

create policy "public can read verified assets" on public.assets for select using (status = 'verified');
create policy "public can read stacks" on public.stacks for select using (true);
create policy "public can read stack components" on public.stack_components for select using (true);
create policy "profile owners can read their profile" on public.profiles for select using (auth_subject = auth.uid()::text);
create policy "profile owners can update their profile" on public.profiles for update using (auth_subject = auth.uid()::text);
create policy "profile owners can insert their profile" on public.profiles for insert with check (auth_subject = auth.uid()::text);
create policy "users can read their positions" on public.positions for select using (lower(owner_wallet) = lower(coalesce(auth.jwt()->>'wallet_address', '')));
create policy "users can read their balances" on public.position_balances for select using (exists (select 1 from public.positions p where p.id = position_id and lower(p.owner_wallet) = lower(coalesce(auth.jwt()->>'wallet_address', ''))));
create policy "users can read their transactions" on public.transactions for select using (lower(user_wallet) = lower(coalesce(auth.jwt()->>'wallet_address', '')));

revoke all on public.creator_fee_ledger from anon, authenticated;
