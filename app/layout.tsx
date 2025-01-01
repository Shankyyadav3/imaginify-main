import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

const IBMplex = IBM_Plex_Sans({
  weight: ['400','500','600','700'],
  subsets: ["latin"],
  variable: '--font-ibm-plex'
});
export const metadata: Metadata = {
  title: "Imaginify",
  description: "AI-powered image generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables: {colorPrimary: '#624cf5'}
    }}>
    <html lang="en">
      <body className={cn("font-IBMplex-antialiased",IBMplex.variable)}>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
