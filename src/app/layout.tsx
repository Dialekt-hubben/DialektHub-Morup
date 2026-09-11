import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const robotoMono = Roboto_Mono({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    openGraph: {
        title: "Mårpeakademien orlesta",
        description: "Mårpeakademiens orlesta",
        images: "/logo.svg",
    },
    metadataBase: new URL("https://www.glommen.eu"),
    title: "Mårpeakademien orlesta",
    description: "Mårpeakademiens orlesta",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={robotoMono.className}>
                <Header />

                {children}

                <Footer />
            </body>
        </html>
    );
}
