import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { getInactiveUserSession } from "@/lib/auth";
import { ChangePasswordModal } from "@/components/Auth/ChangePasswordModal";

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

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const userSession = await getInactiveUserSession();

    return (
        <html lang="en">
            <body className={robotoMono.className}>
                <Header />
                {userSession?.mustChangePassword && (
                    <ChangePasswordModal email={userSession.email} />
                )}

                {children}

                <Footer />
            </body>
        </html>
    );
}
