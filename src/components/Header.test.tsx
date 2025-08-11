import { describe, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import Header from './Header';

vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}));

describe('Header', () => {
    test('is rendered', () => {
        render(<Header />);
    });
});
