import { config } from '@/config';
import Link from 'next/link';
import { FC } from 'react';
import { TopNavigation } from '@/components/TopNavigation';

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
