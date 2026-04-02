import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/components/Provider";
import { Header, Footer } from "@/components/layout/HeaderFooter";

export const metadata: Metadata = {
  title: "SMS Reseller Platform",
  description: "SMS Verification & Social Media Logs Reseller",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,500,600,700&display=swap" rel="stylesheet" />
        <script src="https://js.paystack.co/v1/inline.js" async />
      </head>
      <body className="min-h-full flex flex-col bg-navy">
        <Provider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Provider>
      </body>
    </html>
  );
}