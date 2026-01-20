import { Rss } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { DarkModeToggle } from './DarkModeToggle';
import { Button } from './ui/button';

const Footer: FC = () => {
  return (
    <section className="mx-5 mb-12 mt-8 md:mt-16">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          © Lauri Maila {new Date().getFullYear()}
          {process.env.NEXT_PUBLIC_APP_VERSION && (
            <span className="ml-2 text-xs opacity-50">{process.env.NEXT_PUBLIC_APP_VERSION}</span>
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
