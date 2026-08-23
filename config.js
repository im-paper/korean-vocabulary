// Supabase 접속 정보
//
// Supabase 대시보드 > Project Settings > Data API 에서 확인할 수 있습니다.
// - SUPABASE_URL: "Project URL" (https://xxxxx.supabase.co 형태)
// - SUPABASE_ANON_KEY: "anon public" 키
//
// 이 두 값은 공개되어도 괜찮습니다. 실제 데이터 보호는 schema.sql의 RLS 정책이 담당합니다.
// (절대 "service_role" 키는 여기에 넣지 마세요. 그 키는 모든 보안 정책을 무시합니다.)

export const SUPABASE_URL = "";
export const SUPABASE_ANON_KEY = "";
