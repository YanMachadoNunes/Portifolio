import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yan Machado Nunes — Dev",
  description: "Desenvolvedor full-stack focado em Next.js, Prisma e PostgreSQL. Estudante de Ciências da Computação.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
