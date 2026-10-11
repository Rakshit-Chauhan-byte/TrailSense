import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrailSense — Less scrolling. More exploring.",
  description: "An outdoor micro-quest guide for mindful walking and nature observation. Touch Grass hackathon MVP.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
