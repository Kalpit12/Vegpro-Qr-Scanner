"use client";

import Image from "next/image";
import { useState } from "react";

type PassportImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  wrapperClassName: string;
  fallbackLabel?: string;
};

export function PassportImage({
  src,
  alt,
  priority = false,
  sizes,
  className = "object-cover",
  wrapperClassName,
  fallbackLabel = "Photograph unavailable",
}: PassportImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${wrapperClassName} flex flex-col items-center justify-center gap-2 bg-muted/80 px-6 text-center`}
        role="img"
        aria-label={alt}
      >
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {fallbackLabel}
        </span>
        <span className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          This variety&apos;s public image could not be loaded.
        </span>
      </div>
    );
  }

  return (
    <div className={`${wrapperClassName} relative overflow-hidden bg-muted`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
