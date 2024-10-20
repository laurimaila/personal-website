'use client';
import { Rss } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { DarkModeToggle } from './DarkModeToggle';
import { Button } from './ui/button';

const Footer: FC = () => {
    return (
        <section className="mt-8 md:mt-16 mb-12">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    © Lauri Maila {new Date().getFullYear()}
                </div>
                <div>
                    <Link href="/rss">
                        <Button variant="ghost" className="p-2">
                            <Rss className="w-6 h-6" />
                        </Button>
                    </Link>
                    <DarkModeToggle />
                </div>
            </div>
        </section>
    );
};

export default Footer;
