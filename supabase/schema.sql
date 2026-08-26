-- 페이퍼 어휘장 데이터베이스 스키마
-- Supabase 대시보드 > SQL Editor 에 이 파일 내용을 통째로 붙여넣고 실행하세요.
-- 여러 번 실행해도 안전합니다(이미 있으면 건너뜁니다).

-- ─────────────────────────────────────────────
-- 1. 세트 테이블: '일일 어휘 1일차', '인간실격 1회' 같은 묶음
-- ─────────────────────────────────────────────
create table if not exists public.sets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,

  -- 'daily' = 일일 어휘, 'book' = 책별 어휘
  track       text not null check (track in ('daily', 'book')),

  -- 일일 어휘용: 그날의 날짜
  set_date    date,

  -- 책별 어휘용: 책 정보
  book        text,
  author      text,
  set_label   text,

  note        text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 2. 단어 테이블
-- ─────────────────────────────────────────────
create table if not exists public.words (
  id          uuid primary key default gen_random_uuid(),
  set_id      uuid not null references public.sets(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,

  word        text not null,
  meaning     text not null,
  -- 예문. {{...}} 안이 퀴즈 빈칸 정답이 됩니다.
  example     text not null,
  synonyms    text[] not null default '{}',

  -- 표준국어대사전에서 자동으로 가져온 경우 원본 링크를 남겨둡니다.
  source_url  text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 3. 학습 기록 테이블: 퀴즈를 풀 때마다 누적
-- ─────────────────────────────────────────────
create table if not exists public.progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  word_id          uuid not null references public.words(id) on delete cascade,

  attempts         int not null default 0,
  correct          int not null default 0,
  incorrect        int not null default 0,
  last_reviewed_at timestamptz,

  -- 한 사람이 한 단어에 대해 기록 한 줄만 갖도록
  unique (user_id, word_id)
);

-- ─────────────────────────────────────────────
-- 4. 내가 쓴 문장 테이블
--
--    이 앱이 사용자에게서 받는 유일한 자산입니다. 채점하지 않고 그대로 담습니다.
--    가리키는 대상이 위의 words(uuid)가 아니라 word_slug(text)인 이유:
--    단어 콘텐츠는 프로젝트 파일(data/words.js)에 있고 고정 ID로 단어를 가리키기
--    때문입니다(예: "ningen-1-wiseon"). 브라우저에 쌓인 문장을 변환 없이 그대로
--    올릴 수 있습니다. 외래 키를 걸지 않는 것도 같은 이유입니다.
-- ─────────────────────────────────────────────
create table if not exists public.sentences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,

  -- 콘텐츠 파일의 고정 ID (PROMPT.md 8.2)
  word_slug   text not null,

  -- 200자 상한. 한 줄이 기본이지만 더 쓰고 싶으면 막지 않습니다. (PROMPT.md 6.6)
  text        text not null check (char_length(text) between 1 and 200),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 5. 조회 속도를 위한 인덱스
-- ─────────────────────────────────────────────
create index if not exists sets_user_track_idx    on public.sets (user_id, track, set_date desc);
create index if not exists words_set_idx          on public.words (set_id, sort_order);
create index if not exists progress_user_word_idx on public.progress (user_id, word_id);
-- 한 단어의 문장을 최신 것부터 읽습니다.
create index if not exists sentences_user_word_idx on public.sentences (user_id, word_slug, created_at desc);

-- ─────────────────────────────────────────────
-- 6. 보안 정책 (RLS)
--    로그인한 본인의 데이터만 읽고 쓸 수 있게 잠급니다.
--    이게 없으면 사이트 주소를 아는 누구나 데이터를 볼 수 있습니다.
-- ─────────────────────────────────────────────
alter table public.sets      enable row level security;
alter table public.words     enable row level security;
alter table public.progress  enable row level security;
alter table public.sentences enable row level security;

drop policy if exists "본인 세트만 접근" on public.sets;
create policy "본인 세트만 접근" on public.sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "본인 단어만 접근" on public.words;
create policy "본인 단어만 접근" on public.words
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "본인 기록만 접근" on public.progress;
create policy "본인 기록만 접근" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 내가 쓴 문장은 남에게 보이지 않습니다. 공유 기능은 지금 없습니다. (PROMPT.md 6.6)
drop policy if exists "본인 문장만 접근" on public.sentences;
create policy "본인 문장만 접근" on public.sentences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
