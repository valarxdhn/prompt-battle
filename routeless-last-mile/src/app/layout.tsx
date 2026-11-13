import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miro Wireframe",
  description: "View the project wireframe in Miro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}