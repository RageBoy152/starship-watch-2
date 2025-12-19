import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import "./globals.css";


const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});


export const metadata: Metadata = {
  title: "Starship Watch | Alpha",
  description: "Very epic 3d thing (we're so back)",
};


export default function RootLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${chakra.variable} font-chakra antialiased bg-bg-primary text-label-primary overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
