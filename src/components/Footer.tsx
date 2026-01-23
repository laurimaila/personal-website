import { Rss } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { DarkModeToggle } from './DarkModeToggle';
import { Button } from './ui/button';

const Footer: FC = () => {
  return (
    <section className="mx-5 mb-12 mt-8 md:mt-16">
      <div className="flex items-center justify-between">
        <div className="flex flex-col text-sm text-muted-foreground md:flex-row md:items-baseline">
          <span>© Lauri Maila {new Date().getFullYear()}</span>
          {process.env.NEXT_PUBLIC_APP_VERSION && (
            <span className="text-xs opacity-70 md:ml-2">
              {process.env.NEXT_PUBLIC_APP_VERSION}
            </span>
          )}
        </div>
        <div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/rss" aria-label="RSS feed">
              <Rss className="h-6 w-6" aria-hidden="true" />
            </Link>
          </Button>
          <DarkModeToggle />
        </div>
      </div>
    </section>
  );
};

export default Footer;
