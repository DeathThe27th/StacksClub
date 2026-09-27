create extension if not exists pgcrypto;

create type public.asset_provider as enum ('bstocks', 'xstocks', 'ondo');
create type public.asset_status as enum ('verified', 'stale', 'unsupported', 'not_routable');
create type public.transaction_status as enum ('pending', 'submitted', 'confirmed', 'failed', 'needs_recovery');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_subject text not null unique,
  wallet_address text,
  username text unique check (username is null or username ~ '^[a-z0-9_]{3,24}$'),
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
  contract_address text not null check (contract_address ~ '^0x[0-9a-fA-F]{40}$'),
  onchain_stack_id numeric not null,
  creation_tx_hash text not null,
  recipe_hash text not null unique,
  launched_at timestamptz not null default now(),
  unique (chain_id, contract_address, onchain_stack_id)
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

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id),
  user_wallet text not null,
  stack_id uuid references public.stacks(id),
  type text not null check (type in ('buy', 'sell', 'redeem', 'create_stack')),
  status public.transaction_status not null default 'pending',
  tx_hashes text[] not null default '{}',
  quote_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(quote_metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.creator_fee_ledger (
  id uuid primary key default gen_random_uuid(),
  stack_id uuid not null references public.stacks(id),
  creator_id uuid not null references public.profiles(id),
  chain_id integer not null check (chain_id = 56),
  fee_token_address text not null,
  fee_amount_raw numeric not null check (fee_amount_raw > 0),
  creator_amount_raw numeric not null check (creator_amount_raw >= 0),
  transaction_hash text not null,
  log_index integer not null check (log_index >= 0),
  created_at timestamptz not null default now(),
  unique (chain_id, transaction_hash, log_index)
);

create index assets_ticker_idx on public.assets (underlying_ticker, provider, status);
create index stacks_creator_idx on public.stacks (creator_id, launched_at desc);
create index transactions_wallet_idx on public.transactions (user_wallet, created_at desc);
create index follows_followed_idx on public.follows (followed_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.stacks enable row level security;
alter table public.stack_components enable row level security;
alter table public.follows enable row level security;
alter table public.stack_reactions enable row level security;
alter table public.transactions enable row level security;
alter table public.creator_fee_ledger enable row level security;

create policy "public can read verified assets" on public.assets for select to anon, authenticated using (status = 'verified');
create policy "public can read stacks" on public.stacks for select to anon, authenticated using (true);
create policy "public can read stack components" on public.stack_components for select to anon, authenticated using (true);
create policy "public can read follows" on public.follows for select to anon, authenticated using (true);
create policy "public can read reactions" on public.stack_reactions for select to anon, authenticated using (true);

create view public.profiles_public as
  select id, username, avatar_url, bio, x_profile_url, created_at, updated_at
  from public.profiles;

revoke all on public.profiles, public.transactions, public.creator_fee_ledger from anon, authenticated;
revoke all on public.profiles_public from anon, authenticated;
grant select on public.profiles_public, public.assets, public.stacks, public.stack_components, public.follows, public.stack_reactions to anon, authenticated;

revoke all on public.creator_fee_ledger from anon, authenticated;
