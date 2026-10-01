"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FlowerQrPanelProps = {
  publicIdentifier: string;
  publicUrl: string;
  publicPath: string;
  varietyName: string;
  varietyCode: string;
  qrPreviewDataUrl: string;
  /** Subordinate styling on variety edit pages */
  variant?: "default" | "supporting";
};

export function FlowerQrPanel({
  publicIdentifier,
  publicUrl,
  publicPath,
  varietyName,
  varietyCode,
  qrPreviewDataUrl,
  variant = "default",
}: FlowerQrPanelProps) {
  const [copied, setCopied] = useState(false);
  const pngUrl = `/api/qr/${publicIdentifier}?format=png`;
  const pngDownload = `/api/qr/${publicIdentifier}?format=png&download=1`;
  const svgDownload = `/api/qr/${publicIdentifier}?format=svg&download=1`;

  async function copyUrl() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const shellClass =
    variant === "supporting"
      ? "border border-border bg-muted/30 p-4 sm:p-5"
      : "vegpro-section";

  return (
    <section id="qr" className={shellClass}>
      <p className="type-editorial-label">Digital identity</p>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        Permanent doorway to the public Flower Passport. This QR encodes the stable
        public URL only — never variety data.
      </p>

      <div className="mt-5 grid min-w-0 gap-6 sm:grid-cols-[minmax(0,11.5rem)_minmax(0,1fr)] sm:items-start sm:gap-8 lg:max-w-3xl">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="w-fit border border-border bg-background p-2.5">
            <Image
              src={qrPreviewDataUrl}
              alt={`QR code for ${publicIdentifier}`}
              width={168}
              height={168}
              unoptimized
              className="size-[168px] max-w-full"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="font-display text-xl font-semibold leading-snug text-foreground">
              {varietyName}
            </p>
            <p className="font-mono text-xs text-muted-foreground">{varietyCode}</p>
            <p className="font-mono text-xs font-medium text-botanical">{publicIdentifier}</p>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div>
            <p className="type-editorial-label">Public URL</p>
            <div className="mt-2 space-y-2">
              <Input readOnly value={publicUrl} aria-label="Public passport URL" />
              <p className="type-meta font-mono">{publicPath}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={copyUrl}>
              {copied ? "Copied" : "Copy URL"}
            </Button>
            <a className={buttonVariants({ variant: "outline", size: "sm" })} href={pngDownload}>
              Download PNG
            </a>
            <a className={buttonVariants({ variant: "outline", size: "sm" })} href={svgDownload}>
              Download SVG
            </a>
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href={`/admin/flowers/${publicIdentifier}/qr/print`}
            >
              Print
            </Link>
            <a
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              href={pngUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open PNG
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
