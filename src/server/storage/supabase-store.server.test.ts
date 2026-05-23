import assert from "node:assert/strict";
import test from "node:test";

import { assertSupabaseQuerySucceeded, runSupabaseQueryWithRetry } from "./supabase-store.server";

test("assertSupabaseQuerySucceeded throws with context when Supabase returns an error", () => {
  assert.throws(
    () =>
      assertSupabaseQuerySucceeded("일반 뉴스 중복 확인", {
        message: "TypeError: fetch failed",
      }),
    /Supabase 일반 뉴스 중복 확인 실패: TypeError: fetch failed/,
  );
});

test("assertSupabaseQuerySucceeded does nothing when there is no error", () => {
  assert.doesNotThrow(() => assertSupabaseQuerySucceeded("일반 뉴스 중복 확인", null));
});

test("runSupabaseQueryWithRetry retries transient fetch failures", async () => {
  let attempts = 0;

  const result = await runSupabaseQueryWithRetry("일반 뉴스 저장", async () => {
    attempts += 1;

    if (attempts < 3) {
      return {
        data: null,
        error: {
          message: "TypeError: fetch failed",
        },
      };
    }

    return {
      data: [{ id: 1 }],
      error: null,
    };
  });

  assert.deepEqual(result, { data: [{ id: 1 }], error: null });
  assert.equal(attempts, 3);
});

test("runSupabaseQueryWithRetry does not retry non-network Supabase errors", async () => {
  let attempts = 0;

  const result = await runSupabaseQueryWithRetry("일반 뉴스 저장", async () => {
    attempts += 1;

    return {
      data: null,
      error: {
        code: "23505",
        message: "duplicate key value violates unique constraint",
      },
    };
  });

  assert.equal(result.error?.code, "23505");
  assert.equal(attempts, 1);
});
