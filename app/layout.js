import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata = {
  title: "Solitaire",
  description: "A game of Solitaire built with React Next",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}>
      <Header />
      <Navigation />
      <body className="min-h-full flex flex-col">{children}</body>
      <Footer />
    </html>
  );
}
