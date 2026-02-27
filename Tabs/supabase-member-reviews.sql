create table if not exists public.member_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  product_label text not null,
  rating int not null check (rating between 1 and 5),
  review_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists member_reviews_user_id_created_at_idx
  on public.member_reviews (user_id, created_at desc);

alter table public.member_reviews enable row level security;

drop policy if exists "Users can read own reviews" on public.member_reviews;
create policy "Users can read own reviews"
  on public.member_reviews
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own reviews" on public.member_reviews;
create policy "Users can insert own reviews"
  on public.member_reviews
  for insert
  to authenticated
  with check (auth.uid() = user_id);
