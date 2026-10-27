import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { DeviceFrame } from "@/components/DeviceFrame";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Cloudbreak",
  description:
    "Daily bite-size lessons and a moderated community for teens quitting vaping.",
};

export const viewport: Viewport = {
  themeColor: "#7cc8f8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: extensions like Grammarly inject attributes into <body> */}
      <body className={`${nunito.variable} font-sans antialiased`} suppressHydrationWarning>
        <DeviceFrame>{children}</DeviceFrame>
      </body>
    </html>
  );
}
