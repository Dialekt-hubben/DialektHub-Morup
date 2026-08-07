import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

const robotoMono = Roboto_Mono({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    openGraph: {
        title: "Mårpeakademien orlesta",
        description: "Mårpeakademiens orlesta",
        images: "/logo.svg",
    },
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
