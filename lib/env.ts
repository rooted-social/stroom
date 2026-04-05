export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  }

  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.");
  }

  return {
    url,
    anonKey,
  };
}

export function getSupabaseEnvOrNull() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getR2Env() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const endpoint = process.env.R2_ENDPOINT;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!accountId) throw new Error("R2_ACCOUNT_ID is not set.");
  if (!accessKeyId) throw new Error("R2_ACCESS_KEY_ID is not set.");
  if (!secretAccessKey) throw new Error("R2_SECRET_ACCESS_KEY is not set.");
  if (!bucketName) throw new Error("R2_BUCKET_NAME is not set.");
  if (!endpoint) throw new Error("R2_ENDPOINT is not set.");
  if (!publicBaseUrl) throw new Error("R2_PUBLIC_BASE_URL is not set.");

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
    publicBaseUrl,
  };
}
