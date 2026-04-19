import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "animate.css";
import { ResponseLogger } from "@/components/response-logger";
import { cookies } from "next/headers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AIdroid Simulator",
  description: "Enter AIdroid world with OharaAI. Choose your language, set a PIN, and explore a digital realm with a WhatsApp-like interface and app store. Over 30 languages supported.",
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_0782dc2e-8bd2-49e5-a278-23734fa1d13e-MOcIwMuqcaeWxyYUaDwaKQ2ySYwN7v",
      button: {
        title: "Open with Ohara",
        action: {
          type: "launch_frame",
          name: "AIdroid Simulator",
          url: "https://cake-magnet-756.preview.series.engineering",
          splashImageUrl: "https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg",
          splashBackgroundColor: "#ffffff"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestId = cookies().get("x-request-id")?.value;

  return (
    <html lang="en">
      <head>
        {requestId && <meta name="x-request-id" content={requestId} />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ResponseLogger />
      </body>
    </html>
  );
}
