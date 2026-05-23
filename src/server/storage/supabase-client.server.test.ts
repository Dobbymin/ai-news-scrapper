import assert from "node:assert/strict";
import test from "node:test";

import { createSupabaseFetchFailureMessage } from "./supabase-client.server";

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
