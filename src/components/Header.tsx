import { config } from '@/config';
import Link from 'next/link';
import { FC } from 'react';
import { TopNavigation } from '@/components/TopNavigation';

const Header: FC = () => {
  return (
    <section className="mx-5 mt-5 mb-12 flex items-center justify-between md:mx-0 md:mt-16">
      <Link href="/">
        <h1 className="text-3xl leading-tight font-bold tracking-tighter md:text-4xl md:leading-none">
          {config.blog.name}
        </h1>
      </Link>
      <TopNavigation />
    </section>
  );
};

export default Header;
