'use client';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
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
    const pathname = usePathname();

    return (
        <nav>
            <div className="hidden md:flex items-center">
                {menuItems.map((item) => (
                    <div key={item.href} className="ml-4 md:ml-8">
                        <a
                            href={item.href}
                            target={item.openInNewTab ? '_blank' : '_self'}
                            className={cn(
                                'hover:text-gray-900',
                                pathname === item.href && 'font-semibold',
                            )}>
                            {item.icon ? item.icon : item.name}
                        </a>
                    </div>
                ))}
            </div>
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger>
                        <Menu size="24" />
                    </SheetTrigger>
                    <SheetContent className="w-52">
                        <SheetHeader>
                            <SheetDescription>
                                {menuItems.map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        target={item.openInNewTab ? '_blank' : '_self'}
                                        className={cn(
                                            'block py-2',
                                            pathname === item.href && 'font-semibold',
                                        )}>
                                        {item.name}
                                    </a>
                                ))}
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
        <section className="flex items-center justify-between mt-8 md:mt-16 mb-12 mx-5 md:mx-0">
            <Link href="/">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight">
                    {config.blog.name}
                </h1>
            </Link>
            <Navigation />
        </section>
    );
};

export default Header;
