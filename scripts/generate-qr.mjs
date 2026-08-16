import { resolve } from "node:path";
import QRCode from "qrcode";

const target = process.argv[2];
if (!target) {
  console.error("Usage: npm run generate:qr -- https://example.com/");
  process.exit(1);
}

let url;
try {
  url = new URL(target);
} catch {
  console.error("QR target must be a valid absolute URL.");
  process.exit(1);
}

if (url.protocol !== "https:") {
  console.error("QR target must use HTTPS.");
  process.exit(1);
}

const common = {
  errorCorrectionLevel: "H",
  margin: 4,
  color: { dark: "#000000", light: "#ffffff" },
  type: "png",
};

await Promise.all([
  QRCode.toFile(resolve("public/failfirst-qr.png"), url.href, { ...common, width: 512 }),
  QRCode.toFile(resolve("public/failfirst-qr-1024.png"), url.href, { ...common, width: 1024 }),
]);

console.log(`Generated FailFirst QR codes for ${url.href}`);
