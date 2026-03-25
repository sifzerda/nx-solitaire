import { Geist, Geist_Mono, UnifrakturCook } from "next/font/google";
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

const unifraktur = UnifrakturCook({
  variable: "--font-unifraktur",
  weight: "700",
  subsets: ["latin"],
});

export const metadata = {
  title: "Solitaire",
  description: "A game of Solitaire built with React Next",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${unifraktur.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        <Header />
        <Navigation />

        <main className="flex-grow">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  );
}