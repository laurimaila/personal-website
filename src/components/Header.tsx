'use client';
import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { config } from '@/config';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { SiGithub } from '@icons-pack/react-simple-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, JSX } from 'react';

interface MenuItem {
    name: string;
    href: string;
    openInNewTab?: boolean;
    icon?: JSX.Element;
}

// Show icon over name
const menuItems: MenuItem[] = [
    { name: 'Blog', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Chat', href: '/chat' },
    {
        name: 'Github',
        href: 'https://github.com/laurimaila',
        openInNewTab: true,
        icon: <SiGithub size={24} />,
    },
];

export const Navigation: FC = () => {
    const [sheetOpen, setSheetOpen] = useState(false);

    const pathname = usePathname();

    return (
        <nav>
            <div className="hidden items-center md:flex">
                {menuItems.map((item) => (
                    <div key={item.href} className="ml-4 md:ml-8">
                        {item.openInNewTab ? (
                            <a
                                key={item.href}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'hover:text-gray-900',
                                    pathname === item.href && 'font-semibold',
                                )}>
                                {item.icon ? item.icon : item.name}
                            </a>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'hover:text-gray-900',
                                    pathname === item.href && 'font-semibold',
                                )}>
                                {item.icon ? item.icon : item.name}
                            </Link>
                        )}
                    </div>
                ))}
            </div>
            <div className="md:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <div className="relative z-[100]">
                        <SheetTrigger>
                            <Menu size="24" aria-label="Toggle navigation menu" />
                        </SheetTrigger>
                    </div>
                    <SheetContent className="z-[99] w-[60vw]">
                        <SheetHeader>
                            <SheetTitle className="sr-only">Mobile navigation menu</SheetTitle>
                            <SheetDescription>
                                {menuItems.map((item) =>
                                    item.openInNewTab ? (
                                        <a
                                            key={item.href}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                'block py-2',
                                                pathname === item.href && 'font-semibold',
                                            )}>
                                            {item.name}
                                        </a>
                                    ) : (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSheetOpen(false)}
                                            className={cn(
                                                'block py-2',
                                                pathname === item.href && 'font-semibold',
                                            )}>
                                            {item.name}
                                        </Link>
                                    ),
                                )}
                            </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};

const Header: FC = () => {
    return (
        <section className="mx-5 mb-12 mt-5 flex items-center justify-between md:mx-0 md:mt-16">
            <Link href="/">
                <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
                    {config.blog.name}
                </h1>
            </Link>
            <Navigation />
        </section>
    );
};

export default Header;
