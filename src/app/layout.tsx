import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Son Tra — Beyond the Map",
  description: "Interactive 3D trekking prototype for Son Tra Peninsula.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
