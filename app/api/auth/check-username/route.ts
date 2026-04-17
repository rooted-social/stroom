import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const usernamePattern = /^[a-z0-9_]{4,20}$/;
const rateLimitWindowMs = 60_000;
const rateLimitMaxRequests = 20;
const rateLimitCleanupIntervalMs = 5 * 60_000;

const rateLimitBuckets = new Map<string, { count: number; windowStartAt: number; lastSeenAt: number }>();
let lastRateLimitCleanupAt = 0;

type RateLimitState = {
  isLimited: boolean;
  remaining: number;
  retryAfterSeconds: number;
  backoffDelayMs: number;
};

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown-ip";
  const userAgent = request.headers.get("user-agent")?.slice(0, 160) ?? "unknown-ua";
  return `${forwardedFor}:${userAgent}`;
}

function cleanupRateLimitBuckets(now: number) {
  if (now - lastRateLimitCleanupAt < rateLimitCleanupIntervalMs) {
    return;
  }

  lastRateLimitCleanupAt = now;
  for (const [key, bucket] of rateLimitBuckets) {
    if (now - bucket.lastSeenAt > rateLimitWindowMs * 2) {
      rateLimitBuckets.delete(key);
    }
  }
}

function getBackoffDelayMs(requestCount: number) {
  if (requestCount <= 5) return 0;
  if (requestCount <= 10) return 120;
  if (requestCount <= 15) return 300;
  return 700;
}

function getRateLimitState(request: Request): RateLimitState {
  const now = Date.now();
  cleanupRateLimitBuckets(now);

  const clientKey = getClientKey(request);
  const existingBucket = rateLimitBuckets.get(clientKey);

  if (!existingBucket || now - existingBucket.windowStartAt >= rateLimitWindowMs) {
    rateLimitBuckets.set(clientKey, { count: 1, windowStartAt: now, lastSeenAt: now });
    return {
      isLimited: false,
      remaining: rateLimitMaxRequests - 1,
      retryAfterSeconds: 0,
      backoffDelayMs: 0,
    };
  }

  existingBucket.count += 1;
  existingBucket.lastSeenAt = now;

  const remaining = Math.max(0, rateLimitMaxRequests - existingBucket.count);
  const retryAfterMs = Math.max(0, existingBucket.windowStartAt + rateLimitWindowMs - now);
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
  const isLimited = existingBucket.count > rateLimitMaxRequests;

  return {
    isLimited,
    remaining,
    retryAfterSeconds,
    backoffDelayMs: isLimited ? 0 : getBackoffDelayMs(existingBucket.count),
  };
}

function applyRateLimitHeaders(response: NextResponse, rateLimit: RateLimitState) {
  response.headers.set("X-RateLimit-Limit", String(rateLimitMaxRequests));
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  if (rateLimit.retryAfterSeconds > 0) {
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
  }
}

function jsonWithRateLimit(body: Record<string, unknown>, status: number, rateLimit: RateLimitState) {
  const response = NextResponse.json(body, { status });
  applyRateLimitHeaders(response, rateLimit);
  return response;
}

async function applyBackoffDelay(delayMs: number) {
  if (delayMs <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function GET(request: Request) {
  const rateLimit = getRateLimitState(request);

  if (rateLimit.isLimited) {
    return jsonWithRateLimit(
      { available: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      429,
      rateLimit,
    );
  }

  await applyBackoffDelay(rateLimit.backoffDelayMs);

  const { searchParams } = new URL(request.url);
  const username = String(searchParams.get("username") ?? "").trim().toLowerCase();

  if (!usernamePattern.test(username)) {
    return jsonWithRateLimit(
      {
        available: false,
        message: "아이디는 4~20자의 영문 소문자, 숫자, 밑줄(_)만 가능합니다.",
      },
      200,
      rateLimit,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_email_by_username", {
    p_username: username,
  });

  if (error) {
    return jsonWithRateLimit(
      { available: false, message: "중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      500,
      rateLimit,
    );
  }

  return jsonWithRateLimit(
    {
      available: !data,
      message: data ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다.",
    },
    200,
    rateLimit,
  );
}
