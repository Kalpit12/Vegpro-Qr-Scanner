/** Stable demo passport images (served from /public, not remote hotlinks). */
export const DEMO_FLOWER_IMAGE_PATHS: Record<
  "VP-0001" | "VP-0002" | "VP-0003",
  string
> = {
  "VP-0001": "/demo/flowers/vp-0001.jpg",
  "VP-0002": "/demo/flowers/vp-0002.jpg",
  "VP-0003": "/demo/flowers/vp-0003.jpg",
};

export function getDemoFlowerImagePath(
  publicIdentifier: string,
): string | undefined {
  if (publicIdentifier in DEMO_FLOWER_IMAGE_PATHS) {
    return DEMO_FLOWER_IMAGE_PATHS[
      publicIdentifier as keyof typeof DEMO_FLOWER_IMAGE_PATHS
    ];
  }
  return undefined;
}
