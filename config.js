// ── 저장소 선택 (PROMPT.md 9.2) ──────────────────────────
//
// "local"    학습 기록을 브라우저에 저장합니다. 로그인이 필요 없습니다. (현재)
// "supabase" 클라우드에 저장합니다. 로그인이 필요합니다. (11단계)
//
// 앱 화면 코드는 lib/store.js 만 부르고, 어느 쪽에 저장되는지 알지 못합니다.
// 11단계에서 할 일은 이 줄을 바꾸고 로컬 데이터를 올리는 마이그레이션뿐입니다.
export const STORE = "local";

// ── Supabase 접속 정보 ───────────────────────────────────
//
// Supabase 대시보드 > Project Settings > Data API 에서 확인할 수 있습니다.
// 이 두 값은 공개되어도 괜찮습니다. 실제 데이터 보호는 schema.sql의 RLS 정책이 담당합니다.
// (절대 "service_role" 또는 "secret" 키는 여기에 넣지 마세요. 모든 보안 정책을 무시합니다.)

export const SUPABASE_URL = "https://isbaaaaehmqcbxnfqquv.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_jCHWNo2djU77g28hMOLs9g_rZqofrSw";
