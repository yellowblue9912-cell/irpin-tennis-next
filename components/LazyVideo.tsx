"use client";

import { useState } from "react";

type LazyVideoProps = {
  src: string;
  webmSrc?: string;
  poster?: string;
  label: string;
  className?: string;
};

export default function LazyVideo({
  src,
  webmSrc,
  poster,
  label,
  className = "aspect-video w-full bg-black object-contain",
}: LazyVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const resolvedPoster =
    poster ?? src.replace(/\.[^/.]+$/, ".jpg") ?? "/video-poster.svg";

  if (!isLoaded) {
    return (
      <button
        type="button"
        onClick={() => setIsLoaded(true)}
        className={`group relative block overflow-hidden bg-[#123f2d] text-white ${className}`}
        aria-label={`Завантажити: ${label}`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${resolvedPoster}")` }}
        />
        <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#d7f34c] text-2xl text-[#123f2d] shadow-lg transition group-hover:scale-105">
          ▶
        </span>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-4 py-2 text-xs font-black uppercase tracking-wide">
          Завантажити відео
        </span>
      </button>
    );
  }

  return (
    <video
      aria-label={label}
      controls
      playsInline
      preload="none"
      poster={resolvedPoster}
      className={className}
    >
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      <source src={src} type="video/mp4" />
      Ваш браузер не підтримує відтворення відео.
    </video>
  );
}
