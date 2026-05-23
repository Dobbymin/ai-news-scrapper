create table if not exists public.crypto_news (
  id bigserial primary key,
  news_id integer not null,
  title text not null,
  content text not null,
  url text not null unique,
  published_at timestamptz not null,
  source text not null,
  scraped_at timestamptz not null,
  date date not null,
  created_at timestamptz not null default now()
);

create index if not exists crypto_news_date_idx on public.crypto_news (date desc);
create index if not exists crypto_news_news_id_idx on public.crypto_news (news_id);

create table if not exists public.crypto_analysis (
  id bigserial primary key,
  date date not null unique,
  total_news integer not null default 0,
  investment_index numeric(5, 2) not null default 0,
  positive_count integer not null default 0,
  negative_count integer not null default 0,
  neutral_count integer not null default 0,
  keywords jsonb not null default '[]'::jsonb,
  news_analysis jsonb not null default '[]'::jsonb,
  analyzed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists crypto_analysis_date_idx on public.crypto_analysis (date desc);

create table if not exists public.news (
  id bigserial primary key,
  news_id integer not null,
  title text not null,
  content text not null,
  url text not null unique,
  published_at timestamptz not null,
  source text not null,
  scraped_at timestamptz not null,
  date date not null,
  created_at timestamptz not null default now()
);

create index if not exists news_date_idx on public.news (date desc);
create index if not exists news_news_id_idx on public.news (news_id);

create table if not exists public.news_analysis (
  id bigserial primary key,
  date date not null unique,
  total_news integer not null default 0,
  positive_count integer not null default 0,
  negative_count integer not null default 0,
  neutral_count integer not null default 0,
  keywords jsonb not null default '[]'::jsonb,
  news_analysis jsonb not null default '[]'::jsonb,
  analyzed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists news_analysis_date_idx on public.news_analysis (date desc);

create table if not exists public.market_data (
  id bigserial primary key,
  date date not null,
  btc numeric(10, 4) not null,
  eth numeric(10, 4) not null,
  avg_altcoin numeric(10, 4),
  created_at timestamptz not null default now()
);

create index if not exists market_data_date_idx on public.market_data (date desc);

alter table public.crypto_news enable row level security;
alter table public.crypto_analysis enable row level security;
alter table public.news enable row level security;
alter table public.news_analysis enable row level security;
alter table public.market_data enable row level security;

grant select on public.crypto_news to anon, authenticated;
grant select on public.crypto_analysis to anon, authenticated;
grant select on public.news to anon, authenticated;
grant select on public.news_analysis to anon, authenticated;
grant select on public.market_data to anon, authenticated;

grant all on public.crypto_news to service_role;
grant all on public.crypto_analysis to service_role;
grant all on public.news to service_role;
grant all on public.news_analysis to service_role;
grant all on public.market_data to service_role;

grant usage, select on sequence public.crypto_news_id_seq to service_role;
grant usage, select on sequence public.crypto_analysis_id_seq to service_role;
grant usage, select on sequence public.news_id_seq to service_role;
grant usage, select on sequence public.news_analysis_id_seq to service_role;
grant usage, select on sequence public.market_data_id_seq to service_role;

drop policy if exists "Allow public read access" on public.crypto_news;
create policy "Allow public read access"
on public.crypto_news
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public read access" on public.crypto_analysis;
create policy "Allow public read access"
on public.crypto_analysis
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public read access" on public.news;
create policy "Allow public read access"
on public.news
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public read access" on public.news_analysis;
create policy "Allow public read access"
on public.news_analysis
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public read access" on public.market_data;
create policy "Allow public read access"
on public.market_data
for select
to anon, authenticated
using (true);
