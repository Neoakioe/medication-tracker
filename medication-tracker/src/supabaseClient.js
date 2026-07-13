import { createClient } from "@supabase/supabase-js";

// Vercel 등에 배포할 때는 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)로
// 설정하는 걸 권장해요. 아래 fallback 값은 로컬 테스트용으로 넣어둔 것이니
// 실제 배포 전에 본인 프로젝트 값으로 꼭 교체하거나 환경변수를 설정하세요.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://hjzvsawekxjdfcznirju.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_U9TlLj5tFwvME2hT3yBAlA_upcc6cxD";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
