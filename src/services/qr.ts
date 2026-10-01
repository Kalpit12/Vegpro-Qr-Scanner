import QRCode from "qrcode";
import { buildFlowerPublicUrl } from "@/lib/flower-public-url";
import { isPublicIdentifier } from "@/lib/public-identifier";

const QR_OPTIONS = {
  errorCorrectionLevel: "H" as const,
  margin: 2,
};

function assertPublicIdentifier(publicIdentifier: string) {
  if (!isPublicIdentifier(publicIdentifier)) {
    throw new Error("INVALID_PUBLIC_IDENTIFIER");
  }
}

export {
  buildFlowerPublicPath,
  buildFlowerPublicUrl,
  getAppPublicBaseUrl,
} from "@/lib/flower-public-url";

export async function generateFlowerQrPng(
  publicIdentifier: string,
): Promise<Buffer> {
  assertPublicIdentifier(publicIdentifier);
  const url = buildFlowerPublicUrl(publicIdentifier);
  return QRCode.toBuffer(url, {
    ...QR_OPTIONS,
    type: "png",
    width: 512,
  });
}

export async function generateFlowerQrSvg(
  publicIdentifier: string,
): Promise<string> {
  assertPublicIdentifier(publicIdentifier);
  const url = buildFlowerPublicUrl(publicIdentifier);
  return QRCode.toString(url, {
    ...QR_OPTIONS,
    type: "svg",
  });
}

export async function generateFlowerQrDataUrl(
  publicIdentifier: string,
): Promise<string> {
  assertPublicIdentifier(publicIdentifier);
  const url = buildFlowerPublicUrl(publicIdentifier);
  return QRCode.toDataURL(url, {
    ...QR_OPTIONS,
    width: 280,
  });
}
