import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildOrganizationJsonLd } from "@/lib/seo/structuredData";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteTitle = "Embun";
const siteDescription =
  "Embun — platform yang menghubungkan tamu dengan campsite terbaik, sekaligus membantu pemilik campsite mengelola reservasi dan komisi secara otomatis.";

export const metadata: Metadata = {
  metadataBase: new URL("https://embun.app"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <JsonLd data={buildOrganizationJsonLd()} />
        {children}
      </body>
    </html>
  );
}
