import { config } from '@/config';
import { SiGithub } from '@icons-pack/react-simple-icons';
import Link from 'next/link';
import { FC, JSX } from 'react';
import { TopNavigation } from '@/components/TopNavigation';
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
        href: 'https://github.com/laurimaila/personal-website',
        openInNewTab: true,
        icon: <SiGithub size={24} />,
    },
];

const Header: FC = () => {
    return (
        <section className="mx-5 mb-12 mt-5 flex items-center justify-between md:mx-0 md:mt-16">
            <Link href="/">
                <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
                    {config.blog.name}
                </h1>
            </Link>
            <TopNavigation />
        </section>
    );
};

export default Header;
