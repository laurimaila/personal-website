import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { config } from '@/config';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const fontSans = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
    title: {
        absolute: config.blog.metadata.title.absolute,
        default: config.blog.metadata.title.default,
        template: config.blog.metadata.title.template,
    },
    description: config.blog.metadata.description,
    openGraph: {
        title: config.blog.metadata.title.default,
        description: config.blog.metadata.description,
        images: [],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased max-w-6xl m-auto',
                    fontSans.variable,
                )}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange>
                    <Header />
                    <main>{children}</main>
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}
