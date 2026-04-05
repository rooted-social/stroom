"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { type TradeImage } from "@/types/trade-image";
import { buildTradeImageProxyUrl } from "@/utils/trade-images";

const MAX_IMAGES = 3;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

type TradeImagesFieldProps = {
  existingImages?: TradeImage[];
};

type SelectedFilePreview = {
  id: string;
  file: File;
  previewUrl: string;
};

function createFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`;
}

export function TradeImagesField({ existingImages = [] }: TradeImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFilePreview[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [existingOrderIds, setExistingOrderIds] = useState<string[]>(
    existingImages.map((image) => image.id),
  );
  const [errorMessage, setErrorMessage] = useState("");

  const existingImageMap = useMemo(
    () => new Map(existingImages.map((image) => [image.id, image])),
    [existingImages],
  );

  const orderedExistingImages = useMemo(
    () =>
      existingOrderIds
        .map((id) => existingImageMap.get(id))
        .filter((item): item is TradeImage => Boolean(item)),
    [existingOrderIds, existingImageMap],
  );

  const remainingExistingCount = useMemo(
    () => existingImages.filter((image) => !removedImageIds.includes(image.id)).length,
    [existingImages, removedImageIds],
  );

  function syncInputFileList(nextFiles: SelectedFilePreview[]) {
    if (!inputRef.current) return;
    const dataTransfer = new DataTransfer();
    nextFiles.forEach((item) => dataTransfer.items.add(item.file));
    inputRef.current.files = dataTransfer.files;
  }

  function setNextSelectedFiles(nextFiles: SelectedFilePreview[]) {
    setSelectedFiles(nextFiles);
    syncInputFileList(nextFiles);
  }

  function appendFiles(files: File[]) {
    const currentCount = remainingExistingCount + selectedFiles.length;
    if (files.length === 0) return;

    const filtered = files.filter((file) => ALLOWED_TYPES.includes(file.type));
    if (filtered.length !== files.length) {
      setErrorMessage("jpg, jpeg, png, webp 파일만 업로드할 수 있습니다.");
      return;
    }

    const oversize = filtered.find((file) => file.size > MAX_SIZE_BYTES);
    if (oversize) {
      setErrorMessage("이미지 한 장당 최대 10MB까지 업로드 가능합니다.");
      return;
    }

    if (currentCount + filtered.length > MAX_IMAGES) {
      setErrorMessage("문서당 이미지는 최대 3장까지 업로드 가능합니다.");
      return;
    }

    const previews = filtered.map((file) => ({
      id: createFileId(file),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setErrorMessage("");
    const next = [...selectedFiles, ...previews];
    setNextSelectedFiles(next);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    appendFiles(Array.from(event.target.files ?? []));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    appendFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function removeSelectedFile(id: string) {
    const target = selectedFiles.find((item) => item.id === id);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }
    const next = selectedFiles.filter((item) => item.id !== id);
    setNextSelectedFiles(next);
    setErrorMessage("");
  }

  function toggleRemoveExistingImage(imageId: string) {
    setRemovedImageIds((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId],
    );
    setErrorMessage("");
  }

  function moveSelectedFile(id: string, direction: -1 | 1) {
    const currentIndex = selectedFiles.findIndex((item) => item.id === id);
    const targetIndex = currentIndex + direction;
    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= selectedFiles.length
    ) {
      return;
    }
    const next = [...selectedFiles];
    [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
    setNextSelectedFiles(next);
  }

  function moveExistingImage(id: string, direction: -1 | 1) {
    const currentIndex = existingOrderIds.findIndex((value) => value === id);
    const targetIndex = currentIndex + direction;
    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= existingOrderIds.length
    ) {
      return;
    }
    const next = [...existingOrderIds];
    [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
    setExistingOrderIds(next);
  }

  return (
    <section className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          이미지 업로드 (최대 3장)
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          jpg, jpeg, png, webp만 업로드 가능하며 파일당 최대 10MB입니다.
        </p>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="flex justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950/60"
      >
        <input
          ref={inputRef}
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          파일 선택 또는 드래그 앤 드롭
        </button>
      </div>

      {errorMessage ? (
        <p className="text-xs text-rose-600 dark:text-rose-400">{errorMessage}</p>
      ) : null}

      {orderedExistingImages.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {orderedExistingImages.map((image, index) => {
            const isRemoved = removedImageIds.includes(image.id);
            return (
              <div
                key={image.id}
                className={`relative overflow-hidden rounded-lg border ${
                  isRemoved
                    ? "border-rose-300 opacity-50 dark:border-rose-700"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <Image
                  src={buildTradeImageProxyUrl(image.id, "thumb")}
                  alt={image.file_name}
                  width={320}
                  height={180}
                  className="h-28 w-full object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 inline-flex cursor-pointer items-center justify-center rounded-full bg-black/65 p-1 text-white"
                  onClick={() => toggleRemoveExistingImage(image.id)}
                >
                  <X className="size-3.5" />
                </button>
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveExistingImage(image.id, -1)}
                    disabled={index === 0}
                    className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/65 text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveExistingImage(image.id, 1)}
                    disabled={index === orderedExistingImages.length - 1}
                    className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/65 text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
                <p className="truncate px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-300">
                  {isRemoved ? "삭제 예정" : image.file_name}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      {selectedFiles.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {selectedFiles.map((item, index) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
            >
              <Image
                src={item.previewUrl}
                alt={item.file.name}
                width={320}
                height={180}
                className="h-28 w-full object-cover"
                unoptimized
              />
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex cursor-pointer items-center justify-center rounded-full bg-black/65 p-1 text-white"
                onClick={() => removeSelectedFile(item.id)}
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSelectedFile(item.id, -1)}
                  disabled={index === 0}
                  className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/65 text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSelectedFile(item.id, 1)}
                  disabled={index === selectedFiles.length - 1}
                  className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/65 text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
              <p className="truncate px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-300">
                {item.file.name}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {removedImageIds.map((imageId) => (
        <input key={imageId} type="hidden" name="removeImageIds" value={imageId} />
      ))}
      {existingOrderIds
        .filter((imageId) => !removedImageIds.includes(imageId))
        .map((imageId) => (
          <input
            key={`order-${imageId}`}
            type="hidden"
            name="existingImageOrderIds"
            value={imageId}
          />
        ))}
    </section>
  );
}
