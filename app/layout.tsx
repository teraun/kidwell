import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  variable: "--font-ethiopic",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KidWell — School Wellbeing Platform",
  description: "AI-powered school wellbeing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="am" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoEthiopic.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
