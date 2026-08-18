import type { Metadata } from "next";
import { Lato, Roboto } from "next/font/google";
import "./globals.css";

// DS2 | Core Style Library type styles:
// - Lato (weight 900/Black) powers Headers/Data Point, H1, H2
// - Roboto (weights 400/500) powers Headers/H3, H4 and all Body styles
const lato = Lato({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-lato",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "4Insite Prototype",
  description: "Prototype built from the 4Insite DS2 design system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} ${roboto.variable}`}>
      <head>
        {/* Font Awesome Pro Kit (95881adc33) — Web Fonts + CSS delivery,
            not the SVG+JS auto-replacer, so it can't fight React's own
            DOM management. Icons render via className, e.g.
            <i className="fa-solid fa-bullhorn" />. */}
        <link
          rel="stylesheet"
          href="https://kit.fontawesome.com/95881adc33.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
