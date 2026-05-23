import { SupabaseClient, createClient } from "@supabase/supabase-js";

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

  validateSupabaseCredentials(url, serviceKey);

  return { url, key: serviceKey };
}

export function getSupabaseProjectRefFromUrl(url: string): string | null {
  const hostname = new URL(url).hostname;
  const suffix = ".supabase.co";

  if (!hostname.endsWith(suffix)) {
    return null;
  }

  return hostname.slice(0, -suffix.length);
}

export function getSupabaseJwtProjectRef(key: string): string | null {
  return getSupabaseJwtPayload(key)?.ref ?? null;
}

function getSupabaseJwtPayload(key: string): { ref?: string; role?: string } | null {
  const [, payload] = key.split(".");

  if (!payload) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      ref?: unknown;
      role?: unknown;
    };

    return {
      ref: typeof decoded.ref === "string" ? decoded.ref : undefined,
      role: typeof decoded.role === "string" ? decoded.role : undefined,
    };
  } catch {
    return null;
  }
}

export function validateSupabaseCredentials(url: string, serviceKey: string): void {
  const trimmedKey = serviceKey.trim();

  if (trimmedKey !== serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 앞뒤에 공백 또는 줄바꿈이 있습니다. GitHub Actions Secret 값을 다시 저장하세요.",
    );
  }

  if (serviceKey.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY에 publishable/anon 키가 설정되어 있습니다. 서버 저장 작업에는 service_role 또는 secret key가 필요합니다.",
    );
  }

  if (serviceKey.startsWith("sb_secret_")) {
    return;
  }

  const urlProjectRef = getSupabaseProjectRefFromUrl(url);
  const keyPayload = getSupabaseJwtPayload(serviceKey);
  const keyProjectRef = keyPayload?.ref ?? null;

  if (!keyPayload) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 형식이 올바르지 않습니다. Supabase Dashboard의 service_role 또는 secret key 값을 GitHub Actions Secret에 다시 저장하세요.",
    );
  }

  if (keyPayload.role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY role(${keyPayload.role ?? "unknown"})이 service_role이 아닙니다. GitHub Actions Secret에 anon 키가 아닌 service_role 키를 설정하세요.`,
    );
  }

  if (!urlProjectRef || !keyProjectRef || urlProjectRef === keyProjectRef) {
    return;
  }

  throw new Error(
    `NEXT_PUBLIC_SUPABASE_URL project ref(${urlProjectRef})와 SUPABASE_SERVICE_ROLE_KEY project ref(${keyProjectRef})가 다릅니다. GitHub Actions Secrets를 같은 Supabase 프로젝트 값으로 다시 설정하세요.`,
  );
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
