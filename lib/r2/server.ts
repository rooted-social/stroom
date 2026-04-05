import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { getR2Env } from "@/lib/env";

const { accessKeyId, secretAccessKey, bucketName, endpoint, publicBaseUrl } =
  getR2Env();

export const r2BucketName = bucketName;

export const r2Client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function buildR2PublicUrl(key: string) {
  const base = normalizeBaseUrl(publicBaseUrl);

  if (
    base.endsWith(`/${bucketName}`) ||
    !base.includes("r2.cloudflarestorage.com")
  ) {
    return `${base}/${key}`;
  }

  return `${base}/${bucketName}/${key}`;
}

export async function uploadR2Object(params: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl,
    }),
  );
}

export async function deleteR2Object(key: string) {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}

export async function getR2Object(key: string) {
  return r2Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}
