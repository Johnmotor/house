import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "民宿管理系统",
  description: "轻量级民宿内部管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
