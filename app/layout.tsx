import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investment Simulator",
  description: "Classroom investment simulator using virtual money and real mutual fund data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
