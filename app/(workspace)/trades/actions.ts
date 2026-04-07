"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import sharp from "sharp";

import { deleteR2Object, uploadR2Object, buildR2PublicUrl } from "@/lib/r2/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type TradeImage, type TradeImageOwnerType } from "@/types/trade-image";
import { type TradeRecordMode, type TradeRecordStatus } from "@/types/trade";
import { encodeTradeFormMeta } from "@/utils/trade-form";

const allowedModes: TradeRecordMode[] = ["pre", "post"];
const allowedStatuses: TradeRecordStatus[] = ["draft", "open", "closed"];
const allowedImageTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const maxImagePerTrade = 3;
const maxImageSizeBytes = 10 * 1024 * 1024;

async function getCurrentUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user.id;
}

function getValidMode(value: string): TradeRecordMode {
  if (!allowedModes.includes(value as TradeRecordMode)) {
    return "pre";
  }

  return value as TradeRecordMode;
}

function getValidStatus(value: string): TradeRecordStatus {
  if (!allowedStatuses.includes(value as TradeRecordStatus)) {
    return "draft";
  }

  return value as TradeRecordStatus;
}

function calculatePnlRate(
  position: "LONG" | "SHORT",
  entryPrice: number,
  exitPrice: number,
  leverage: number,
) {
  if (!Number.isFinite(entryPrice) || !Number.isFinite(exitPrice) || entryPrice === 0) {
    return null;
  }

  const raw =
    position === "LONG"
      ? ((exitPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - exitPrice) / entryPrice) * 100;

  if (!Number.isFinite(raw)) {
    return null;
  }

  return raw * leverage;
}

function parseNumericInput(value: string) {
  const normalized = value.replaceAll(",", "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseLeverageInput(value: string) {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed)) {
    return null;
  }
  if (parsed < 1 || parsed > 100) {
    return null;
  }
  return parsed;
}

function normalizeFileName(value: string) {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  return cleaned.length > 0 ? cleaned : "image";
}

function getOwnerTypeByMode(mode: TradeRecordMode): TradeImageOwnerType {
  return mode === "pre" ? "scenario" : "tradeJournal";
}

function getUploadedImageFiles(formData: FormData) {
  const raw = formData.getAll("images");
  return raw.filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

async function fetchTradeImages(userId: string, tradeId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("trade_images")
    .select("*")
    .eq("user_id", userId)
    .eq("owner_id", tradeId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  return (data ?? []) as TradeImage[];
}

async function uploadTradeImage(params: {
  file: File;
  userId: string;
  tradeId: string;
  ownerType: TradeImageOwnerType;
  sortOrder: number;
}) {
  const file = params.file;
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("이미지는 jpg/jpeg/png/webp 형식만 업로드할 수 있습니다.");
  }
  if (file.size > maxImageSizeBytes) {
    throw new Error("이미지 한 장당 최대 10MB까지 업로드 가능합니다.");
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const safeName = normalizeFileName(file.name);
  const token = `${Date.now()}-${randomUUID()}`;
  const fullKey = `trades/${params.userId}/${params.tradeId}/${token}-${safeName}`;
  const thumbKey = `trades/${params.userId}/${params.tradeId}/thumb-${token}.${ext === "png" ? "webp" : ext}`;

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const thumbBuffer = await sharp(fileBuffer)
    .rotate()
    .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await uploadR2Object({
    key: fullKey,
    body: fileBuffer,
    contentType: file.type,
    cacheControl: "public, max-age=86400",
  });
  await uploadR2Object({
    key: thumbKey,
    body: thumbBuffer,
    contentType: "image/webp",
    cacheControl: "public, max-age=31536000, immutable",
  });

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("trade_images").insert({
    user_id: params.userId,
    owner_type: params.ownerType,
    owner_id: params.tradeId,
    object_key_full: fullKey,
    object_key_thumb: thumbKey,
    url_full: buildR2PublicUrl(fullKey),
    url_thumb: buildR2PublicUrl(thumbKey),
    file_name: file.name,
    content_type: file.type,
    size_bytes: file.size,
    sort_order: params.sortOrder,
  });

  if (error) {
    await Promise.allSettled([deleteR2Object(fullKey), deleteR2Object(thumbKey)]);
    throw new Error(error.message);
  }
}

async function removeTradeImages(params: { userId: string; imageIds: string[] }) {
  if (params.imageIds.length === 0) return;
  const supabase = await createSupabaseServerClient();
  const { data: images } = await supabase
    .from("trade_images")
    .select("id, object_key_full, object_key_thumb")
    .eq("user_id", params.userId)
    .in("id", params.imageIds);
  const targets = images ?? [];
  await Promise.allSettled(
    targets.flatMap((row) => [deleteR2Object(row.object_key_full), deleteR2Object(row.object_key_thumb)]),
  );
  await supabase.from("trade_images").delete().eq("user_id", params.userId).in("id", params.imageIds);
}

export async function createTradeAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();
  const uploadedFiles = getUploadedImageFiles(formData);

  const mode = getValidMode(String(formData.get("mode") ?? "pre"));
  const status = getValidStatus(String(formData.get("status") ?? "draft"));
  const symbol = String(formData.get("symbol") ?? "").trim().toUpperCase();
  const tradeDate = String(formData.get("tradeDate") ?? "").trim();
  const holdingTime = String(formData.get("holdingTime") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim().toUpperCase();
  const leverage = String(formData.get("leverage") ?? "").trim();
  const entryPrice = String(formData.get("entryPrice") ?? "").trim();
  const exitPrice = String(formData.get("exitPrice") ?? "").trim();
  const stopPrice = String(formData.get("stopPrice") ?? "").trim();
  const entryReason = String(formData.get("entryReason") ?? "").trim();
  const exitReason = String(formData.get("exitReason") ?? "").trim();
  const scenarioChecklist = String(formData.get("scenarioChecklist") ?? "").trim();
  const memoAdditional = String(formData.get("memoAdditional") ?? "").trim();
  const review = String(formData.get("review") ?? "").trim();

  const title = symbol ? `${symbol} ${mode === "pre" ? "시나리오" : "매매일지"}` : "";
  const reasonsEntry = entryReason;
  const reasonsExit = exitReason;
  const plan = encodeTradeFormMeta({
    tradeDate,
    holdingTime,
    position: position === "SHORT" ? "SHORT" : position === "LONG" ? "LONG" : "",
    leverage,
    entryPrice,
    exitPrice,
    stopPrice,
  });
  const parsedEntry = parseNumericInput(entryPrice);
  const parsedExit = parseNumericInput(exitPrice);
  const parsedLeverage = parseLeverageInput(leverage);
  const pnlRate =
    parsedEntry !== null &&
    parsedExit !== null &&
    parsedLeverage !== null &&
    (position === "LONG" || position === "SHORT")
      ? calculatePnlRate(position, parsedEntry, parsedExit, parsedLeverage)
      : null;
  const result =
    pnlRate !== null
      ? `${pnlRate >= 0 ? "+" : ""}${pnlRate.toFixed(2)}%`
      : "";

  if (
    !symbol ||
    !tradeDate ||
    !position ||
    !entryPrice ||
    !exitPrice ||
    !stopPrice ||
    !leverage ||
    !entryReason ||
    !exitReason
  ) {
    redirect(`/trades/new?mode=${mode}&error=${encodeURIComponent("필수 항목을 모두 입력해주세요.")}`);
  }

  if (parseLeverageInput(leverage) === null) {
    redirect(`/trades/new?mode=${mode}&error=${encodeURIComponent("레버리지는 1~100 사이 숫자만 입력해주세요.")}`);
  }

  if (mode === "post" && !holdingTime) {
    redirect(`/trades/new?mode=${mode}&error=${encodeURIComponent("매매일지 작성에서는 포지션 홀딩 시간을 입력해주세요.")}`);
  }

  const { data, error } = await supabase
    .from("trades")
    .insert({
      user_id: userId,
      mode,
      status,
      title,
      symbol,
      trade_date: tradeDate || null,
      holding_time: holdingTime || null,
      position: position === "SHORT" ? "SHORT" : "LONG",
      leverage: parsedLeverage,
      entry_price: parsedEntry,
      exit_price: parsedExit,
      stop_loss: parseNumericInput(stopPrice),
      pnl_rate: pnlRate,
      reasons_entry: reasonsEntry,
      reasons_exit: reasonsExit,
      scenario_checklist: scenarioChecklist || null,
      memo_additional: memoAdditional || null,
      plan,
      result,
      review,
      created_at: new Date(`${tradeDate}T09:00:00.000Z`).toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/trades/new?mode=${mode}&error=${encodeURIComponent(error?.message ?? "생성 실패")}`);
  }

  if (uploadedFiles.length > maxImagePerTrade) {
    redirect(`/trades/new?mode=${mode}&error=${encodeURIComponent("이미지는 최대 3장까지 업로드 가능합니다.")}`);
  }

  if (uploadedFiles.length > 0) {
    try {
      const ownerType = getOwnerTypeByMode(mode);
      for (const [index, file] of uploadedFiles.entries()) {
        await uploadTradeImage({
          file,
          userId,
          tradeId: data.id,
          ownerType,
          sortOrder: index,
        });
      }
    } catch (uploadError) {
      redirect(
        `/trades/${data.id}?error=${encodeURIComponent(
          uploadError instanceof Error ? uploadError.message : "이미지 업로드 중 오류가 발생했습니다.",
        )}`,
      );
    }
  }

  revalidatePath("/trades");
  redirect(`/trades/${data.id}?success=${encodeURIComponent("매매일지를 생성했습니다.")}`);
}

export async function updateTradeAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();
  const uploadedFiles = getUploadedImageFiles(formData);
  const removeImageIds = formData
    .getAll("removeImageIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const existingImageOrderIds = formData
    .getAll("existingImageOrderIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const tradeId = String(formData.get("tradeId") ?? "").trim();
  const mode = getValidMode(String(formData.get("mode") ?? "pre"));
  const status = getValidStatus(String(formData.get("status") ?? "draft"));
  const symbol = String(formData.get("symbol") ?? "").trim().toUpperCase();
  const tradeDate = String(formData.get("tradeDate") ?? "").trim();
  const holdingTime = String(formData.get("holdingTime") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim().toUpperCase();
  const leverage = String(formData.get("leverage") ?? "").trim();
  const entryPrice = String(formData.get("entryPrice") ?? "").trim();
  const exitPrice = String(formData.get("exitPrice") ?? "").trim();
  const stopPrice = String(formData.get("stopPrice") ?? "").trim();
  const entryReason = String(formData.get("entryReason") ?? "").trim();
  const exitReason = String(formData.get("exitReason") ?? "").trim();
  const scenarioChecklist = String(formData.get("scenarioChecklist") ?? "").trim();
  const memoAdditional = String(formData.get("memoAdditional") ?? "").trim();
  const review = String(formData.get("review") ?? "").trim();

  const title = symbol ? `${symbol} ${mode === "pre" ? "시나리오" : "매매일지"}` : "";
  const reasonsEntry = entryReason;
  const reasonsExit = exitReason;
  const plan = encodeTradeFormMeta({
    tradeDate,
    holdingTime,
    position: position === "SHORT" ? "SHORT" : position === "LONG" ? "LONG" : "",
    leverage,
    entryPrice,
    exitPrice,
    stopPrice,
  });
  const parsedEntry = parseNumericInput(entryPrice);
  const parsedExit = parseNumericInput(exitPrice);
  const parsedLeverage = parseLeverageInput(leverage);
  const pnlRate =
    parsedEntry !== null &&
    parsedExit !== null &&
    parsedLeverage !== null &&
    (position === "LONG" || position === "SHORT")
      ? calculatePnlRate(position, parsedEntry, parsedExit, parsedLeverage)
      : null;
  const result =
    pnlRate !== null
      ? `${pnlRate >= 0 ? "+" : ""}${pnlRate.toFixed(2)}%`
      : "";

  if (!tradeId) {
    notFound();
  }

  if (
    !symbol ||
    !tradeDate ||
    !position ||
    !entryPrice ||
    !exitPrice ||
    !stopPrice ||
    !leverage ||
    !entryReason ||
    !exitReason
  ) {
    redirect(`/trades/${tradeId}?error=${encodeURIComponent("필수 항목을 모두 입력해주세요.")}`);
  }

  if (parseLeverageInput(leverage) === null) {
    redirect(`/trades/${tradeId}?error=${encodeURIComponent("레버리지는 1~100 사이 숫자만 입력해주세요.")}`);
  }

  if ((mode === "post" || status === "closed") && !holdingTime) {
    redirect(`/trades/${tradeId}?error=${encodeURIComponent("포지션 종료 기록에는 홀딩 시간을 입력해주세요.")}`);
  }

  const { error } = await supabase
    .from("trades")
    .update({
      mode,
      status,
      title,
      symbol,
      trade_date: tradeDate || null,
      holding_time: holdingTime || null,
      position: position === "SHORT" ? "SHORT" : "LONG",
      leverage: parsedLeverage,
      entry_price: parsedEntry,
      exit_price: parsedExit,
      stop_loss: parseNumericInput(stopPrice),
      pnl_rate: pnlRate,
      reasons_entry: reasonsEntry,
      reasons_exit: reasonsExit,
      scenario_checklist: scenarioChecklist || null,
      memo_additional: memoAdditional || null,
      plan,
      result,
      review,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tradeId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/trades/${tradeId}?error=${encodeURIComponent(error.message)}`);
  }

  const currentImages = await fetchTradeImages(userId, tradeId);
  if (currentImages.length > 0) {
    await supabase
      .from("trade_images")
      .update({ owner_type: getOwnerTypeByMode(mode) })
      .eq("user_id", userId)
      .eq("owner_id", tradeId);
  }
  const currentImageIdSet = new Set(currentImages.map((item) => item.id));
  const remainingOrderedIds = existingImageOrderIds.filter(
    (id) => currentImageIdSet.has(id) && !removeImageIds.includes(id),
  );
  const fallbackRemainingIds = currentImages
    .map((item) => item.id)
    .filter((id) => !removeImageIds.includes(id) && !remainingOrderedIds.includes(id));
  const finalRemainingIds = [...remainingOrderedIds, ...fallbackRemainingIds];
  const remainingCount = finalRemainingIds.length;
  if (remainingCount + uploadedFiles.length > maxImagePerTrade) {
    redirect(`/trades/${tradeId}?edit=1&error=${encodeURIComponent("이미지는 최대 3장까지 유지할 수 있습니다.")}`);
  }

  if (removeImageIds.length > 0) {
    await removeTradeImages({ userId, imageIds: removeImageIds });
  }

  if (finalRemainingIds.length > 0) {
    await Promise.all(
      finalRemainingIds.map((id, index) =>
        supabase
          .from("trade_images")
          .update({ sort_order: index, owner_type: getOwnerTypeByMode(mode) })
          .eq("id", id)
          .eq("user_id", userId),
      ),
    );
  }

  if (uploadedFiles.length > 0) {
    const ownerType = getOwnerTypeByMode(mode);
    const baseSortOrder = remainingCount;
    try {
      for (const [index, file] of uploadedFiles.entries()) {
        await uploadTradeImage({
          file,
          userId,
          tradeId,
          ownerType,
          sortOrder: baseSortOrder + index,
        });
      }
    } catch (uploadError) {
      redirect(
        `/trades/${tradeId}?edit=1&error=${encodeURIComponent(
          uploadError instanceof Error ? uploadError.message : "이미지 업로드 중 오류가 발생했습니다.",
        )}`,
      );
    }
  }

  revalidatePath("/trades");
  revalidatePath(`/trades/${tradeId}`);
  redirect(`/trades/${tradeId}?success=${encodeURIComponent("변경사항을 저장했습니다.")}`);
}

export async function deleteTradeAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  const tradeId = String(formData.get("tradeId") ?? "").trim();

  if (!tradeId) {
    notFound();
  }

  const existingImages = await fetchTradeImages(userId, tradeId);
  if (existingImages.length > 0) {
    await Promise.allSettled(
      existingImages.flatMap((image) => [
        deleteR2Object(image.object_key_full),
        deleteR2Object(image.object_key_thumb),
      ]),
    );
    await supabase
      .from("trade_images")
      .delete()
      .eq("user_id", userId)
      .eq("owner_id", tradeId);
  }

  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", tradeId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/trades/${tradeId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/trades");
  redirect(`/trades?success=${encodeURIComponent("매매일지를 삭제했습니다.")}`);
}

export async function duplicateTradeAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  const tradeId = String(formData.get("tradeId") ?? "").trim();

  if (!tradeId) {
    notFound();
  }

  const { data: source, error: sourceError } = await supabase
    .from("trades")
    .select(
      "mode, title, symbol, trade_date, holding_time, position, leverage, entry_price, exit_price, stop_loss, pnl_rate, reasons_entry, reasons_exit, scenario_checklist, memo_additional, plan, result, review",
    )
    .eq("id", tradeId)
    .eq("user_id", userId)
    .single();

  if (sourceError || !source) {
    redirect(`/trades?error=${encodeURIComponent(sourceError?.message ?? "복제 실패")}`);
  }

  const { error } = await supabase.from("trades").insert({
    user_id: userId,
    mode: source.mode,
    status: "draft",
    title: `${source.title} (copy)`,
    symbol: source.symbol,
    trade_date: source.trade_date,
    holding_time: source.holding_time,
    position: source.position,
    leverage: source.leverage,
    entry_price: source.entry_price,
    exit_price: source.exit_price,
    stop_loss: source.stop_loss,
    pnl_rate: source.pnl_rate,
    reasons_entry: source.reasons_entry,
    reasons_exit: source.reasons_exit,
    scenario_checklist: source.scenario_checklist,
    memo_additional: source.memo_additional,
    plan: source.plan,
    result: source.result,
    review: source.review,
  });

  if (error) {
    redirect(`/trades?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/trades");
  redirect(`/trades?success=${encodeURIComponent("매매일지를 복제했습니다.")}`);
}

export async function updateTradeStatusAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  const tradeId = String(formData.get("tradeId") ?? "").trim();
  const status = getValidStatus(String(formData.get("status") ?? "draft"));

  if (!tradeId) {
    notFound();
  }

  const { error } = await supabase
    .from("trades")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tradeId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/trades?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/trades");
  redirect(`/trades?success=${encodeURIComponent("상태를 변경했습니다.")}`);
}

export async function closePositionFromDetailAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  const tradeId = String(formData.get("tradeId") ?? "").trim();
  if (!tradeId) {
    notFound();
  }

  const { error } = await supabase
    .from("trades")
    .update({
      mode: "post",
      status: "closed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", tradeId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/trades/${tradeId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/trades");
  revalidatePath(`/trades/${tradeId}`);
  redirect(
    `/trades/${tradeId}?edit=1&focus=postClose&success=${encodeURIComponent(
      "포지션이 종료되었습니다. 홀딩 시간과 복기 내용을 입력해보세요",
    )}`,
  );
}
