import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트
 *
 * @description
 * 환경 변수 기반으로 Supabase 클라이언트를 초기화합니다.
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
 * - SUPABASE_SERVICE_ROLE_KEY: 서비스 롤 키 (서버 전용, RLS 우회)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: 익명 키 (클라이언트 전용, RLS 적용)
 */

let supabaseClient: SupabaseClient | null = null;

type NetworkErrorCause = {
  code?: string;
  hostname?: string;
  message?: string;
};

/**
 * 환경 변수 검증
 */
function validateEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL 및 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.",
    );
  }

  return { url, key: serviceKey };
}

export function createSupabaseFetchFailureMessage(method: string, input: RequestInfo | URL, error: unknown): string {
  const requestUrl = typeof input === "string" || input instanceof URL ? input.toString() : input.url;
  const origin = new URL(requestUrl).origin;
  const cause = error instanceof Error ? (error.cause as NetworkErrorCause | undefined) : undefined;
  const causeParts = [cause?.code, cause?.hostname].filter(Boolean).join(" ");
  const fallbackMessage = error instanceof Error ? error.message : String(error);
  const causeMessage = cause?.message ?? fallbackMessage;
  const causeText = causeParts ? `${causeParts} - ${causeMessage}` : causeMessage;

  return `fetch failed (${method} ${origin}; cause: ${causeText})`;
}

function createDiagnosticFetch(): typeof fetch {
  return async (input, init) => {
    try {
      return await fetch(input, init);
    } catch (error) {
      const method = init?.method ?? (input instanceof Request ? input.method : "GET");

      throw new TypeError(createSupabaseFetchFailureMessage(method, input, error), {
        cause: error,
      });
    }
  };
}

/**
 * Supabase 클라이언트 초기화 (서비스 롤)
 *
 * 서버 측에서 사용하며 RLS를 우회하여 모든 데이터에 접근 가능합니다.
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { url, key } = validateEnv();

  supabaseClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: createDiagnosticFetch(),
    },
  });

  console.log("✅ Supabase 클라이언트 초기화 완료");
  return supabaseClient;
}

/**
 * Supabase 익명 클라이언트 생성 (공개 읽기 전용)
 *
 * API 엔드포인트에서 사용하며 RLS 정책에 따라 공개된 데이터만 조회 가능합니다.
 */
export function getSupabaseAnonClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL 및 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.",
    );
  }

  return createClient(url, anonKey);
}
