import "dotenv/config";
import { createHash } from "node:crypto";

import { validateSupabaseCredentials } from "../storage/supabase-client.server";

function fingerprint(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function getJwtPayload(key: string): { ref?: string; role?: string } | null {
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

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("🔎 Supabase 환경 변수 사전 점검");
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${url ? `SET sha256=${fingerprint(url)}` : "MISSING"}`);
  console.log(
    `SUPABASE_SERVICE_ROLE_KEY: ${
      serviceKey ? `SET len=${serviceKey.length} sha256=${fingerprint(serviceKey)}` : "MISSING"
    }`,
  );

  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
  }

  const payload = getJwtPayload(serviceKey);

  if (payload) {
    console.log(`SUPABASE_SERVICE_ROLE_KEY JWT: ref=${payload.ref ?? "unknown"} role=${payload.role ?? "unknown"}`);
  } else if (serviceKey.startsWith("sb_secret_")) {
    console.log("SUPABASE_SERVICE_ROLE_KEY type: sb_secret");
  } else {
    console.log("SUPABASE_SERVICE_ROLE_KEY type: unknown");
  }

  validateSupabaseCredentials(url, serviceKey);

  const response = await fetch(`${url}/rest/v1/news?select=id&limit=1`, {
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
  });
  const body = await response.text();

  console.log(`Supabase REST probe: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    throw new Error(`Supabase REST probe 실패: ${body.slice(0, 300)}`);
  }
}

main().catch((error) => {
  console.error("❌ Supabase 환경 변수 사전 점검 실패:", error);
  process.exitCode = 1;
});
