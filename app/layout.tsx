import type { Metadata } from "next";
import { Libre_Baskerville, Roboto_Mono } from "next/font/google";
import "./globals.css";

const display = Libre_Baskerville({ variable: "--font-display", subsets: ["latin"], weight: ["400", "700"] });
const mono = Roboto_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });
export const metadata: Metadata = { title: "Lab — Bookchaowalit", description: "A local notebook for experiments and observations.", metadataBase: new URL("https://lab.bookchaowalit.com"), openGraph: { title: "Lab — Bookchaowalit", description: "A local notebook for experiments and observations.", type: "website" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${display.variable} ${mono.variable}`}>{/* THESIS: experiments deserve a trace, not a generic dashboard. OWN-WORLD: aged paper, bench green, instrument amber, notebook serif, and mono labels. STORY: record the question, read the signal, and pin what future-you should try next. FIRST VIEWPORT: a live instrument dial balances the oversized notebook thesis; observations remain below the readout. FORM: assigned bench notebook direction, candidate 7 of 7, seed 4a533645. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance */}{children}</body></html>; }
