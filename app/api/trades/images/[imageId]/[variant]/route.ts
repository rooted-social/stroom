import { NextResponse } from "next/server";

import { getR2Object } from "@/lib/r2/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type TradeImage } from "@/types/trade-image";

type Params = {
  imageId: string;
  variant: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<Params> },
) {
  const { imageId, variant } = await context.params;
  if (variant !== "thumb" && variant !== "full") {
    return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("trade_images")
    .select("*")
    .eq("id", imageId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const image = data as TradeImage;
  const objectKey =
    variant === "thumb" ? image.object_key_thumb : image.object_key_full;

  try {
    const result = await getR2Object(objectKey);
    const body = result.Body as
      | {
          transformToWebStream?: () => ReadableStream<Uint8Array>;
          transformToByteArray?: () => Promise<Uint8Array>;
        }
      | undefined;

    if (!body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const contentType =
      variant === "thumb"
        ? "image/webp"
        : image.content_type || "application/octet-stream";

    const cacheControl =
      variant === "thumb"
        ? "private, max-age=604800"
        : "private, max-age=3600";

    if (typeof body.transformToWebStream === "function") {
      return new NextResponse(body.transformToWebStream(), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": cacheControl,
        },
      });
    }

    if (typeof body.transformToByteArray === "function") {
      const bytes = await body.transformToByteArray();
      const normalizedBytes = new Uint8Array(bytes);
      return new NextResponse(normalizedBytes, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": cacheControl,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported body stream" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
