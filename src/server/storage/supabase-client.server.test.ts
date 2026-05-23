import assert from "node:assert/strict";
import test from "node:test";

import {
  createSupabaseFetchFailureMessage,
  getSupabaseJwtProjectRef,
  getSupabaseProjectRefFromUrl,
  validateSupabaseCredentials,
} from "./supabase-client.server";

function createLegacySupabaseJwt(payload: Record<string, unknown>): string {
  return [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
    Buffer.from(JSON.stringify(payload)).toString("base64url"),
    "signature",
  ].join(".");
}

test("createSupabaseFetchFailureMessage includes method, origin, and network cause", () => {
  const error = new TypeError("fetch failed", {
    cause: Object.assign(new Error("getaddrinfo ENOTFOUND example.supabase.co"), {
      code: "ENOTFOUND",
      hostname: "example.supabase.co",
    }),
  });

  assert.equal(
    createSupabaseFetchFailureMessage("POST", "https://example.supabase.co/rest/v1/news?select=*", error),
    "fetch failed (POST https://example.supabase.co; cause: ENOTFOUND example.supabase.co - getaddrinfo ENOTFOUND example.supabase.co)",
  );
});

test("createSupabaseFetchFailureMessage does not include query strings", () => {
  const error = new TypeError("fetch failed");

  assert.equal(
    createSupabaseFetchFailureMessage("GET", "https://example.supabase.co/rest/v1/news?apikey=secret", error),
    "fetch failed (GET https://example.supabase.co; cause: fetch failed)",
  );
});

test("getSupabaseProjectRefFromUrl returns the project ref", () => {
  assert.equal(getSupabaseProjectRefFromUrl("https://dfvweliszqrrobxthvxh.supabase.co"), "dfvweliszqrrobxthvxh");
});

test("getSupabaseJwtProjectRef returns the ref from a legacy JWT key", () => {
  const key = createLegacySupabaseJwt({ ref: "dfvweliszqrrobxthvxh", role: "service_role" });

  assert.equal(getSupabaseJwtProjectRef(key), "dfvweliszqrrobxthvxh");
});

test("validateSupabaseCredentials rejects mismatched URL and service role key refs", () => {
  const key = createLegacySupabaseJwt({ ref: "otherprojectref", role: "service_role" });

  assert.throws(
    () => validateSupabaseCredentials("https://dfvweliszqrrobxthvxh.supabase.co", key),
    /NEXT_PUBLIC_SUPABASE_URL project ref\(dfvweliszqrrobxthvxh\)와 SUPABASE_SERVICE_ROLE_KEY project ref\(otherprojectref\)가 다릅니다/,
  );
});

test("validateSupabaseCredentials rejects legacy anon keys in the service role key env", () => {
  const key = createLegacySupabaseJwt({ ref: "dfvweliszqrrobxthvxh", role: "anon" });

  assert.throws(
    () => validateSupabaseCredentials("https://dfvweliszqrrobxthvxh.supabase.co", key),
    /SUPABASE_SERVICE_ROLE_KEY role\(anon\)이 service_role이 아닙니다/,
  );
});

test("validateSupabaseCredentials rejects publishable keys in the service role key env", () => {
  assert.throws(
    () => validateSupabaseCredentials("https://dfvweliszqrrobxthvxh.supabase.co", "sb_publishable_abc123_checksum"),
    /SUPABASE_SERVICE_ROLE_KEY에 publishable\/anon 키가 설정되어 있습니다/,
  );
});

test("validateSupabaseCredentials rejects keys with surrounding whitespace", () => {
  const key = createLegacySupabaseJwt({ ref: "dfvweliszqrrobxthvxh", role: "service_role" });

  assert.throws(
    () => validateSupabaseCredentials("https://dfvweliszqrrobxthvxh.supabase.co", `${key}\n`),
    /SUPABASE_SERVICE_ROLE_KEY 앞뒤에 공백 또는 줄바꿈이 있습니다/,
  );
});

test("validateSupabaseCredentials accepts new secret keys", () => {
  assert.doesNotThrow(() =>
    validateSupabaseCredentials("https://dfvweliszqrrobxthvxh.supabase.co", "sb_secret_abc123_checksum"),
  );
});

test("validateSupabaseCredentials accepts matching URL and service role key refs", () => {
  const key = createLegacySupabaseJwt({ ref: "dfvweliszqrrobxthvxh", role: "service_role" });

  assert.doesNotThrow(() => validateSupabaseCredentials("https://dfvweliszqrrobxthvxh.supabase.co", key));
});
