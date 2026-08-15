import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  return {
    metadataBase: base,
    title: "FailFirst — 先失败一次，再勇敢开始",
    description: "一场帮助你发现行动 Bug、把失败变成反馈的互动冒险。",
    icons: { icon: "/favicon.svg" },
    openGraph: { title: "FailFirst — 先失败一次，再勇敢开始", description: "把失败从需要逃避的东西，变成可以探索的东西。", images: [{ url: new URL("/og.png", base).toString(), width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: "FailFirst", description: "先失败一次，再勇敢开始。", images: [new URL("/og.png", base).toString()] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
