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
    { name: 'Physics', href: '/physics' },
    { name: 'Chat', href: '/chat' },
    {
        name: 'Github',
        href: 'https://github.com/laurimaila/personal-website',
        openInNewTab: true,
        icon: <SiGithub size={24} />,
    },
];

export const TopNavigation: FC = () => {
    const [sheetOpen, setSheetOpen] = useState<boolean>(false);
    const pathname = usePathname();

    const isActive = (item: MenuItem) => {
        if (item.href === '/') {
            return pathname === '/' || pathname.startsWith('/blog');
        }
        return pathname.startsWith(item.href);
    };

    return (
        <nav>
            <div className="hidden items-center md:flex">
                {menuItems.map((item) => (
                    <div key={item.href} className="ml-4 md:ml-8">
                        {item.openInNewTab ? (
                            <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'hover:text-primary-foreground/60 rounded-md py-2',
                                    isActive(item) ? 'bg-accent text-accent-foreground' : '',
                                )}>
                                {item.icon ? item.icon : item.name}
                            </a>
                        ) : (
                            <Link
                                href={item.href}
                                className={cn(
                                    'hover:text-primary-foreground/60 rounded-md px-3 py-2',
                                    isActive(item) ? 'bg-accent text-accent-foreground' : '',
                                )}>
                                {item.icon ? item.icon : item.name}
                            </Link>
                        )}
                    </div>
                ))}
            </div>
            <div className="md:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <button className="relative" aria-label="Toggle navigation menu">
                            <Menu size="24" />
                        </button>
                    </SheetTrigger>
                    <SheetContent className="z-[99] w-[60vw]">
                        <SheetHeader>
                            <SheetTitle className="sr-only">Mobile navigation menu</SheetTitle>
                            <SheetDescription className="sr-only">
                                Navigation links
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-4 flex flex-col gap-2">
                            {menuItems.map((item) =>
                                item.openInNewTab ? (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            'mx-7 block rounded-sm py-2 text-center',
                                            isActive(item)
                                                ? 'bg-accent text-accent-foreground'
                                                : '',
                                        )}>
                                        {item.name}
                                    </a>
                                ) : (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSheetOpen(false)}
                                        className={cn(
                                            'mx-7 block rounded-sm py-2 text-center',
                                            isActive(item)
                                                ? 'bg-accent text-accent-foreground'
                                                : '',
                                        )}>
                                        {item.name}
                                    </Link>
                                ),
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};
