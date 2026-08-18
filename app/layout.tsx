import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NESCAFÉ RTD CEP Engine Builder",
  description: "Build, score and translate the six Always Ready category entry point engines.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
