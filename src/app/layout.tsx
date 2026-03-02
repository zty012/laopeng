import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../index.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Laopeng",
  description: "AI-powered interdisciplinary research assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={inter.className}>
        <TooltipProvider>
          <Toaster position="bottom-right" richColors />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
