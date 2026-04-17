"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";

import { type TradeImage } from "@/types/trade-image";
import { buildTradeImageProxyUrl } from "@/utils/trade-images";

type TradeImageGalleryProps = {
  images: TradeImage[];
};

export function TradeImageGallery({ images }: TradeImageGalleryProps) {
  const sorted = useMemo(
    () =>
      [...images]
        .filter((item) => item.deleted_at === null)
        .sort((a, b) => a.sort_order - b.sort_order),
    [images],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (sorted.length === 0) {
    return null;
  }

  const activeImage = activeIndex !== null ? sorted[activeIndex] : null;

  function moveSlide(direction: -1 | 1) {
    if (activeIndex === null) return;
    const next =
      (activeIndex + direction + sorted.length) % sorted.length;
    setActiveIndex(next);
  }

  return (
    <>
      <section className="mb-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-[#101317]">
        <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-zinc-500">
          차트 이미지
        </p>
        <div className="space-y-3">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className="group relative block w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-left dark:border-zinc-700 dark:bg-zinc-900/60"
              onClick={() => setActiveIndex(index)}
            >
              <div className="absolute left-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                이미지 {index + 1}
              </div>
              <div className="relative w-full overflow-hidden bg-zinc-900">
                <Image
                  src={buildTradeImageProxyUrl(image.id, "full")}
                  alt={image.file_name}
                  width={1920}
                  height={1080}
                  className="h-auto w-full object-contain"
                  loading="lazy"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </button>
          ))}
        </div>
      </section>

      {activeImage ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-zinc-900/70 text-zinc-100"
            onClick={() => setActiveIndex(null)}
            aria-label="모달 닫기"
          >
            <X className="size-5" />
          </button>

          {sorted.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-4 inline-flex size-9 items-center justify-center rounded-full bg-zinc-900/70 text-zinc-100"
                onClick={() => moveSlide(-1)}
                aria-label="이전 이미지"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-900/70 text-zinc-100"
                onClick={() => moveSlide(1)}
                aria-label="다음 이미지"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}

          <Image
            src={buildTradeImageProxyUrl(activeImage.id, "full")}
            alt={activeImage.file_name}
            width={1600}
            height={900}
            className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
            unoptimized
          />
        </div>
      ) : null}
    </>
  );
}
