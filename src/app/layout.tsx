import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MBTI 选专业",
  description:
    "用 MBTI 找到更像你的学长学姐，看看他们真实的专业体验",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Serif+SC:wght@400;500;600;700&family=LXGW+WenKai:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        {children}
      </body>
    </html>
  );
}
