import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "YAN — Full Stack Developer",
  description: "Portfolio — Full Stack Developer specializing in Next.js, TypeScript, and modern web applications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={oswald.variable}>
      <body className="bg-[#080808] text-white overflow-x-hidden">{children}</body>
    </html>
  );
}
